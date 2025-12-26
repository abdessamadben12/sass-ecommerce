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
        Schema::create('products', function (Blueprint $table) {
          $table->id();

// Références
$table->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
$table->foreignId('category_id')->constrained('categories');
$table->foreignId('product_setting_id')->constrained('product_settings');
$table->foreignId('license_id')->constrained('licenses');

// Informations produit
$table->string('title');
$table->string('slug')->unique();
$table->text('description')->nullable();
$table->json('tags')->nullable();

// Prix
$table->decimal('base_price', 10, 2);
$table->decimal('minimum_price', 10, 2)->default(0.00);

// Fichiers
$table->string('main_file_path', 500);
$table->unsignedBigInteger('main_file_size')->nullable();
$table->string('file_hash', 64)->nullable();

// Preview
$table->json('preview_images')->nullable();
$table->string('thumbnail_path')->nullable();

// Status modération
$table->enum('status', ['draft', 'pending', 'approved', 'rejected',"supended"])->default('draft');
// Timestamps
$table->timestamp('published_at')->nullable();
$table->timestamps();

        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('products');
    }
};
