<?php

namespace App\Models;

use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Categorie extends Model
{
    use HasFactory;
    protected $fillable = ["name","slug","parent_id","level" ,"path" ,"description" ,"icon" ,"meta_title","meta_description","is_active"];
    protected $table = 'categories';
    protected $casts = [ 'is_active' => 'boolean','level' => 'integer'];
    
    public function products()
    {
        return $this->hasMany(Product::class,"category_id");
    }
    public function parent()
{
    return $this->belongsTo(Categorie::class, 'parent_id');
}

public function children()
{
    return $this->hasMany(Categorie::class, 'parent_id');
}
}
