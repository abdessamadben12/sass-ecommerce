<?php

namespace App\Services\Seller;

use App\Models\User;
use App\Models\Order_item;
use App\Models\Product;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class SellerDashboardService
{
    public function getDashboardData(User $user): array
    {
        $shop = $user->shops()->first();
        if (!$shop) {
            return $this->emptyDashboard();
        }

        $shopId = $shop->id;
        $productIds = Product::where('shop_id', $shopId)->pluck('id');

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        $totalRevenue = Order_item::whereIn('product_id', $productIds)
            ->whereHas('order', fn ($q) => $q->where('status', 'completed'))
            ->sum('price');

        $monthlyRevenue = Order_item::whereIn('product_id', $productIds)
            ->whereHas('order', fn ($q) => $q->where('status', 'completed')->where('created_at', '>=', $startOfMonth))
            ->sum('price');

        $totalSales = Order_item::whereIn('product_id', $productIds)
            ->whereHas('order', fn ($q) => $q->where('status', 'completed'))
            ->count();

        $monthlySales = Order_item::whereIn('product_id', $productIds)
            ->whereHas('order', fn ($q) => $q->where('status', 'completed')->where('created_at', '>=', $startOfMonth))
            ->count();

        $productStats = [
            'total' => Product::where('shop_id', $shopId)->count(),
            'approved' => Product::where('shop_id', $shopId)->where('status', 'approved')->count(),
            'pending' => Product::where('shop_id', $shopId)->where('status', 'pending')->count(),
            'draft' => Product::where('shop_id', $shopId)->where('status', 'draft')->count(),
            'rejected' => Product::where('shop_id', $shopId)->where('status', 'rejected')->count(),
        ];

        $recentOrders = Order_item::whereIn('product_id', $productIds)
            ->with(['order.user', 'product'])
            ->latest()
            ->take(5)
            ->get();

        $recentNotifications = $user->notifications()
            ->where('is_read', false)
            ->latest()
            ->take(5)
            ->get();

        $walletBalance = $user->balance?->balance ?? 0;

        $pendingWithdrawals = $user->withdrawals()
            ->where('status', 'pending')
            ->sum('amount');

        $monthlyRevenueChart = $this->getMonthlyRevenueChart($productIds);

        return [
            'shop' => $shop,
            'totalRevenue' => $totalRevenue,
            'monthlyRevenue' => $monthlyRevenue,
            'totalSales' => $totalSales,
            'monthlySales' => $monthlySales,
            'productStats' => $productStats,
            'recentOrders' => $recentOrders,
            'recentNotifications' => $recentNotifications,
            'walletBalance' => $walletBalance,
            'pendingWithdrawals' => $pendingWithdrawals,
            'monthlyRevenueChart' => $monthlyRevenueChart,
        ];
    }

    private function getMonthlyRevenueChart($productIds): array
    {
        $data = Order_item::whereIn('product_id', $productIds)
            ->whereHas('order', fn ($q) => $q->where('status', 'completed'))
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(price) as revenue')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        $labels = [];
        $values = [];
        $months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $months[$date->month - 1] . ' ' . $date->year;
            $labels[] = $label;

            $match = $data->first(fn ($item) => $item->month == $date->month && $item->year == $date->year);
            $values[] = $match ? round((float) $match->revenue, 2) : 0;
        }

        return ['labels' => $labels, 'values' => $values];
    }

    private function emptyDashboard(): array
    {
        return [
            'shop' => null,
            'totalRevenue' => 0,
            'monthlyRevenue' => 0,
            'totalSales' => 0,
            'monthlySales' => 0,
            'productStats' => ['total' => 0, 'approved' => 0, 'pending' => 0, 'draft' => 0, 'rejected' => 0],
            'recentOrders' => collect(),
            'recentNotifications' => collect(),
            'walletBalance' => 0,
            'pendingWithdrawals' => 0,
            'monthlyRevenueChart' => ['labels' => [], 'values' => []],
        ];
    }
}
