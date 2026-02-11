<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductView;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function topProducts(Request $request)
    {
        $data = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $from = $data['from'] ?? null;
        $to = $data['to'] ?? null;
        $limit = (int) ($data['limit'] ?? 10);

        $base = DB::table('order_items as oi')
            ->join('products as p', 'p.id', '=', 'oi.product_id')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->whereIn('o.status', ['paid', 'shipped', 'completed']);

        if ($from) {
            $base->whereDate('o.created_at', '>=', $from);
        }
        if ($to) {
            $base->whereDate('o.created_at', '<=', $to);
        }

        $topByUnits = (clone $base)
            ->selectRaw('
                p.id as product_id,
                p.title as product,
                SUM(oi.quantity) as units_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
                COUNT(DISTINCT o.id) as orders_count
            ')
            ->groupBy('p.id', 'p.title')
            ->orderByDesc('units_sold')
            ->limit($limit)
            ->get();

        $topByRevenue = (clone $base)
            ->selectRaw('
                p.id as product_id,
                p.title as product,
                SUM(oi.quantity) as units_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
                COUNT(DISTINCT o.id) as orders_count
            ')
            ->groupBy('p.id', 'p.title')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();

        $topCategories = (clone $base)
            ->leftJoin('categories as c', 'c.id', '=', 'p.category_id')
            ->selectRaw('
                COALESCE(c.name, "Unknown") as category,
                SUM(oi.quantity) as units_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
            ')
            ->groupBy('c.name')
            ->orderByDesc('units_sold')
            ->limit($limit)
            ->get();

        $topProduct = $topByUnits->first();

        return response()->json([
            'top_by_units' => $topByUnits,
            'top_by_revenue' => $topByRevenue,
            'top_product' => $topProduct,
            'top_categories' => $topCategories,
        ]);
    }

    public function products(Request $request)
    {
        [$from, $to, $status, $perPage] = $this->validatedFilters($request);

        $rowsQuery = DB::table('products as p')
            ->leftJoin('order_items as oi', 'oi.product_id', '=', 'p.id')
            ->selectRaw('
                p.id,
                DATE(p.created_at) as date,
                p.title as product,
                p.status,
                COALESCE(SUM(oi.quantity), 0) as sales
            ');

        $chartQuery = DB::table('products as p')
            ->leftJoin('order_items as oi', 'oi.product_id', '=', 'p.id')
            ->selectRaw('DATE(p.created_at) as date, COALESCE(SUM(oi.quantity), 0) as value');

        if ($from) {
            $rowsQuery->whereDate('p.created_at', '>=', $from);
            $chartQuery->whereDate('p.created_at', '>=', $from);
        }
        if ($to) {
            $rowsQuery->whereDate('p.created_at', '<=', $to);
            $chartQuery->whereDate('p.created_at', '<=', $to);
        }
        if ($status && $status !== 'all') {
            $rowsQuery->where('p.status', $status);
            $chartQuery->where('p.status', $status);
        }

        $rows = $rowsQuery
            ->groupBy('p.id', 'p.created_at', 'p.title', 'p.status')
            ->orderBy('p.created_at', 'desc')
            ->paginate($perPage);

        $chart = $chartQuery
            ->groupBy(DB::raw('DATE(p.created_at)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'rows' => $rows,
            'chart' => $chart,
            'status_options' => [
                ['value' => 'draft', 'label' => 'Draft'],
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'approved', 'label' => 'Approved'],
                ['value' => 'rejected', 'label' => 'Rejected'],
                ['value' => 'supended', 'label' => 'Supended'],
            ],
        ]);
    }

    public function orders(Request $request)
    {
        [$from, $to, $status, $perPage] = $this->validatedFilters($request);

        $rowsQuery = DB::table('orders as o')
            ->leftJoin('users as u', 'u.id', '=', 'o.user_id')
            ->selectRaw('
                o.id,
                DATE(o.created_at) as date,
                CONCAT("ORD-", LPAD(o.id, 6, "0")) as reference,
                u.email as customer_email,
                o.status,
                o.total_price as amount
            ');

        $chartQuery = DB::table('orders as o')
            ->selectRaw('DATE(o.created_at) as date, COALESCE(SUM(o.total_price), 0) as value');

        if ($from) {
            $rowsQuery->whereDate('o.created_at', '>=', $from);
            $chartQuery->whereDate('o.created_at', '>=', $from);
        }
        if ($to) {
            $rowsQuery->whereDate('o.created_at', '<=', $to);
            $chartQuery->whereDate('o.created_at', '<=', $to);
        }
        if ($status && $status !== 'all') {
            $rowsQuery->where('o.status', $status);
            $chartQuery->where('o.status', $status);
        }

        $rows = $rowsQuery
            ->orderBy('o.created_at', 'desc')
            ->paginate($perPage);

        $chart = $chartQuery
            ->groupBy(DB::raw('DATE(o.created_at)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'rows' => $rows,
            'chart' => $chart,
            'status_options' => [
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'paid', 'label' => 'Paid'],
                ['value' => 'shipped', 'label' => 'Shipped'],
                ['value' => 'completed', 'label' => 'Completed'],
                ['value' => 'cancelled', 'label' => 'Cancelled'],
            ],
        ]);
    }

    public function users(Request $request)
    {
        [$from, $to, $status, $perPage] = $this->validatedFilters($request);

        $rowsQuery = User::query()
            ->selectRaw('
                id,
                DATE(created_at) as date,
                email,
                status,
                role
            ');

        $chartQuery = User::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as value');

        if ($from) {
            $rowsQuery->whereDate('created_at', '>=', $from);
            $chartQuery->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $rowsQuery->whereDate('created_at', '<=', $to);
            $chartQuery->whereDate('created_at', '<=', $to);
        }
        if ($status && $status !== 'all') {
            $rowsQuery->where('status', $status);
            $chartQuery->where('status', $status);
        }

        $rows = $rowsQuery
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $chart = $chartQuery
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'rows' => $rows,
            'chart' => $chart,
            'status_options' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
        ]);
    }

    public function visitors(Request $request)
    {
        [$from, $to, $status, $perPage] = $this->validatedFilters($request);

        $rowsQuery = ProductView::query()
            ->selectRaw('
                DATE(created_at) as date,
                COALESCE(country, "Unknown") as source,
                CASE WHEN user_id IS NULL THEN "anonymous" ELSE "authenticated" END as status,
                COUNT(*) as visits
            ');

        $chartQuery = ProductView::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as value');

        if ($from) {
            $rowsQuery->whereDate('created_at', '>=', $from);
            $chartQuery->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $rowsQuery->whereDate('created_at', '<=', $to);
            $chartQuery->whereDate('created_at', '<=', $to);
        }
        if ($status && $status !== 'all') {
            if ($status === 'anonymous') {
                $rowsQuery->whereNull('user_id');
                $chartQuery->whereNull('user_id');
            }
            if ($status === 'authenticated') {
                $rowsQuery->whereNotNull('user_id');
                $chartQuery->whereNotNull('user_id');
            }
        }

        $rows = $rowsQuery
            ->groupBy(DB::raw('DATE(created_at)'), 'source', 'status')
            ->orderBy('date', 'desc')
            ->paginate($perPage);

        $chart = $chartQuery
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'rows' => $rows,
            'chart' => $chart,
            'status_options' => [
                ['value' => 'anonymous', 'label' => 'Anonymous'],
                ['value' => 'authenticated', 'label' => 'Authenticated'],
            ],
        ]);
    }

    public function transactions(Request $request)
    {
        [$from, $to, $status, $perPage] = $this->validatedFilters($request);

        $rowsQuery = Transaction::query()
            ->selectRaw('
                id,
                DATE(created_at) as date,
                trx as reference,
                status,
                amount
            ');

        $chartQuery = Transaction::query()
            ->selectRaw('DATE(created_at) as date, COALESCE(SUM(amount), 0) as value');

        if ($from) {
            $rowsQuery->whereDate('created_at', '>=', $from);
            $chartQuery->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $rowsQuery->whereDate('created_at', '<=', $to);
            $chartQuery->whereDate('created_at', '<=', $to);
        }
        if ($status && $status !== 'all') {
            $rowsQuery->where('status', $status);
            $chartQuery->where('status', $status);
        }

        $rows = $rowsQuery
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $chart = $chartQuery
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'rows' => $rows,
            'chart' => $chart,
            'status_options' => [
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'success', 'label' => 'Success'],
                ['value' => 'failed', 'label' => 'Failed'],
            ],
        ]);
    }

    private function validatedFilters(Request $request): array
    {
        $data = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'status' => 'nullable|string|max:50',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        return [
            $data['from'] ?? null,
            $data['to'] ?? null,
            $data['status'] ?? 'all',
            (int) ($data['per_page'] ?? 10),
        ];
    }
}
