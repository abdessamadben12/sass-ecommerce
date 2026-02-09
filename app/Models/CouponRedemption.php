<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponRedemption extends Model
{
    protected $fillable = [
        'coupon_id',
        'user_id',
        'order_id',
        'discount_amount',
        'redeemed_at',
    ];

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }
}
