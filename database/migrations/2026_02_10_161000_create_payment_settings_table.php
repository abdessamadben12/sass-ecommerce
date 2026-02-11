<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50);
            $table->boolean('is_enabled')->default(false);
            $table->string('currency', 10)->default('USD');
            $table->decimal('platform_fee_percent', 5, 2)->default(0.00);
            $table->decimal('min_withdrawal', 10, 2)->default(0.00);
            $table->json('config')->nullable();
            $table->timestamps();

            $table->unique('provider');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
