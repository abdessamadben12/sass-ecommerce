<?php

namespace App\Models;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Withdrawal extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'amount', 'status', 'transaction_id'];
    protected $table = 'withdrawals';
    public function user()
    {
        return $this->belongsTo(User::class);
    }
       public function transactions()
{
      return $this->morphOne(Transaction::class, 'sourceable');
}
}
