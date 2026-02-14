<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Services\Seller\SellerOnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use InvalidArgumentException;

class SellerOnboardingController extends Controller
{
    public function __construct(private readonly SellerOnboardingService $onboardingService)
    {
    }

    public function index(Request $request): View
    {
        $user = $request->user();

        abort_if(!$user || $user->role !== 'seller', 403);

        $payload = $this->onboardingService->getOnboardingData($user);

        return view('seller.onboarding.index', $payload);
    }

    public function updateStep(Request $request, string $stepKey): JsonResponse
    {
        $user = $request->user();

        abort_if(!$user || $user->role !== 'seller', 403);

        $validated = $request->validate([
            'completed' => ['required', 'boolean'],
        ]);

        try {
            $payload = $this->onboardingService->updateManualStep(
                $user,
                $stepKey,
                (bool) $validated['completed']
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json($payload);
    }

    public function completeGuide(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_if(!$user || $user->role !== 'seller', 403);

        $payload = $this->onboardingService->markGuideCompleted($user);

        return response()->json($payload);
    }
}

