<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Services\Seller\SellerDashboardService;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __construct(
        private SellerDashboardService $dashboardService
    ) {}

    public function index(): View
    {
        $user = auth()->user();
        $data = $this->dashboardService->getDashboardData($user);

        return view('seller.dashboard.index', $data);
    }
}
