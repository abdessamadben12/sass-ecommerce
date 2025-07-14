<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\ShopResource;
use App\Http\Resources\ProductResource;

class ShopProductController extends Controller
{
      public function getShops (Request $request){
        $perPage = $request->input('per_page', 10);
        $nameShop=$request->name;
        $status=$request->status;
        $query = Shop::query();
        if(!empty($nameShop) && $nameShop !== 'null' && $nameShop !== 'undefined'){
          $query->where('name',"like","%$nameShop%");
        }
        if(!empty($status) && $status !== 'null' && $status !== 'undefined'){
            $query->where('status', $status);
        }

        $shops=$query->with(["user", "products"])->withCount('products')->orderBy('created_at', 'desc')->paginate($perPage);
        return response()->json($shops, 200);
    }

    public function getShop(Request $request){
        $id = $request->id;
        $shop=Shop::with(["user.details","profits","products.orderItems.order"])->withSum("profits","total_amount")->withCount("products")->whereHas("products", function ($q) {
            // counter les order
        })->find($id);
         $ordersIds = collect($shop->products)
        ->flatMap(function ($product) {
            return $product->orderItems->pluck('order.id');
        })
        ->unique()
        ->filter()
        ->values();
        $totalOrders = $ordersIds->count();
        $totalProfits = $shop->profits_sum_total_amount ?? 0;
        $shop->total_orders = $totalOrders;
        $shop->total_profits = $totalProfits;
        return response()->json(new ShopResource($shop), 200);
    }
    public function getProducts(Request $request){
            $perPage = $request->input('per_page', 10);
            $nameProduct=$request->name;
            $nameShop=$request->name;
            $category=$request->category;
            $status=$request->status;
            $query = Product::query();
        if(!empty($name) && $name !== 'null' && $name !=="undefined"){
          $query->where('name',"like","%$nameProduct%");
           $query->whereHas('shop',function($q) use($nameShop){
            $q->where('name',"like","%$nameShop%");
          });
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
        }



