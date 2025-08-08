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
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
             $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
             $table->enum('type', ['content_sensitive', 'missing_license', 'policy_violation', 'other']);
            $table->string('message');
            $table->boolean('resolved')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('alerts');
    }
};
