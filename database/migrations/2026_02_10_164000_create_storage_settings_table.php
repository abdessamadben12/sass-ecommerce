<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storage_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50)->default('local');
            $table->string('endpoint')->nullable();
            $table->string('region', 50)->nullable();
            $table->string('bucket')->nullable();
            $table->string('access_key')->nullable();
            $table->string('secret_key')->nullable();
            $table->string('public_url')->nullable();
            $table->unsignedInteger('max_upload_mb')->default(50);
            $table->json('allowed_mimes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storage_settings');
    }
};
