<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Disable FK checks for clean bulk inserts
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $this->call([
            // 1. Reference data (no FK dependencies)
            CategorySeeder::class,
            LicenseSeeder::class,
            ProductFormatSeeder::class,

            // 2. Users
            UserSeeder::class,

            // 3. Shops, wallets, product settings, products
            ShopAndProductSeeder::class,

            // 4. Orders, order items, profits, transactions
            OrderSeeder::class,

            // 5. Reviews
            ReviewSeeder::class,

            // 6. Support tickets & replies
            TicketSeeder::class,

            // 7. App settings (existing seeder)
            StorageSettingsSeeder::class,
        ]);

        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
