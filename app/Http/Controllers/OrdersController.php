<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class OrdersController extends Controller
{
 public function Statistics(Request $request)
    {
        $totalOrders = Order::count();
        $totalSales = Order::sum('total_price');
        $totalPendingOrders = Order::where('status', 'pending')->count();
        $totalCompletedOrders = Order::where('status', 'completed')->count();

        return response()->json([
            'total_orders' => $totalOrders,
            'total_sales' => $totalSales,
            'total_pending_orders' => $totalPendingOrders,
            'total_completed_orders' => $totalCompletedOrders,
        ]);
    }
  public function getOrders(Request $request)
    {
        $per_page = $request->input('per_page', 10);
        $status = $request->input('status', null);
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
        $NameShopOrUserName = $request->input('search', null);
        $category = $request->input('category', null);
        $query = Order::query();
        if($NameShopOrUserName!==null){
            $query->whereHas("orderItems.product.shop", function ($q) use ($NameShopOrUserName) {
                $q->where('name', 'like', '%' . $NameShopOrUserName . '%');
            })->orWhereHas('user', function ($q) use ($NameShopOrUserName) {
                $q->where('name', 'like', '%' . $NameShopOrUserName . '%');
            });
        }
        if($status !== null) {
            $query->where('status', $status);
        }
        if($startDate !== null && $endDate !== null) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        elseif ($startDate !== null) {
            $query->where('created_at', '>=', $startDate);
        } elseif ($endDate !== null) {
            $query->where('created_at', '<=', $endDate);
        }
        if($category !== null) {
            $query->whereHas('orderItems.product.category', function ($q) use ($category) {
                $q->where('name', 'like', '%' . $category . '%');
            });
        }
        $orders = $query->with(['orderItems.product.shop', 'user'])->orderBy('created_at', 'desc')->paginate($per_page);
        return response()->json($orders, 200);
    }
    public function getOrderDetail(Request $request)
    {
        $id = $request->id;
        $order = Order::with(['orderItems.product.shop', 'user'])->find($id);
        return response()->json($order, 200);
    }
    
   
}
