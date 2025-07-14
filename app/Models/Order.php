<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Product;
use App\Models\Order_item;
use App\Models\Profit;

class Order extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'total_price', 'status'];
    protected $table = 'orders';
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function products()
    {
        return $this->belongsToMany(Product::class)->withPivot('quantity', 'price');
    }
    public function items()
    {
        return $this->hasMany(Order_item::class);
    } 
    public function transactions()
{
    return $this->morphMany(Transaction::class, 'sourceable');
}
}
