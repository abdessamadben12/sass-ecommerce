<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'name',
        'type',
        'title',
        'description',
        'banner_image',
        'target_url',
        'status',
        'starts_at',
        'ends_at',
        'priority',
        'created_by',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'promotion_products');
    }

    public function shops()
    {
        return $this->belongsToMany(Shop::class, 'promotion_shops');
    }
}
