<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Categorie;
use App\Models\License;
use App\Models\Product;
use App\Models\ProductFormat;
use App\Models\Shop;
use App\Services\FileUploadService;
use App\Services\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService,
        private FileUploadService $fileUploadService
    ) {}

    public function index(Request $request): View
    {
        $shop = $this->getShop();
        $query = Product::where('shop_id', $shop->id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $products = $query->with(['category', 'license'])->latest()->paginate(12);
        $categories = Categorie::where('is_active', true)->get();

        $stats = [
            'total' => Product::where('shop_id', $shop->id)->count(),
            'approved' => Product::where('shop_id', $shop->id)->where('status', 'approved')->count(),
            'pending' => Product::where('shop_id', $shop->id)->where('status', 'pending')->count(),
            'draft' => Product::where('shop_id', $shop->id)->where('status', 'draft')->count(),
        ];

        return view('seller.products.index', compact('products', 'categories', 'stats'));
    }

    public function create(): View
    {
        $categories = Categorie::where('is_active', true)->get();
        $licenses = License::where('is_active', true)->orderBy('sort_order')->get();
        $formats = ProductFormat::where('is_active', true)->get();

        return view('seller.products.create', compact('categories', 'licenses', 'formats'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:50',
            'base_price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'license_id' => 'nullable|exists:licenses,id',
            'tags' => 'nullable|string',
            'main_file' => 'required|file|max:512000',
            'preview_images.*' => 'nullable|image|max:5120',
        ]);

        $shop = $this->getShop();

        $product = Product::create([
            'shop_id' => $shop->id,
            'category_id' => $request->category_id,
            'license_id' => $request->license_id,
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'description' => $request->description,
            'tags' => $request->tags ? array_map('trim', explode(',', $request->tags)) : [],
            'base_price' => $request->base_price,
            'minimum_price' => $request->base_price,
            'status' => 'draft',
        ]);

        if ($request->hasFile('main_file')) {
            $file = $request->file('main_file');
            $path = $file->store('products/main-files/' . $product->id, 'spaces_2');
            $product->update([
                'main_file_path' => $path,
                'main_file_size' => $file->getSize(),
                'file_hash' => hash_file('sha256', $file->getRealPath()),
            ]);
        }

        if ($request->hasFile('preview_images')) {
            $previews = [];
            foreach ($request->file('preview_images') as $image) {
                $previews[] = $image->store('products/preview-images/' . $product->id, 'spaces_2');
            }
            $product->update(['preview_images' => $previews]);

            if (!empty($previews)) {
                $product->update(['thumbnail_path' => $previews[0]]);
            }
        }

        return redirect()
            ->route('seller.products.show', $product)
            ->with('success', 'Produit cree avec succes.');
    }

    public function show(Product $product): View
    {
        $this->authorizeProduct($product);
        $product->load(['category', 'license', 'reviews', 'downloads', 'views']);

        return view('seller.products.show', compact('product'));
    }

    public function edit(Product $product): View
    {
        $this->authorizeProduct($product);
        $categories = Categorie::where('is_active', true)->get();
        $licenses = License::where('is_active', true)->orderBy('sort_order')->get();
        $formats = ProductFormat::where('is_active', true)->get();

        return view('seller.products.edit', compact('product', 'categories', 'licenses', 'formats'));
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeProduct($product);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:50',
            'base_price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'license_id' => 'nullable|exists:licenses,id',
            'tags' => 'nullable|string',
            'main_file' => 'nullable|file|max:512000',
            'preview_images.*' => 'nullable|image|max:5120',
        ]);

        $product->update([
            'category_id' => $request->category_id,
            'license_id' => $request->license_id,
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'description' => $request->description,
            'tags' => $request->tags ? array_map('trim', explode(',', $request->tags)) : [],
            'base_price' => $request->base_price,
            'minimum_price' => $request->base_price,
        ]);

        if ($request->hasFile('main_file')) {
            $file = $request->file('main_file');
            $path = $file->store('products/main-files/' . $product->id, 'spaces_2');
            $product->update([
                'main_file_path' => $path,
                'main_file_size' => $file->getSize(),
                'file_hash' => hash_file('sha256', $file->getRealPath()),
            ]);
        }

        if ($request->hasFile('preview_images')) {
            $previews = $product->preview_images ?? [];
            foreach ($request->file('preview_images') as $image) {
                $previews[] = $image->store('products/preview-images/' . $product->id, 'spaces_2');
            }
            $product->update(['preview_images' => $previews]);

            if (empty($product->thumbnail_path) && !empty($previews)) {
                $product->update(['thumbnail_path' => $previews[0]]);
            }
        }

        return redirect()
            ->route('seller.products.show', $product)
            ->with('success', 'Produit mis a jour.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorizeProduct($product);

        if ($product->status === 'approved') {
            return back()->with('error', 'Impossible de supprimer un produit publie. Mettez-le en brouillon d\'abord.');
        }

        $product->delete();

        return redirect()
            ->route('seller.products.index')
            ->with('success', 'Produit supprime.');
    }

    public function submitForReview(Product $product): RedirectResponse
    {
        $this->authorizeProduct($product);

        if (!in_array($product->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Ce produit ne peut pas etre soumis pour verification.');
        }

        if (empty($product->main_file_path)) {
            return back()->with('error', 'Veuillez d\'abord telecharger le fichier principal.');
        }

        if (strlen($product->description) < 50) {
            return back()->with('error', 'La description doit contenir au moins 50 caracteres.');
        }

        $product->update(['status' => 'pending']);

        return back()->with('success', 'Produit soumis pour verification.');
    }

    private function getShop(): Shop
    {
        $shop = auth()->user()->shops()->first();

        if (!$shop) {
            $shop = Shop::create([
                'user_id' => auth()->id(),
                'shop_name' => auth()->user()->name . "'s Shop",
                'shop_slug' => Str::slug(auth()->user()->name . '-shop-' . Str::random(4)),
                'status' => 'active',
            ]);
        }

        return $shop;
    }

    private function authorizeProduct(Product $product): void
    {
        $shop = $this->getShop();
        abort_if($product->shop_id !== $shop->id, 403, 'Acces non autorise.');
    }
}
