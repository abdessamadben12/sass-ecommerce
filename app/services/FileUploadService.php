<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

class FileUploadService
{
    private const MAIN_FILES_PATH = 'products/main-files';
    private const PREVIEW_IMAGES_PATH = 'products/preview-images';
    private const THUMBNAILS_PATH = 'products/thumbnails';

    /**
     * Upload main product file
     */
    public function uploadMainFile(UploadedFile $file, Product $product): string
    {
        // Validate file
        $this->validateMainFile($file, $product);
;;
        // Generate unique filename
        $filename = $this->generateMainFileName($file, $product);
        $path = self::MAIN_FILES_PATH . '/' . $product->shop_id . '/' . $filename;

        // Delete old file if exists
        if ($product->main_file_path && Storage::disk("spaces_2")->exists($product->main_file_path)) {
            Storage::disk("spaces_2")->delete($product->main_file_path);
        }

        // Store file
        $storedPath = Storage::disk("spaces_2")->putFileAs(
            dirname($path),
            $file,
            basename($path),
            'private'
        );
        // Verify upload
        if (!$storedPath || !Storage::disk("spaces_2")->exists($storedPath)) {
            throw new \Exception('File upload failed');
        }

        return $storedPath;
    }

    /**
     * Upload preview images
     */
    public function uploadPreviewImages(array $files, Product $product): array
    {
        $uploadedPaths = [];

        // Delete old preview images
        if ($product->preview_images) {
            foreach ($product->preview_images as $oldImage) {
                if (Storage::disk("spaces_2")->exists($oldImage)) {
                    Storage::disk("spaces_2")->delete($oldImage);
                }
            }
        }

        foreach ($files as $index => $file) {
            $this->validatePreviewImage($file);

            $filename = $this->generatePreviewImageName($file, $product, $index);
            $path = self::PREVIEW_IMAGES_PATH . '/' . $product->shop_id . '/' . $filename;

            // Process and store image
            $storedPath = $this->processAndStoreImage($file, $path);
            $uploadedPaths[] = $storedPath;
        }

        // Generate thumbnail from first image
        if (!empty($uploadedPaths)) {
            $thumbnailPath = $this->generateThumbnail($uploadedPaths[0], $product);
            $product->update(['thumbnail_path' => $thumbnailPath]);
        }

        return $uploadedPaths;
    }

    /**
     * Validate main file according to product settings
     */
    private function validateMainFile(UploadedFile $file, Product $product): void
    {
        $setting = $product->productSetting;

        // Check file size
        if (!$setting->validateFileSize($file->getSize())) {
            $min = $setting->min_file_size ? $this->formatBytes($setting->min_file_size) : null;
            $max = $setting->max_file_size ? $this->formatBytes($setting->max_file_size) : null;
            
            if ($min && $max) {
                throw new \Exception("File size must be between {$min} and {$max}");
            } elseif ($min) {
                throw new \Exception("File size must be at least {$min}");
            } elseif ($max) {
                throw new \Exception("File size must not exceed {$max}");
            }
        }

        // Check file extension if format is specified
        if ($setting->format) {
            $allowedExtensions =explode(',',$setting->format->extension);
    
            $fileExtension = strtolower($file->getClientOriginalExtension());
            if (!in_array($fileExtension,$allowedExtensions)) {
                throw new \Exception("File type not allowed. Allowed types: " . implode(', ',$allowedExtensions));
               
            }
        }

        // Check MIME type
        if ($setting->format && $setting->format->mime_type) {
            $allowedMimeTypes = explode(',', $setting->format->mime_type);
            if (!in_array($file->getMimeType(), $allowedMimeTypes)) {
                throw new \Exception("Invalid file type");
            }
        }

        // For images, check dimensions and DPI
        if ($this->isImageFile($file)) {
            $this->validateImageDimensions($file, $setting);
        }
    }

    /**
     * Validate preview image
     */
    private function validatePreviewImage(UploadedFile $file): void
    {
        // Check if it's an image
        if (!$this->isImageFile($file)) {
            throw new \Exception('Preview files must be images');
        }

        // Check file size (max 5MB)
        if ($file->getSize() > 5 * 1024 * 1024) {
            throw new \Exception('Preview image size cannot exceed 5MB');
        }

        // Check image dimensions (min 300x300, max 2048x2048)
        $dimensions = getimagesize($file->getRealPath());
        if ($dimensions[0] < 300 || $dimensions[1] < 300) {
            throw new \Exception('Preview images must be at least 300x300 pixels');
        }
        if ($dimensions[0] > 2048 || $dimensions[1] > 2048) {
            throw new \Exception('Preview images cannot exceed 2048x2048 pixels');
        }
    }

    /**
     * Validate image dimensions and DPI
     */
    private function validateImageDimensions(UploadedFile $file, $setting): void
    {
        $dimensions = getimagesize($file->getRealPath());
        
        if (!$dimensions) {
            throw new \Exception('Could not read image dimensions');
        }

        $width = $dimensions[0];
        $height = $dimensions[1];

        if (!$setting->validateDimensions($width, $height)) {
            $errors = [];
            
            if ($setting->min_width && $width < $setting->min_width) {
                $errors[] = "Width must be at least {$setting->min_width}px";
            }
            
            if ($setting->min_height && $height < $setting->min_height) {
                $errors[] = "Height must be at least {$setting->min_height}px";
            }
            
            throw new \Exception(implode(', ', $errors));
        }

        // Check DPI if required (this is a simplified check)
        if ($setting->required_dpi) {
            // Note: DPI checking from uploaded files is complex and may not always be accurate
            // You might want to implement a more sophisticated DPI checking mechanism
            $dpi = $this->getImageDPI($file->getRealPath());
            
            if ($dpi && $dpi < $setting->required_dpi) {
                throw new \Exception("Image DPI must be at least {$setting->required_dpi}");
            }
        }
    }

    /**
     * Process and store image with optimization
     */
    private function processAndStoreImage(UploadedFile $file, string $path): string
    {
        try {
            // Create optimized image
            $image = Image::make($file->getRealPath());
            
            // Optimize image (compress without losing too much quality)
            $image->encode('jpg', 85);
            
            // Store processed image
            $storedPath = Storage::disk('spaces_2')->put($path, $image->stream(), 'public');
            
            if (!$storedPath) {
                throw new \Exception('Failed to store processed image');
            }
            
            return $storedPath;
            
        } catch (\Exception $e) {
            // Fallback to direct file upload if image processing fails
            return Storage::disk("spaces_2")->put(
                dirname($path),
                $file,
            );
        }
    }

    /**
     * Generate thumbnail from preview image
     */
    private function generateThumbnail(string $previewImagePath, Product $product): string
    {
        try {
            if (!Storage::disk("spaces_2")->exists($previewImagePath)) {
                throw new \Exception('Preview image not found');
            }

            $thumbnailName = 'thumb_' . $product->id . '_' . time() . '.jpg';
            $thumbnailPath = self::THUMBNAILS_PATH . '/' . $product->shop_id . '/' . $thumbnailName;

            // Create thumbnail (300x300)
            $imageContent = Image::make(Storage::disk("spaces_2")->get($previewImagePath));
              // Créer la miniature avec Intervention Image
        $image = Image::make($imageContent);
        $image->fit(300, 300)
              ->encode('jpg', 80);
         $uploaded = Storage::disk('spaces_2')->put(
            $thumbnailPath, 
            $image->stream()->__toString(),
            'public'
        );
            // Store thumbnail
            
            if (!$uploaded) {
                throw new \Exception('Failed to generate thumbnail');
            }

             return $thumbnailPath;

        } catch (\Exception $e) {
            // Return null if thumbnail generation fails
            return $e->getMessage();
        }
    }

    /**
     * Generate unique filename for main file
     */
    private function generateMainFileName(UploadedFile $file, Product $product): string
    {
        $extension = $file->getClientOriginalExtension();
        $slug = Str::slug($product->title);
        $timestamp = time();
        $random = Str::random(8);
        
        return "{$slug}_{$product->id}_{$timestamp}_{$random}.{$extension}";
    }

    /**
     * Generate filename for preview image
     */
    private function generatePreviewImageName(UploadedFile $file, Product $product, int $index): string
    {
        $extension = $file->getClientOriginalExtension();
        $timestamp = time();
        $random = Str::random(6);
        
        return "preview_{$product->id}_{$index}_{$timestamp}_{$random}.{$extension}";
    }

    /**
     * Check if file is an image
     */
    private function isImageFile(UploadedFile $file): bool
    {
        return strpos($file->getMimeType(), 'image/') === 0;
    }

    /**
     * Get image DPI (basic implementation)
     */
    private function getImageDPI(string $filePath): ?int
    {
        try {
            $imageInfo = getimagesize($filePath);
            
            if (isset($imageInfo['channels']) && isset($imageInfo['bits'])) {
                // This is a simplified DPI check
                // For more accurate DPI detection, you might need to use EXIF data
                $exif = @exif_read_data($filePath);
                
                if ($exif && isset($exif['XResolution'])) {
                    // Convert fraction to decimal if needed
                    if (strpos($exif['XResolution'], '/') !== false) {
                        $parts = explode('/', $exif['XResolution']);
                        return intval($parts[0] / $parts[1]);
                    }
                    
                    return intval($exif['XResolution']);
                }
            }
            
            return null;
            
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Format bytes to human readable string
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
     * Delete product files
     */
    public function deleteProductFiles(Product $product): void
    {
        // Delete main file
        if ($product->main_file_path && Storage::disk("spaces_2")->exists($product->main_file_path)) {
            Storage::disk("spaces_2")->delete($product->main_file_path);
        }

        // Delete preview images
        if ($product->preview_images) {
            foreach ($product->preview_images as $imagePath) {
                if (Storage::disk("spaces_2")->exists($imagePath)) {
                    Storage::disk("spaces_2")->delete($imagePath);
                }
            }
        }

        // Delete thumbnail
        if ($product->thumbnail_path && Storage::disk("spaces_2")->exists($product->thumbnail_path)) {
            Storage::disk("spaces_2")->delete($product->thumbnail_path);
        }
    }

    /**
     * Get file download URL for authorized users
     */
    public function getSecureDownloadUrl(Product $product): string
    {
        // Generate a temporary signed URL for downloading
        return Storage::temporaryUrl(
            $product->main_file_path,
            now()->addMinutes(60) // URL expires in 1 hour
        );
    }

    /**
     * Duplicate product files for product duplication
     */
    public function duplicateProductFiles(Product $originalProduct, Product $newProduct): void
    {
        try {
            // Duplicate main file
            if ($originalProduct->main_file_path && Storage::disk("spaces_2")->exists($originalProduct->main_file_path)) {
                $originalPath = $originalProduct->main_file_path;
                $newPath = str_replace(
                    "/{$originalProduct->shop_id}/",
                    "/{$newProduct->shop_id}/",
                    $originalPath
                );
                $newPath = str_replace(
                    "_{$originalProduct->id}_",
                    "_{$newProduct->id}_",
                    $newPath
                );

                Storage::copy($originalPath, $newPath);
                $newProduct->update([
                    'main_file_path' => $newPath,
                    'main_file_size' => $originalProduct->main_file_size,
                    'file_hash' => hash_file('sha256', Storage::path($newPath))
                ]);
            }

            // Duplicate preview images
            if ($originalProduct->preview_images) {
                $newPreviewImages = [];
                
                foreach ($originalProduct->preview_images as $index => $originalImagePath) {
                    if (Storage::disk("spaces_2")->exists($originalImagePath)) {
                        $newImagePath = str_replace(
                            "/{$originalProduct->shop_id}/",
                            "/{$newProduct->shop_id}/",
                            $originalImagePath
                        );
                        $newImagePath = str_replace(
                            "_{$originalProduct->id}_",
                            "_{$newProduct->id}_",
                            $newImagePath
                        );

                        Storage::copy($originalImagePath, $newImagePath);
                        $newPreviewImages[] = $newImagePath;
                    }
                }

                $newProduct->update(['preview_images' => $newPreviewImages]);

                // Generate new thumbnail
                if (!empty($newPreviewImages)) {
                    $thumbnailPath = $this->generateThumbnail($newPreviewImages[0], $newProduct);
                    $newProduct->update(['thumbnail_path' => $thumbnailPath]);
                }
            }

        } catch (\Exception $e) {
            // Log error but don't fail the duplication process
            \Log::error("Failed to duplicate files for product {$newProduct->id}: " . $e->getMessage());
        }
    }

    /**
     * Validate file integrity
     */
    public function validateFileIntegrity(Product $product): bool
    {
        if (!$product->main_file_path || !$product->file_hash) {
            return false;
        }

        if (!Storage::disk("spaces_2")->exists($product->main_file_path)) {
            return false;
        }

        $filePath = Storage::path($product->main_file_path);
        $currentHash = hash_file('sha256', $filePath);

        return $currentHash === $product->file_hash;
    }

    /**
     * Get file metadata
     */
    public function getFileMetadata(string $filePath): array
    {
        if (!Storage::disk("spaces_2")->exists($filePath)) {
            throw new \Exception('File not found');
        }

        $fullPath = Storage::path($filePath);
        $metadata = [
            'size' => filesize($fullPath),
            'mime_type' => mime_content_type($fullPath),
            'extension' => pathinfo($fullPath, PATHINFO_EXTENSION),
            'hash' => hash_file('sha256', $fullPath),
            'created_at' => date('Y-m-d H:i:s', filectime($fullPath)),
            'modified_at' => date('Y-m-d H:i:s', filemtime($fullPath))
        ];

        // Add image-specific metadata if it's an image
        if (strpos($metadata['mime_type'], 'image/') === 0) {
            $imageInfo = getimagesize($fullPath);
            if ($imageInfo) {
                $metadata['width'] = $imageInfo[0];
                $metadata['height'] = $imageInfo[1];
                $metadata['type'] = $imageInfo[2];
            }

            // Try to get EXIF data
            try {
                $exif = exif_read_data($fullPath);
                if ($exif) {
                    $metadata['exif'] = [
                        'camera' => $exif['Make'] ?? null,
                        'model' => $exif['Model'] ?? null,
                        'date_taken' => $exif['DateTime'] ?? null,
                        'dpi_x' => $exif['XResolution'] ?? null,
                        'dpi_y' => $exif['YResolution'] ?? null
                    ];
                }
            } catch (\Exception $e) {
                // EXIF data not available or corrupted
            }
        }

        return $metadata;
    }

    /**
     * Clean up orphaned files
     */
    public function cleanupOrphanedFiles(): int
    {
        $deletedCount = 0;
        $directories = [
            self::MAIN_FILES_PATH,
            self::PREVIEW_IMAGES_PATH,
            self::THUMBNAILS_PATH
        ];

        foreach ($directories as $directory) {
            $files = Storage::allFiles($directory);
            
            foreach ($files as $file) {
                // Extract product ID from filename pattern
                if (preg_match('/_(\\d+)_/', basename($file), $matches)) {
                    $productId = $matches[1];
                    
                    // Check if product exists
                    if (!Product::where('id', $productId)->exists()) {
                        Storage::disk("spaces_2")->delete($file);
                        $deletedCount++;
                    }
                }
            }
        }

        return $deletedCount;
    }

    /**
     * Get storage usage statistics
     */
    public function getStorageStats(): array
    {
        $stats = [
            'total_files' => 0,
            'total_size' => 0,
            'by_type' => [
                'main_files' => ['count' => 0, 'size' => 0],
                'preview_images' => ['count' => 0, 'size' => 0],
                'thumbnails' => ['count' => 0, 'size' => 0]
            ]
        ];

        $directories = [
            'main_files' => self::MAIN_FILES_PATH,
            'preview_images' => self::PREVIEW_IMAGES_PATH,
            'thumbnails' => self::THUMBNAILS_PATH
        ];

        foreach ($directories as $type => $directory) {
            $files = Storage::allFiles($directory);
            
            foreach ($files as $file) {
                $size = Storage::size($file);
                $stats['total_files']++;
                $stats['total_size'] += $size;
                $stats['by_type'][$type]['count']++;
                $stats['by_type'][$type]['size'] += $size;
            }
        }

        // Format sizes for human readability
        $stats['total_size_formatted'] = $this->formatBytes($stats['total_size']);
        foreach ($stats['by_type'] as $type => $data) {
            $stats['by_type'][$type]['size_formatted'] = $this->formatBytes($data['size']);
        }

        return $stats;
    }
}