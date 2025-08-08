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
        Schema::create('payments', function (Blueprint $table) {
      $table->bigIncrements('id');


            $table->foreignId('invoice_id')->constrained()->onDelete('cascade'); 
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); 

            $table->enum('method', ['card', 'paypal', 'crypto', 'wallet']);
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('EUR');

            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamp('paid_at')->nullable();

            $table->string('transaction_id')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('payments');
    }
};
