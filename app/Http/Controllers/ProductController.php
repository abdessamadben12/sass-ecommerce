<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use App\Services\FileUploadService;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductCollection;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use App\Models\ProductFormat;
use App\Models\ProductSetting;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService,
        private FileUploadService $fileUploadService
    ) {
        // $this->middleware('auth:sanctum')->except(['index', 'show']);
        // $this->middleware('verified')->except(['index', 'show']);
    }

    /**
     * Display a listing of products with filters and pagination
     */
    public function index(Request $request)
    {
        // Backward-compatible query params
        $request->merge([
            'search' => $request->input('search', $request->input('serch')),
            'sort_by' => $request->input('sort_by', $request->input('sort')),
            'price_min' => $request->input('price_min', $request->input('min_price')),
            'price_max' => $request->input('price_max', $request->input('max_price')),
        ]);
        if ($request->input('category_id') === 'all') {
            $request->merge(['category_id' => null]);
        }
        if ($request->input('license_id') === 'all') {
            $request->merge(['license_id' => null]);
        }

        $filters = $request->validate([
            'category_id' => 'nullable',
            "license_id" => "nullable",
            'status' => 'nullable|string|in:draft,pending,approved,rejected,suspended,all',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:created_at,title,base_price,updated_at,newest,price_asc,price_desc',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $products = $this->productService->getFilteredProducts($filters);
        $stats = $this->productService->getProductsStats();
        foreach($products as $product){
            if(Storage::disk("spaces_2")->exists($product->thumbnail_path)){
                $product->thumbnail_path=Storage::disk("spaces_2")->url($product->thumbnail_path);
            }
        }

        return response()->json(["products"=>$products,"stats"=>$stats]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $product = $this->productService->createProduct($request->all());

            return response()->json([
                'message' => 'Product created successfully',
                'data' => new ProductResource($product)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Display the specified product
     */
    public function show(Product $product): JsonResponse
    {
        // Check if user can view this product
        if (!$this->productService->canUserViewProduct($product, auth()->user())) {
            return response()->json([
                'message' => 'Product not found or access denied'
            ], 404);
        }

        return response()->json([
            'data' => new ProductResource($product->load([
                'shop', 'category', 'license', 'productSetting'
            ]))
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        // Check ownership
        if (!$this->productService->userOwnsProduct($product, auth()->user())) {
            return response()->json([
                'message' => 'Access denied'
            ], 403);
        }

        try {
            $updatedProduct = $this->productService->updateProduct($product, $request->validated());

            return response()->json([
                'message' => 'Product updated successfully',
                'data' => new ProductResource($updatedProduct)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product): JsonResponse
    {
        if (!$this->productService->userOwnsProduct($product, auth()->user())) {
            return response()->json([
                'message' => 'Access denied'
            ], 403);
        }

        try {
            $this->productService->deleteProduct($product);

            return response()->json([
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete product',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Upload main file for product
     */
    public function uploadMainFile(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:102400' // 100MB max
        ]);

        // if (!$this->productService->userOwnsProduct($product, auth()->user())) {
        //     return response()->json([
        //         'message' => 'Access denied'
        //     ], 403);
        // }

        try {
            $filePath = $this->fileUploadService->uploadMainFile($request->file('file'), $product);
            
            $product->update([
                'main_file_path' => $filePath,
                'main_file_size' => $request->file('file')->getSize(),
                'file_hash' => hash_file('sha256', $request->file('file')->getRealPath())
            ]);
            $this->logAdminAction($product, 'upload_main_file', [
                'file_path' => $filePath,
                'file_size' => $request->file('file')->getSize(),
            ]);

            return response()->json([
                'message' => 'File uploaded successfully',
                'file_path' => $filePath
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'File upload failed',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Upload preview images for product
     */
    public function uploadPreviewImages(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120' // 5MB per image
        ]);

        // if (!$this->productService->userOwnsProduct($product, auth()->user())) {
        //     return response()->json([
        //         'message' => 'Access denied'
        //     ], 403);
        // }

        try {
            $imagePaths = $this->fileUploadService->uploadPreviewImages($request->file('images'), $product);
            $product->update([
                'preview_images' => $imagePaths
            ]);
            $this->logAdminAction($product, 'upload_preview_images', [
                'count' => count($request->file('images')),
            ]);

            return response()->json([
                'message' => 'Preview images uploaded successfully',
                'images' => $imagePaths
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Image upload failed',
                'error' => $e->getMessage()
            ], 422);
        }
    }





    /**
     * Get product statistics
     */
    public function getStats(Product $product): JsonResponse
    {
       
        $stats = $this->productService->getProductStats($product);

        return response()->json($stats);
    }

    /**
     * Download product file (for purchased products)
     */
    public function download(Product $product): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        $user = auth()->user();

        if (!$this->productService->canUserDownloadProduct($product, $user)) {
            return response()->json([
                'message' => 'Access denied or product not purchased'
            ], 403);
        }

        try {
            return $this->productService->downloadProduct($product, $user);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Download failed',
                'error' => $e->getMessage()
            ], 422);
        }
    }
    public function getDetailsProduct(Product $product): JsonResponse
    {
       $product = $this->productService->getDetailsProduct($product);
       return response()->json($product);
    }
    public function productPending()
    {
        $products = Product::where("status","pending")->get();
        return response()->json($products);
    }
    public function submitForReview(Product $product): JsonResponse
    {
        try {
            $this->productService->submitForReview($product);
            $this->logAdminAction($product, 'submit_for_review');
            return response()->json(['message' => 'Product submitted for review']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function removePreviewImage(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'index' => 'required|integer|min:0',
        ]);

        $images = $product->preview_images ?? [];
        if (!array_key_exists($data['index'], $images)) {
            return response()->json(['message' => 'Preview image not found'], 404);
        }

        $imagePath = $images[$data['index']];
        unset($images[$data['index']]);
        $images = array_values($images);

        $product->update(['preview_images' => $images]);
        $this->logAdminAction($product, 'remove_preview_image', [
            'index' => $data['index'],
            'image' => $imagePath,
        ]);

        try {
            if ($imagePath) {
                \Illuminate\Support\Facades\Storage::delete($imagePath);
            }
        } catch (\Exception $e) {
            // ignore storage delete errors
        }

        return response()->json(['message' => 'Preview image removed']);
    }
    public function duplicateProduct(Product $product): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        try {
            $newProduct = $this->productService->duplicateProduct($product, $user);
            $this->logAdminAction($newProduct, 'duplicate_product', [
                'original_id' => $product->id,
            ]);
            return response()->json(['message' => 'Product duplicated', 'data' => new ProductResource($newProduct)]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'integer|exists:products,id',
            'status' => 'required|in:draft,pending,approved,rejected,suspended',
            'reason' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $count = $this->productService->bulkUpdateProducts(
            $data['product_ids'],
            ['status' => $data['status'], 'reason' => $data['reason'] ?? null],
            $user
        );
        $this->logAdminAction(null, 'bulk_update_products', [
            'count' => $count,
            'product_ids' => $data['product_ids'],
            'status' => $data['status'],
            'reason' => $data['reason'] ?? null,
        ]);

        return response()->json(['message' => 'Products updated', 'count' => $count]);
    }
    public function putStatusProduct(Request $request,Product $product,string $status): JsonResponse
    {
        $validated = $request->validate([
            "reason" => "nullable|string|max:255"
        ]);
        if($validated["reason"] == "null"){
            $product->update(["status"=>$status]);
            $this->logAdminAction($product, 'update_status', ['status' => $status]);
            return response()->json(["message"=>"Product status updated successfully"]);
        }
        else{
            $product->update(["status"=>$status,"reason"=>$validated["reason"]]);
            $this->logAdminAction($product, 'update_status', ['status' => $status, 'reason' => $validated["reason"]]);
            return response()->json(["message"=>"Product status updated successfully"]);
        }
    }
    public function getProductFormat(){
        $formats = ProductFormat::all();
        return response()->json($formats);
    }
    public function addFormatProduct(Request $request){
        $validated = $request->validate([
            "name" => "required|string|max:255",
            "extension" => "nullable|string|max:255",
            "mime_type" => "required",
            "is_active" => "required|boolean",
        ]);

        $format = ProductFormat::create($validated);
        return response()->json(["message"=>"Format product created successfully"]);
    }
    public function updateFormatProduct(Request $request,ProductFormat $format){
        $validated = $request->validate([
            "name" => "required|string|max:255",
            "extension" => "required|string|max:255",
            "mime_type" => "required",
            "is_active" => "required|boolean",
        ]);
        $format->update($validated);
        return response()->json(["message"=>"Format product updated successfully"]);
    }
    public function deleteFormatProduct(Request $request){
     ProductFormat::where("id",$request->format)->delete();
    
        return response()->json(["message"=>"Format product deleted successfully"]);
    }
    // setting product
    public function getProductSettings(){
        $settings = ProductSetting::with("category","format")->get();
        return response()->json($settings);
    }
    public function addProductSetting(Request $request){
  
        $validated = $request->validate([
            "category_id" => "required",  
          "format_id" => "nullable|integer",
            "min_width" => "required",
            "min_height" => "required",
            "min_file_size" => "required",
            "max_file_size" => "required",
            "required_dpi" => "required",
            "requires_description_min_length"=>"required",
            "requires_tags_min_count"=>"required",
            "requires_preview_images_min"=>"required",
            "auto_virus_scan"=>"required",
            "auto_duplicate_check"=>"required",
            "auto_quality_assessment"=>"required",
            "requires_manual_review"=>"required",
        ]);
        $setting = ProductSetting::create($validated);
        return response()->json(["message"=>"Setting product created successfully"]);
    }

    private function logAdminAction(?Product $product, string $action, array $properties = []): void
    {
        $user = Auth::user();
        if (!$user) {
            return;
        }
        try {
            $logger = activity()->causedBy($user);
            if ($product) {
                $logger->performedOn($product);
            }
            if (!empty($properties)) {
                $logger->withProperties($properties);
            }
            $logger->log($action);
        } catch (\Exception $e) {
            // ignore logging errors
        }
    }

}
