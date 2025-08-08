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

        Schema::create('shops', function (Blueprint $table) {
              $table->id(); // id BIGINT AUTO_INCREMENT PRIMARY KEY
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('shop_name');
            $table->string('shop_slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('commission_rate', 5, 2)->default(30.00);
            $table->integer('total_products')->default(0);
            $table->integer('total_sales')->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0.00);
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->string('logo')->nullable();
            
            $table->enum('status', ['active', 'suspended', 'inactive'])->default('active');
            
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('shops');
    }
};
