<?php

namespace App\Models;

use App\Models\User;
use App\Models\Order;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Profit extends Model
{
    use HasFactory;
    protected $fillable = ["shop_id" ,"total_amount" ,"profit_platform"];
    protected $table = 'profits';
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function shop(){
        return $this->belongsTo(Shop::class);

    }
    public function transactions()
{
    return $this->morphMany(Transaction::class, 'sourceable');
}
}
