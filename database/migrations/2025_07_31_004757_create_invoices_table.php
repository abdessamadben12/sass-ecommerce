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
        Schema::create('invoices', function (Blueprint $table) {
            
            $table->bigIncrements('id');

            // علاقات
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');

            // بيانات عامة
            $table->string('invoice_number')->unique();
            $table->enum('document_type', ['invoice', 'quote', 'credit_note'])->default('invoice');
            $table->enum('status', ['draft', 'sent', 'paid', 'refunded'])->default('draft');

            $table->date('issue_date');
            $table->date('due_date')->nullable();

            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('total_paid', 12, 2)->default(0);
            $table->decimal('total_outstanding', 12, 2)->default(0);

            $table->string('currency', 3)->default('EUR');
            $table->decimal('exchange_rate', 10, 6)->default(1.0);

            $table->string('pdf_path')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
