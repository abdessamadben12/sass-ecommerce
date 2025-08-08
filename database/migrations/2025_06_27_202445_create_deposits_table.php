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
        Schema::create('deposits', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->decimal('amount', 10, 2);
        $table->string('payment_method'); // ex: 'paypal', 'card', 'manual'
        $table->string('transaction_id')->nullable(); // ID de transaction externe
        $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
        $table->timestamp('confirmed_at')->nullable();
        $table->text('notes')->nullable(); // notes internes ou justificatifs
        $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('deposits');
    }
};
