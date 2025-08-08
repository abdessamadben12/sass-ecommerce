<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Shop;
use App\Models\Order;
use App\Models\User_detaill;
use App\Models\Profit;
use App\Models\Wallet;
use App\Models\Deposit;
use App\Models\Product;
use App\Models\Withdrawal;
use App\Models\Transaction;
use App\Models\Notification;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    public function balance()
    {
        return $this->hasOne(Wallet::class,'user_id',"id");
    }
    public function orders()
    {
        return $this->hasMany(Order::class,'user_id',"id");
    }
    public function shops()
    {
        return $this->hasMany(Shop::class,  'user_id',"id");
    }
    public function deposits()
    {
        return $this->hasMany(Deposit::class,  'user_id',"id");
    }
    public function notifications()
    {
        return $this->hasMany(Notification::class,'id','user_id');
    }
    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class, 'user_id','id');
    }
    public function products()
{
    return $this->hasManyThrough(
        Product::class,
        Shop::class,
        'user_id',
        'shop_id',
        'id',
        'id'
    );
}
 public function transactions(){
    return $this->hasMany(Transaction::class);
 }
 public function profit(){
   return $this->hasMany(Profit::class);
 }
 public function details(){
    return $this->hasOne(User_detaill::class);
 }
}