<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ShopAndProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('wallets')->delete();
        DB::table('shops')->delete();
        DB::table('product_settings')->delete();
        DB::table('products')->delete();
        $now = Carbon::now();

        // ── Wallets for ALL users ──────────────────────────────
        $userIds = DB::table('users')->pluck('id')->toArray();
        $wallets = [];
        foreach ($userIds as $uid) {
            $wallets[] = [
                'user_id'    => $uid,
                'balance'    => round(rand(0, 50000) / 100, 2),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('wallets')->insert($wallets);

        // ── Shops (one per seller) ─────────────────────────────
        $sellerIds = DB::table('users')->where('role', 'seller')->pluck('id')->toArray();

        $shopNames = [
            'PixelPerfect Studio', 'Creative Nest', 'Design Lab', 'ArtWave', 'VectorVault',
            'StudioAlpha', 'InkMasters', 'TemplateHive', 'FontForge', 'AudioAtlas',
            'CreativeCorner', 'DesignDepot', 'GraphicGarden', 'ShapeShop', 'ColorCraft',
            'MotionMakers', 'SoundScape', 'PixelPulse', 'IllustroHub', 'TypeCraft',
            'RenderZone', 'FrameLab', 'VectorsPlus', 'BrushStudio', 'DigitalDen',
            'LayerLoft', 'AssetArena', 'ProTemplate', 'DesignForge', 'CreativeCloud9',
            'StudioPrime', 'MoGraph', 'IconFactory', 'SnapAssets', 'TuneVault',
            'WaveStudio', 'NeonDesigns', 'PenPath', 'MintStudio', 'BlueArc',
            'StellarMedia', 'UrbanPixel', 'NovaCraft', 'EchoStudio', 'PrismLab',
            'ZenAssets', 'PureDesign', 'AlphaCreative', 'BoldBrands', 'FluxStudio',
        ];

        $shopIds    = [];
        $shopInsert = [];
        foreach ($sellerIds as $idx => $sellerId) {
            $shopName = $shopNames[$idx] ?? "Shop $idx";
            $slug     = strtolower(str_replace(' ', '-', $shopName)) . '-' . $sellerId;
            $shopInsert[] = [
                'user_id'         => $sellerId,
                'shop_name'       => $shopName,
                'shop_slug'       => $slug,
                'description'     => "Welcome to $shopName! We offer premium digital assets.",
                'commission_rate' => [20, 25, 30][rand(0, 2)],
                'total_products'  => 0,
                'total_sales'     => rand(0, 500),
                'total_revenue'   => round(rand(0, 1000000) / 100, 2),
                'average_rating'  => round(rand(30, 50) / 10, 2),
                'logo'            => null,
                'status'          => $idx % 15 === 0 ? 'inactive' : 'active',
                'created_at'      => $now->copy()->subDays(rand(30, 400)),
                'updated_at'      => $now,
            ];
        }
        DB::table('shops')->insert($shopInsert);

        $shopIds = DB::table('shops')->pluck('id', 'user_id')->toArray();

        // ── Product Formats & Settings ─────────────────────────
        $formatIds   = DB::table('product_formats')->pluck('id')->toArray();
        $categoryIds = DB::table('categories')->where('level', 1)->pluck('id')->toArray();
        $licenseIds  = DB::table('licenses')->pluck('id')->toArray();

        // Create one product_setting per category+format combo (sample set)
        $settingInsert = [];
        $usedCombos    = [];
        foreach ($categoryIds as $catId) {
            foreach (array_slice($formatIds, 0, 3) as $fmtId) {
                $key = "$catId-$fmtId";
                if (isset($usedCombos[$key])) continue;
                $usedCombos[$key] = true;
                $settingInsert[] = [
                    'category_id'                        => $catId,
                    'format_id'                          => $fmtId,
                    'min_width'                          => 800,
                    'min_height'                         => 600,
                    'min_file_size'                      => 1024,
                    'max_file_size'                      => 104857600,
                    'required_dpi'                       => 72,
                    'requires_description_min_length'    => 100,
                    'requires_tags_min_count'            => 3,
                    'requires_preview_images_min'        => 1,
                    'auto_virus_scan'                    => true,
                    'auto_duplicate_check'               => true,
                    'auto_quality_assessment'            => true,
                    'requires_manual_review'             => true,
                    'created_at'                         => $now,
                ];
            }
        }
        DB::table('product_settings')->insert($settingInsert);

        $settingIds = DB::table('product_settings')->pluck('id')->toArray();

        // ── Products (500) ────────────────────────────────────
        $shopIdList   = array_values($shopIds);
        $statuses     = ['approved', 'approved', 'approved', 'pending', 'rejected', 'draft', 'suspended'];
        $productTitles = [
            'Minimal Logo Pack', 'Business Card Template', 'Social Media Kit', 'Icon Set Pro',
            'Watercolor Bundle', 'Abstract Backgrounds', 'Flyer Template', 'Resume Template',
            'Motion Graphic Pack', 'Sound Effect Bundle', 'Font Family', 'UI Kit Dark',
            'Presentation Deck', 'Brand Identity Kit', 'Illustration Pack', 'Pattern Collection',
            'Photo Presets', '3D Character Model', 'WordPress Theme', 'Landing Page HTML',
        ];

        $products = [];
        for ($i = 1; $i <= 500; $i++) {
            $shopId    = $shopIdList[array_rand($shopIdList)];
            $catId     = $categoryIds[array_rand($categoryIds)];
            $settingId = $settingIds[array_rand($settingIds)];
            $licenseId = $licenseIds[array_rand($licenseIds)];
            $title     = $productTitles[array_rand($productTitles)] . " v$i";
            $slug      = strtolower(str_replace([' ', "'"], ['-', ''], $title)) . '-' . $i;
            $basePrice = round(rand(299, 9999) / 100, 2);
            $status    = $statuses[array_rand($statuses)];

            $products[] = [
                'shop_id'            => $shopId,
                'category_id'        => $catId,
                'product_setting_id' => $settingId,
                'license_id'         => $licenseId,
                'title'              => $title,
                'slug'               => $slug,
                'description'        => "High-quality digital asset: $title. Perfect for professional projects.",
                'tags'               => json_encode(['design', 'digital', 'creative', 'premium']),
                'base_price'         => $basePrice,
                'minimum_price'      => round($basePrice * 0.7, 2),
                'main_file_path'     => "products/$i/main.zip",
                'main_file_size'     => rand(1024000, 50000000),
                'file_hash'          => bin2hex(random_bytes(16)),
                'preview_images'     => json_encode(["products/$i/preview1.jpg"]),
                'thumbnail_path'     => "products/$i/thumb.jpg",
                'status'             => $status,
                'reason'             => $status === 'rejected' ? 'Content does not meet quality standards.' : null,
                'published_at'       => in_array($status, ['approved']) ? $now->copy()->subDays(rand(1, 300)) : null,
                'created_at'         => $now->copy()->subDays(rand(1, 365)),
                'updated_at'         => $now,
                'deleted_at'         => null,
            ];
        }
        // Insert in chunks for performance
        foreach (array_chunk($products, 100) as $chunk) {
            DB::table('products')->insert($chunk);
        }
    }
}
