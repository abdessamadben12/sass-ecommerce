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
        Schema::create('product_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('format_id')->constrained('product_formats')->onDelete('cascade');

            // Règles techniques
            $table->integer('min_width')->nullable();
            $table->integer('min_height')->nullable();
            $table->unsignedBigInteger('min_file_size')->nullable();
            $table->unsignedBigInteger('max_file_size')->nullable();
            $table->integer('required_dpi')->nullable();

            // Règles de contenu
            $table->integer('requires_description_min_length')->default(100);
            $table->integer('requires_tags_min_count')->default(3);
            $table->integer('requires_preview_images_min')->default(1);

            // Validation automatique
            $table->boolean('auto_virus_scan')->default(true);
            $table->boolean('auto_duplicate_check')->default(true);
            $table->boolean('auto_quality_assessment')->default(true);

            // Validation manuelle
            $table->boolean('requires_manual_review')->default(true);

            $table->timestamp('created_at')->useCurrent();

            $table->unique(['category_id', 'format_id'], 'unique_category_format');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('product_settings');
    }
};
