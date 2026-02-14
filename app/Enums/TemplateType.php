<?php
namespace App\Enums;

enum TemplateType: string
{
    // Documents
    case INVOICE = 'invoice';
    case QUOTE = 'quote';
    case RECEIPT = 'receipt';
    
    // Emails
    case EMAIL_WELCOME = 'email_welcome';
    case EMAIL_NOTIFICATION = 'email_notification';
    case EMAIL_CAMPAIGN = 'email_campaign';
    case EMAIL_ADMIN = 'email_admin';
    case EMAIL_RESET_PASSWORD = 'email_reset_password';
    case EMAIL_ORDER_CONFIRMATION = 'email_order_confirmation';
    
    // SMS & Push
    case SMS_NOTIFICATION = 'sms_notification';
    case SMS_VERIFICATION = 'sms_verification';
    case PUSH_NOTIFICATION = 'push_notification';
    
    // Web
    case WEB_HEADER = 'web_header';
    case WEB_FOOTER = 'web_footer';
    case WEB_SIDEBAR = 'web_sidebar';
    case WEB_MODAL = 'web_modal';
    case WEB_BANNER = 'web_banner';
    
    // PDF & Exports
    case PDF_REPORT = 'pdf_report';
    case PDF_CONTRACT = 'pdf_contract';
    case EXPORT_CSV = 'export_csv';
    case EXPORT_EXCEL = 'export_excel';
    
    // Legal
    case LEGAL_TERMS = 'legal_terms';
    case LEGAL_PRIVACY = 'legal_privacy';
    case LEGAL_COOKIES = 'legal_cookies';

    public function label(): string
    {
        return match($this) {
            self::INVOICE => 'Facture',
            self::QUOTE => 'Devis',
            self::EMAIL_WELCOME => 'Email de bienvenue',
            self::EMAIL_NOTIFICATION => 'Email notification',
            self::EMAIL_ADMIN => 'Email admin',
            self::WEB_FOOTER => 'Pied de page',
            self::PDF_REPORT => 'Rapport PDF',
            default => ucfirst(str_replace('_', ' ', $this->value))
        };
    }

    public function category(): string
    {
        return match($this) {
            self::INVOICE, self::QUOTE, self::RECEIPT => 'documents',
            self::EMAIL_WELCOME, self::EMAIL_NOTIFICATION, 
            self::EMAIL_CAMPAIGN, self::EMAIL_ADMIN, self::EMAIL_RESET_PASSWORD, 
            self::EMAIL_ORDER_CONFIRMATION => 'emails',
            self::SMS_NOTIFICATION, self::SMS_VERIFICATION, 
            self::PUSH_NOTIFICATION => 'notifications',
            self::WEB_HEADER, self::WEB_FOOTER, self::WEB_SIDEBAR, 
            self::WEB_MODAL, self::WEB_BANNER => 'web',
            self::PDF_REPORT, self::PDF_CONTRACT, 
            self::EXPORT_CSV, self::EXPORT_EXCEL => 'exports',
            self::LEGAL_TERMS, self::LEGAL_PRIVACY, 
            self::LEGAL_COOKIES => 'legal',
        };
    }
}
