<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use App\Models\PaymentSetting;
use App\Models\EmailSetting;
use App\Models\CommissionSetting;
use App\Models\StorageSetting;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    private function normalizeBooleanLike($value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        $normalized = strtolower(trim((string) $value));
        if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
            return 'true';
        }
        if (in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
            return 'false';
        }

        return null;
    }

    private function maskSecret(?string $value): ?string
    {
        return $value ? '********' : null;
    }

    public function getGeneral()
    {
        $items = Setting::where('group', 'general')->get()->pluck('value', 'key');
        if ($items->isEmpty()) {
            $defaults = [
                'app_name' => config('app.name'),
                'app_url' => config('app.url'),
                'frontend_url' => env('FRONTEND_URL'),
                'support_email' => config('mail.from.address'),
                'logo_url' => env('APP_LOGO_URL'),
                'favicon_url' => env('APP_FAVICON_URL'),
                'default_currency' => env('APP_CURRENCY', 'USD'),
                'default_language' => env('APP_LOCALE', 'en'),
                'default_timezone' => env('APP_TIMEZONE', 'UTC'),
            ];
            foreach ($defaults as $key => $value) {
                if ($value === null) {
                    continue;
                }
                Setting::updateOrCreate(
                    ['group' => 'general', 'key' => $key],
                    ['value' => $value]
                );
            }
            $items = Setting::where('group', 'general')->get()->pluck('value', 'key');
        }
        $items = $this->normalizeAssetUrls($items);
        return response()->json($items, 200);
    }

    public function updateGeneral(Request $request)
    {
        $data = $request->validate([
            'app_name' => 'nullable|string|max:255',
            'app_url' => 'nullable|string|max:255',
            'frontend_url' => 'nullable|string|max:255',
            'support_email' => 'nullable|email|max:255',
            'logo_url' => 'nullable|string|max:255',
            'favicon_url' => 'nullable|string|max:255',
            'default_currency' => 'nullable|string|max:10',
            'default_language' => 'nullable|string|max:10',
            'default_timezone' => 'nullable|string|max:50',
        ]);

        $data = $this->normalizeAssetUrls(collect($data))->all();

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['group' => 'general', 'key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'General settings updated'], 200);
    }

    public function getPolicies()
    {
        $items = Setting::where('group', 'policies')->get()->pluck('value', 'key');
        if ($items->isEmpty()) {
            $defaults = [
                'terms_of_use' => '',
                'privacy_policy' => '',
                'legal_notice' => '',
            ];
            foreach ($defaults as $key => $value) {
                Setting::updateOrCreate(
                    ['group' => 'policies', 'key' => $key],
                    ['value' => $value]
                );
            }
            $items = Setting::where('group', 'policies')->get()->pluck('value', 'key');
        }
        return response()->json($items, 200);
    }

    public function updatePolicies(Request $request)
    {
        $data = $request->validate([
            'terms_of_use' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'legal_notice' => 'nullable|string',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['group' => 'policies', 'key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Policies updated'], 200);
    }

    public function uploadLogo(Request $request)
    {
        $data = $request->validate([
            'logo' => 'required|image|max:2048',
        ]);

        $path = $data['logo']->store('settings', 'public');
        $url = Storage::disk('public')->url($path);

        Setting::updateOrCreate(
            ['group' => 'general', 'key' => 'logo_url'],
            ['value' => $url]
        );

        return response()->json(['logo_url' => $url], 200);
    }

    public function uploadFavicon(Request $request)
    {
        $data = $request->validate([
            'favicon' => 'required|image|max:512',
        ]);

        $path = $data['favicon']->store('settings', 'public');
        $url = Storage::disk('public')->url($path);

        Setting::updateOrCreate(
            ['group' => 'general', 'key' => 'favicon_url'],
            ['value' => $url]
        );

        return response()->json(['favicon_url' => $url], 200);
    }

    private function normalizeAssetUrls($items)
    {
        $collection = $items instanceof \Illuminate\Support\Collection ? $items : collect($items);
        foreach (['logo_url', 'favicon_url'] as $key) {
            $value = $collection->get($key);
            if (!$value) {
                continue;
            }
            if (!preg_match('/^https?:\\/\\//i', $value)) {
                $collection->put($key, Storage::disk('public')->url($value));
            }
        }
        return $collection;
    }

    public function getPayment()
    {
        $settings = PaymentSetting::orderBy('provider')->get();
        if ($settings->isEmpty()) {
            PaymentSetting::create([
                'provider' => 'default',
                'is_enabled' => false,
                'currency' => 'USD',
                'platform_fee_percent' => 0,
                'min_withdrawal' => 0,
                'config' => [],
            ]);
            $settings = PaymentSetting::orderBy('provider')->get();
        }
        return response()->json($settings, 200);
    }

    public function updatePayment(Request $request)
    {
        $data = $request->validate([
            'provider' => 'required|string|max:50',
            'is_enabled' => 'boolean',
            'currency' => 'nullable|string|max:10',
            'platform_fee_percent' => 'nullable|numeric|min:0',
            'min_withdrawal' => 'nullable|numeric|min:0',
            'config' => 'nullable|array',
        ]);

        $setting = PaymentSetting::updateOrCreate(
            ['provider' => $data['provider']],
            $data
        );

        return response()->json($setting, 200);
    }

    public function getEmail()
    {
        $setting = EmailSetting::first();
        if (!$setting) {
            $setting = EmailSetting::create([
                'is_enabled' => true,
                'driver' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
                'password' => config('mail.mailers.smtp.password'),
                'encryption' => config('mail.mailers.smtp.encryption'),
                'from_address' => config('mail.from.address'),
                'from_name' => config('mail.from.name'),
            ]);
        }
        $data = $setting->toArray();
        $data['password'] = $this->maskSecret($data['password'] ?? null);
        return response()->json($data, 200);
    }

    public function updateEmail(Request $request)
    {
        $data = $request->validate([
            'is_enabled' => 'boolean',
            'driver' => 'nullable|string|max:50',
            'host' => 'nullable|string|max:255',
            'port' => 'nullable|integer',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'encryption' => 'nullable|string|max:20',
            'from_address' => 'nullable|email|max:255',
            'from_name' => 'nullable|string|max:255',
            'reply_to' => 'nullable|email|max:255',
        ]);

        $setting = EmailSetting::first();
        if (!$setting) {
            $setting = EmailSetting::create([]);
        }
        if (isset($data['password']) && $data['password'] === '********') {
            unset($data['password']);
        }
        $setting->update($data);

        return response()->json(['message' => 'Email settings updated'], 200);
    }

    public function getCommission()
    {
        $setting = CommissionSetting::first();
        if (!$setting) {
            $setting = CommissionSetting::create([
                'platform_percent' => 0,
                'seller_percent' => 0,
                'buyer_fee_percent' => 0,
                'min_withdrawal' => 0,
            ]);
        }
        return response()->json($setting, 200);
    }

    public function updateCommission(Request $request)
    {
        $data = $request->validate([
            'platform_percent' => 'nullable|numeric|min:0|max:100',
            'seller_percent' => 'nullable|numeric|min:0|max:100',
            'buyer_fee_percent' => 'nullable|numeric|min:0|max:100',
            'min_withdrawal' => 'nullable|numeric|min:0',
        ]);

        $setting = CommissionSetting::first();
        if (!$setting) {
            $setting = CommissionSetting::create([]);
        }
        $setting->update($data);

        return response()->json(['message' => 'Commission settings updated'], 200);
    }

    public function getStorage()
    {
        $setting = StorageSetting::first();
        if (!$setting) {
            $setting = StorageSetting::create([
                'provider' => config('filesystems.default', 'local'),
                'endpoint' => env('DO_SPACES_ENDPOINT_2'),
                'region' => env('DO_SPACES_REGION_2'),
                'bucket' => env('DO_SPACES_BUCKET_2'),
                'access_key' => env('DO_SPACES_KEY_2'),
                'secret_key' => env('DO_SPACES_SECRET_2'),
                'public_url' => env('DO_SPACES_ENDPOINT_2'),
                'max_upload_mb' => 50,
                'allowed_mimes' => [],
            ]);
        }
        $data = $setting->toArray();
        $data['secret_key'] = $this->maskSecret($data['secret_key'] ?? null);
        return response()->json($data, 200);
    }

    public function updateStorage(Request $request)
    {
        $data = $request->validate([
            'provider' => 'nullable|string|max:50',
            'endpoint' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:50',
            'bucket' => 'nullable|string|max:255',
            'access_key' => 'nullable|string|max:255',
            'secret_key' => 'nullable|string|max:255',
            'public_url' => 'nullable|string|max:255',
            'max_upload_mb' => 'nullable|integer|min:1',
            'allowed_mimes' => 'nullable|array',
        ]);

        $setting = StorageSetting::first();
        if (!$setting) {
            $setting = StorageSetting::create([]);
        }
        if (isset($data['secret_key']) && $data['secret_key'] === '********') {
            unset($data['secret_key']);
        }
        $setting->update($data);

        return response()->json(['message' => 'Storage settings updated'], 200);
    }

    public function getNotifications()
    {
        $items = Setting::where('group', 'notifications')->get()->pluck('value', 'key');
        if ($items->isEmpty()) {
            $defaults = [
                'alerts_enabled' => 'true',
                'alerts_email' => config('mail.from.address'),
                'system_emails_enabled' => 'true',
            ];
            foreach ($defaults as $key => $value) {
                Setting::updateOrCreate(
                    ['group' => 'notifications', 'key' => $key],
                    ['value' => $value]
                );
            }
            $items = Setting::where('group', 'notifications')->get()->pluck('value', 'key');
        }
        return response()->json($items, 200);
    }

    public function updateNotifications(Request $request)
    {
        $data = $request->validate([
            'alerts_enabled' => 'nullable',
            'alerts_email' => 'nullable|email',
            'system_emails_enabled' => 'nullable',
        ]);

        foreach (['alerts_enabled', 'system_emails_enabled'] as $booleanKey) {
            if (array_key_exists($booleanKey, $data)) {
                $normalized = $this->normalizeBooleanLike($data[$booleanKey]);
                if ($normalized === null) {
                    return response()->json([
                        'message' => "Invalid value for {$booleanKey}. Use true or false.",
                    ], 422);
                }
                $data[$booleanKey] = $normalized;
            }
        }

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['group' => 'notifications', 'key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Notifications updated'], 200);
    }

    public function getMaintenance()
    {
        $items = Setting::where('group', 'maintenance')->get()->pluck('value', 'key');
        if ($items->isEmpty()) {
            $defaults = [
                'maintenance_mode' => 'false',
                'maintenance_message' => '',
            ];
            foreach ($defaults as $key => $value) {
                Setting::updateOrCreate(
                    ['group' => 'maintenance', 'key' => $key],
                    ['value' => $value]
                );
            }
            $items = Setting::where('group', 'maintenance')->get()->pluck('value', 'key');
        }
        return response()->json($items, 200);
    }

    public function updateMaintenance(Request $request)
    {
        $data = $request->validate([
            'maintenance_mode' => 'nullable',
            'maintenance_message' => 'nullable|string',
        ]);

        if (array_key_exists('maintenance_mode', $data)) {
            $normalized = $this->normalizeBooleanLike($data['maintenance_mode']);
            if ($normalized === null) {
                return response()->json([
                    'message' => 'Invalid value for maintenance_mode. Use true or false.',
                ], 422);
            }
            $data['maintenance_mode'] = $normalized;
        }

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['group' => 'maintenance', 'key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Maintenance updated'], 200);
    }

    public function getSeo()
    {
        $items = Setting::where('group', 'seo')->get()->pluck('value', 'key');
        $defaults = [
            'meta_title' => '',
            'meta_description' => '',
            'meta_keywords' => '',
            'canonical_base' => '',
            'robots' => 'index,follow',
            'robots_url' => '',
            'sitemap_url' => '',
        ];

        if ($items->isEmpty()) {
            foreach ($defaults as $key => $value) {
                Setting::updateOrCreate(
                    ['group' => 'seo', 'key' => $key],
                    ['value' => $value]
                );
            }
            $items = Setting::where('group', 'seo')->get()->pluck('value', 'key');
        } else {
            foreach ($defaults as $key => $value) {
                if (!$items->has($key)) {
                    Setting::updateOrCreate(
                        ['group' => 'seo', 'key' => $key],
                        ['value' => $value]
                    );
                    $items->put($key, $value);
                }
            }
        }
        return response()->json($items, 200);
    }

    public function updateSeo(Request $request)
    {
        $data = $request->validate([
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'canonical_base' => 'nullable|string|max:255',
            'robots' => 'nullable|string|max:50',
            'robots_url' => 'nullable|url|max:255',
            'sitemap_url' => 'nullable|url|max:255',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['group' => 'seo', 'key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'SEO settings updated'], 200);
    }
}
