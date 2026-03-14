<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Clear dependent tables first, then users
        DB::table('transactions')->delete();
        DB::table('profits')->delete();
        DB::table('order_items')->delete();
        DB::table('orders')->delete();
        DB::table('reviews')->delete();
        DB::table('product_reviews')->delete();
        DB::table('ticket_replies')->delete();
        DB::table('tickets')->delete();
        DB::table('wallets')->delete();
        DB::table('products')->delete();
        DB::table('shops')->delete();
        DB::table('users')->delete();
        DB::statement('ALTER TABLE users AUTO_INCREMENT = 1');

        $now    = Carbon::now();
        $hashed = Hash::make('password');

        // ── Admin ─────────────────────────────────────────────
        DB::table('users')->insert([
            'name'              => 'Super Admin',
            'email'             => 'admin@market.com',
            'role'              => 'admin',
            'status'            => 'active',
            'email_verified_at' => $now,
            'password'          => Hash::make('123456789'),
            'created_at'        => $now,
            'updated_at'        => $now,
        ]);

        // ── Sellers (50) ──────────────────────────────────────
        $sellers = [];
        for ($i = 1; $i <= 50; $i++) {
            $sellers[] = [
                'name'              => "Seller User $i",
                'email'             => "seller$i@market.com",
                'role'              => 'seller',
                'status'            => $i % 10 === 0 ? 'inactive' : 'active',
                'email_verified_at' => $now,
                'password'          => Hash::make('123456789'),
                'created_at'        => $now->copy()->subDays(rand(10, 365)),
                'updated_at'        => $now,
            ];
        }
        DB::table('users')->insert($sellers);

        // ── Buyers (200) ──────────────────────────────────────
        $buyers = [];
        for ($i = 1; $i <= 200; $i++) {
            $statuses = ['active', 'active', 'active', 'pending', 'inactive'];
            $buyers[] = [
                'name'              => "Buyer User $i",
                'email'             => "buyer$i@market.com",
                'role'              => 'buyer',
                'status'            => $statuses[array_rand($statuses)],
                'email_verified_at' => $i % 20 === 0 ? null : $now,
                'password'          => $hashed,
                'created_at'        => $now->copy()->subDays(rand(1, 500)),
                'updated_at'        => $now,
            ];
        }
        DB::table('users')->insert($buyers);
    }
}
