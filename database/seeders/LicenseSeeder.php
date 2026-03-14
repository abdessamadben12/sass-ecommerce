<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LicenseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('licenses')->delete();
        DB::statement('ALTER TABLE licenses AUTO_INCREMENT = 1');
        $now = Carbon::now();

        DB::table('licenses')->insert([
            [
                'name'               => 'Personal Use',
                'slug'               => 'personal-use',
                'description'        => 'For personal, non-commercial projects only.',
                'terms_and_conditions' => 'Cannot be used for commercial purposes. No redistribution allowed.',
                'usage_rights'       => json_encode(['personal' => true, 'commercial' => false, 'resale' => false]),
                'price_multiplier'   => 1.00,
                'minimum_price'      => 0.00,
                'download_limit'     => 5,
                'time_limit_days'    => null,
                'is_active'          => true,
                'sort_order'         => 1,
                'created_at'         => $now,
            ],
            [
                'name'               => 'Commercial Use',
                'slug'               => 'commercial-use',
                'description'        => 'Use in commercial projects, websites, and products.',
                'terms_and_conditions' => 'Can be used commercially. No resale of the asset itself.',
                'usage_rights'       => json_encode(['personal' => true, 'commercial' => true, 'resale' => false]),
                'price_multiplier'   => 2.50,
                'minimum_price'      => 9.99,
                'download_limit'     => null,
                'time_limit_days'    => null,
                'is_active'          => true,
                'sort_order'         => 2,
                'created_at'         => $now,
            ],
            [
                'name'               => 'Extended Commercial',
                'slug'               => 'extended-commercial',
                'description'        => 'Full commercial rights including resale in end products.',
                'terms_and_conditions' => 'Can be resold as part of end products. Up to 500 unit sales.',
                'usage_rights'       => json_encode(['personal' => true, 'commercial' => true, 'resale' => true, 'units' => 500]),
                'price_multiplier'   => 5.00,
                'minimum_price'      => 29.99,
                'download_limit'     => null,
                'time_limit_days'    => null,
                'is_active'          => true,
                'sort_order'         => 3,
                'created_at'         => $now,
            ],
            [
                'name'               => 'Editorial Use',
                'slug'               => 'editorial-use',
                'description'        => 'Use in editorial content like blogs and news articles.',
                'terms_and_conditions' => 'Editorial use only. Not for commercial advertising.',
                'usage_rights'       => json_encode(['personal' => true, 'commercial' => false, 'editorial' => true]),
                'price_multiplier'   => 1.50,
                'minimum_price'      => 4.99,
                'download_limit'     => 10,
                'time_limit_days'    => 365,
                'is_active'          => true,
                'sort_order'         => 4,
                'created_at'         => $now,
            ],
            [
                'name'               => 'Unlimited License',
                'slug'               => 'unlimited-license',
                'description'        => 'No restrictions on usage or resale quantity.',
                'terms_and_conditions' => 'Unlimited commercial use, unlimited resale, unlimited downloads.',
                'usage_rights'       => json_encode(['personal' => true, 'commercial' => true, 'resale' => true, 'unlimited' => true]),
                'price_multiplier'   => 10.00,
                'minimum_price'      => 99.99,
                'download_limit'     => null,
                'time_limit_days'    => null,
                'is_active'          => true,
                'sort_order'         => 5,
                'created_at'         => $now,
            ],
        ]);
    }
}
