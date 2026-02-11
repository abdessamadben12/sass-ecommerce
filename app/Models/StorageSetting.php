<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorageSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider',
        'endpoint',
        'region',
        'bucket',
        'access_key',
        'secret_key',
        'public_url',
        'max_upload_mb',
        'allowed_mimes',
    ];

    protected $casts = [
        'allowed_mimes' => 'array',
        'max_upload_mb' => 'integer',
    ];
}
