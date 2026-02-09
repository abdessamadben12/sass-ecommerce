<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralInvite extends Model
{
    protected $fillable = [
        'referral_code_id',
        'inviter_id',
        'invitee_email',
        'invitee_user_id',
        'status',
        'sent_at',
        'registered_at',
        'converted_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'registered_at' => 'datetime',
        'converted_at' => 'datetime',
    ];
}
