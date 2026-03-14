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
         Schema::disableForeignKeyConstraints();
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_review_id')->nullable();
            $table->unsignedBigInteger('reported_by')->nullable();
            $table->boolean('is_reported')->default(false);
            $table->text('report_reason')->nullable();
            $table->enum('moderation_status', ['pending', 'reviewed', 'removed'])->default('pending');
            $table->timestamps();

            $table->foreign('product_review_id')->references('id')->on('product_reviews')->onDelete('cascade');
            $table->foreign('reported_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('reviews');
    }
};
