<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Services\Seller\SellerOnboardingService;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class OnboardingController extends Controller
{
    public function __construct(
        private SellerOnboardingService $onboardingService
    ) {}

    public function index(): View
    {
        $user = auth()->user();
        $data = $this->onboardingService->getOnboardingData($user);

        return view('seller.onboarding.index', $data);
    }

    public function updateStep(Request $request): RedirectResponse
    {
        $request->validate([
            'step' => 'required|string',
            'completed' => 'required|boolean',
        ]);

        $user = auth()->user();

        try {
            $this->onboardingService->updateManualStep(
                $user,
                $request->input('step'),
                $request->boolean('completed')
            );
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Etape mise a jour.');
    }

    public function completeGuide(): RedirectResponse
    {
        $user = auth()->user();
        $this->onboardingService->markGuideCompleted($user);

        return redirect()->route('seller.dashboard')->with('success', 'Guide termine ! Bienvenue sur votre espace vendeur.');
    }
}
