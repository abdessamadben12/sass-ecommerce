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

        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('description');
            $table->text('terms_and_conditions');

            // Droits accordés
            $table->json('usage_rights');

            // Tarification
            $table->decimal('price_multiplier', 4, 2)->default(1.00);
            $table->decimal('minimum_price', 8, 2)->default(0.00);

            // Restrictions
            $table->integer('download_limit')->nullable(); // Limite de téléchargement
            $table->integer('time_limit_days')->nullable(); // Durée en jours

            // Autres
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('licenses');
    }
};
