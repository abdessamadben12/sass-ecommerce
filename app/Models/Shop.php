<?php

namespace App\Models;

use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shop extends Model
{
    use HasFactory;
        protected $fillable = [
        'user_id',
        'shop_name',
        'shop_slug',
        'description',
        'commission_rate',
        'total_products',
        'total_sales',
        'total_revenue',
        'average_rating',
        'status'
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'total_revenue' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'total_products' => 'integer',
        'total_sales' => 'integer',
    ];
    protected $table = 'shops';
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    public function products()
    {
        return $this->hasMany(Product::class,"shop_id","id");
    }
    public function profits(){
        return $this->hasMany(Profit::class, 'shop_id', 'id');
    }
     public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
