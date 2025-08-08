<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSetting extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table= 'product_settings';
    protected $fillable = [
        'category_id',
        'format_id',
        'min_width',
        'min_height',
        'min_file_size',
        'max_file_size',
        'required_dpi',
        'requires_description_min_length',
        'requires_tags_min_count',
        'requires_preview_images_min',
        'auto_virus_scan',
        'auto_duplicate_check',
        'auto_quality_assessment',
        'requires_manual_review'
    ];

    protected $casts = [
        'min_width' => 'integer',
        'min_height' => 'integer',
        'min_file_size' => 'integer',
        'max_file_size' => 'integer',
        'required_dpi' => 'integer',
        'requires_description_min_length' => 'integer',
        'requires_tags_min_count' => 'integer',
        'requires_preview_images_min' => 'integer',
        'auto_virus_scan' => 'boolean',
        'auto_duplicate_check' => 'boolean',
        'auto_quality_assessment' => 'boolean',
        'requires_manual_review' => 'boolean',
        'created_at' => 'datetime'
    ];

    // Relations
    public function category()
    {
        return $this->belongsTo(Categorie::class);
    }

    public function format()
    {
        return $this->belongsTo(ProductFormat::class, 'format_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Validation Methods
    public function validateFileSize(int $fileSize): bool
    {
        if ($this->min_file_size && $fileSize < $this->min_file_size) {
            return false;
        }

        if ($this->max_file_size && $fileSize > $this->max_file_size) {
            return false;
        }

        return true;
    }

    public function validateDimensions(int $width, int $height): bool
    {
        if ($this->min_width && $width < $this->min_width) {
            return false;
        }

        if ($this->min_height && $height < $this->min_height) {
            return false;
        }

        return true;
    }

    public function validateDescription(string $description): bool
    {
        return strlen(trim($description)) >= $this->requires_description_min_length;
    }

    public function validateTags(array $tags): bool
    {
        return count($tags) >= $this->requires_tags_min_count;
    }

    public function validatePreviewImages(array $previewImages): bool
    {
        return count($previewImages) >= $this->requires_preview_images_min;
    }

    public function getValidationRules(): array
    {
        return [
            'file_size_min' => $this->min_file_size,
            'file_size_max' => $this->max_file_size,
            'width_min' => $this->min_width,
            'height_min' => $this->min_height,
            'dpi_required' => $this->required_dpi,
            'description_min_length' => $this->requires_description_min_length,
            'tags_min_count' => $this->requires_tags_min_count,
            'preview_images_min' => $this->requires_preview_images_min
        ];
    }
}
