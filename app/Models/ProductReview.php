<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductReview extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'user_id',
        'rating',
        'title',
        'comment',
        'status',
        'rejection_reason',
        'moderated_by',
        'moderated_at',
        'helpful_count',
        'not_helpful_count',
        'is_verified_purchase',
        'purchase_id',
        'metadata',
        'vendor_response',
        'vendor_response_at',
        'vendor_response_by'
    ];

    protected $casts = [
        'rating' => 'integer',
        'moderated_at' => 'datetime',
        'helpful_count' => 'integer',
        'not_helpful_count' => 'integer',
        'is_verified_purchase' => 'boolean',
        'metadata' => 'array',
        'vendor_response_at' => 'datetime',
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

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function vendorResponder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_response_by');
    }

    public function helpfulVotes(): HasMany
    {
        return $this->hasMany(ReviewHelpfulVote::class, 'review_id');
    }

    // Scopes
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeByRating(Builder $query, int $rating): Builder
    {
        return $query->where('rating', $rating);
    }

    public function scopeByProduct(Builder $query, int $productId): Builder
    {
        return $query->where('product_id', $productId);
    }

    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeVerifiedPurchase(Builder $query): Builder
    {
        return $query->where('is_verified_purchase', true);
    }

    public function scopeWithVendorResponse(Builder $query): Builder
    {
        return $query->whereNotNull('vendor_response');
    }

    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeHighRated(Builder $query, int $minRating = 4): Builder
    {
        return $query->where('rating', '>=', $minRating);
    }

    public function scopeLowRated(Builder $query, int $maxRating = 2): Builder
    {
        return $query->where('rating', '<=', $maxRating);
    }

    public function scopeHelpful(Builder $query, int $minHelpful = 1): Builder
    {
        return $query->where('helpful_count', '>=', $minHelpful);
    }

    // Accessors
    public function getRatingStarsAttribute(): string
    {
        return str_repeat('★', $this->rating) . str_repeat('☆', 5 - $this->rating);
    }

    public function getIsRecentAttribute(): bool
    {
        return $this->created_at && $this->created_at->isAfter(now()->subDays(7));
    }

    public function getHelpfulnessRatioAttribute(): float
    {
        $total = $this->helpful_count + $this->not_helpful_count;
        
        if ($total === 0) {
            return 0;
        }

        return round(($this->helpful_count / $total) * 100, 1);
    }

    public function getHasVendorResponseAttribute(): bool
    {
        return !empty($this->vendor_response);
    }

    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at->format('d/m/Y à H:i');
    }

    public function getShortCommentAttribute(): string
    {
        if (!$this->comment) {
            return '';
        }

        return strlen($this->comment) > 100 
            ? substr($this->comment, 0, 100) . '...' 
            : $this->comment;
    }

    // Business Logic Methods
    public function approve(User $moderator = null): bool
    {
        $data = [
            'status' => 'approved',
            'moderated_at' => now()
        ];

        if ($moderator) {
            $data['moderated_by'] = $moderator->id;
        }

        return $this->update($data);
    }

    public function reject(string $reason = null, User $moderator = null): bool
    {
        $data = [
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'moderated_at' => now()
        ];

        if ($moderator) {
            $data['moderated_by'] = $moderator->id;
        }

        return $this->update($data);
    }

    public function hide(): bool
    {
        return $this->update(['status' => 'hidden']);
    }

    public function addVendorResponse(string $response, User $vendor): bool
    {
        return $this->update([
            'vendor_response' => $response,
            'vendor_response_at' => now(),
            'vendor_response_by' => $vendor->id
        ]);
    }

    public function markAsHelpful(User $user): bool
    {
        // Check if user already voted
        $existingVote = $this->helpfulVotes()
            ->where('user_id', $user->id)
            ->first();

        if ($existingVote) {
            if ($existingVote->is_helpful) {
                return false; // Already marked as helpful
            }
            
            // Change vote from not helpful to helpful
            $existingVote->update(['is_helpful' => true]);
            $this->decrement('not_helpful_count');
            $this->increment('helpful_count');
        } else {
            // New helpful vote
            $this->helpfulVotes()->create([
                'user_id' => $user->id,
                'is_helpful' => true
            ]);
            $this->increment('helpful_count');
        }

        return true;
    }

    public function markAsNotHelpful(User $user): bool
    {
        // Check if user already voted
        $existingVote = $this->helpfulVotes()
            ->where('user_id', $user->id)
            ->first();

        if ($existingVote) {
            if (!$existingVote->is_helpful) {
                return false; // Already marked as not helpful
            }
            
            // Change vote from helpful to not helpful
            $existingVote->update(['is_helpful' => false]);
            $this->decrement('helpful_count');
            $this->increment('not_helpful_count');
        } else {
            // New not helpful vote
            $this->helpfulVotes()->create([
                'user_id' => $user->id,
                'is_helpful' => false
            ]);
            $this->increment('not_helpful_count');
        }

        return true;
    }

    public function canBeEditedBy(User $user): bool
    {
        // User can edit their own review within 24 hours
        if ($this->user_id === $user->id) {
            return $this->created_at->isAfter(now()->subHours(24));
        }

        // Admins and moderators can always edit
        return $user->hasRole(['admin', 'moderator']);
    }

    public function canBeDeletedBy(User $user): bool
    {
        // User can delete their own review
        if ($this->user_id === $user->id) {
            return true;
        }

        // Admins and moderators can delete
        return $user->hasRole(['admin', 'moderator']);
    }

    // Static Methods
    public static function getAverageRating(int $productId): float
    {
        return self::where('product_id', $productId)
                   ->approved()
                   ->avg('rating') ?? 0;
    }

    public static function getRatingDistribution(int $productId): array
    {
        $distribution = [];
        
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = self::where('product_id', $productId)
                                   ->approved()
                                   ->where('rating', $i)
                                   ->count();
        }

        return $distribution;
    }

    public static function getRecentReviews(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return self::with(['user', 'product'])
                   ->approved()
                   ->orderBy('created_at', 'desc')
                   ->limit($limit)
                   ->get();
    }

    public static function getPendingReviewsCount(): int
    {
        return self::pending()->count();
    }
}