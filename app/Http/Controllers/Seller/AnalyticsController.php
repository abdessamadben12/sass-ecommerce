<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductDownload;
use App\Models\ProductReview;
use App\Models\ProductView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    public function index(): View
    {
        $shop = auth()->user()->shops()->first();
        $productIds = $shop ? Product::where('shop_id', $shop->id)->pluck('id') : collect();

        $totalViews = ProductView::whereIn('product_id', $productIds)->count();
        $totalDownloads = ProductDownload::whereIn('product_id', $productIds)->count();
        $avgRating = ProductReview::whereIn('product_id', $productIds)
            ->where('status', 'approved')
            ->avg('rating') ?? 0;
        $totalReviews = ProductReview::whereIn('product_id', $productIds)
            ->where('status', 'approved')
            ->count();

        $topProducts = Product::whereIn('id', $productIds)
            ->withCount(['views', 'downloads', 'reviews'])
            ->orderByDesc('views_count')
            ->take(10)
            ->get();

        $viewsChart = $this->getViewsChart($productIds);
        $downloadsChart = $this->getDownloadsChart($productIds);

        return view('seller.analytics.index', compact(
            'totalViews', 'totalDownloads', 'avgRating', 'totalReviews',
            'topProducts', 'viewsChart', 'downloadsChart'
        ));
    }

    public function export(): StreamedResponse
    {
        $shop = auth()->user()->shops()->first();
        $products = $shop ? Product::where('shop_id', $shop->id)
            ->withCount(['views', 'downloads', 'reviews'])
            ->get() : collect();

        return response()->streamDownload(function () use ($products) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Produit', 'Vues', 'Telechargements', 'Avis', 'Prix', 'Statut', 'Date creation']);

            foreach ($products as $product) {
                fputcsv($handle, [
                    $product->title,
                    $product->views_count,
                    $product->downloads_count,
                    $product->reviews_count,
                    $product->base_price,
                    $product->status,
                    $product->created_at->format('Y-m-d'),
                ]);
            }

            fclose($handle);
        }, 'analytics-' . now()->format('Y-m-d') . '.csv');
    }

    private function getViewsChart($productIds): array
    {
        $data = ProductView::whereIn('product_id', $productIds)
            ->where('created_at', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $labels = [];
        $values = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $labels[] = now()->subDays($i)->format('d/m');
            $match = $data->firstWhere('date', $date);
            $values[] = $match ? $match->count : 0;
        }

        return ['labels' => $labels, 'values' => $values];
    }

    private function getDownloadsChart($productIds): array
    {
        $data = ProductDownload::whereIn('product_id', $productIds)
            ->where('created_at', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $labels = [];
        $values = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $labels[] = now()->subDays($i)->format('d/m');
            $match = $data->firstWhere('date', $date);
            $values[] = $match ? $match->count : 0;
        }

        return ['labels' => $labels, 'values' => $values];
    }
}
