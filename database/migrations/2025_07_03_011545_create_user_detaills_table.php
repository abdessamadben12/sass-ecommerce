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
        Schema::create('user_detaills', function (Blueprint $table) {
           
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('country')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('user_detaills');
    }
};
