<?php

use App\Enums\TemplateType;
use App\Services\TemplateService;
// Dans app/helpers.php
function render_template(string $type, array $variables = []): string
{
    return app(TemplateService::class)->renderByType(
        TemplateType::from($type),
        $variables
    );
}

// Usage
$footer = render_template('web_footer', [
    'company' => ['name' => 'Ma Société'],
    'current_year' => date('Y')
]);