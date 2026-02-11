<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('platform_percent', 5, 2)->default(0.00);
            $table->decimal('seller_percent', 5, 2)->default(0.00);
            $table->decimal('buyer_fee_percent', 5, 2)->default(0.00);
            $table->decimal('min_withdrawal', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_settings');
    }
};
