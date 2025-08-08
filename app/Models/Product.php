<?php

namespace App\Models;

use Hamcrest\Type\IsBoolean;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use App\Models\ProductReview;
use App\Models\ProductDownload;
use App\Models\ProductSetting;
use App\Models\License;
use App\Models\Categorie;
use App\Models\Shop;
use App\Models\ProductFormat;
use App\Models\Order_item;


class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'shop_id',
        'category_id',
        'product_setting_id',
        'license_id',
        'title',
        'slug',
        'description',
        'tags',
        'base_price',
        'minimum_price',
        'main_file_path',
        'main_file_size',
        'file_hash',
        'preview_images',
        'thumbnail_path',
        'status',
        'meta_title',
        'meta_description',
        'published_at',
        "reason"
    ];

    protected $casts = [
        'tags' => 'array',
        'preview_images' => 'array',
        'base_price' => 'decimal:2',
        'minimum_price' => 'decimal:2',
        'main_file_size' => 'integer',
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $dates = [
        'published_at'
    ];

    // Relations
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
    public function views(): HasMany
    {
        return $this->hasMany(ProductView::class,"product_id","id");
    }
    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_items','product_id','order_id');
    }
    
    public function category(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    public function file_format(): BelongsTo
    {
        return $this->belongsTo(ProductFormat::class,"product_setting_id","id");
    }

    public function productSetting(): BelongsTo
    {
        return $this->belongsTo(ProductSetting::class,"product_setting_id","id");
    }

    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }

    public function downloads(): HasMany
    {
        return $this->hasMany(ProductDownload::class,"product_id","id");
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class,"product_id","id");
    }
  
   

    // Scopes
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'approved')
                    ->whereNotNull('published_at')
                    ->where('published_at', '<=', now());
    }

    public function scopeByCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByShop(Builder $query, string $shopName): Builder
    {
        return $query->whereHas("shop", function ($q) use ($shopName) {
            $q->where('name', "%".$shopName."%");
        });

    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeByPriceRange(Builder $query, $minPrice = false,  $maxPrice = false)
    {
        if ($minPrice) {
            $query->orderBy('base_price', 'asc');
        }
        
        
        if ($maxPrice) {
            $query->orderBy('base_price', 'desc');
        }

        return $query;
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%")
              ->orWhereJsonContains('tags', $search);
        });
    }

    // Accessors & Mutators
    public function setTitleAttribute(string $value): void
    {
        $this->attributes['title'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->base_price, 2) . ' €';
    }

    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->main_file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getIsPublishedAttribute(): bool
    {
        return $this->status === 'approved' && 
               $this->published_at !== null && 
               $this->published_at <= now();
    }

    // Business Logic Methods
    public function canBeDownloaded(): bool
    {
        return $this->status === 'approved' && $this->is_published;
    }

    public function approve(): bool
    {
        $this->status = 'approved';
        $this->published_at = now();
        return $this->save();
    }

    public function reject(): bool
    {
        $this->status = 'rejected';
        return $this->save();
    }

    public function suspend(): bool
    {
        $this->status = 'suspended';
        return $this->save();
    }

    public function calculateFinalPrice(): float
    {
        $basePrice = $this->base_price;
        $multiplier = $this->license->price_multiplier ?? 1.0;
        $finalPrice = $basePrice * $multiplier;
        
        return max($finalPrice, $this->license->minimum_price ?? 0);
    }

    public function incrementDownloads(): void
    {
        $this->increment('download_count');
    }

    public function hasValidFileHash(): bool
    {
        return !empty($this->file_hash) && 
               hash_file('sha256', storage_path('app/' . $this->main_file_path)) === $this->file_hash;
    }
}