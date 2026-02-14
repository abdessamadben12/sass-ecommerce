<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Seller\SellerOnboardingController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::middleware(['auth', 'seller.web'])->prefix('seller')->name('seller.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('seller.onboarding.index');
    })->name('home');

    Route::get('/onboarding', [SellerOnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('/onboarding/steps/{stepKey}', [SellerOnboardingController::class, 'updateStep'])->name('onboarding.steps.update');
    Route::post('/onboarding/guide/complete', [SellerOnboardingController::class, 'completeGuide'])->name('onboarding.guide.complete');
});
