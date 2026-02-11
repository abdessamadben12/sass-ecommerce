<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\ShopResource;
use App\Http\Resources\ProductResource;
use App\Models\Profit;
use App\Models\Order;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ShopProductController extends Controller
{
      public function getShops (Request $request){
        $perPage = $request->input('per_page', 10);
        $nameShop=$request->name;
        $status=$request->status;
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $query = Shop::query();
        if(!empty($nameShop) && $nameShop !== 'null' && $nameShop !== 'undefined'){
          $query->where('name',"like","%$nameShop%");
        }
        if(!empty($status) && $status !== 'null' && $status !== 'undefined'){
            $query->where('status', $status);
        }
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $allowedSort = ['created_at', 'total_sales', 'total_revenue', 'average_rating', 'total_products'];
        if (!in_array($sortBy, $allowedSort, true)) {
            $sortBy = 'created_at';
        }
        $sortDir = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';

        $shops=$query->with(["user"])
            ->withCount('products')
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage);

        foreach ($shops as $shop) {
            $shop->logo = $this->safePublicUrl($shop->logo);
            if (!empty($shop->user?->avatar)) {
                $shop->user->avatar = $this->safePublicUrl($shop->user->avatar);
            }
        }
        return response()->json($shops, 200);
    }

    public function getShop(Request $request){
        $id = $request->id;
        $shop = Shop::with(["user"])
            ->withCount('products')
            ->find($id);

        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }

        $shop->logo = $this->safePublicUrl($shop->logo);
        if (!empty($shop->user?->avatar)) {
            $shop->user->avatar = $this->safePublicUrl($shop->user->avatar);
        }

        return response()->json($shop, 200);
    }
    public function getProducts(Request $request){
            $perPage = $request->input('per_page', 10);
            $nameProduct=$request->input('name');
            $nameShop=$request->input('shop_name') ?? $request->input('shop') ?? $request->input('name_shop');
            $category=$request->category;
            $status=$request->status;
            $query = Product::query();
        if(!empty($nameProduct) && $nameProduct !== 'null' && $nameProduct !=="undefined"){
          $query->where('title',"like","%$nameProduct%");
        }
        if(!empty($nameShop) && $nameShop !== 'null' && $nameShop !=="undefined"){
           $query->whereHas('shop',function($q) use($nameShop){
            $q->where('name',"like","%$nameShop%");
          });
        }
        if(!empty($category) && $category !== 'null' && $category !=="undefined"){
          $query->whereHas('category', function ($q) use ($category) {
            $q->where('name', "like","%$category%");
        });
        }
        if(!empty($status) && $status !== 'null' && $status !== 'undefined'){
            $query->where('status',"like", "%$status%");
        }
            $result = $query->with("shop.user")->orderBy("created_at", "desc")->paginate($perPage);
            // $products=new ProductResource($result);
            return response()->json($result, 200);
    }

    public function getStatistiqueShop(Request $request){
        $id = $request->id;
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $totalProducts = Product::where('shop_id', $id)->count();
        $totalProfits = Profit::where('shop_id', $id)->where("is_paid",false)->sum('total_amount');
        $productactive = Product::where('shop_id', $id)->where('status', 'active')->count();
        $totalOredrs = Product::where('shop_id', $id)->withCount('orderItems')->get()->sum('order_items_count');

        $ordersQuery = Order::query()->whereHas('orderItems.product', function ($q) use ($id) {
            $q->where('shop_id', $id);
        });
        if ($dateFrom) {
            $ordersQuery->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $ordersQuery->whereDate('created_at', '<=', $dateTo);
        }

        $ordersCount = $ordersQuery->count();
        $revenue = $ordersQuery->sum('total_price');

        $dailyQuery = clone $ordersQuery;
        $daily = $dailyQuery
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total_price) as revenue')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'total_products' => $totalProducts,
            'total_profits' => $totalProfits,
            'product_active' => $productactive,
            'total_orders' => $totalOredrs,
            'orders_count' => $ordersCount,
            'revenue' => $revenue,
            'daily' => $daily
        ], 200);
      
    }

    public function getShopProducts(Request $request, $id)
    {
        $perPage = $request->input('per_page', 10);
        $status = $request->input('status');
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $query = Product::where('shop_id', $id)->with(['category', 'license']);
        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        $allowedSort = ['created_at', 'base_price', 'title', 'status'];
        if (!in_array($sortBy, $allowedSort, true)) {
            $sortBy = 'created_at';
        }
        $sortDir = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';

        $result = $query->orderBy($sortBy, $sortDir)->paginate($perPage);
        return response()->json($result, 200);
    }

    public function getShopOrders(Request $request, $id)
    {
        $perPage = $request->input('per_page', 10);
        $status = $request->input('status');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = Order::query()
            ->with(['user', 'orderItems.product'])
            ->whereHas('orderItems.product', function ($q) use ($id) {
                $q->where('shop_id', $id);
            });

        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $result = $query->orderBy('created_at', 'desc')->paginate($perPage);
        return response()->json($result, 200);
    }

    public function updateStatus(Request $request){
        $validate=$request->validate([
            "status"=>"required|string|in:active,inactive,suspended"
        ]);
        $id = $request->id;
        $shop = Shop::find($id);
        $shop->status = $validate["status"] ?? "active";
        $shop->save();
        $this->logAdminAction($shop, 'update_shop_status', [
            'status' => $validate["status"] ?? "active"
        ]);
        return response()->json(["message"=>"Status updated successfully"], 200);
    }

    public function exportShops(Request $request)
    {
        $perPage = $request->input('per_page', 100000);
        $nameShop=$request->name;
        $status=$request->status;
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $query = Shop::query();
        if(!empty($nameShop) && $nameShop !== 'null' && $nameShop !== 'undefined'){
          $query->where('name',"like","%$nameShop%");
        }
        if(!empty($status) && $status !== 'null' && $status !== 'undefined'){
            $query->where('status', $status);
        }
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }
        $allowedSort = ['created_at', 'total_sales', 'total_revenue', 'average_rating', 'total_products'];
        if (!in_array($sortBy, $allowedSort, true)) {
            $sortBy = 'created_at';
        }
        $sortDir = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';

        $shops = $query->with(['user'])->withCount('products')->orderBy($sortBy, $sortDir)->paginate($perPage);

        $callback = function () use ($shops) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id','shop_name','owner','email','status','products_count','total_sales','total_revenue','rating','created_at']);
            foreach ($shops as $shop) {
                fputcsv($handle, [
                    $shop->id,
                    $shop->shop_name ?? $shop->name,
                    $shop->user?->name,
                    $shop->user?->email,
                    $shop->status,
                    $shop->products_count,
                    $shop->total_sales,
                    $shop->total_revenue,
                    $shop->average_rating,
                    $shop->created_at,
                ]);
            }
            fclose($handle);
        };

        return response()->streamDownload($callback, 'shops.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function exportShopProducts(Request $request, $id)
    {
        $perPage = $request->input('per_page', 100000);
        $status = $request->input('status');
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $query = Product::where('shop_id', $id)->with(['category', 'license']);
        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        $allowedSort = ['created_at', 'base_price', 'title', 'status'];
        if (!in_array($sortBy, $allowedSort, true)) {
            $sortBy = 'created_at';
        }
        $sortDir = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';

        $products = $query->orderBy($sortBy, $sortDir)->paginate($perPage);

        $callback = function () use ($products) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id','title','status','base_price','category','license','created_at']);
            foreach ($products as $product) {
                fputcsv($handle, [
                    $product->id,
                    $product->title,
                    $product->status,
                    $product->base_price,
                    $product->category?->name,
                    $product->license?->name,
                    $product->created_at,
                ]);
            }
            fclose($handle);
        };

        return response()->streamDownload($callback, "shop_{$id}_products.csv", [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function exportShopOrders(Request $request, $id)
    {
        $perPage = $request->input('per_page', 100000);
        $status = $request->input('status');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = Order::query()
            ->with(['user', 'orderItems.product'])
            ->whereHas('orderItems.product', function ($q) use ($id) {
                $q->where('shop_id', $id);
            });

        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $callback = function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id','user','status','total','items','created_at']);
            foreach ($orders as $order) {
                $itemsCount = $order->orderItems?->count() ?? 0;
                fputcsv($handle, [
                    $order->id,
                    $order->user?->name,
                    $order->status,
                    $order->total_price,
                    $itemsCount,
                    $order->created_at,
                ]);
            }
            fclose($handle);
        };

        return response()->streamDownload($callback, "shop_{$id}_orders.csv", [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function logAdminAction(?Shop $shop, string $action, array $properties = []): void
    {
        $user = Auth::user();
        if (!$user) {
            return;
        }
        try {
            $logger = activity()->causedBy($user);
            if ($shop) {
                $logger->performedOn($shop);
            }
            if (!empty($properties)) {
                $logger->withProperties($properties);
            }
            $logger->log($action);
        } catch (\Exception $e) {
            // ignore logging errors
        }
    }

    private function safePublicUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        try {
            if (Storage::disk('spaces_2')->exists($path)) {
                return Storage::disk('spaces_2')->url($path);
            }
        } catch (\Throwable $e) {
            // ignore storage errors to avoid breaking the response
        }
        return null;
    }
}
