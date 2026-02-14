<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerOnboardingProgress extends Model
{
    use HasFactory;

    protected $table = 'seller_onboarding_progress';

    protected $fillable = [
        'user_id',
        'completed_steps',
        'guide_completed_at',
    ];

    protected $casts = [
        'completed_steps' => 'array',
        'guide_completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}

