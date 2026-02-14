<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('templates')) {
            return;
        }

        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type', 80);
            $table->string('subtype', 80)->nullable();
            $table->string('description')->nullable();
            $table->longText('content');
            $table->longText('css_content')->nullable();
            $table->longText('js_content')->nullable();
            $table->json('variables')->nullable();
            $table->json('settings')->nullable();
            $table->json('tags')->nullable();
            $table->string('output_format', 30)->default('html');
            $table->string('target_audience', 40)->default('all');
            $table->string('language', 10)->default('fr');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_public')->default(false);
            $table->string('status', 30)->default('draft');
            $table->unsignedInteger('usage_count')->default(0);
            $table->string('version', 20)->default('1.0');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index(['target_audience', 'language']);
            $table->index('is_default');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
