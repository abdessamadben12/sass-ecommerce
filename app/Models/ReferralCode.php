<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralCode extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'reward_type',
        'reward_value',
        'max_uses',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function invites()
    {
        return $this->hasMany(ReferralInvite::class);
    }

    public function rewards()
    {
        return $this->hasMany(ReferralReward::class);
    }
}
