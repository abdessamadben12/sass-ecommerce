<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'tags' => $this->tags,
            'status' => $this->status,
            'is_published' => $this->is_published,
            
            // Pricing
            'base_price' => $this->base_price,
            'minimum_price' => $this->minimum_price,
            'formatted_price' => $this->formatted_price,
            'final_price' => $this->when($this->relationLoaded('license'), function () {
                return $this->calculateFinalPrice();
            }),
            
            // File information
            'main_file_size' => $this->main_file_size,
            'file_size_human' => $this->file_size_human,
            'preview_images' => $this->preview_images ? 
                array_map(fn($path) => asset('storage/' . $path), $this->preview_images) : [],
            'thumbnail_url' => $this->thumbnail_path ? 
                asset('storage/' . $this->thumbnail_path) : null,
            
            // SEO
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            
            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'published_at' => $this->published_at?->toISOString(),
            
            // Relations
            'shop' => new ShopResource($this->whenLoaded('shop')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'license' => new LicenseResource($this->whenLoaded('license')),
            'product_setting' => new ProductSettingResource($this->whenLoaded('productSetting')),
            
            // Stats (only for owner or admin)
            'stats' => $this->when(
                $this->canViewStats($request->user()),
                function () {
                    return [
                        'downloads_count' => $this->downloads_count ?? $this->downloads()->count(),
                        'reviews_count' => $this->reviews_count ?? $this->reviews()->count(),
                        'average_rating' => $this->average_rating ?? $this->reviews()->avg('rating'),
                    ];
                }
            ),
            
            // Permissions for current user
            'permissions' => $this->getPermissions($request->user()),
        ];
    }

    private function canViewStats(?object $user): bool
    {
        if (!$user) {
            return false;
        }

        // Owner can view stats
        if ($this->shop_id === $user->shop?->id) {
            return true;
        }

        // Admin/moderator can view stats
        return $user->hasRole(['admin', 'moderator']);
    }

    private function getPermissions(?object $user): array
    {
        if (!$user) {
            return [
                'can_view' => $this->is_published,
                'can_edit' => false,
                'can_delete' => false,
                'can_download' => false,
            ];
        }

        $isOwner = $this->shop_id === $user->shop?->id;
        $isAdmin = $user->hasRole(['admin', 'moderator']);

        return [
            'can_view' => $this->is_published || $isOwner || $isAdmin,
            'can_edit' => $isOwner || $isAdmin,
            'can_delete' => $isOwner || $isAdmin,
            'can_download' => $this->canUserDownload($user),
            'can_approve' => $isAdmin && $this->status === 'pending',
            'can_reject' => $isAdmin && $this->status === 'pending',
            'can_suspend' => $isAdmin && $this->status === 'approved',
        ];
    }

    private function canUserDownload(?object $user): bool
    {
        if (!$user || !$this->is_published) {
            return false;
        }

        // Owner can download
        if ($this->shop_id === $user->shop?->id) {
            return true;
        }

        // Check if user has purchased
        return $user->purchases()
            ->where('product_id', $this->id)
            ->where('status', 'completed')
            ->exists();
    }
}

class ProductCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->total(),
                'count' => $this->count(),
                'per_page' => $this->perPage(),
                'current_page' => $this->currentPage(),
                'last_page' => $this->lastPage(),
                'from' => $this->firstItem(),
                'to' => $this->lastItem(),
            ],
            'links' => [
                'first' => $this->url(1),
                'last' => $this->url($this->lastPage()),
                'prev' => $this->previousPageUrl(),
                'next' => $this->nextPageUrl(),
            ],
        ];
    }
}

class ShopResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo_url' => $this->logo_path ? asset('storage/' . $this->logo_path) : null,
            'rating' => $this->average_rating,
            'total_orders' => $this->total_orders,
            'revenue_totale' => $this->revenue_totale,
            'revenue_moyen' => $this->revenue_moyen,
            'products_count' => $this->when(
                $this->relationLoaded('products'),
                $this->products->count()
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'color' => $this->color,
            'parent_id' => $this->parent_id,
            'products_count' => $this->when(
                $this->relationLoaded('products'),
                $this->products->count()
            ),
            'children' => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}

class LicenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'terms_and_conditions' => $this->terms_and_conditions,
            'usage_rights' => $this->usage_rights,
            'usage_rights_formatted' => $this->getUsageRightsFormatted(),
            'price_multiplier' => $this->price_multiplier,
            'formatted_price_multiplier' => $this->formatted_price_multiplier,
            'minimum_price' => $this->minimum_price,
            'formatted_minimum_price' => $this->formatted_minimum_price,
            'download_limit' => $this->download_limit,
            'time_limit_days' => $this->time_limit_days,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];
    }
}

class ProductSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'format_id' => $this->format_id,
            
            // Technical rules
            'min_width' => $this->min_width,
            'min_height' => $this->min_height,
            'min_file_size' => $this->min_file_size,
            'max_file_size' => $this->max_file_size,
            'required_dpi' => $this->required_dpi,
            
            // Content rules
            'requires_description_min_length' => $this->requires_description_min_length,
            'requires_tags_min_count' => $this->requires_tags_min_count,
            'requires_preview_images_min' => $this->requires_preview_images_min,
            
            // Validation settings
            'auto_virus_scan' => $this->auto_virus_scan,
            'auto_duplicate_check' => $this->auto_duplicate_check,
            'auto_quality_assessment' => $this->auto_quality_assessment,
            'requires_manual_review' => $this->requires_manual_review,
            
            // Formatted rules for frontend
            'validation_rules' => $this->getValidationRules(),
            
            // Relations
            'category' => new CategoryResource($this->whenLoaded('category')),
            'format' => new ProductFormatResource($this->whenLoaded('format')),
        ];
    }
}

class ProductFormatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'extension' => $this->extension,
            'mime_type' => $this->mime_type,
            'description' => $this->description,
            'is_active' => $this->is_active,
        ];
    }
}