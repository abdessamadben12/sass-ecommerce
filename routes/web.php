<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return view('auth.login', ['role' => 'buyer']);
})->name('login');

Route::get('/login/buyer', function () {
    return view('auth.login', ['role' => 'buyer']);
})->name('login.buyer');

Route::get('/login/seller', function () {
    return view('auth.login', ['role' => 'seller']);
})->name('login.seller');

Route::post('/login', function (Request $request) {
    $validated = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
        'role' => 'required|in:buyer,seller',
    ]);

    if (Auth::attempt([
        'email' => $validated['email'],
        'password' => $validated['password'],
        'role' => $validated['role'],
        'status' => 'active',
    ])) {
        $request->session()->regenerate();
        return redirect('/')->with('status', 'Login successful');
    }

    return back()->withErrors(['email' => 'Invalid credentials or role'])->withInput();
})->name('login.submit');

Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/login');
})->name('logout');
