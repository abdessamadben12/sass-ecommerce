<?php

namespace App\Models;

use App\Models\User;
use App\Models\Order;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;
    protected $fillable = ['order_id', 'user_id', 'amount', 'provider', 'provider_id', 'status'];
    protected $table = 'payments';
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function transactions()
{
    return $this->morphMany(Transaction::class, 'sourceable');
}
    
}
