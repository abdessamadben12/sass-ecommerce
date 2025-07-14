<?php

namespace App\Models;

use App\Models\Shop;
use App\Models\Order;
use App\Models\License;
use App\Models\Categorie;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'description', 'price', 'category_id', 'shop_id'];
    protected $table = 'products';
    public function category()
    {
        return $this->belongsTo(Categorie::class);
    }
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
    public function licenses()
    {
        return $this->hasMany(License::class);
    }
    public function orderItems()
    {
        return $this->hasMany(Order_item::class);
    }
}
