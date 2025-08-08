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
            $shop=Shop::with(["user","products.orders"])
            ->find($id);
            $url=Storage::disk('spaces_2')->url($shop->user->avatar);
            $shop->user->avatar=$url;
        return response()->json($shop, 200);
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

    public function getStatistiqueShop(Request $request){
        $id = $request->id;
        $totalProducts = Product::where('shop_id', $id)->count();
        $totalProfits = Profit::where('shop_id', $id)->where("is_paid",false)->sum('total_amount');
        $productactive = Product::where('shop_id', $id)->where('status', 'active')->count();
        $totalOredrs = Product::where('shop_id', $id)->withCount('orderItems')->get()->sum('order_items_count');
        return response()->json([
            'total_products' => $totalProducts,
            'total_profits' => $totalProfits,
            'product_active' => $productactive,
            'total_orders' => $totalOredrs
        ], 200);
      
    }
}
