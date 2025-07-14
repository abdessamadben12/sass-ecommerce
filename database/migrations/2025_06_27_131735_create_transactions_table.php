<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->decimal('amount', 16, 8)->default(0.00);
            $table->enum('trx_type', ['+', '-']); // + زيادة، - نقصان
            $table->string('trx', 40)->unique();   // معرف العملية

            $table->decimal('post_balance', 16, 8)->default(0.00);
            $table->decimal('charge', 16, 8)->default(0.00);

            $table->string('remark')->nullable(); // مثل "purchase", "deposit", "withdraw"
            $table->text('details')->nullable();  // وصف مفصل

            // ✅ Champs polymorphiques
            $table->string('sourceable_type')->nullable();
            $table->unsignedBigInteger('sourceable_id')->nullable();

            $table->enum('status', ['pending', 'success', 'failed'])->default('success');

            $table->timestamps();

            // ✅ Index pour la relation polymorphique
            $table->index(['sourceable_type', 'sourceable_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}
