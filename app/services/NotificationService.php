<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use App\Notifications\ProductApprovedNotification;
use App\Notifications\ProductRejectedNotification;
use App\Notifications\ProductSuspendedNotification;
use App\Notifications\ProductSubmittedNotification;
use App\Notifications\ProductAutoApprovedNotification;
use App\Notifications\ProductAutoRejectedNotification;
use App\Notifications\ProductReadyForReviewNotification;
use App\Notifications\ProductPurchasedNotification;
use App\Notifications\ProductReviewNotification;
use App\Notifications\ProductDownloadedNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    /**
     * Notify when a product is approved
     */
    public function notifyProductApproved(Product $product): void
    {
        try {
            $shop = $product->shop;
            $owner = $shop->user;

            // Notify shop owner
            $owner->notify(new ProductApprovedNotification($product));

            // Send email notification
            $this->sendProductApprovedEmail($product, $owner);

            // Log notification
            Log::info("Product approved notification sent", [
                'product_id' => $product->id,
                'shop_id' => $shop->id,
                'user_id' => $owner->id
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send product approved notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Notify when a product is rejected
     */
    public function notifyProductRejected(Product $product, ?string $reason = null): void
    {
        try {
            $shop = $product->shop;
            $owner = $shop->user;

            // Notify shop owner
            $owner->notify(new ProductRejectedNotification($product, $reason));

            // Send email notification
            $this->sendProductRejectedEmail($product, $owner, $reason);

            // Log notification
            Log::info("Product rejected notification sent", [
                'product_id' => $product->id,
                'shop_id' => $shop->id,
                'user_id' => $owner->id,
                'reason' => $reason
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send product rejected notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Notify when a product is suspended
     */
    public function notifyProductSuspended(Product $product, ?string $reason = null): void
    {
        try {
            $shop = $product->shop;
            $owner = $shop->user;

            // Notify shop owner
            $owner->notify(new ProductSuspendedNotification($product, $reason));

            // Send email notification
            $this->sendProductSuspendedEmail($product, $owner, $reason);

            // Log notification
            Log::info("Product suspended notification sent", [
                'product_id' => $product->id,
                'shop_id' => $shop->id,
                'user_id' => $owner->id,
                'reason' => $reason
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send product suspended notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Notify when a product is submitted for review
     */
    public function notifyProductSubmitted(Product $product): void
    {
        try {
            // Notify administrators and moderators
            $admins = User::role(['admin', 'moderator'])->get();

            Notification::send($admins, new ProductSubmittedNotification($product));

            // Send email to admin team
            $this->sendProductSubmittedEmail($product);

            // Log notification
            Log::info("Product submitted notification sent", [
                'product_id' => $product->id,
                'admin_count' => $admins->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send product submitted notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Notify when a product is auto-approved
     */
    public function notifyProductAutoApproved(Product $product): void
    {
        try {
            $shop = $product->shop;
            $owner = $shop->user;

            // Notify shop owner
            $owner->notify(new ProductAutoApprovedNotification($product));

            // Send email notification
            $this->sendProductAutoApprovedEmail($product, $owner);

            // Log notification
            Log::info("Product auto-approved notification sent", [
                'product_id' => $product->id,
                'shop_id' => $shop->id,
                'user_id' => $owner->id
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send product auto-approved notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Notify when a product is auto-rejected
     */
    public function notifyProductAutoRejected(Product $product, array $errors): void
    {
        try {
            $shop = $product->shop;
            $owner = $shop->user;

            // Notify shop owner
            $owner->notify(new ProductAutoRejectedNotification($product, $errors));

            // Send email notification
            $this->sendProductAutoRejectedEmail($product, $owner, $errors);

            // Log notification
            Log::info("Product auto-rejected notification sent", [
                'product_id' => $product->id,
                'shop_id' => $shop->id,
                'user_id' => $owner->id,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send product auto-rejected notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Notify when a product is ready for manual review
     */
    public function notifyProductReadyForReview(Product $product): void
    {
        try {
            // Notify administrators and moderators
            $moderators = User::role(['admin', 'moderator'])->get();

            Notification::send($moderators, new ProductReadyForReviewNotification($product));

            // Log notification
            Log::info("Product ready for review notification sent", [
                'product_id' => $product->id,
                'moderator_count' => $moderators->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send product ready for review notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Notify when a product is purchased
     */
    public function notifyProductPurchased(Product $product, User $buyer, float $amount): void
    {
        try {
            $shop = $product->shop;
            $seller = $shop->user;

            // Notify seller
            $seller->notify(new ProductPurchasedNotification($product, $buyer, $amount));

            // Send email to seller
            $this->sendProductPurchasedEmail($product, $seller, $buyer, $amount);

            // Log notification
            Log::info("Product purchased notification sent", [
                'product_id' => $product->id,
                'buyer_id' => $buyer->id,
                'seller_id' => $seller->id,
                'amount' => $amount
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send product purchased notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Notify when a product receives a new review
     */
    public function notifyProductReview(Product $product, User $reviewer, int $rating, ?string $comment = null): void
    {
        try {
            $shop = $product->shop;
            $owner = $shop->user;

            // Don't notify if the owner is reviewing their own product
            if ($owner->id === $reviewer->id) {
                return;
            }

            // Notify shop owner
            $owner->notify(new ProductReviewNotification($product, $reviewer, $rating, $comment));

            // Send email notification
            $this->sendProductReviewEmail($product, $owner, $reviewer, $rating, $comment);

            // Log notification
            Log::info("Product review notification sent", [
                'product_id' => $product->id,
                'reviewer_id' => $reviewer->id,
                'shop_owner_id' => $owner->id,
                'rating' => $rating
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send product review notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Notify when a product is downloaded
     */
    public function notifyProductDownloaded(Product $product, User $downloader): void
    {
        try {
            $shop = $product->shop;
            $owner = $shop->user;

            // Don't notify if the owner is downloading their own product
            if ($owner->id === $downloader->id) {
                return;
            }

            // Notify shop owner (only for first-time downloads to avoid spam)
            $previousDownloads = $product->downloads()
                ->where('user_id', $downloader->id)
                ->where('status', 'completed')
                ->count();

            if ($previousDownloads <= 1) { // First download
                $owner->notify(new ProductDownloadedNotification($product, $downloader));

                // Log notification
                Log::info("Product downloaded notification sent", [
                    'product_id' => $product->id,
                    'downloader_id' => $downloader->id,
                    'shop_owner_id' => $owner->id
                ]);
            }

        } catch (\Exception $e) {
            Log::error("Failed to send product downloaded notification: " . $e->getMessage(), [
                'product_id' => $product->id
            ]);
        }
    }

    /**
     * Send bulk notifications to users
     */
    public function sendBulkNotification(array $userIds, $notification): void
    {
        try {
            $users = User::whereIn('id', $userIds)->get();
            Notification::send($users, $notification);

            Log::info("Bulk notification sent", [
                'user_count' => $users->count(),
                'notification_type' => get_class($notification)
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send bulk notification: " . $e->getMessage());
        }
    }

    /**
     * Send daily digest to admins
     */
    public function sendDailyDigest(): void
    {
        try {
            $admins = User::role('admin')->get();
            $stats = $this->getDailyStats();

            foreach ($admins as $admin) {
                $this->sendDailyDigestEmail($admin, $stats);
            }

            Log::info("Daily digest sent to admins", [
                'admin_count' => $admins->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send daily digest: " . $e->getMessage());
        }
    }
}