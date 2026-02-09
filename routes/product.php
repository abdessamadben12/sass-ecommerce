<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Api\ProductSettingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\Admin\ProductModerationController;
use App\Http\Controllers\LicenseController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
    // Products - Authenticated endpoints
    Route::middleware(['auth:sanctum','admin'])->prefix('/admin/products')->group(function () {
        Route::post('/', [ProductController::class, 'store']);
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/test-pending', [ProductController::class, 'productPending']);
        Route::put('/{product}', [ProductController::class, 'update'])->where('product', '[0-9]+');
    Route::delete('/{product}', [ProductController::class, 'destroy'])->where('product', '[0-9]+');
    Route::get('/{product}', [ProductController::class, 'getDetailsProduct'])->where('product', '[0-9]+');
    Route::get('/{product}/stats', [ProductController::class, 'getStats'])->where('product', '[0-9]+');
    Route::post('/{product}/upload-main-file', [ProductController::class, 'uploadMainFile'])->where('product', '[0-9]+');
    Route::post('/{product}/upload-preview-images', [ProductController::class, 'uploadPreviewImages'])->where('product', '[0-9]+');
    Route::delete('/{product}/preview-image', [ProductController::class, 'removePreviewImage'])->where('product', '[0-9]+');
    Route::post('/{product}/submit-for-review', [ProductController::class, 'submitForReview'])->where('product', '[0-9]+');
    Route::post('/{product}/duplicate', [ProductController::class, 'duplicateProduct'])->where('product', '[0-9]+');
    Route::post('/bulk-status', [ProductController::class, 'bulkUpdateStatus']);
    Route::get('/{product}/download', [ProductController::class, 'download'])->where('product', '[0-9]+');
    Route::put('/{product}/{status}', [ProductController::class, 'putStatusProduct'])->where('product', '[0-9]+')
    ->where('status', 'pending|approved|rejected|suspended');
        
        // Statistics (for product owners)
    });
    Route::middleware(['auth:sanctum','admin'])->prefix('/admin/file-formats')->group(function () {
        Route::get('/', [ProductController::class, 'getProductFormat']);
        Route::post('/', [ProductController::class, 'addFormatProduct']);
        Route::put('/{format}', [ProductController::class, 'updateFormatProduct'])->where('format', '[0-9]+');
        Route::delete('/{format}', [ProductController::class, 'deleteFormatProduct'])->where('format', '[0-9]+');
    });
    Route::middleware(['auth:sanctum','admin'])->prefix('/admin/product-settings')->group(function () {
        Route::get('/', [ProductController::class, 'getProductSettings']);
        Route::post('/', [ProductController::class, 'addProductSetting']);
        Route::delete('/{setting}', [ProductController::class, 'deleteProductSetting'])->where('setting', '[0-9]+');
    });
    // LICENSES
    Route::middleware(['auth:sanctum','admin'])->prefix('/admin/licenses')->group(function () {
        Route::get('/', [LicenseController::class, 'getLicenses']);
        Route::post('/', [LicenseController::class, 'store']);
        Route::put('/{license}', [LicenseController::class, 'update'])->where('license', '[0-9]+');
        Route::delete('/{license}', [LicenseController::class, 'destroy'])->where('license', '[0-9]+');
    });
    


