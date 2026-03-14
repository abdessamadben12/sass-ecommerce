<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductFormatSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product_formats')->delete();
        DB::statement('ALTER TABLE product_formats AUTO_INCREMENT = 1');
        $now = Carbon::now();

        DB::table('product_formats')->insert([
            [
                'name'              => 'PDF Document',
                'extension'         => 'pdf',
                'mime_type'         => 'application/pdf',
                'max_file_size'     => 524288000, // 500 MB
                'allowed_categories'=> json_encode(['templates', 'graphics-design']),
                'validation_rules'  => json_encode(['min_pages' => 1]),
                'is_active'         => true,
                'created_at'        => $now,
            ],
            [
                'name'              => 'PNG Image',
                'extension'         => 'png',
                'mime_type'         => 'image/png',
                'max_file_size'     => 104857600, // 100 MB
                'allowed_categories'=> json_encode(['graphics-design', 'photos-images', 'fonts-typography']),
                'validation_rules'  => json_encode(['min_width' => 800, 'min_height' => 600]),
                'is_active'         => true,
                'created_at'        => $now,
            ],
            [
                'name'              => 'SVG Vector',
                'extension'         => 'svg',
                'mime_type'         => 'image/svg+xml',
                'max_file_size'     => 52428800, // 50 MB
                'allowed_categories'=> json_encode(['graphics-design', 'icons', 'logos']),
                'validation_rules'  => json_encode([]),
                'is_active'         => true,
                'created_at'        => $now,
            ],
            [
                'name'              => 'MP3 Audio',
                'extension'         => 'mp3',
                'mime_type'         => 'audio/mpeg',
                'max_file_size'     => 314572800, // 300 MB
                'allowed_categories'=> json_encode(['music-audio']),
                'validation_rules'  => json_encode(['min_bitrate' => 128]),
                'is_active'         => true,
                'created_at'        => $now,
            ],
            [
                'name'              => 'WAV Audio',
                'extension'         => 'wav',
                'mime_type'         => 'audio/wav',
                'max_file_size'     => 524288000, // 500 MB
                'allowed_categories'=> json_encode(['music-audio']),
                'validation_rules'  => json_encode([]),
                'is_active'         => true,
                'created_at'        => $now,
            ],
            [
                'name'              => 'ZIP Archive',
                'extension'         => 'zip',
                'mime_type'         => 'application/zip',
                'max_file_size'     => 2147483648, // 2 GB
                'allowed_categories'=> null,
                'validation_rules'  => json_encode([]),
                'is_active'         => true,
                'created_at'        => $now,
            ],
            [
                'name'              => 'PSD Photoshop',
                'extension'         => 'psd',
                'mime_type'         => 'image/vnd.adobe.photoshop',
                'max_file_size'     => 1073741824, // 1 GB
                'allowed_categories'=> json_encode(['graphics-design', 'templates']),
                'validation_rules'  => json_encode([]),
                'is_active'         => true,
                'created_at'        => $now,
            ],
            [
                'name'              => 'TTF Font',
                'extension'         => 'ttf',
                'mime_type'         => 'font/ttf',
                'max_file_size'     => 52428800, // 50 MB
                'allowed_categories'=> json_encode(['fonts-typography']),
                'validation_rules'  => json_encode([]),
                'is_active'         => true,
                'created_at'        => $now,
            ],
            [
                'name'              => 'OBJ 3D Model',
                'extension'         => 'obj',
                'mime_type'         => 'model/obj',
                'max_file_size'     => 524288000, // 500 MB
                'allowed_categories'=> json_encode(['3d-models']),
                'validation_rules'  => json_encode([]),
                'is_active'         => true,
                'created_at'        => $now,
            ],
            [
                'name'              => 'MP4 Video',
                'extension'         => 'mp4',
                'mime_type'         => 'video/mp4',
                'max_file_size'     => 2147483648, // 2 GB
                'allowed_categories'=> json_encode(['video-motion']),
                'validation_rules'  => json_encode(['min_resolution' => '720p']),
                'is_active'         => true,
                'created_at'        => $now,
            ],
        ]);
    }
}
