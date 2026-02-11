<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StorageSetting;

class StorageSettingsSeeder extends Seeder
{
    public function run(): void
    {
        StorageSetting::updateOrCreate(
            ['provider' => 'spaces_2'],
            [
                'endpoint' => 'https://nyc3.digitaloceanspaces.com',
                'region' => 'nyc3',
                'bucket' => 'fileetsy',
                'access_key' => '6LdYomYsAAAAAIHPbK8Yr3HUCReg4Eu6dtewaadt',
                'secret_key' => '6LdYomYsAAAAACZ5D93zAclVcyR1Nf6SDwK3Uzea',
                'public_url' => 'https://nyc3.digitaloceanspaces.com',
                'max_upload_mb' => 50,
                'allowed_mimes' => [],
            ]
        );

        StorageSetting::updateOrCreate(
            ['provider' => 'spaces_1'],
            [
                'endpoint' => 'https://nyc3.digitaloceanspaces.com',
                'region' => 'nyc3',
                'bucket' => 'digitalproductstore',
                'access_key' => 'DO00GHYYTGP32RDEMFA3',
                'secret_key' => 'BrShwVWKnkqFQxSKEnEVoLEnVk3S7UCuE+gpjcgCXwc',
                'public_url' => 'https://nyc3.digitaloceanspaces.com',
                'max_upload_mb' => 50,
                'allowed_mimes' => [],
            ]
        );
    }
}
