<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order_item;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\View\View;

class OrderController extends Controller
{
    public function index(Request $request): View
    {
        $shop = auth()->user()->shops()->first();
        $productIds = $shop ? Product::where('shop_id', $shop->id)->pluck('id') : collect();

        $query = Order_item::whereIn('product_id', $productIds)
            ->with(['order.user', 'product']);

        if ($request->filled('status')) {
            $query->whereHas('order', fn ($q) => $q->where('status', $request->status));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('product', fn ($pq) => $pq->where('title', 'like', "%{$search}%"))
                  ->orWhereHas('order.user', fn ($uq) => $uq->where('email', 'like', "%{$search}%"));
            });
        }

        $orders = $query->latest()->paginate(15);

        $totalSales = Order_item::whereIn('product_id', $productIds)
            ->whereHas('order', fn ($q) => $q->where('status', 'completed'))
            ->sum('price');

        $totalCount = Order_item::whereIn('product_id', $productIds)->count();

        return view('seller.orders.index', compact('orders', 'totalSales', 'totalCount'));
    }

    public function show(Order_item $order): View
    {
        $shop = auth()->user()->shops()->first();
        $productIds = $shop ? Product::where('shop_id', $shop->id)->pluck('id') : collect();

        abort_if(!$productIds->contains($order->product_id), 403);

        $order->load(['order.user', 'product.downloads' => function ($q) use ($order) {
            $q->where('user_id', $order->order->user_id);
        }]);

        return view('seller.orders.show', compact('order'));
    }
}
