<?php

namespace App\Services;

use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Str;
use App\Models\ProductSetting;
use App\Jobs\ScanProductForVirus;
use App\Jobs\AssessProductQuality;
use Illuminate\Support\Facades\DB;
use App\Jobs\CheckProductDuplicate;
use App\Services\ValidationService;
use App\Events\ProductStatusChanged;
use App\Services\NotificationService;
use App\Jobs\ProcessProductValidation;
use Illuminate\Support\Facades\Storage;
use App\Events\ProductSubmittedForReview;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use App\Models\Order_item;
use App\Models\ProductDownload;
use App\Models\ProductView;
use Carbon\Carbon;

class ProductService
{
    public function __construct(
        private ValidationService $validationService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get filtered and paginated products
     */
   public function getFilteredProducts(array $filters): LengthAwarePaginator
{
    $query = Product::query()->with(['shop.user', 'category', 'license',"reviews",])->withCount('downloads')->withCount('reviews');

    // Apply filters
    if (!empty($filters['category_id']) && $filters['category_id'] !== "undefined") {
        $query->where('category_id', $filters['category_id']);
    }

    if (!empty($filters['status'] && $filters['status'] !== "undefined") && $filters['status'] !== "all") {
        $query->where('status', $filters['status']);}
    // } else {
    //     if (!auth()->check() || !auth()->user()->hasRole(['admin'])) {
    //         $query->published(); // Assure-toi que tu as un scopePublished() dans Product
    //     }
    // }

    // Price filters (attention: tu ordonnes ici, tu ne filtres pas vraiment par min/max)
    if (isset($filters['price_min']) && $filters['price_min'] !== "undefined" && $filters['price_min'] !== "0") {
        $query->where('base_price', '>=', $filters['price_min']);
    }

    if (isset($filters['price_max']) && $filters['price_max'] !== "undefined" && $filters['price_max'] !== "0") {
        $query->where('base_price', '<=', $filters['price_max']);
    }

    // Search
    if (!empty($filters['search']) && $filters['search'] !== "undefined") {
        $search = $filters['search'];
        $query->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%")
              ->orWhereJsonContains('tags', $search);
        });
    }
    // license 
    if (!empty($filters['license_id']) && $filters['license_id'] !== "undefined" && $filters['license_id'] !== "all") {
        $query->where('license_id', $filters['license_id']);
    }
    // category
    if (!empty($filters['category_id']) && $filters['category_id'] !== "undefined" && $filters['category_id'] !== "all") {
        $query->where('category_id', $filters['category_id']);
    }
    // Sorting
    if (!empty($filters['sort_by']) && $filters['sort_by'] !== "undefined") {
        switch ($filters['sort_by']) {
            case 'price_asc':
                $query->orderBy('base_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('base_price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
                
        }
    } else {
        $query->orderBy('created_at', 'desc');
    }

    // Pagination
    $perPage = $filters['per_page'] ?? 15;
    return $query->paginate($perPage);
}

public function getDetailsProduct($product)
{
    $product = $product->with(['shop.user', 'category', 'license', 'reviews', 'file_format'])
        ->withCount('downloads')
        ->withCount('reviews')
        ->withCount('views')
        ->withSum('orders',"total_price")
        ->withCount('orders')
        ->withAvg('orders',"total_price")
        ->first();

    if (Storage::disk("spaces_2")->exists($product->thumbnail_path)) {
        $product->thumbnail_path = Storage::disk("spaces_2")->url($product->thumbnail_path);
    }

    $updatedImages = [];
    foreach ($product->preview_images ?? [] as $image) {
        if (is_string($image) && (str_starts_with($image, 'http://') || str_starts_with($image, 'https://'))) {
            $updatedImages[] = $image;
            continue;
        }
        if (Storage::disk("spaces_2")->exists($image)) {
            $updatedImages[] = Storage::disk("spaces_2")->url($image);
        }
    }
    if (!empty($product->shop->user->avatar)) {
        $product->shop->user->avatar = Storage::disk("spaces_2")->url($product->shop->user->avatar);
    }
    $product->preview_images = $updatedImages;
    if (!empty($product->shop->logo)) {
        $product->shop->logo = Storage::disk("spaces_2")->url($product->shop->logo);
    }
  
    return $product;
}


    /**
     * Create a new product
     */
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            // Get product settings for validation
            $productSetting = ProductSetting::where('category_id', $data['category_id'])
                ->where('format_id', $data['format_id'] )
                ->first();

            if (!$productSetting) {
                throw new \Exception('No product settings found for this category and format combination.');
            }

            // Create product
            $product = Product::create([
                'shop_id' => auth()->user()->shop->id ?? 1,
                'category_id' => $data['category_id'],
                'product_setting_id' => $productSetting->id,
                'license_id' => $data['license_id'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'tags' => $data['tags'] ?? [],
                'base_price' => $data['base_price'],
                'minimum_price' => $data['minimum_price'] ?? 0,
                'meta_title' => $data['meta_title'] ?? null,
                'meta_description' => $data['meta_description'] ?? null,
                'status' => 'draft'
            ]);
            $logger = activity();
            if (auth()->check()) {
                $logger->causedBy(auth()->user());
            }
            $logger->performedOn($product)
                ->withProperties(['action' => 'created'])
                ->log('Product created');

            return $product;
        });
    }

    /**
     * Update an existing product
     */
    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $oldStatus = $product->status;
            
            $product->update($data);

            // If status changed, trigger events
            if (isset($data['status']) && $data['status'] !== $oldStatus) {
                event(new ProductStatusChanged($product, $oldStatus, $data['status']));
            }

            // Log activity
            $logger = activity();
            if (auth()->check()) {
                $logger->causedBy(auth()->user());
            }
            $logger->performedOn($product)
                ->withProperties(['action' => 'updated', 'changes' => $data])
                ->log('Product updated');

            return $product->fresh();
        });
    }

    /**
     * Delete a product
     */
    public function deleteProduct(Product $product): bool
    {
        return DB::transaction(function () use ($product) {
            // Delete associated files
            if ($product->main_file_path) {
                Storage::delete($product->main_file_path);
            }

            if ($product->preview_images) {
                foreach ($product->preview_images as $image) {
                    Storage::delete($image);
                }
            }

            if ($product->thumbnail_path) {
                Storage::delete($product->thumbnail_path);
            }

            // Log activity before deletion
            $logger = activity();
            if (auth()->check()) {
                $logger->causedBy(auth()->user());
            }
            $logger->performedOn($product)
                ->withProperties(['action' => 'deleted'])
                ->log('Product deleted');

            return $product->delete();
        });
    }

    /**
     * Submit product for review
     */
    public function submitForReview(Product $product): void
    {
        // Validate product completeness
        $this->validateProductForSubmission($product);

        DB::transaction(function () use ($product) {
            $product->update(['status' => 'pending']);

            // Dispatch validation jobs
            $productSetting = $product->productSetting;

            if ($productSetting->auto_virus_scan) {
                ScanProductForVirus::dispatch($product);
            }

            if ($productSetting->auto_duplicate_check) {
                CheckProductDuplicate::dispatch($product);
            }

            if ($productSetting->auto_quality_assessment) {
                AssessProductQuality::dispatch($product);
            }

            // Dispatch main validation job
            ProcessProductValidation::dispatch($product);

            // Fire event
            event(new ProductSubmittedForReview($product));

            // Log activity
            $logger = activity();
            if (auth()->check()) {
                $logger->causedBy(auth()->user());
            }
            $logger->performedOn($product)
                ->withProperties(['action' => 'submitted_for_review'])
                ->log('Product submitted for review');
        });
    }

    /**
     * Approve a product
     */
    public function approveProduct(Product $product, User $approver): void
    {
        DB::transaction(function () use ($product, $approver) {
            $product->approve();

            // Notify shop owner
            $this->notificationService->notifyProductApproved($product);
            activity()
                ->causedBy($approver)
                ->performedOn($product)
                ->withProperties(['action' => 'approved'])
                ->log('Product approved');
        });
    }

    /**
     * Reject a product
     */
    public function rejectProduct(Product $product, User $rejector, string $reason = null): void
    {
        DB::transaction(function () use ($product, $rejector, $reason) {
            $product->reject();

            // Notify shop owner
            $this->notificationService->notifyProductRejected($product, $reason);

            // Log activity
            activity()
                ->causedBy($rejector)
                ->performedOn($product)
                ->withProperties(['action' => 'rejected', 'reason' => $reason])
                ->log('Product rejected');
        });
    }

    /**
     * Suspend a product
     */
    public function suspendProduct(Product $product, User $suspender, string $reason = null): void
    {
        DB::transaction(function () use ($product, $suspender, $reason) {
            $product->suspend();

            // Notify shop owner
            $this->notificationService->notifyProductSuspended($product, $reason);

            // Log activity
            activity()
                ->causedBy($suspender)
                ->performedOn($product)
                ->withProperties(['action' => 'suspended', 'reason' => $reason])
                ->log('Product suspended');
        });
    }

    /**
     * Validate product for submission
     */
    private function validateProductForSubmission(Product $product): void
    {
        $setting = $product->productSetting;
        $errors = [];

        // Check required fields
        if (!$product->main_file_path) {
            $errors[] = 'Main file is required';
        }

        if (!$product->description || !$setting->validateDescription($product->description)) {
            $errors[] = "Description must be at least {$setting->requires_description_min_length} characters";
        }

        if (!$product->tags || !$setting->validateTags($product->tags)) {
            $errors[] = "At least {$setting->requires_tags_min_count} tags are required";
        }

        if (!$product->preview_images || !$setting->validatePreviewImages($product->preview_images)) {
            $errors[] = "At least {$setting->requires_preview_images_min} preview images are required";
        }

        // Check file size if file exists
        if ($product->main_file_path && !$setting->validateFileSize($product->main_file_size)) {
            $min = $setting->min_file_size ? $this->formatBytes($setting->min_file_size) : null;
            $max = $setting->max_file_size ? $this->formatBytes($setting->max_file_size) : null;
            
            if ($min && $max) {
                $errors[] = "File size must be between {$min} and {$max}";
            } elseif ($min) {
                $errors[] = "File size must be at least {$min}";
            } elseif ($max) {
                $errors[] = "File size must not exceed {$max}";
            }
        }

        if (!empty($errors)) {
            throw new \Exception('Product validation failed: ' . implode(', ', $errors));
        }
    }

    /**
     * Check if user can view product
     */
    public function canUserViewProduct(Product $product, ?User $user = null): bool
    {
        // Public products can be viewed by anyone
        if ($product->is_published) {
            return true;
        }

        // No user logged in
        if (!$user) {
            return false;
        }

        // Owner can always view
        if ($this->userOwnsProduct($product, $user)) {
            return true;
        }

        // Admin/moderator can view all
        return $user->hasRole(['admin', 'moderator']);
    }

    /**
     * Check if user owns the product
     */
    public function userOwnsProduct(Product $product, User $user): bool
    {
        return $product->shop_id === $user->shop?->id;
    }

    /**
     * Check if user can download product
     */
    public function canUserDownloadProduct(Product $product, User $user): bool
    {
        // Check if product is downloadable
        if (!$product->canBeDownloaded()) {
            return false;
        }

        // Owner can always download
        if ($this->userOwnsProduct($product, $user)) {
            return true;
        }

        // Check if user has purchased the product
        return $user->purchases()
            ->where('product_id', $product->id)
            ->where('status', 'completed')
            ->exists();
    }

    /**
     * Download product file
     */
    public function downloadProduct(Product $product, User $user): BinaryFileResponse
    {
        // Validate file integrity
        if (!$product->hasValidFileHash()) {
            throw new \Exception('File integrity check failed');
        }

        // Record download
        $this->recordDownload($product, $user);

        // Return file download
        $filePath = storage_path('app/' . $product->main_file_path);
        $fileName = Str::slug($product->title) . '.' . pathinfo($product->main_file_path, PATHINFO_EXTENSION);

        return response()->download($filePath, $fileName);
    }

    /**
     * Record product download
     */
    private function recordDownload(Product $product, User $user): void
    {
        DB::transaction(function () use ($product, $user) {
            // Create download record
            $product->downloads()->create([
                'user_id' => $user->id,
                'downloaded_at' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            // Increment download count
            $product->incrementDownloads();

            // Log activity
            activity()
                ->causedBy($user)
                ->performedOn($product)
                ->withProperties(['action' => 'downloaded'])
                ->log('Product downloaded');
        });
    }

    /**
     * Get product statistics
     */
    public function getProductStats(Product $product): array
    {
        $productsCount = Product::count();

    $productsCountPending = Product::where('status', 'pending')->count();

    $revenue = Order_item::query()
        ->whereHas('order', function ($query) {
            $query->where('status', 'completed');
        })
        ->sum('price');

    $downloads = ProductDownload::count();

    return [
        'products_count'          => $productsCount,
        'products_count_pending'  => $productsCountPending,
        'revenue'                 => (float) $revenue,
        'downloads'               => $downloads,
    ];
    }
    public function getProductsStats(){
        $products_Count = Product::count();
        $products_Count_Pending = Product::where("status","pending")->count();
        $revenue = Order_item::whereHas("order",function($query){
            $query->where("status","completed");
        })->sum("price");
        $downloads = ProductDownload::count();
        return [
            "products_Count" => $products_Count,
            "products_Count_Pending" => $products_Count_Pending,
            "revenue" => $revenue,
            "downloads" => $downloads,
        ];
    }

    /**
     * Get views for last N days
     */
    private function getViewsLastNDays(Product $product, int $days): int
    {
        // This would typically come from an analytics service or views table
        // For now, return a placeholder
        return 0;
    }

    /**
     * Calculate conversion rate (sales/views)
     */
    private function calculateConversionRate(Product $product): float
    {
        $totalViews = $this->getViewsLastNDays($product, 90);
        $totalSales = $product->purchases()->where('status', 'completed')->count();

        if ($totalViews === 0) {
            return 0;
        }

        return round(($totalSales / $totalViews) * 100, 2);
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Duplicate product
     */
    public function duplicateProduct(Product $product, User $user): Product
    {
        if (!$this->userOwnsProduct($product, $user)) {
            throw new \Exception('Access denied');
        }

        return DB::transaction(function () use ($product) {
            $newProduct = $product->replicate();
            $newProduct->title = $product->title . ' (Copy)';
            $newProduct->slug = Str::slug($newProduct->title);
            $newProduct->status = 'draft';
            $newProduct->published_at = null;
            $newProduct->save();

            // Log activity
            activity()
                ->performedOn($newProduct)
                ->withProperties(['action' => 'duplicated', 'original_id' => $product->id])
                ->log('Product duplicated');

            return $newProduct;
        });
    }

    /**
     * Bulk update products
     */
    public function bulkUpdateProducts(array $productIds, array $data, User $user): int
    {
        $query = Product::whereIn('id', $productIds);

        // If not admin, only allow updating own products
        if (!$user->hasRole(['admin', 'moderator'])) {
            $query->where('shop_id', $user->shop?->id);
        }

        $count = $query->count();
        $query->update($data);

        // Log activity
        activity()
            ->causedBy($user)
            ->withProperties(['action' => 'bulk_update', 'count' => $count, 'data' => $data])
            ->log('Products bulk updated');

        return $count;
    }
}
