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
      Schema::create('product_downloads', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Download information
            $table->timestamp('downloaded_at');
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            
            // Download session info
            $table->string('download_token', 64)->nullable(); // For secure download links
            $table->timestamp('token_expires_at')->nullable();
            
            // File info at time of download
            $table->string('file_name')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('file_hash', 64)->nullable();
            
            // Download status
            $table->enum('status', ['initiated', 'completed', 'failed', 'expired'])->default('initiated');
            $table->text('failure_reason')->nullable();
            
            // License info at time of download
            $table->string('license_type')->nullable();
            $table->decimal('license_price', 10, 2)->nullable();
            
            // Metadata
            $table->json('metadata')->nullable(); // Extra info like browser, OS, etc.
            
            $table->timestamps();
            
            // Indexes
            $table->index(['product_id', 'user_id']);
            $table->index(['user_id', 'downloaded_at']);
            $table->index(['product_id', 'downloaded_at']);
            $table->index('downloaded_at');
            $table->index('status');
            $table->index('download_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_downloads');
    }
};
