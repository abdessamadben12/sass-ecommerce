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
        Schema::create('tickets', function (Blueprint $table) {
             $table->id();
            $table->string('ticket_number')->unique();
            $table->string('title');
            $table->text('description');
           $table->enum('type', ['report', 'support', 'feature_request']);
$table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
$table->enum('status', ['new', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'])->default('new');

            
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamp('resolved_at')->nullable();
            $table->integer('satisfaction_score')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'priority']);
            $table->index('assigned_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tickets');
    }
};
