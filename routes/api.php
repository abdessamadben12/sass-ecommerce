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
use App\Http\Controllers\MarketingEmailController;
use App\Http\Controllers\MarketingRecipientController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Marketing\PromotionController;
use App\Http\Controllers\Marketing\CouponController;
use App\Http\Controllers\Marketing\CampaignController;
use App\Http\Controllers\Marketing\ReferralController;
use App\Http\Controllers\FileDownloadController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\LicenseController;
use App\Http\Controllers\AuthController;


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

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});
Route::middleware(['auth:sanctum','admin'])->group(function () {
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
Route::post("/admin/users/create-admin", [UserController::class, 'createAdmin'])->name('admin.users.create-admin');
Route::put("/admin/users/{id}", [UserController::class, 'updateUser'])->name('admin.users.update');
Route::put("/admin/users/addBalance/{id}",[UserController::class,"addBalance"])->name("admin.users.addBalance");
Route::put("/admin/users/subBalance/{id}",[UserController::class,"subBalance"])->name("admin.users.subBalance");
Route::delete("/admin/users/{id}", [UserController::class, 'deleteUser'])->name('admin.users.delete');  
// shops

Route::get("/admin/shops/statistique/{id}",[ShopProductController::class,"getStatistiqueShop"])->name('admin.shops.statistique');
Route::get("/admin/shops",[ShopProductController::class,"getShops"])->name('admin.shops');
Route::get("/admin/shops/export",[ShopProductController::class,"exportShops"])->name('admin.shops.export');
Route::get("/admin/shops/{id}",[ShopProductController::class,"getShop"])->name('admin.shop');
Route::get("/admin/shops/{id}/products",[ShopProductController::class,"getShopProducts"])->name('admin.shops.products');
Route::get("/admin/shops/{id}/orders",[ShopProductController::class,"getShopOrders"])->name('admin.shops.orders');
Route::get("/admin/shops/{id}/products/export",[ShopProductController::class,"exportShopProducts"])->name('admin.shops.products.export');
Route::get("/admin/shops/{id}/orders/export",[ShopProductController::class,"exportShopOrders"])->name('admin.shops.orders.export');
Route::put("/admin/shops/status/{id}",[ShopProductController::class,"updateStatus"])->name('admin.status');
// notification
Route::get("/admin/notifications",[NotificationController::class,"getNotifications"])->name('admin.notifications');
Route::get("/admin/notifications/{notification}",[NotificationController::class,"show"])->name('admin.notifications.show');
Route::put("/admin/notifications/{notification}/read",[NotificationController::class,"markRead"])->name('admin.notifications.read');
Route::put("/admin/notifications/read-all",[NotificationController::class,"markAllRead"])->name('admin.notifications.read-all');
Route::get("/admin/send-nitification",[NotificationController::class,"sendNotification"])->name('admin.send-nitification');
// marketing email
Route::post("/admin/email-marketing", [MarketingEmailController::class, "send"])->name('admin.email-marketing');
Route::get("/admin/marketing/recipients", [MarketingRecipientController::class, "search"])->name('admin.marketing.recipients');
// activity logs
Route::get("/admin/activity-logs", [ActivityLogController::class, "index"])->name('admin.activity-logs');
// marketing modules
Route::prefix('/admin/marketing')->group(function () {
    Route::get('/promotions', [PromotionController::class, 'index']);
    Route::post('/promotions', [PromotionController::class, 'store']);
    Route::put('/promotions/{promotion}', [PromotionController::class, 'update']);
    Route::delete('/promotions/{promotion}', [PromotionController::class, 'destroy']);

    Route::get('/coupons', [CouponController::class, 'index']);
    Route::post('/coupons', [CouponController::class, 'store']);
    Route::put('/coupons/{coupon}', [CouponController::class, 'update']);
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy']);

    Route::get('/campaigns', [CampaignController::class, 'index']);
    Route::post('/campaigns', [CampaignController::class, 'store']);
    Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);
    Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);

    Route::get('/referrals/codes', [ReferralController::class, 'codes']);
    Route::post('/referrals/codes', [ReferralController::class, 'createCode']);
    Route::get('/referrals/invites', [ReferralController::class, 'invites']);
    Route::get('/referrals/rewards', [ReferralController::class, 'rewards']);
});
// deposits
Route::get("/admin/deposits",[DepositController::class,"getDeposits"])->name('admin.deposits');
Route::get("/admin/deposits/{deposit}",[DepositController::class,"show"])->name('admin.deposits.show');
Route::post("/admin/deposits/{deposit}/approve",[DepositController::class,"approve"])->name('admin.deposits.approve');
Route::post("/admin/deposits/{deposit}/reject",[DepositController::class,"reject"])->name('admin.deposits.reject');
// withdrawals
Route::get("/admin/withdrawals",[WithdrawalsController::class,"getWithdrawals"])->name('admin.withdrawals');
Route::get("/admin/withdrawals/{withdrawal}",[WithdrawalsController::class,"show"])->name('admin.withdrawals.show');
Route::post("/admin/withdrawals/{withdrawal}/approve",[WithdrawalsController::class,"approve"])->name('admin.withdrawals.approve');
Route::post("/admin/withdrawals/{withdrawal}/reject",[WithdrawalsController::class,"reject"])->name('admin.withdrawals.reject');
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
});

require __DIR__.'/product.php';










