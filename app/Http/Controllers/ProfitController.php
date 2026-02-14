<?php

namespace App\Http\Controllers;

use App\Models\CommissionSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfitController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'search' => 'nullable|string|max:120',
            'status' => 'nullable|string|max:40',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $perPage = (int) ($data['per_page'] ?? 10);
        $platformPercent = $this->resolvePlatformPercent();
        $base = $this->buildBaseQuery($data);

        $summary = (clone $base)
            ->selectRaw('
                COALESCE(SUM(oi.quantity * oi.price), 0) as gross_sales,
                COALESCE(SUM(oi.quantity), 0) as units_sold,
                COUNT(DISTINCT o.id) as orders_count,
                COUNT(DISTINCT u.id) as sellers_count
            ')
            ->first();

        $rows = (clone $base)
            ->selectRaw('
                u.id as seller_id,
                u.name as seller_name,
                u.email as seller_email,
                MIN(COALESCE(s.shop_name, "N/A")) as shop_name,
                COALESCE(SUM(oi.quantity * oi.price), 0) as gross_sales,
                COALESCE(SUM(oi.quantity), 0) as units_sold,
                COUNT(DISTINCT o.id) as orders_count
            ')
            ->groupBy('u.id', 'u.name', 'u.email')
            ->orderByDesc('gross_sales')
            ->paginate($perPage);

        $rows->getCollection()->transform(function ($row) use ($platformPercent) {
            $gross = (float) ($row->gross_sales ?? 0);
            $platformProfit = round($gross * ($platformPercent / 100), 2);
            $sellerProfit = round($gross - $platformProfit, 2);

            return [
                'id' => (int) $row->seller_id,
                'seller_id' => (int) $row->seller_id,
                'seller_name' => $row->seller_name,
                'seller_email' => $row->seller_email,
                'shop_name' => $row->shop_name,
                'gross_sales' => $gross,
                'platform_profit' => $platformProfit,
                'seller_profit' => $sellerProfit,
                'units_sold' => (int) ($row->units_sold ?? 0),
                'orders_count' => (int) ($row->orders_count ?? 0),
            ];
        });

        return response()->json([
            'rows' => $rows,
            'platform_percent' => $platformPercent,
            'summary' => [
                'gross_sales' => (float) ($summary->gross_sales ?? 0),
                'platform_profit' => round((float) ($summary->gross_sales ?? 0) * ($platformPercent / 100), 2),
                'seller_profit' => round((float) ($summary->gross_sales ?? 0) * (1 - ($platformPercent / 100)), 2),
                'units_sold' => (int) ($summary->units_sold ?? 0),
                'orders_count' => (int) ($summary->orders_count ?? 0),
                'sellers_count' => (int) ($summary->sellers_count ?? 0),
            ],
            'status_options' => [
                ['value' => 'all', 'label' => 'Finalized (paid, shipped, completed)'],
                ['value' => 'paid', 'label' => 'Paid'],
                ['value' => 'shipped', 'label' => 'Shipped'],
                ['value' => 'completed', 'label' => 'Completed'],
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'cancelled', 'label' => 'Cancelled'],
                ['value' => 'canceled', 'label' => 'Canceled'],
            ],
        ]);
    }

    public function show(Request $request, int $seller)
    {
        $data = $request->validate([
            'status' => 'nullable|string|max:40',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $sellerUser = User::query()
            ->select('id', 'name', 'email')
            ->where('id', $seller)
            ->where('role', 'seller')
            ->first();

        if (!$sellerUser) {
            return response()->json(['message' => 'Seller not found.'], 404);
        }

        $perPage = (int) ($data['per_page'] ?? 10);
        $platformPercent = $this->resolvePlatformPercent();
        $base = $this->buildBaseQuery($data)->where('u.id', $seller);

        $summary = (clone $base)
            ->selectRaw('
                COALESCE(SUM(oi.quantity * oi.price), 0) as gross_sales,
                COALESCE(SUM(oi.quantity), 0) as units_sold,
                COUNT(DISTINCT o.id) as orders_count
            ')
            ->first();

        $orders = (clone $base)
            ->selectRaw('
                o.id as order_id,
                o.status as status,
                DATE(o.created_at) as order_date,
                COALESCE(SUM(oi.quantity * oi.price), 0) as gross_sales,
                COALESCE(SUM(oi.quantity), 0) as units_sold,
                COUNT(*) as line_items
            ')
            ->groupBy('o.id', 'o.status', DB::raw('DATE(o.created_at)'))
            ->orderByDesc('o.created_at')
            ->paginate($perPage);

        $orders->getCollection()->transform(function ($row) use ($platformPercent) {
            $gross = (float) ($row->gross_sales ?? 0);
            $platformProfit = round($gross * ($platformPercent / 100), 2);
            $sellerProfit = round($gross - $platformProfit, 2);

            return [
                'id' => (int) $row->order_id,
                'order_id' => (int) $row->order_id,
                'status' => $row->status,
                'order_date' => $row->order_date,
                'gross_sales' => $gross,
                'platform_profit' => $platformProfit,
                'seller_profit' => $sellerProfit,
                'units_sold' => (int) ($row->units_sold ?? 0),
                'line_items' => (int) ($row->line_items ?? 0),
            ];
        });

        return response()->json([
            'seller' => [
                'id' => $sellerUser->id,
                'name' => $sellerUser->name,
                'email' => $sellerUser->email,
            ],
            'platform_percent' => $platformPercent,
            'summary' => [
                'gross_sales' => (float) ($summary->gross_sales ?? 0),
                'platform_profit' => round((float) ($summary->gross_sales ?? 0) * ($platformPercent / 100), 2),
                'seller_profit' => round((float) ($summary->gross_sales ?? 0) * (1 - ($platformPercent / 100)), 2),
                'units_sold' => (int) ($summary->units_sold ?? 0),
                'orders_count' => (int) ($summary->orders_count ?? 0),
            ],
            'orders' => $orders,
        ]);
    }

    private function buildBaseQuery(array $data)
    {
        $query = DB::table('order_items as oi')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->join('products as p', 'p.id', '=', 'oi.product_id')
            ->join('shops as s', 's.id', '=', 'p.shop_id')
            ->join('users as u', 'u.id', '=', 's.user_id')
            ->where('u.role', 'seller');

        $status = strtolower((string) ($data['status'] ?? 'all'));
        if (!$status || $status === 'all') {
            $query->whereIn('o.status', ['paid', 'shipped', 'completed']);
        } else {
            $query->where('o.status', $status);
        }

        if (!empty($data['from'])) {
            $query->whereDate('o.created_at', '>=', $data['from']);
        }
        if (!empty($data['to'])) {
            $query->whereDate('o.created_at', '<=', $data['to']);
        }
        if (!empty($data['search'])) {
            $search = trim((string) $data['search']);
            $query->where(function ($q) use ($search) {
                $q->where('u.name', 'like', "%{$search}%")
                    ->orWhere('u.email', 'like', "%{$search}%")
                    ->orWhere('s.shop_name', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    private function resolvePlatformPercent(): float
    {
        $setting = CommissionSetting::query()->first();
        $platformPercent = (float) ($setting?->platform_percent ?? 0);
        if ($platformPercent <= 0 && (float) ($setting?->seller_percent ?? 0) > 0) {
            $platformPercent = max(0, 100 - (float) $setting->seller_percent);
        }

        return min(100, max(0, $platformPercent));
    }
}

