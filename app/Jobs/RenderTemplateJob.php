<?php
namespace App\Jobs;

use App\Models\Order;
use App\Models\Template;
use App\Enums\TemplateType;
use App\Services\TemplateService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Queue\ShouldQueue;

class GenerateMonthlyReport implements ShouldQueue
{
    public function handle()
    {
        $templateService = app(TemplateService::class);
        
        $reportData = [
            'month' => now()->format('F Y'),
            'sales' => Sale::thisMonth()->sum('total'),
            'orders' => Order::thisMonth()->count(),
        ];
        
        $pdf = $templateService->renderToPdf(
            Template::byType(TemplateType::PDF_REPORT)->first()->id,
            $reportData
        );
        
        Storage::put("reports/monthly-" . now()->format('Y-m') . ".pdf", $pdf);
    }
}