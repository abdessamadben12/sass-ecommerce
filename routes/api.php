<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\TicketsController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ShopProductController;
use App\Http\Controllers\TicketReplyController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WithdrawalsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FileDownloadController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\LicenseController;

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

Route::get("/admin/shops/statistique/{id}",[ShopProductController::class,"getStatistiqueShop"])->name('admin.shops.statistique');
Route::get("/admin/shops",[ShopProductController::class,"getShops"])->name('admin.shops');
Route::get("/admin/shops/{id}",[ShopProductController::class,"getShop"])->name('admin.shop');
Route::put("/admin/shops/status/{id}",[ShopProductController::class,"updateStatus"])->name('admin.status');
Route::get("/admin/products",[ShopProductController::class,"getProducts"])->name('admin.products');
Route::get("/admin/product/{id}",[ShopProductController::class,"getProduct"])->name('admin.product');
Route::put("/admin/products/{id}",[ShopProductController::class,"updateProduct"])->name('admin.products.update');
Route::delete("/admin/products/{id}",[ShopProductController::class,"deleteProduct"])->name('admin.product.delete');
// notification
Route::get("/admin/notifications",[NotificationController::class,"getNotifications"])->name('admin.notifications');
Route::get("/admin/send-nitification",[NotificationController::class,"sendNotification"])->name('admin.send-nitification');
// deposits
Route::get("/admin/deposits",[DepositController::class,"getDeposits"])->name('admin.deposits');
// withdrawals
Route::get("/admin/withdrawals",[WithdrawalsController::class,"getWithdrawals"])->name('admin.withdrawals');
// orders
Route::get("/admin/orders/statistics", [OrdersController::class, 'Statistics'])->name('admin.orders.statistics');
Route::get("/admin/orders", [OrdersController::class, 'getOrders'])->name('admin.orders');
Route::get("/admin/order/{id}", [OrdersController::class, 'getOrderDetail'])->name('admin.order.detail');
// transaction
Route::get("/admin/transactions", [TransactionController::class, 'getTransactions'])->name('admin.transactions');
// support tickets
Route::get("/admin/tickets", [TicketsController::class, 'index'])->name('admin.tickets.index');
Route::get("/admin/ticket-detaill/{id}",[TicketsController::class,"getTicketDetail"])->name("admin.tickets.index");
Route::post("/admin/create-ticket",[TicketsController::class,"createTicket"]);
Route::put("/admin/update-ticket/{id}",[TicketsController::class,"updateTicket"])->name("admin.tickets.update");
Route::delete("/admin/delete-ticket/{id}",[TicketsController::class,"deleteTicket"])->name("admin.tickets.delete");
Route::get("/download-file",[FileDownloadController::class,"downloadFile"]);
// pour les message
Route::post("/admin/create-reply-ticket",[TicketReplyController::class,"create"]);
Route::delete("/admin/delete-reply-ticket/{id}",[TicketReplyController::class,"deleteMessage"]);
Route::apiResource('categorie', CategoryController::class);
Route::get('parent-categorie', [CategoryController::class,"parentcategory"]);
Route::get('category-by-name', [CategoryController::class,"categoryByName"]);
// les templates

Route::get('license-by-name', [LicenseController::class,"licenseByName"]);

Route::prefix('/admin/templates')->group(function () {
    Route::get('/get-templates', [TemplateController::class, 'index']);
    Route::post('/create-template', [TemplateController::class, 'store']);
    Route::put('/update-template/{id}', [TemplateController::class, 'update']);
    Route::get('/type/{type}', [TemplateController::class, 'byType']);
    Route::get('/{template}', [TemplateController::class, 'show']);
    Route::get('/{template}/preview', [TemplateController::class, 'preview']);
    Route::post('/{template}/render', [TemplateController::class, 'render']);
});
Route::get('/pdf', [TemplateController::class, 'renderPdf']);

require __DIR__.'/product.php';
