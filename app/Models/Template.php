<?php

namespace App\Models;

use App\Enums\TemplateType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Template extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'subtype',
        'description',
        'content',
        'css_content',
        'js_content',
        'variables',
        'settings',
        'tags',
        'output_format',
        'target_audience',
        'language',
        'is_default',
        'is_public',
        'status',
        'usage_count',
        'version',
        'created_by',
    ];

    protected $casts = [
        'variables' => 'array',
        'settings' => 'array',
        'tags' => 'array',
        'is_default' => 'boolean',
        'is_public' => 'boolean',
        'usage_count' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeByType($query, TemplateType|string $type)
    {
        $value = $type instanceof TemplateType ? $type->value : $type;
        return $query->where('type', $value);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeForAudience($query, string $audience)
    {
        return $query->where(function ($q) use ($audience) {
            $q->where('target_audience', $audience)
              ->orWhere('target_audience', 'all')
              ->orWhereNull('target_audience');
        });
    }
}
