<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Shop;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function index(): View
    {
        $featuredProducts = collect();
        $categories = collect();
        $topShops = collect();
        $stats = [
            'products' => 0,
            'shops' => 0,
            'categories' => 0,
        ];

        try {
            $featuredProducts = Product::query()
                ->select(['id', 'title', 'slug', 'description', 'base_price', 'thumbnail_path', 'category_id', 'shop_id', 'status', 'published_at'])
                ->with(['category:id,name', 'shop:id,shop_name'])
                ->where('status', 'approved')
                ->orderByDesc('published_at')
                ->take(8)
                ->get();

            $categories = Categorie::query()
                ->select(['id', 'name', 'slug'])
                ->where('is_active', true)
                ->withCount('products')
                ->orderByDesc('products_count')
                ->take(12)
                ->get();

            $topShops = Shop::query()
                ->select(['id', 'shop_name', 'total_sales', 'total_products', 'average_rating', 'status'])
                ->where('status', 'active')
                ->orderByDesc('total_sales')
                ->take(4)
                ->get();

            $stats = [
                'products' => Product::query()->where('status', 'approved')->count(),
                'shops' => Shop::query()->where('status', 'active')->count(),
                'categories' => Categorie::query()->where('is_active', true)->count(),
            ];
        } catch (\Throwable $e) {
            // Keep homepage available if database or table setup is incomplete.
        }

        $generalSettings = Setting::query()
            ->where('group', 'general')
            ->pluck('value', 'key');
        $policySettings = Setting::query()
            ->where('group', 'policies')
            ->pluck('value', 'key');

        $appName = $generalSettings->get('app_name') ?: config('app.name');
        $logoUrl = $this->toPublicUrl($generalSettings->get('logo_url'));
        $faviconUrl = $this->toPublicUrl($generalSettings->get('favicon_url'));
        $supportEmail = $generalSettings->get('support_email') ?: config('mail.from.address');
        $termsOfUse = $policySettings->get('terms_of_use');
        $privacyPolicy = $policySettings->get('privacy_policy');
        $legalNotice = $policySettings->get('legal_notice');

        return view('welcome', compact(
            'featuredProducts',
            'categories',
            'topShops',
            'stats',
            'appName',
            'logoUrl',
            'faviconUrl',
            'supportEmail',
            'termsOfUse',
            'privacyPolicy',
            'legalNotice'
        ));
    }

    private function toPublicUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $value)) {
            return $value;
        }

        return Storage::disk('public')->url($value);
    }
}
