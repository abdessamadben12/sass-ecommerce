<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_uses',
        'max_uses_per_user',
        'status',
        'starts_at',
        'ends_at',
        'applies_to',
        'note',
        'created_by',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'coupon_categories');
    }

    public function shops()
    {
        return $this->belongsToMany(Shop::class, 'coupon_shops');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'coupon_users');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'coupon_products');
    }

    public function redemptions()
    {
        return $this->hasMany(CouponRedemption::class);
    }
}
