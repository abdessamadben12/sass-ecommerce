<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\Seller\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/seller/login', [AuthController::class, 'showLoginForm'])->name('login.seller');
    Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle'])->name('auth.google.redirect');
    Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
    
    Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
    Route::post('/seller/login', [AuthController::class, 'login'])->name('seller.login');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware(['auth', 'seller.web'])->prefix('seller')->name('seller.')->group(function () {
   Route::get('/dashboard', function () {
       return view('seller.index');
   })->name('dashboard');

   
});
