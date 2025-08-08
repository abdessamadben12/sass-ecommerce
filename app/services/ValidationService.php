<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductSetting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Intervention\Image\Facades\Image;

class ValidationService
{
    /**
     * Validate a product completely
     */
    public function validateProduct(Product $product): array
    {
        $errors = [];
        $warnings = [];
        $productSetting = $product->productSetting;

        try {
            // Basic content validation
            $contentValidation = $this->validateContent($product, $productSetting);
            $errors = array_merge($errors, $contentValidation['errors']);
            $warnings = array_merge($warnings, $contentValidation['warnings']);

            // File validation
            if ($product->main_file_path) {
                $fileValidation = $this->validateFile($product, $productSetting);
                $errors = array_merge($errors, $fileValidation['errors']);
                $warnings = array_merge($warnings, $fileValidation['warnings']);
            }

            // Preview images validation
            if ($product->preview_images) {
                $imageValidation = $this->validatePreviewImages($product, $productSetting);
                $errors = array_merge($errors, $imageValidation['errors']);
                $warnings = array_merge($warnings, $imageValidation['warnings']);
            }

            // SEO validation
            $seoValidation = $this->validateSEO($product);
            $warnings = array_merge($warnings, $seoValidation['warnings']);

            // Pricing validation
            $pricingValidation = $this->validatePricing($product);
            $errors = array_merge($errors, $pricingValidation['errors']);
            $warnings = array_merge($warnings, $pricingValidation['warnings']);

        } catch (\Exception $e) {
            Log::error("Validation error for product {$product->id}: " . $e->getMessage());
            $errors[] = 'System error during validation: ' . $e->getMessage();
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'score' => $this->calculateValidationScore($errors, $warnings)
        ];
    }

    /**
     * Validate product content (title, description, tags)
     */
    private function validateContent(Product $product, ProductSetting $setting): array
    {
        $errors = [];
        $warnings = [];

        // Title validation
        if (empty($product->title)) {
            $errors[] = 'Title is required';
        } elseif (strlen($product->title) < 3) {
            $errors[] = 'Title must be at least 3 characters long';
        } elseif (strlen($product->title) > 255) {
            $errors[] = 'Title must not exceed 255 characters';
        } elseif (!$this->isValidTitle($product->title)) {
            $warnings[] = 'Title should be more descriptive and professional';
        }

        // Description validation
        if (empty($product->description)) {
            $errors[] = 'Description is required';
        } elseif (strlen($product->description) < $setting->requires_description_min_length) {
            $errors[] = "Description must be at least {$setting->requires_description_min_length} characters long";
        } elseif (!$this->isQualityDescription($product->description)) {
            $warnings[] = 'Description could be more detailed and informative';
        }

        // Tags validation
        if (empty($product->tags)) {
            $errors[] = 'Tags are required';
        } elseif (count($product->tags) < $setting->requires_tags_min_count) {
            $errors[] = "At least {$setting->requires_tags_min_count} tags are required";
        } else {
            $tagValidation = $this->validateTags($product->tags);
            $errors = array_merge($errors, $tagValidation['errors']);
            $warnings = array_merge($warnings, $tagValidation['warnings']);
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Validate main product file
     */
    private function validateFile(Product $product, ProductSetting $setting): array
    {
        $errors = [];
        $warnings = [];

        if (!Storage::exists($product->main_file_path)) {
            $errors[] = 'Main file does not exist';
            return ['errors' => $errors, 'warnings' => $warnings];
        }

        // File size validation
        $fileSize = Storage::size($product->main_file_path);
        if ($setting->min_file_size && $fileSize < $setting->min_file_size) {
            $errors[] = 'File size is too small (minimum: ' . $this->formatBytes($setting->min_file_size) . ')';
        }
        if ($setting->max_file_size && $fileSize > $setting->max_file_size) {
            $errors[] = 'File size is too large (maximum: ' . $this->formatBytes($setting->max_file_size) . ')';
        }

        // File integrity validation
        if (!$product->hasValidFileHash()) {
            $errors[] = 'File integrity check failed - file may be corrupted';
        }

        // File type validation
        $mimeType = Storage::mimeType($product->main_file_path);
        if (!$this->isValidMimeType($mimeType, $product->productSetting->format)) {
            $errors[] = 'File type is not supported for this format';
        }

        // Image-specific validation
        if ($this->isImageFile($mimeType)) {
            $imageValidation = $this->validateImageFile($product, $setting);
            $errors = array_merge($errors, $imageValidation['errors']);
            $warnings = array_merge($warnings, $imageValidation['warnings']);
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Validate image file (dimensions, DPI, etc.)
     */
    private function validateImageFile(Product $product, ProductSetting $setting): array
    {
        $errors = [];
        $warnings = [];

        try {
            $filePath = Storage::path($product->main_file_path);
            $imageInfo = getimagesize($filePath);

            if (!$imageInfo) {
                $errors[] = 'Unable to read image dimensions';
                return ['errors' => $errors, 'warnings' => $warnings];
            }

            $width = $imageInfo[0];
            $height = $imageInfo[1];

            // Dimension validation
            if ($setting->min_width && $width < $setting->min_width) {
                $errors[] = "Image width is too small (minimum: {$setting->min_width}px, current: {$width}px)";
            }
            if ($setting->min_height && $height < $setting->min_height) {
                $errors[] = "Image height is too small (minimum: {$setting->min_height}px, current: {$height}px)";
            }

            // DPI validation (if available in EXIF)
            if ($setting->required_dpi) {
                $dpi = $this->getImageDPI($filePath);
                if ($dpi && $dpi < $setting->required_dpi) {
                    $warnings[] = "Image DPI is lower than recommended ({$setting->required_dpi} DPI)";
                }
            }

            // Image quality assessment
            $qualityScore = $this->assessImageQuality($filePath);
            if ($qualityScore < 70) {
                $warnings[] = 'Image quality could be improved';
            }

        } catch (\Exception $e) {
            $warnings[] = 'Unable to fully validate image properties';
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Validate preview images
     */
    private function validatePreviewImages(Product $product, ProductSetting $setting): array
    {
        $errors = [];
        $warnings = [];

        $imageCount = count($product->preview_images);
        
        if ($imageCount < $setting->requires_preview_images_min) {
            $errors[] = "At least {$setting->requires_preview_images_min} preview images are required (current: {$imageCount})";
        }

        $validImages = 0;
        foreach ($product->preview_images as $index => $imagePath) {
            if (!Storage::exists($imagePath)) {
                $errors[] = "Preview image " . ($index + 1) . " does not exist";
                continue;
            }

            // Basic image validation
            try {
                $imageInfo = getimagesize(Storage::path($imagePath));
                if ($imageInfo) {
                    $validImages++;
                    
                    // Check minimum dimensions for previews
                    if ($imageInfo[0] < 300 || $imageInfo[1] < 300) {
                        $warnings[] = "Preview image " . ($index + 1) . " is smaller than recommended (300x300px)";
                    }
                } else {
                    $errors[] = "Preview image " . ($index + 1) . " is not a valid image";
                }
            } catch (\Exception $e) {
                $errors[] = "Unable to validate preview image " . ($index + 1);
            }
        }

        if ($validImages === 0 && $imageCount > 0) {
            $errors[] = 'No valid preview images found';
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Validate SEO elements
     */
    private function validateSEO(Product $product): array
    {
        $warnings = [];

        // Meta title validation
        if (empty($product->meta_title)) {
            $warnings[] = 'Meta title is recommended for better SEO';
        } elseif (strlen($product->meta_title) > 60) {
            $warnings[] = 'Meta title is too long (recommended: max 60 characters)';
        }

        // Meta description validation
        if (empty($product->meta_description)) {
            $warnings[] = 'Meta description is recommended for better SEO';
        } elseif (strlen($product->meta_description) > 160) {
            $warnings[] = 'Meta description is too long (recommended: max 160 characters)';
        }

        // Slug validation
        if (!$this->isValidSlug($product->slug)) {
            $warnings[] = 'Product slug could be more SEO-friendly';
        }

        return ['warnings' => $warnings];
    }

    /**
     * Validate pricing
     */
    private function validatePricing(Product $product): array
    {
        $errors = [];
        $warnings = [];

        if ($product->base_price <= 0) {
            $errors[] = 'Base price must be greater than 0';
        }

        if ($product->minimum_price < 0) {
            $errors[] = 'Minimum price cannot be negative';
        }

        if ($product->minimum_price > $product->base_price) {
            $errors[] = 'Minimum price cannot be greater than base price';
        }

        // Market analysis
        $finalPrice = $product->calculateFinalPrice();
        if ($finalPrice < 1) {
            $warnings[] = 'Product price is very low - consider market positioning';
        } elseif ($finalPrice > 500) {
            $warnings[] = 'Product price is high - ensure value justification';
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Validate individual tags
     */
    private function validateTags(array $tags): array
    {
        $errors = [];
        $warnings = [];

        $validTags = 0;
        $duplicates = [];
        $seenTags = [];

        foreach ($tags as $tag) {
            $cleanTag = trim($tag);
            
            if (empty($cleanTag)) {
                $warnings[] = 'Empty tags should be removed';
                continue;
            }

            if (strlen($cleanTag) < 2) {
                $warnings[] = "Tag '{$cleanTag}' is too short";
                continue;
            }

            if (strlen($cleanTag) > 50) {
                $warnings[] = "Tag '{$cleanTag}' is too long (max 50 characters)";
                continue;
            }

            $lowerTag = strtolower($cleanTag);
            if (in_array($lowerTag, $seenTags)) {
                $duplicates[] = $cleanTag;
            } else {
                $seenTags[] = $lowerTag;
                $validTags++;
            }
        }

        if (!empty($duplicates)) {
            $warnings[] = 'Duplicate tags found: ' . implode(', ', array_unique($duplicates));
        }

        if ($validTags < 3) {
            $warnings[] = 'More relevant tags would improve discoverability';
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Helper methods
     */
    private function isValidTitle(string $title): bool
    {
        // Check for meaningful content, not just numbers or single words
        $wordCount = str_word_count($title);
        return $wordCount >= 2 && !preg_match('/^[0-9\s]+$/', $title);
    }

    private function isQualityDescription(string $description): bool
    {
        $wordCount = str_word_count($description);
        $sentences = preg_split('/[.!?]+/', $description);
        
        return $wordCount >= 20 && count($sentences) >= 2;
    }

    private function isValidMimeType(string $mimeType, $format): bool
    {
        if (!$format || !$format->mime_type) {
            return true; // No restriction
        }

        $allowedTypes = explode(',', $format->mime_type);
        return in_array($mimeType, array_map('trim', $allowedTypes));
    }

    private function isImageFile(string $mimeType): bool
    {
        return strpos($mimeType, 'image/') === 0;
    }

    private function getImageDPI(string $filePath): ?int
    {
        try {
            $exif = exif_read_data($filePath);
            if ($exif && isset($exif['XResolution'])) {
                if (strpos($exif['XResolution'], '/') !== false) {
                    $parts = explode('/', $exif['XResolution']);
                    return intval($parts[0] / $parts[1]);
                }
                return intval($exif['XResolution']);
            }
        } catch (\Exception $e) {
            // EXIF data not available
        }
        
        return null;
    }

    private function assessImageQuality(string $filePath): int
    {
        try {
            $image = Image::make($filePath);
            $width = $image->width();
            $height = $image->height();
            $fileSize = filesize($filePath);
            
            // Simple quality assessment based on resolution and file size ratio
            $pixels = $width * $height;
            $bytesPerPixel = $fileSize / $pixels;
            
            // Score from 0-100
            $score = 50;
            
            // Higher resolution = better quality
            if ($pixels > 2000000) $score += 20; // 2MP+
            elseif ($pixels > 1000000) $score += 10; // 1MP+
            
            // Reasonable file size per pixel
            if ($bytesPerPixel > 1) $score += 15;
            elseif ($bytesPerPixel > 0.5) $score += 10;
            
            // Aspect ratio check
            $ratio = $width / $height;
            if ($ratio >= 0.5 && $ratio <= 2) $score += 15; // Reasonable aspect ratio
            
            return min(100, max(0, $score));
            
        } catch (\Exception $e) {
            return 50; // Default neutral score
        }
    }

    private function isValidSlug(string $slug): bool
    {
        return preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug) && strlen($slug) >= 3;
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    private function calculateValidationScore(array $errors, array $warnings): int
    {
        $score = 100;
        $score -= count($errors) * 20; // Each error removes 20 points
        $score -= count($warnings) * 5; // Each warning removes 5 points
        
        return max(0, min(100, $score));
    }

    /**
     * Quick validation for specific aspects
     */
    public function validateFileUpload(string $filePath, ProductSetting $setting): array
    {
        $errors = [];
        
        if (!file_exists($filePath)) {
            $errors[] = 'File does not exist';
            return ['is_valid' => false, 'errors' => $errors];
        }

        $fileSize = filesize($filePath);
        
        if ($setting->min_file_size && $fileSize < $setting->min_file_size) {
            $errors[] = 'File is too small';
        }
        
        if ($setting->max_file_size && $fileSize > $setting->max_file_size) {
            $errors[] = 'File is too large';
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors,
            'file_size' => $fileSize
        ];
    }

    /**
     * Validate product data before creation
     */
    public function validateProductData(array $data, ProductSetting $setting): array
    {
        $errors = [];

        // Required fields
        if (empty($data['title'])) {
            $errors[] = 'Title is required';
        }

        if (empty($data['base_price']) || $data['base_price'] <= 0) {
            $errors[] = 'Valid base price is required';
        }

        if (empty($data['license_id'])) {
            $errors[] = 'License selection is required';
        }

        // Description length
        if (!empty($data['description'])) {
            if (strlen($data['description']) < $setting->requires_description_min_length) {
                $errors[] = "Description must be at least {$setting->requires_description_min_length} characters";
            }
        }

        // Tags count
        if (!empty($data['tags'])) {
            if (count($data['tags']) < $setting->requires_tags_min_count) {
                $errors[] = "At least {$setting->requires_tags_min_count} tags are required";
            }
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors
        ];
    }
}