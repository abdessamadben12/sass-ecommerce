<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\ValidationService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessProductValidation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private Product $product
    ) {}

    public function handle(
        ValidationService $validationService,
        NotificationService $notificationService
    ): void {
        try {
            Log::info("Starting validation for product {$this->product->id}");

            $validationResult = $validationService->validateProduct($this->product);

            if ($validationResult['is_valid']) {
                // Auto-approve if no manual review required
                if (!$this->product->productSetting->requires_manual_review) {
                    $this->product->approve();
                    $notificationService->notifyProductAutoApproved($this->product);
                } else {
                    $notificationService->notifyProductReadyForReview($this->product);
                }
            } else {
                // Auto-reject with validation errors
                $this->product->update([
                    'status' => 'rejected',
                    'validation_errors' => $validationResult['errors']
                ]);
                
                $notificationService->notifyProductAutoRejected(
                    $this->product, 
                    $validationResult['errors']
                );
            }

            Log::info("Validation completed for product {$this->product->id}");

        } catch (\Exception $e) {
            Log::error("Validation failed for product {$this->product->id}: " . $e->getMessage());
            
            $this->product->update([
                'status' => 'rejected',
                'validation_errors' => ['system_error' => 'Validation process failed']
            ]);
            
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Product validation job failed for product {$this->product->id}: " . $exception->getMessage());
        
        $this->product->update([
            'status' => 'rejected',
            'validation_errors' => ['system_error' => 'Validation process failed']
        ]);
    }
}

class ScanProductForVirus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private Product $product
    ) {}

    public function handle(): void
    {
        try {
            Log::info("Starting virus scan for product {$this->product->id}");

            if (!$this->product->main_file_path || !Storage::exists($this->product->main_file_path)) {
                throw new \Exception('Product file not found');
            }

            $filePath = Storage::path($this->product->main_file_path);
            $scanResult = $this->performVirusScan($filePath);

            // Store scan result
            $this->product->update([
                'virus_scan_status' => $scanResult['clean'] ? 'clean' : 'infected',
                'virus_scan_date' => now(),
                'virus_scan_details' => $scanResult
            ]);

            if (!$scanResult['clean']) {
                $this->product->update([
                    'status' => 'rejected',
                    'validation_errors' => ['virus_scan' => 'File failed virus scan']
                ]);

                Log::warning("Virus detected in product {$this->product->id}");
            }

            Log::info("Virus scan completed for product {$this->product->id}");

        } catch (\Exception $e) {
            Log::error("Virus scan failed for product {$this->product->id}: " . $e->getMessage());
            throw $e;
        }
    }

    private function performVirusScan(string $filePath): array
    {
        // Mock virus scan - replace with actual scanning service
        // You could integrate with ClamAV, VirusTotal API, etc.
        
        $fileSize = filesize($filePath);
        $fileHash = hash_file('sha256', $filePath);
        
        // Simulate scan delay
        sleep(2);
        
        // Mock result - in reality, this would call actual antivirus
        return [
            'clean' => true,
            'scan_engine' => 'mock-scanner',
            'scan_version' => '1.0.0',
            'file_size' => $fileSize,
            'file_hash' => $fileHash,
            'threats_found' => [],
            'scan_duration' => 2
        ];
    }
}

class CheckProductDuplicate implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private Product $product
    ) {}

    public function handle(): void
    {
        try {
            Log::info("Starting duplicate check for product {$this->product->id}");

            $duplicates = $this->findDuplicates();

            // Store duplicate check result
            $this->product->update([
                'duplicate_check_status' => empty($duplicates) ? 'unique' : 'duplicate',
                'duplicate_check_date' => now(),
                'potential_duplicates' => $duplicates
            ]);

            if (!empty($duplicates)) {
                $this->product->update([
                    'status' => 'rejected',
                    'validation_errors' => [
                        'duplicate_check' => 'Potential duplicate content detected',
                        'similar_products' => array_slice($duplicates, 0, 5) // Limit to 5 results
                    ]
                ]);

                Log::warning("Duplicates found for product {$this->product->id}");
            }

            Log::info("Duplicate check completed for product {$this->product->id}");

        } catch (\Exception $e) {
            Log::error("Duplicate check failed for product {$this->product->id}: " . $e->getMessage());
            throw $e;
        }
    }

    private function findDuplicates(): array
    {
        $duplicates = [];

        // Check by file hash (exact duplicates)
        if ($this->product->file_hash) {
            $exactDuplicates = Product::where('file_hash', $this->product->file_hash)
                ->where('id', '!=', $this->product->id)
                ->where('status', 'approved')
                ->get(['id', 'title', 'shop_id']);

            foreach ($exactDuplicates as $duplicate) {
                $duplicates[] = [
                    'type' => 'exact',
                    'confidence' => 100,
                    'product_id' => $duplicate->id,
                    'title' => $duplicate->title,
                    'shop_id' => $duplicate->shop_id
                ];
            }
        }

        // Check by similar titles (fuzzy matching)
        $similarTitles = Product::where('id', '!=', $this->product->id)
            ->where('status', 'approved')
            ->where('category_id', $this->product->category_id)
            ->get(['id', 'title', 'shop_id']);

        foreach ($similarTitles as $similar) {
            $similarity = $this->calculateStringSimilarity(
                strtolower($this->product->title),
                strtolower($similar->title)
            );

            if ($similarity > 80) { // 80% similarity threshold
                $duplicates[] = [
                    'type' => 'similar_title',
                    'confidence' => $similarity,
                    'product_id' => $similar->id,
                    'title' => $similar->title,
                    'shop_id' => $similar->shop_id
                ];
            }
        }

        // Check by file size (potential duplicates)
        if ($this->product->main_file_size) {
            $tolerance = 1024; // 1KB tolerance
            $similarSize = Product::where('id', '!=', $this->product->id)
                ->where('status', 'approved')
                ->where('category_id', $this->product->category_id)
                ->whereBetween('main_file_size', [
                    $this->product->main_file_size - $tolerance,
                    $this->product->main_file_size + $tolerance
                ])
                ->get(['id', 'title', 'shop_id', 'main_file_size']);

            foreach ($similarSize as $similar) {
                $duplicates[] = [
                    'type' => 'similar_size',
                    'confidence' => 60,
                    'product_id' => $similar->id,
                    'title' => $similar->title,
                    'shop_id' => $similar->shop_id,
                    'file_size_diff' => abs($this->product->main_file_size - $similar->main_file_size)
                ];
            }
        }

        return $duplicates;
    }

    private function calculateStringSimilarity(string $str1, string $str2): float
    {
        return (similar_text($str1, $str2) / max(strlen($str1), strlen($str2))) * 100;
    }
}

class AssessProductQuality implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private Product $product
    ) {}

    public function handle(): void
    {
        try {
            Log::info("Starting quality assessment for product {$this->product->id}");

            $qualityScore = $this->calculateQualityScore();

            // Store quality assessment result
            $this->product->update([
                'quality_score' => $qualityScore['score'],
                'quality_assessment_date' => now(),
                'quality_details' => $qualityScore['details']
            ]);

            if ($qualityScore['score'] < 60) { // Minimum quality threshold
                $this->product->update([
                    'status' => 'rejected',
                    'validation_errors' => [
                        'quality_assessment' => 'Product quality does not meet minimum standards',
                        'score' => $qualityScore['score'],
                        'issues' => $qualityScore['issues']
                    ]
                ]);

                Log::warning("Low quality score for product {$this->product->id}: {$qualityScore['score']}");
            }

            Log::info("Quality assessment completed for product {$this->product->id}");

        } catch (\Exception $e) {
            Log::error("Quality assessment failed for product {$this->product->id}: " . $e->getMessage());
            throw $e;
        }
    }

    private function calculateQualityScore(): array
    {
        $score = 0;
        $maxScore = 100;
        $details = [];
        $issues = [];

        // Title quality (20 points)
        $titleScore = $this->assessTitle();
        $score += $titleScore['score'];
        $details['title'] = $titleScore;
        if ($titleScore['score'] < 15) {
            $issues[] = 'Title needs improvement';
        }

        // Description quality (25 points)
        $descriptionScore = $this->assessDescription();
        $score += $descriptionScore['score'];
        $details['description'] = $descriptionScore;
        if ($descriptionScore['score'] < 18) {
            $issues[] = 'Description needs improvement';
        }

        // Tags quality (15 points)
        $tagsScore = $this->assessTags();
        $score += $tagsScore['score'];
        $details['tags'] = $tagsScore;
        if ($tagsScore['score'] < 10) {
            $issues[] = 'Tags need improvement';
        }

        // Preview images quality (20 points)
        $previewScore = $this->assessPreviewImages();
        $score += $previewScore['score'];
        $details['preview_images'] = $previewScore;
        if ($previewScore['score'] < 15) {
            $issues[] = 'Preview images need improvement';
        }

        // File quality (20 points)
        $fileScore = $this->assessFile();
        $score += $fileScore['score'];
        $details['file'] = $fileScore;
        if ($fileScore['score'] < 15) {
            $issues[] = 'File quality needs improvement';
        }

        return [
            'score' => min($score, $maxScore),
            'details' => $details,
            'issues' => $issues
        ];
    }

    private function assessTitle(): array
    {
        $score = 0;
        $maxScore = 20;

        if (!$this->product->title) {
            return ['score' => 0, 'reason' => 'No title provided'];
        }

        $title = $this->product->title;
        $length = strlen($title);

        // Length assessment
        if ($length >= 10 && $length <= 100) {
            $score += 8;
        } elseif ($length >= 5) {
            $score += 4;
        }

        // Word count
        $wordCount = str_word_count($title);
        if ($wordCount >= 3 && $wordCount <= 15) {
            $score += 6;
        } elseif ($wordCount >= 2) {
            $score += 3;
        }

        // Check for meaningful content (not just random characters)
        if (preg_match('/^[a-zA-Z0-9\s\-_.,()]+$/', $title)) {
            $score += 3;
        }

        // Check capitalization
        if (ucwords(strtolower($title)) === $title || $title === strtoupper($title)) {
            $score += 3;
        }

        return [
            'score' => min($score, $maxScore),
            'length' => $length,
            'word_count' => $wordCount
        ];
    }

    private function assessDescription(): array
    {
        $score = 0;
        $maxScore = 25;

        if (!$this->product->description) {
            return ['score' => 5, 'reason' => 'No description provided'];
        }

        $description = $this->product->description;
        $length = strlen($description);
        $wordCount = str_word_count($description);

        // Length assessment
        if ($length >= 200 && $length <= 2000) {
            $score += 10;
        } elseif ($length >= 100) {
            $score += 6;
        } elseif ($length >= 50) {
            $score += 3;
        }

        // Word count
        if ($wordCount >= 30) {
            $score += 8;
        } elseif ($wordCount >= 15) {
            $score += 5;
        }

        // Check for structured content (paragraphs, sentences)
        $sentences = preg_split('/[.!?]+/', $description);
        if (count($sentences) >= 3) {
            $score += 4;
        }

        // Check for meaningful content
        if (!preg_match('/lorem ipsum|test|sample|placeholder/i', $description)) {
            $score += 3;
        }

        return [
            'score' => min($score, $maxScore),
            'length' => $length,
            'word_count' => $wordCount,
            'sentences' => count($sentences)
        ];
    }

    private function assessTags(): array
    {
        $score = 0;
        $maxScore = 15;

        if (!$this->product->tags || empty($this->product->tags)) {
            return ['score' => 0, 'reason' => 'No tags provided'];
        }

        $tags = $this->product->tags;
        $tagCount = count($tags);

        // Tag count assessment
        if ($tagCount >= 5 && $tagCount <= 15) {
            $score += 8;
        } elseif ($tagCount >= 3) {
            $score += 5;
        } elseif ($tagCount >= 1) {
            $score += 2;
        }

        // Tag quality
        $validTags = 0;
        foreach ($tags as $tag) {
            if (strlen($tag) >= 3 && strlen($tag) <= 30 && preg_match('/^[a-zA-Z0-9\s\-]+$/', $tag)) {
                $validTags++;
            }
        }

        $score += min($validTags * 1, 7); // Max 7 points for tag quality

        return [
            'score' => min($score, $maxScore),
            'tag_count' => $tagCount,
            'valid_tags' => $validTags
        ];
    }

    private function assessPreviewImages(): array
    {
        $score = 0;
        $maxScore = 20;

        if (!$this->product->preview_images || empty($this->product->preview_images)) {
            return ['score' => 2, 'reason' => 'No preview images provided'];
        }

        $imageCount = count($this->product->preview_images);

        // Image count assessment
        if ($imageCount >= 3) {
            $score += 10;
        } elseif ($imageCount >= 2) {
            $score += 7;
        } elseif ($imageCount >= 1) {
            $score += 4;
        }

        // Image existence check
        $validImages = 0;
        foreach ($this->product->preview_images as $imagePath) {
            if (Storage::exists($imagePath)) {
                $validImages++;
            }
        }

        $score += min($validImages * 2, 10); // Max 10 points for valid images

        return [
            'score' => min($score, $maxScore),
            'image_count' => $imageCount,
            'valid_images' => $validImages
        ];
    }

    private function assessFile(): array
    {
        $score = 0;
        $maxScore = 20;

        if (!$this->product->main_file_path) {
            return ['score' => 0, 'reason' => 'No main file provided'];
        }

        // File existence
        if (Storage::exists($this->product->main_file_path)) {
            $score += 10;
        } else {
            return ['score' => 0, 'reason' => 'Main file does not exist'];
        }

        // File size assessment
        $fileSize = $this->product->main_file_size;
        if ($fileSize > 1024 && $fileSize < 100 * 1024 * 1024) { // Between 1KB and 100MB
            $score += 5;
        }

        // File hash validation
        if ($this->product->hasValidFileHash()) {
            $score += 5;
        }

        return [
            'score' => min($score, $maxScore),
            'file_size' => $fileSize,
            'file_exists' => Storage::exists($this->product->main_file_path),
            'hash_valid' => $this->product->hasValidFileHash()
        ];
    }
}