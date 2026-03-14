<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Fixes schema issues on existing databases that were already migrated.
 * Safe to run multiple times — each change is guarded by a column/index existence check.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Fix products.status ENUM: 'supended' → 'suspended', add 'reason', softDeletes, nullable main_file_path
        if (Schema::hasTable('products')) {
            // Fix status ENUM typo
            DB::statement("ALTER TABLE products MODIFY COLUMN status ENUM('draft','pending','approved','rejected','suspended') NOT NULL DEFAULT 'draft'");

            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'reason')) {
                    $table->text('reason')->nullable()->after('status');
                }
                if (!Schema::hasColumn('products', 'deleted_at')) {
                    $table->softDeletes();
                }
            });

            // Make main_file_path nullable if it exists and is NOT NULL
            if (Schema::hasColumn('products', 'main_file_path')) {
                DB::statement("ALTER TABLE products MODIFY COLUMN main_file_path VARCHAR(500) NULL");
            }
        }

        // 2. Fix profits table: add shop_id and is_paid if missing
        if (Schema::hasTable('profits')) {
            Schema::table('profits', function (Blueprint $table) {
                if (!Schema::hasColumn('profits', 'shop_id')) {
                    $table->foreignId('shop_id')->nullable()->after('user_id')->constrained('shops')->onDelete('set null');
                }
                if (!Schema::hasColumn('profits', 'is_paid')) {
                    $table->boolean('is_paid')->default(false)->after('profit_platform');
                }
            });
        }

        // 3. Fix reviews table: add product_review_id and reported_by if missing
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (!Schema::hasColumn('reviews', 'product_review_id')) {
                    $table->unsignedBigInteger('product_review_id')->nullable()->after('id');
                    if (Schema::hasTable('product_reviews')) {
                        $table->foreign('product_review_id')->references('id')->on('product_reviews')->onDelete('cascade');
                    }
                }
                if (!Schema::hasColumn('reviews', 'reported_by')) {
                    $table->unsignedBigInteger('reported_by')->nullable()->after('product_review_id');
                    $table->foreign('reported_by')->references('id')->on('users')->onDelete('set null');
                }
            });
        }

        // 4. Fix admin_logs table: add proper fields if missing
        if (Schema::hasTable('admin_logs')) {
            Schema::table('admin_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('admin_logs', 'admin_id')) {
                    $table->unsignedBigInteger('admin_id')->nullable()->after('id');
                    $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
                }
                if (!Schema::hasColumn('admin_logs', 'action')) {
                    $table->string('action')->after('admin_id');
                }
                if (!Schema::hasColumn('admin_logs', 'model')) {
                    $table->string('model')->nullable()->after('action');
                }
                if (!Schema::hasColumn('admin_logs', 'model_id')) {
                    $table->unsignedBigInteger('model_id')->nullable()->after('model');
                }
                if (!Schema::hasColumn('admin_logs', 'old_values')) {
                    $table->json('old_values')->nullable()->after('model_id');
                }
                if (!Schema::hasColumn('admin_logs', 'new_values')) {
                    $table->json('new_values')->nullable()->after('old_values');
                }
                if (!Schema::hasColumn('admin_logs', 'ip_address')) {
                    $table->string('ip_address', 45)->nullable()->after('new_values');
                }
                if (!Schema::hasColumn('admin_logs', 'user_agent')) {
                    $table->text('user_agent')->nullable()->after('ip_address');
                }
            });
        }

        // 5. Fix product_reviews: drop invalid purchases FK if it exists
        if (Schema::hasTable('product_reviews') && Schema::hasColumn('product_reviews', 'purchase_id')) {
            try {
                Schema::table('product_reviews', function (Blueprint $table) {
                    $table->dropForeign(['purchase_id']);
                });
            } catch (\Throwable $e) {
                // FK may not exist or already dropped — safe to ignore
            }
        }
    }

    public function down(): void
    {
        // Reversing these structural fixes is intentionally left empty
        // as rollback would risk data loss on production databases.
    }
};
