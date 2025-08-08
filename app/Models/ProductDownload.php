<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class ProductDownload extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'downloaded_at',
        'ip_address',
        'user_agent',
        'download_token',
        'token_expires_at',
        'file_name',
        'file_size',
        'file_hash',
        'status',
        'failure_reason',
        'license_type',
        'license_price',
        'metadata'
    ];

    protected $casts = [
        'downloaded_at' => 'datetime',
        'token_expires_at' => 'datetime',
        'file_size' => 'integer',
        'license_price' => 'decimal:2',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relations
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByProduct(Builder $query, int $productId): Builder
    {
        return $query->where('product_id', $productId);
    }

    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('downloaded_at', '>=', now()->subDays($days));
    }

    public function scopeByDateRange(Builder $query, Carbon $startDate, Carbon $endDate): Builder
    {
        return $query->whereBetween('downloaded_at', [$startDate, $endDate]);
    }

    public function scopeWithValidToken(Builder $query): Builder
    {
        return $query->whereNotNull('download_token')
                    ->where('token_expires_at', '>', now());
    }

    // Accessors
    public function getFileSizeHumanAttribute(): string
    {
        if (!$this->file_size) {
            return 'N/A';
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getFormattedLicensePriceAttribute(): string
    {
        return $this->license_price ? number_format($this->license_price, 2) . ' €' : 'N/A';
    }

    public function getIsRecentAttribute(): bool
    {
        return $this->downloaded_at && $this->downloaded_at->isAfter(now()->subDays(7));
    }

    // Business Logic Methods
    public function markAsCompleted(): bool
    {
        return $this->update([
            'status' => 'completed',
            'downloaded_at' => now()
        ]);
    }

    public function markAsFailed(string $reason = null): bool
    {
        return $this->update([
            'status' => 'failed',
            'failure_reason' => $reason
        ]);
    }

    public function generateSecureToken(): string
    {
        $token = bin2hex(random_bytes(32));
        
        $this->update([
            'download_token' => $token,
            'token_expires_at' => now()->addHours(24) // Token expires in 24 hours
        ]);

        return $token;
    }

    public function isTokenValid(): bool
    {
        return $this->download_token && 
               $this->token_expires_at && 
               $this->token_expires_at->isFuture();
    }

    public function extendTokenExpiry(int $hours = 24): bool
    {
        if (!$this->download_token) {
            return false;
        }

        return $this->update([
            'token_expires_at' => now()->addHours($hours)
        ]);
    }

    public function getBrowserInfo(): ?string
    {
        if (!$this->user_agent) {
            return null;
        }

        // Simple browser detection
        $userAgent = $this->user_agent;
        
        if (strpos($userAgent, 'Chrome') !== false) {
            return 'Chrome';
        } elseif (strpos($userAgent, 'Firefox') !== false) {
            return 'Firefox';
        } elseif (strpos($userAgent, 'Safari') !== false) {
            return 'Safari';
        } elseif (strpos($userAgent, 'Edge') !== false) {
            return 'Edge';
        }

        return 'Unknown';
    }

    public function getDownloadDuration(): ?int
    {
        if ($this->status !== 'completed' || !$this->downloaded_at) {
            return null;
        }

        return $this->downloaded_at->diffInSeconds($this->created_at);
    }

    // Static Methods
    public static function getDownloadStats(int $productId): array
    {
        $downloads = self::where('product_id', $productId);

        return [
            'total_downloads' => $downloads->count(),
            'completed_downloads' => $downloads->completed()->count(),
            'unique_users' => $downloads->distinct('user_id')->count(),
            'recent_downloads' => $downloads->recent(7)->count(),
            'average_file_size' => $downloads->avg('file_size'),
            'total_bandwidth' => $downloads->completed()->sum('file_size')
        ];
    }

    public static function getUserDownloadHistory(int $userId, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return self::with(['product', 'product.shop'])
                   ->byUser($userId)
                   ->completed()
                   ->orderBy('downloaded_at', 'desc')
                   ->limit($limit)
                   ->get();
    }
}