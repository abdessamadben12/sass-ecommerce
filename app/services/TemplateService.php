<?php
namespace App\Services;

use Twig\TwigFilter;
use Twig\Environment;
use App\Models\Invoice;
use App\Models\Template;
use App\Enums\TemplateType;
use Illuminate\Support\Str;
use Twig\Loader\ArrayLoader;
use App\Models\TemplateUsage;
use Barryvdh\DomPDF\Facade\Pdf;
use Twig\Extension\AbstractExtension;


class TemplateService
{
    private Environment $twig;

    public function __construct()
    {
        $loader = new ArrayLoader([]);
        
        $this->twig = new Environment($loader, [
            'autoescape' => 'html', // optionnel
        ]);
    
        $this->registerCustomFilters();
    }
    


    /**
     * Rendre un template par ID
     */
    public function render(int $templateId, array $variables = []): string
    {
        $template = Template::findOrFail($templateId);
        return $this->renderTemplate($template, $variables);
    }

    /**
     * Rendre un template par type (utilise le template par défaut)
     */
    public function renderByType(TemplateType $type, array $variables = []): string
    {
        $template = Template::byType($type)
                           ->active()
                           ->default()
                           ->first();
        
        if (!$template) {
            throw new \Exception("Aucun template par défaut trouvé pour le type: {$type->value}");
        }

        return $this->renderTemplate($template, $variables);
    }

    /**
     * Rendre une facture
     */
    public function renderInvoice(int $invoiceId): string
    {
        $invoice = Invoice::with(['client', 'items', 'company'])->findOrFail($invoiceId);
        
        $variables = [
            'invoice' => [
                'id' => $invoice->id,
                'number' => $invoice->number,
                'date' => $invoice->created_at->format('d/m/Y'),
                'due_date' => $invoice->due_date->format('d/m/Y'),
                'subtotal' => $invoice->subtotal,
                'tax_rate' => $invoice->tax_rate,
                'tax_amount' => $invoice->tax_amount,
                'total' => $invoice->total,
                'notes' => $invoice->notes,
            ],
            'company' => [
                'name' => $invoice->company->name,
                'logo_url' => $invoice->company->logo_url,
                'address' => $invoice->company->address,
                'phone' => $invoice->company->phone,
                'email' => $invoice->company->email,
                'legal_text' => $invoice->company->legal_text,
            ],
            'client' => [
                'name' => $invoice->client->name,
                'address' => $invoice->client->address,
                'city' => $invoice->client->city,
                'postal_code' => $invoice->client->postal_code,
                'vat_number' => $invoice->client->vat_number,
            ],
            'items' => $invoice->items->map(function($item) {
                return [
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->total,
                ];
            })->toArray(),
            'current_date' => now()->format('d/m/Y')
        ];

        return $this->renderByType(TemplateType::INVOICE, $variables);
    }

    /**
     * Rendre un email
     */
    public function renderEmail(TemplateType $emailType, array $variables = []): string
    {
        // Ajouter des variables communes aux emails
        $variables = array_merge([
            'brand' => [
                'name' => config('app.name'),
                'logo_url' => config('app.logo_url'),
                'primary_color' => config('app.brand_color', '#3b82f6'),
                'website' => config('app.url'),
            ],
            'unsubscribe_url' => route('emails.unsubscribe', ['token' => 'UNSUBSCRIBE_TOKEN']),
            'current_year' => date('Y'),
        ], $variables);

        return $this->renderByType($emailType, $variables);
    }

    /**
     * Rendre en PDF
     */
    public function renderToPdf(int $templateId, array $variables = []): string
    {
        $html = $this->render($templateId, $variables);
        
        $template = Template::find($templateId);
        $settings = $template->settings ?? [];
        
        $pdf = Pdf::loadHTML($html);
        
        // Appliquer les paramètres du template
        if (isset($settings['page_size'])) {
            $pdf->setPaper($settings['page_size']);
        }
        
        if (isset($settings['orientation'])) {
            $pdf->setOption('orientation', $settings['orientation']);
        }

        return $pdf->output();
    }

    /**
     * Prévisualisation avec données d'exemple
     */
    public function preview(int $templateId): string
    {
        $template = Template::findOrFail($templateId);
        $sampleData = $this->generateSampleData($template);
        
        return $this->renderTemplate($template, $sampleData);
    }

    /**
     * Obtenir un template par type et contexte
     */
    public function getTemplate(TemplateType $type, string $audience = 'all', string $language = 'fr'): ?Template
    {
        return Template::byType($type)
                      ->active()
                      ->forAudience($audience)
                      ->where('language', $language)
                      ->default()
                      ->first();
    }

    /**
     * Créer un nouveau template
     */
    public function createTemplate(array $data): Template
    {
        $baseSlug = Str::slug($data['name']);
        $slug = $baseSlug;
        $count = 1;

        while (Template::where('slug', $slug)->exists()) {
    $slug = $baseSlug . '-' . $count++;
            }

$data['slug'] = $slug;
        $template = Template::create([
            'name' => $data['name'],
            'type' => $data['type'],
            "description" => $data['description'] ?? null ,
            "output_format"=>$data["output_format"],
            "tags"=>$data["tags"],
            'content' => $data['content'],
            'variables' => $data['variables'] ?? [],
            "target_audience"=>$data["target_audience"],
            "is_default"=>$data["is_default"],
            'settings' => $data['settings'] ?? [],
            "slug"=>$slug,
            'created_by' => auth()->id() ?? 1,
            'status' => 'draft'
        ]);

        return $template;
    }

    // Méthodes privées
    private function renderTemplate(Template $template, array $variables): string
{
    // Vérifier les permissions
    // if (!$template->isUsableBy(auth()->user())) {
    //     throw new \Exception('Permission insuffisante pour utiliser ce template');
    // }

    // Valider les variables requises
    $this->validateRequiredVariables($template, $variables);

    // Ajouter des variables globales
    $variables = $this->addGlobalVariables($variables);

    // ⚠️ Re-créer le loader avec le contenu dynamique du template
    $loader = new \Twig\Loader\ArrayLoader([
        'template' => $template->content,
    ]);

    // ⚠️ Changer le loader de l’environnement Twig
    $this->twig->setLoader($loader);

    // ✅ Rendu du template avec nom "template"
    $rendered = $this->twig->render('template', $variables);

    // Logger l'utilisation
    // $this->logUsage($template, $variables);

    // Incrémenter le compteur
    // $template->incrementUsage();

    return $rendered;
}


    private function validateRequiredVariables(Template $template, array $variables): void
    {
        $templateVars = $template->variables ?? [];
        
        foreach ($templateVars as $varName => $varConfig) {
            if (($varConfig['required'] ?? false) && !isset($variables[$varName])) {
                throw new \Exception("Variable requise manquante: {$varName}");
            }
        }
    }

    private function addGlobalVariables(array $variables): array
    {
        return array_merge([
            'app' => [
                'name' => config('app.name'),
                'url' => config('app.url'),
            ],
            'current_date' => now()->format('d/m/Y'),
            'current_year' => date('Y'),
            'current_time' => now()->format('H:i'),
        ], $variables);
    }

    // private function logUsage(Template $template, array $variables): void
    // {
    //     TemplateUsage::create([
    //         'template_id' => $template->id,
    //         'used_by' => auth()->id(),
    //         'variables_data' => $variables,
    //         'context_type' => request()->route()?->getName() ?? 'unknown',
    //     ]);
    // }

    private function generateSampleData(Template $template): array
    {
        $sampleData = [];
        $templateVars = $template->variables ?? [];
        
        foreach ($templateVars as $varName => $varConfig) {
            $sampleData[$varName] = $this->generateSampleValue($varConfig['type'] ?? 'string');
        }
        
        // Données d'exemple spécifiques par type
        return match($template->type) {
            TemplateType::INVOICE => array_merge($sampleData, [
                'invoice' => [
                    'number' => 'INV-2025-001',
                    'total' => 150.00,
                    'date' => '30/07/2025'
                ],
                'client' => ['name' => 'Société Exemple'],
                'company' => ['name' => 'Ma Société']
            ]),
            TemplateType::EMAIL_WELCOME => array_merge($sampleData, [
                'user' => ['name' => 'John Doe'],
                'activation_link' => 'https://example.com/activate'
            ]),
            default => $sampleData
        };
    }

    private function generateSampleValue(string $type): mixed
    {
        return match($type) {
            'string' => 'Exemple de texte',
            'number' => 42,
            'date' => now()->format('d/m/Y'),
            'boolean' => true,
            'array' => ['item1', 'item2'],
            'email' => 'exemple@email.com',
            'url' => 'https://example.com',
            default => 'Valeur exemple'
        };
    }

    private function registerCustomFilters(): void
    {
        // Filtre pour formater les prix
        $this->twig->addFilter(new TwigFilter('currency', function ($value, $currency = '€') {
            return number_format($value, 2, ',', ' ') . ' ' . $currency;
        }));
        
        // Filtre pour formater les dates
        $this->twig->addFilter(new TwigFilter('date', function ($value, $format = 'd/m/Y') {
            if (is_string($value)) {
                $value = \Carbon\Carbon::parse($value);
            }
            return $value->format($format);
        }));
        
        // Filtre pour majuscules
        $this->twig->addFilter(new TwigFilter('upper', function ($value) {
            return strtoupper($value);
        }));
    }
}