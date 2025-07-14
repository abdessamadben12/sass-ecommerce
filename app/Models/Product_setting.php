<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product_setting extends Model
{
    use HasFactory;
    protected $fillable = ['product_id', 'key', 'value'];
    protected $table = 'product_settings';
}
