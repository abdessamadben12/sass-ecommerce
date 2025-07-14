<?php

use App\Models\Deposit;
use Mockery\Matcher\Not;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\ShopProductController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('/admin/userAnnalyse', [AdminController::class, 'getAnnalyseUser'])->name('admin.userAnnalyse');
Route::get('/admin/depositAnalyse', [AdminController::class, 'getAnnalyseDeposit'])->name('admin.depositAnalyse');
Route::get('/admin/withdrawalAnalyse', [AdminController::class, 'getAnnalyseWithdrawal'])->name('admin.withdrawalAnalyse');
Route::get('/admin/globalViews', [AdminController::class, 'getViewsGlobal'])->name('admin.globalViews');
Route::get("admin/DepositWithdrawChartData", [AdminController::class, 'getDepositWithdrawChartData'])->name('admin.DepositWithdrawChartData');
Route::get("admin/dailyTransactionsReport", [AdminController::class, 'dailyTransactionsReport'])->name('admin.dailyTransactionsReport');

// gerer les users
Route::get("/admin/users/user-active/", [UserController::class, 'getActiveUsers'])->name('admin.users.active');
Route::get("/admin/users/user-banned", [UserController::class, 'getBlockedUsers'])->name('admin.users.blocked');
Route::get("/admin/users/user-unverified", [UserController::class, 'getUnverifiedUsers'])->name('admin.users.unverified');
// gerer les action de users
Route::get("/admin/users/{id}", [UserController::class, 'getUser'])->name('admin.users.user');
Route::put("/admin/users/{id}", [UserController::class, 'updateUser'])->name('admin.users.update');
Route::put("/admin/users/addBalance/{id}",[UserController::class,"addBalance"])->name("admin.users.addBalance");
Route::delete("/admin/users/{id}", [UserController::class, 'deleteUser'])->name('admin.users.delete');  
// shops
Route::get("/admin/shops",[ShopProductController::class,"getShops"])->name('admin.shops');
Route::get("/admin/shops/{id}",[ShopProductController::class,"getShop"])->name('admin.shop');
Route::get("/admin/products",[ShopProductController::class,"getProducts"])->name('admin.products');
Route::get("/admin/product/{id}",[ShopProductController::class,"getProduct"])->name('admin.product');
Route::put("/admin/products/{id}",[ShopProductController::class,"updateProduct"])->name('admin.products.update');
Route::delete("/admin/products/{id}",[ShopProductController::class,"deleteProduct"])->name('admin.product.delete');
// notification
Route::get("/admin/notifications",[NotificationController::class,"getNotifications"])->name('admin.notifications');
// deposits
Route::get("/admin/deposits",[DepositController::class,"getDeposits"])->name('admin.deposits');


