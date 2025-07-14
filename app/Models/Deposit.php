<?php

namespace App\Models;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Deposit extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'amount',
        'payment_method',
        'transaction_id',
        'status',
        'confirmed_at',
        'notes'
    ];
    protected $table = 'deposits';
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }
    public function transactions()
{
    return $this->morphMany(Transaction::class, 'sourceable');
}
}
