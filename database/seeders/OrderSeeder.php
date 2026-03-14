<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('transactions')->delete();
        DB::table('profits')->delete();
        DB::table('order_items')->delete();
        DB::table('orders')->delete();
        $now       = Carbon::now();
        $buyerIds  = DB::table('users')->where('role', 'buyer')->pluck('id')->toArray();
        $products  = DB::table('products')->where('status', 'approved')->select('id', 'base_price', 'shop_id')->get()->toArray();

        if (empty($products)) {
            $this->command->warn('No approved products found. Skipping OrderSeeder.');
            return;
        }

        $statuses  = ['pending', 'paid', 'completed', 'completed', 'completed', 'cancelled'];
        $shops     = DB::table('shops')->pluck('user_id', 'id')->toArray(); // shopId => sellerId

        $orders     = [];
        $orderItems = [];
        $profits    = [];
        $transactions = [];

        for ($o = 1; $o <= 1000; $o++) {
            $buyerId    = $buyerIds[array_rand($buyerIds)];
            $status     = $statuses[array_rand($statuses)];
            $createdAt  = $now->copy()->subDays(rand(1, 500))->subHours(rand(0, 23));
            $itemCount  = rand(1, 4);
            $totalPrice = 0;

            // Pick random products for this order
            $pickedProducts = [];
            $usedProductIds = [];
            for ($p = 0; $p < $itemCount; $p++) {
                do {
                    $prod = $products[array_rand($products)];
                } while (in_array($prod->id, $usedProductIds));
                $usedProductIds[]  = $prod->id;
                $pickedProducts[]  = $prod;
                $totalPrice       += $prod->base_price;
            }

            $orders[] = [
                'user_id'    => $buyerId,
                'total_price'=> round($totalPrice, 2),
                'status'     => $status,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
        }

        // Bulk insert orders, then retrieve IDs
        foreach (array_chunk($orders, 200) as $chunk) {
            DB::table('orders')->insert($chunk);
        }

        // Rebuild with IDs for order_items
        $allOrders     = DB::table('orders')->orderBy('id')->get()->toArray();
        $productList   = $products; // array of stdClass

        foreach ($allOrders as $order) {
            $itemCount     = rand(1, 4);
            $usedProductIds = [];
            for ($p = 0; $p < $itemCount; $p++) {
                do {
                    $prod = $productList[array_rand($productList)];
                } while (in_array($prod->id, $usedProductIds));
                $usedProductIds[] = $prod->id;

                $price = $prod->base_price;
                $orderItems[] = [
                    'order_id'   => $order->id,
                    'product_id' => $prod->id,
                    'quantity'   => 1,
                    'price'      => $price,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->created_at,
                ];

                // Profit for seller
                if ($order->status === 'completed') {
                    $sellerId = null;
                    $shopId   = $prod->shop_id;
                    foreach ($shops as $sid => $uid) {
                        if ($sid === $prod->shop_id) {
                            $sellerId = $uid;
                            break;
                        }
                    }
                    $commission    = 0.30;
                    $platformProfit = round($price * $commission, 2);
                    $profits[] = [
                        'user_id'          => $sellerId ?? 2,
                        'shop_id'          => $shopId,
                        'order_id'         => $order->id,
                        'total_amount'     => $price,
                        'profit_platform'  => $platformProfit,
                        'is_paid'          => rand(0, 1) === 1,
                        'created_at'       => $order->created_at,
                        'updated_at'       => $order->created_at,
                    ];

                    // Transaction for buyer
                    $transactions[] = [
                        'user_id'          => $order->user_id,
                        'amount'           => $price,
                        'trx_type'         => '-',
                        'trx'              => substr(md5(uniqid('', true)), 0, 40),
                        'post_balance'     => round(rand(0, 50000) / 100, 2),
                        'charge'           => 0,
                        'remark'           => 'purchase',
                        'details'          => "Order #{$order->id} - Product #{$prod->id}",
                        'sourceable_type'  => 'App\\Models\\Order',
                        'sourceable_id'    => $order->id,
                        'status'           => 'success',
                        'created_at'       => $order->created_at,
                        'updated_at'       => $order->created_at,
                    ];
                }
            }
        }

        foreach (array_chunk($orderItems, 500) as $chunk) {
            DB::table('order_items')->insert($chunk);
        }
        foreach (array_chunk($profits, 500) as $chunk) {
            DB::table('profits')->insert($chunk);
        }
        foreach (array_chunk($transactions, 500) as $chunk) {
            DB::table('transactions')->insert($chunk);
        }
    }
}
