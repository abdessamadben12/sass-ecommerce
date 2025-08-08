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
        Schema::create('product_formats', function (Blueprint $table) {
            $table->id();
             $table->string('name', 100);
            $table->string('extension', 10)->unique();
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('max_file_size');
            $table->json('allowed_categories')->nullable();
            $table->json('validation_rules')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('product_formats');
    }
};
