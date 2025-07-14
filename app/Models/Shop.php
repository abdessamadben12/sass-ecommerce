<?php

namespace App\Models;

use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shop extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'user_id', 'description', 'image', 'status'];
    protected $table = 'shops';
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    public function products()
    {
        return $this->hasMany(Product::class);
    }
    public function profits(){
        return $this->hasMany(Profit::class, 'shop_id', 'id');
    }
}
