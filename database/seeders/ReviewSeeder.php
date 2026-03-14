<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('reviews')->delete();
        DB::table('product_reviews')->delete();
        $now = Carbon::now();

        $buyerIds  = DB::table('users')->where('role', 'buyer')->pluck('id')->toArray();
        $products  = DB::table('products')->where('status', 'approved')->pluck('id')->toArray();

        if (empty($products) || empty($buyerIds)) return;

        $reviewStatuses = ['approved', 'approved', 'approved', 'pending', 'rejected'];
        $titles         = [
            'Amazing quality!', 'Great value for money', 'Exactly what I needed',
            'Professional and clean', 'Would buy again', 'Fantastic design',
            'Perfect for my project', 'High quality asset', 'Very versatile',
            'Highly recommended',
        ];
        $comments = [
            'The files are well organized and easy to work with.',
            'Excellent quality, totally worth the price.',
            'Great design, saved me hours of work.',
            'Very professional. Will use in future projects.',
            'Clean, modern, and easy to customize.',
        ];

        $productReviews = [];
        $usedPairs      = [];

        for ($i = 0; $i < 800; $i++) {
            $productId = $products[array_rand($products)];
            $userId    = $buyerIds[array_rand($buyerIds)];
            $key       = "$productId-$userId";
            if (isset($usedPairs[$key])) continue;
            $usedPairs[$key] = true;

            $status = $reviewStatuses[array_rand($reviewStatuses)];
            $productReviews[] = [
                'product_id'           => $productId,
                'user_id'              => $userId,
                'rating'               => rand(1, 5),
                'title'                => $titles[array_rand($titles)],
                'comment'              => $comments[array_rand($comments)],
                'status'               => $status,
                'rejection_reason'     => $status === 'rejected' ? 'Inappropriate content.' : null,
                'moderated_by'         => null,
                'moderated_at'         => null,
                'helpful_count'        => rand(0, 50),
                'not_helpful_count'    => rand(0, 10),
                'is_verified_purchase' => rand(0, 1) === 1,
                'purchase_id'          => null,
                'metadata'             => null,
                'vendor_response'      => rand(0, 4) === 0 ? 'Thank you for your feedback!' : null,
                'vendor_response_at'   => rand(0, 4) === 0 ? $now->copy()->subDays(rand(1, 30)) : null,
                'vendor_response_by'   => null,
                'created_at'           => $now->copy()->subDays(rand(1, 300)),
                'updated_at'           => $now,
                'deleted_at'           => null,
            ];
        }

        foreach (array_chunk($productReviews, 200) as $chunk) {
            DB::table('product_reviews')->insert($chunk);
        }

        // ── Report flags (reviews table) ─────────────────────
        $prIds       = DB::table('product_reviews')->pluck('id')->toArray();
        $reporterIds = $buyerIds;
        $modStatuses = ['pending', 'reviewed', 'removed'];
        $reportRows  = [];

        for ($r = 0; $r < 100; $r++) {
            $reportRows[] = [
                'product_review_id' => $prIds[array_rand($prIds)],
                'reported_by'       => $reporterIds[array_rand($reporterIds)],
                'is_reported'       => true,
                'report_reason'     => 'Spam / misleading content.',
                'moderation_status' => $modStatuses[array_rand($modStatuses)],
                'created_at'        => $now->copy()->subDays(rand(1, 100)),
                'updated_at'        => $now,
            ];
        }

        DB::table('reviews')->insert($reportRows);
    }
}
