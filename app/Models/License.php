<?php

namespace App\Models;

use DateTime;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class License extends Model
{
    use HasFactory;

    public $timestamps = false;

        protected $fillable = [
        'name', 'slug', 'description', 'terms_and_conditions',
        'usage_rights', 'price_multiplier', 'minimum_price',
        'download_limit', 'time_limit_days', 'is_active', 'sort_order'
    ];

    protected $casts = [
        'usage_rights' => 'array',
        'price_multiplier' => 'decimal:2',
        'minimum_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];
    // Relations
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // les donload 
     public function hasDownloadLimit(): bool
    {
        return !is_null($this->download_limit);
    }

    public function hasTimeLimit(): bool
    {
        return !is_null($this->time_limit_days);
    }
    // Business Logic
    public function canDownload(int $currentDownloads = 0): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->download_limit && $currentDownloads >= $this->download_limit) {
            return false;
        }

        return true;
    }

    public function isExpired(DateTime $purchaseDate): bool
    {
        if (!$this->time_limit_days) {
            return false;
        }

        $expirationDate = clone $purchaseDate;
        $expirationDate->modify("+{$this->time_limit_days} days");

        return $expirationDate < new \DateTime();
    }

    public function calculatePrice(float $basePrice): float
    {
        $finalPrice = $basePrice * $this->price_multiplier;
        return max($finalPrice, $this->minimum_price);
    }

    public function hasUsageRight(string $right): bool
    {
        return in_array($right, $this->usage_rights ?? []);
    }

    public function getUsageRightsFormatted(): array
    {
        $rights = $this->usage_rights ?? [];
        $formatted = [];

        foreach ($rights as $right) {
            $formatted[] = ucfirst(str_replace('_', ' ', $right));
        }

        return $formatted;
    }

    // Accessors
    public function getFormattedPriceMultiplierAttribute(): string
    {
        return 'x' . number_format($this->price_multiplier, 2);
    }

    public function getFormattedMinimumPriceAttribute(): string
    {
        return number_format($this->minimum_price, 2) . ' €';
    }
}