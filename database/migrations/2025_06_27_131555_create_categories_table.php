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

       Schema::create('categories', function (Blueprint $table) {
            $table->id(); // id BIGINT AUTO_INCREMENT PRIMARY KEY
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('parent_id')->nullable()->constrained('categories');
            $table->integer('level')->default(0);
            $table->string('path', 1000)->nullable();

            // Métadonnées
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
    

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            // Statut
            $table->boolean('is_active')->default(true);
          

            $table->timestamps();

            // Indexes
            $table->index(['parent_id', 'level'], 'idx_parent_level');
            $table->index('path', 'idx_path');
            $table->fullText(['name', 'description'], 'idx_search');
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('categories');
    }
};
