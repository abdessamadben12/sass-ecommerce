<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\Seller\AuthController;
use App\Http\Controllers\Seller\OnboardingController;
use App\Http\Controllers\Seller\DashboardController;
use App\Http\Controllers\Seller\ProductController;
use App\Http\Controllers\Seller\OrderController;
use App\Http\Controllers\Seller\WalletController;
use App\Http\Controllers\Seller\ProfileController;
use App\Http\Controllers\Seller\TicketController;
use App\Http\Controllers\Seller\AnalyticsController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

// --- Auth (guest) ---
Route::middleware('guest')->group(function () {
    Route::get('/seller/login', [AuthController::class, 'showLoginForm'])->name('login.seller');
    Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle'])->name('auth.google.redirect');
    Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');

    Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
    Route::post('/seller/login', [AuthController::class, 'login'])->name('seller.login');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

// --- Seller Panel ---
Route::middleware(['auth', 'seller.web'])->prefix('seller')->name('seller.')->group(function () {

    // Onboarding
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('/onboarding/step', [OnboardingController::class, 'updateStep'])->name('onboarding.updateStep');
    Route::post('/onboarding/complete', [OnboardingController::class, 'completeGuide'])->name('onboarding.complete');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Products
    Route::resource('products', ProductController::class);
    Route::post('/products/{product}/submit', [ProductController::class, 'submitForReview'])->name('products.submit');

    // Orders
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    // Wallet & Payments
    Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
    Route::get('/wallet/withdrawals', [WalletController::class, 'withdrawals'])->name('wallet.withdrawals');
    Route::post('/wallet/withdraw', [WalletController::class, 'requestWithdrawal'])->name('wallet.withdraw');
    Route::get('/wallet/invoices', [WalletController::class, 'invoices'])->name('wallet.invoices');

    // Profile & Shop
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.index');
    Route::put('/profile', [ProfileController::class, 'updateProfile'])->name('profile.update');
    Route::get('/profile/shop', [ProfileController::class, 'shop'])->name('profile.shop');
    Route::put('/profile/shop', [ProfileController::class, 'updateShop'])->name('profile.shop.update');

    // Tickets
    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/create', [TicketController::class, 'create'])->name('tickets.create');
    Route::post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
    Route::get('/tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
    Route::post('/tickets/{ticket}/reply', [TicketController::class, 'reply'])->name('tickets.reply');

    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    Route::get('/analytics/export', [AnalyticsController::class, 'export'])->name('analytics.export');
});
