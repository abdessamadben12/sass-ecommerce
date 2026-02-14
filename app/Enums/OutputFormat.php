<?php
namespace App\Enums;

enum OutputFormat: string
{
    case HTML = 'html';
    case PDF = 'pdf';
    case TEXT = 'text';
    case JSON = 'json';
    case XML = 'xml';
    case CSV = 'csv';
    case EXCEL = 'excel';
    case RTF = 'rtf';
    case DOCX = 'docx';

    /**
     * Libellé lisible pour l'interface
     */
    public function label(): string
    {
        return match($this) {
            self::HTML => 'HTML',
            self::PDF => 'PDF',
            self::TEXT => 'Texte brut',
            self::JSON => 'JSON',
            self::XML => 'XML',
            self::CSV => 'CSV (Excel)',
            self::EXCEL => 'Excel (.xlsx)',
            self::RTF => 'Rich Text Format',
            self::DOCX => 'Word Document',
        };
    }

    /**
     * Type MIME correspondant
     */
    public function mimeType(): string
    {
        return match($this) {
            self::HTML => 'text/html',
            self::PDF => 'application/pdf',
            self::TEXT => 'text/plain',
            self::JSON => 'application/json',
            self::XML => 'application/xml',
            self::CSV => 'text/csv',
            self::EXCEL => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            self::RTF => 'application/rtf',
            self::DOCX => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
    }

    /**
     * Extension de fichier
     */
    public function extension(): string
    {
        return match($this) {
            self::HTML => 'html',
            self::PDF => 'pdf',
            self::TEXT => 'txt',
            self::JSON => 'json',
            self::XML => 'xml',
            self::CSV => 'csv',
            self::EXCEL => 'xlsx',
            self::RTF => 'rtf',
            self::DOCX => 'docx',
        };
    }

    /**
     * Icône pour l'interface
     */
    public function icon(): string
    {
        return match($this) {
            self::HTML => '🌐',
            self::PDF => '📄',
            self::TEXT => '📝',
            self::JSON => '📊',
            self::XML => '🏷️',
            self::CSV => '📈',
            self::EXCEL => '📗',
            self::RTF => '📃',
            self::DOCX => '📘',
        };
    }

    /**
     * Formats supportés pour chaque type de template
     */
    public static function getForTemplateType(string $templateType): array
    {
        return match($templateType) {
            'invoice', 'quote', 'receipt' => [
                self::HTML, self::PDF, self::DOCX
            ],
            'email_welcome', 'email_notification', 'email_campaign', 'email_admin' => [
                self::HTML, self::TEXT
            ],
            'sms_notification', 'sms_verification' => [
                self::TEXT
            ],
            'web_header', 'web_footer', 'web_sidebar', 'web_modal', 'web_banner' => [
                self::HTML
            ],
            'pdf_report', 'pdf_contract', 'pdf_certificate' => [
                self::PDF, self::HTML
            ],
            'export_csv' => [
                self::CSV
            ],
            'export_excel' => [
                self::EXCEL, self::CSV
            ],
            'api_response', 'webhook_payload' => [
                self::JSON, self::XML
            ],
            'legal_terms', 'legal_privacy', 'legal_cookies' => [
                self::HTML, self::PDF, self::TEXT
            ],
            default => [
                self::HTML, self::PDF, self::TEXT, self::JSON
            ]
        };
    }

    /**
     * Vérifie si le format nécessite un traitement spécial
     */
    public function requiresSpecialProcessing(): bool
    {
        return match($this) {
            self::PDF, self::EXCEL, self::DOCX, self::RTF => true,
            default => false
        };
    }

    /**
     * Vérifie si le format peut être prévisualisé dans le navigateur
     */
    public function canPreviewInBrowser(): bool
    {
        return match($this) {
            self::HTML, self::TEXT, self::JSON, self::XML, self::CSV => true,
            default => false
        };
    }
}
