<?php
namespace App\Models;

use Str;
use App\Enums\OutputFormat;
use App\Enums\TemplateType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Template extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'type', 'subtype',
        'output_format', 'content', 'css_content', 'js_content',
        'variables', 'settings', 'tags', 'preview_image',
        'usage_context', 'target_audience', 'language', 'country',
        'status', 'is_default', 'is_system', 'is_public',
        'version', 'parent_template_id', 'created_by', 'allowed_roles'
    ];

    protected $casts = [
        'type' => TemplateType::class,
        'output_format' => OutputFormat::class,
        'variables' => 'array',
        'settings' => 'array',
        'tags' => 'array',
        'allowed_roles' => 'array',
        'is_default' => 'boolean',
        'is_system' => 'boolean',
        'is_public' => 'boolean',
        'rating_average' => 'decimal:2',
        'last_used_at' => 'datetime'
    ];

    // Relations
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Template::class, 'parent_template_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Template::class, 'parent_template_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, TemplateType|string $type)
{
    return $query->where('type', $type instanceof TemplateType ? $type->value : $type);
}

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeForAudience($query, string $audience)
    {
        return $query->where('target_audience', $audience)
                    ->orWhere('target_audience', 'all');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    // Accessors & Mutators
    public function getVariableNamesAttribute(): array
    {
        return array_keys($this->variables ?? []);
    }

    public function setSlugAttribute($value)
    {
        $this->attributes['slug'] = $value ?: Str::slug($this->name);
    }

    // Methods

   
}