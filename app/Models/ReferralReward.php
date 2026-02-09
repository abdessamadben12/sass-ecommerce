<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralReward extends Model
{
    protected $fillable = [
        'referral_code_id',
        'user_id',
        'type',
        'amount',
        'status',
        'awarded_at',
    ];

    protected $casts = [
        'awarded_at' => 'datetime',
    ];
}
