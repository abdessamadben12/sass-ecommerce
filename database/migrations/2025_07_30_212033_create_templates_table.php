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
        Schema::create('templates', function (Blueprint $table) {
          $table->id(); // BIGINT AUTO_INCREMENT PRIMARY KEY
            
            // Identification
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            
            // Type de template
            $table->enum('type', [
                'invoice',
                'quote',
                'receipt',
                'email_welcome',
                'email_notification',
                'email_campaign',
                'email_reset_password',
                'email_order_confirmation',
                'sms_notification',
                'sms_verification',
                'push_notification',
                'web_header',
                'web_footer',
                'web_sidebar',
                'web_modal',
                'web_banner',
                'pdf_report',
                'pdf_contract',
                'pdf_certificate',
                'print_label',
                'print_ticket',
                'export_csv',
                'export_excel',
                'api_response',
                'webhook_payload',
                'legal_terms',
                'legal_privacy',
                'legal_cookies',
            ]);
            
            // Sous-type
            $table->string('subtype', 100)->nullable();
            
            // Format de sortie
            $table->enum('output_format', ['html', 'pdf', 'text', 'json', 'xml', 'csv', 'excel'])->default('html');
            
            // Contenus
            $table->text('content');
            $table->text('css_content')->nullable();
            $table->text('js_content')->nullable();
            
            // Configuration JSON
            $table->json('variables')->nullable();
            $table->json('settings')->nullable();
            
            // Métadonnées
            $table->json('tags')->nullable();
            $table->string('preview_image', 500)->nullable();
            
            // Usage et contexte
            $table->enum('target_audience', ['buyer', 'seller', 'admin', 'all'])->default('all');
            
            // Localisation
            $table->string('language', 5)->default('fr');
            $table->string('country', 2)->nullable();
            
            // Statut et permissions
            $table->enum('status', ['draft', 'active', 'archived', 'deprecated'])->default('draft');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_system')->default(false);
            $table->boolean('is_public')->default(false);
            
            // Versioning
            $table->string('version', 20)->default('1.0.0');
            $table->foreignId('parent_template_id')->nullable()->constrained('templates')->onDelete('set null');
            
            // Permissions
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->json('allowed_roles')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // Index optimisés
            $table->index(['type', 'status'], 'idx_type_status');
            $table->index(['type', 'is_default'], 'idx_type_default');
            $table->index(['language', 'country'], 'idx_language');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
