<?php

namespace App\Providers;

use App\Models\EmailSetting;
use App\Models\Setting;
use App\Models\StorageSetting;
use App\Services\MoneyService;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
         $this->app->singleton(MoneyService::class, function ($app) {
        return new MoneyService();
    });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::if('seller', function () {
        return auth()->check() && auth()->user()->role === 'seller';
    });
        try {
            if (Schema::hasTable('settings')) {
                $general = Setting::where('group', 'general')->get()->pluck('value', 'key');
                if ($general->has('app_name')) {
                    config(['app.name' => $general->get('app_name')]);
                }
                if ($general->has('app_url')) {
                    config(['app.url' => $general->get('app_url')]);
                }
                if ($general->has('default_currency')) {
                    config(['app.currency' => $general->get('default_currency')]);
                }
            }

            if (Schema::hasTable('email_settings')) {
                $email = EmailSetting::first();
                if ($email) {
                    config(['mail.default' => $email->driver ?? config('mail.default')]);
                    config([
                        'mail.mailers.smtp.host' => $email->host ?? config('mail.mailers.smtp.host'),
                        'mail.mailers.smtp.port' => $email->port ?? config('mail.mailers.smtp.port'),
                        'mail.mailers.smtp.username' => $email->username ?? config('mail.mailers.smtp.username'),
                        'mail.mailers.smtp.password' => $email->password ?? config('mail.mailers.smtp.password'),
                        'mail.mailers.smtp.encryption' => $email->encryption ?? config('mail.mailers.smtp.encryption'),
                    ]);
                    if ($email->from_address) {
                        config(['mail.from.address' => $email->from_address]);
                    }
                    if ($email->from_name) {
                        config(['mail.from.name' => $email->from_name]);
                    }
                }
            }

            if (Schema::hasTable('storage_settings')) {
                $storage = StorageSetting::first();
                if ($storage) {
                    config(['filesystems.default' => $storage->provider ?? config('filesystems.default')]);
                    if ($storage->provider === 'spaces_2') {
                        config([
                            'filesystems.disks.spaces_2.key' => $storage->access_key ?? config('filesystems.disks.spaces_2.key'),
                            'filesystems.disks.spaces_2.secret' => $storage->secret_key ?? config('filesystems.disks.spaces_2.secret'),
                            'filesystems.disks.spaces_2.region' => $storage->region ?? config('filesystems.disks.spaces_2.region'),
                            'filesystems.disks.spaces_2.bucket' => $storage->bucket ?? config('filesystems.disks.spaces_2.bucket'),
                            'filesystems.disks.spaces_2.endpoint' => $storage->endpoint ?? config('filesystems.disks.spaces_2.endpoint'),
                        ]);
                    }
                }
            }
        } catch (\Throwable $e) {
            // avoid breaking app if settings are not ready
        }
    }
}
