<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Review content
            $table->unsignedTinyInteger('rating'); // 1-5 stars
            $table->string('title', 255)->nullable();
            $table->text('comment')->nullable();
            
            // Review status
            $table->enum('status', ['pending', 'approved', 'rejected', 'hidden'])->default('pending');
            $table->text('rejection_reason')->nullable();
            
            // Moderation
            $table->foreignId('moderated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('moderated_at')->nullable();
            
            // Helpfulness tracking
            $table->unsignedInteger('helpful_count')->default(0);
            $table->unsignedInteger('not_helpful_count')->default(0);
            
            // Purchase verification
            $table->boolean('is_verified_purchase')->default(false);
            $table->foreignId('purchase_id')->nullable()->constrained('purchases')->onDelete('set null');
            
            // Review metadata
            $table->json('metadata')->nullable(); // Extra data like purchase date, version, etc.
            
            // Response from vendor
            $table->text('vendor_response')->nullable();
            $table->timestamp('vendor_response_at')->nullable();
            $table->foreignId('vendor_response_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Constraints
            
            // Indexes
            $table->index(['product_id', 'status']);
            $table->index(['user_id', 'created_at']);
            $table->index(['product_id', 'rating']);
            $table->index(['product_id', 'created_at']);
            $table->index('status');
            $table->index('is_verified_purchase');
            $table->index('rating');
            
            // Unique constraint to prevent multiple reviews per user per product
            $table->unique(['product_id', 'user_id'], 'unique_product_user_review');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
