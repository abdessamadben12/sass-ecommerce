<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product_settings')->delete();
        DB::table('products')->delete();
        DB::table('categories')->delete();
        DB::statement('ALTER TABLE categories AUTO_INCREMENT = 1');
        $now = Carbon::now();

        $parents = [
            ['name' => 'Graphics & Design',    'slug' => 'graphics-design'],
            ['name' => 'Templates',             'slug' => 'templates'],
            ['name' => 'Music & Audio',         'slug' => 'music-audio'],
            ['name' => 'Video & Motion',        'slug' => 'video-motion'],
            ['name' => 'Fonts & Typography',    'slug' => 'fonts-typography'],
            ['name' => 'Photos & Images',       'slug' => 'photos-images'],
            ['name' => '3D Models',             'slug' => '3d-models'],
            ['name' => 'Code & Scripts',        'slug' => 'code-scripts'],
        ];

        $parentIds = [];
        foreach ($parents as $cat) {
            $id = DB::table('categories')->insertGetId([
                'name'        => $cat['name'],
                'slug'        => $cat['slug'],
                'parent_id'   => null,
                'level'       => 0,
                'path'        => $cat['slug'],
                'description' => 'Top-level category: ' . $cat['name'],
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);
            $parentIds[$cat['slug']] = $id;
        }

        $children = [
            ['name' => 'Logos',               'slug' => 'logos',               'parent' => 'graphics-design'],
            ['name' => 'Icons',               'slug' => 'icons',               'parent' => 'graphics-design'],
            ['name' => 'Illustrations',       'slug' => 'illustrations',       'parent' => 'graphics-design'],
            ['name' => 'Business Cards',      'slug' => 'business-cards',      'parent' => 'graphics-design'],
            ['name' => 'Social Media',        'slug' => 'social-media',        'parent' => 'graphics-design'],
            ['name' => 'Resume Templates',    'slug' => 'resume-templates',    'parent' => 'templates'],
            ['name' => 'Presentation',        'slug' => 'presentation',        'parent' => 'templates'],
            ['name' => 'Invoice Templates',   'slug' => 'invoice-templates',   'parent' => 'templates'],
            ['name' => 'Sound Effects',       'slug' => 'sound-effects',       'parent' => 'music-audio'],
            ['name' => 'Music Tracks',        'slug' => 'music-tracks',        'parent' => 'music-audio'],
            ['name' => 'Motion Graphics',     'slug' => 'motion-graphics',     'parent' => 'video-motion'],
            ['name' => 'After Effects',       'slug' => 'after-effects',       'parent' => 'video-motion'],
            ['name' => 'Sans Serif',          'slug' => 'sans-serif',          'parent' => 'fonts-typography'],
            ['name' => 'Script Fonts',        'slug' => 'script-fonts',        'parent' => 'fonts-typography'],
            ['name' => 'Stock Photos',        'slug' => 'stock-photos',        'parent' => 'photos-images'],
            ['name' => 'Textures',            'slug' => 'textures',            'parent' => 'photos-images'],
            ['name' => 'Characters',          'slug' => 'characters',          'parent' => '3d-models'],
            ['name' => 'Architecture',        'slug' => 'architecture',        'parent' => '3d-models'],
            ['name' => 'WordPress Themes',    'slug' => 'wordpress-themes',    'parent' => 'code-scripts'],
            ['name' => 'JavaScript',          'slug' => 'javascript',          'parent' => 'code-scripts'],
        ];

        foreach ($children as $cat) {
            $parentId = $parentIds[$cat['parent']];
            DB::table('categories')->insert([
                'name'        => $cat['name'],
                'slug'        => $cat['slug'],
                'parent_id'   => $parentId,
                'level'       => 1,
                'path'        => $cat['parent'] . '/' . $cat['slug'],
                'description' => 'Sub-category: ' . $cat['name'],
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);
        }
    }
}
