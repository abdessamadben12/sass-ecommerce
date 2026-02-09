<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $fillable = [
        'name',
        'type',
        'subject',
        'content',
        'status',
        'scheduled_at',
        'sent_at',
        'target_type',
        'filters',
        'created_by',
    ];

    protected $casts = [
        'filters' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function sends()
    {
        return $this->hasMany(CampaignSend::class);
    }
}
