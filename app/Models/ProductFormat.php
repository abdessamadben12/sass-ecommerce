<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductFormat extends Model
{
    use HasFactory;
        protected $fillable = [
        'name',
        'extension',
        'mime_type',
        'max_file_size',
        'allowed_categories',
        'validation_rules',
        'is_active',
        'created_at',
    ];
    
    public $timestamps = false;
    protected $casts = [
        'allowed_categories' => 'array',     // JSON dans la base
        'validation_rules' => 'array',       // JSON dans la base
        'is_active' => 'boolean',
        'max_file_size' => 'integer',
        'created_at' => 'datetime',
    ];
    public function productSetting(){
        return $this->hasMany(ProductSetting::class);
    }

}
