<?php

use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\LoginController as AdminLoginController;
use App\Http\Controllers\Admin\PaymentsController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\URLController;
use App\Http\Controllers\Admin\VendorController;
use App\Http\Controllers\Admin\BidController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\ApiController;
use App\Models\admin\Menu;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

Route::get('/clear-cache', function() {
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    Artisan::call('view:clear');
    return "Cache is cleared";
});

// Admin Routing
Route::get('/', [AdminLoginController::class, 'index']);
Route::get('admin', [AdminLoginController::class, 'index']);
Route::post('admin/auth', [AdminLoginController::class, 'auth'])->name('admin.auth');
Route::get('admin/logout', [AdminLoginController::class, 'logout'])->name('admin.logout');

Route::prefix('admin')->middleware(['admin_auth'])->group(function () {
    if (Schema::hasTable('menus')) {
        $menus = Menu::all()->whereNotNull('controller');
        foreach ($menus as $list) {
            $controller = "App\Http\Controllers\Admin\\" . $list['controller'];
            Route::get($list['route'], [$controller, $list['method']]);
        }
    }

    Route::get('user/addedit/{id?}', [UserController::class, 'addEdit']);
    Route::post('user/delete/{id}', [UserController::class, 'delete'])->name('admin.user.delete');
    Route::post('user/addeditaction', [UserController::class, 'addEditAction']);
    Route::get('user/status/{status}/{id}', [UserController::class, 'status']);
    Route::post('user/getloginLogoutDetailByUserId', [UserController::class, 'getloginLogoutDetailByUserId']);
    Route::get('menupermission', [MenuController::class, 'index']);
    Route::post('menupermission/getUsersPermittedMenu', [MenuController::class, 'getUsersPermittedMenu']);
    Route::post('menupermission/assignMenu', [MenuController::class, 'assignMenu']);
    Route::post('user/change_password', [AdminLoginController::class, 'changePassword']);
    Route::post('menupermission/assignmenu', [MenuController::class, 'assignMenu']);
    Route::post('log/{table}/{rowid}', [DashboardController::class, 'logActivity']);
    
    Route::get('client/addedit/{id?}', [ClientController::class, 'addEdit']);
    Route::post('clientaddeditajax', [ClientController::class, 'addEditAction']);
    Route::get('client/view/{id}', [ClientController::class, 'view']);
    Route::post('client/status', [ClientController::class, 'status']);
    Route::get('client/delete/{id}', [ClientController::class, 'delete']);
    Route::get('client/filter', [ClientController::class, 'filterClients']);
    //This is for Zamplia Supply API Integration 
    Route::get('api_survey', [ApiController::class, 'getAllocatedSurveys'])->name('admin.api_survey');
    Route::get('api_survey/sync', [ApiController::class, 'ajaxSyncSurveys'])->name('admin.api_survey.sync');
    Route::get('api_survey/qualifications/{surveyId}', [ApiController::class, 'getSurveyQualificationsAjax'])->name('admin.api_survey.qualifications');
    Route::get('api_survey/quotas/{surveyId}', [ApiController::class, 'getSurveyQuotasAjax'])->name('admin.api_survey.quotas');
    Route::get('api_survey/global-stats/{surveyId?}', [ApiController::class, 'getGlobalStatsAjax'])->name('admin.api_survey.global_stats');
    Route::get('api_survey/reconciliation', [ApiController::class, 'reconciliationView'])->name('admin.api_survey.reconciliation');
    Route::get('api_survey/reference-data', [ApiController::class, 'referenceDataView'])->name('admin.api_survey.reference_data');
    Route::get('survey/view/{surveyId}', [ApiController::class, 'viewSurvey'])->name('admin.survey.view');
    //Inhouse Team Route 
     Route::get('team/list', [TeamController::class, 'index']);
     Route::get('team/add', [TeamController::class, 'add']);

     
    Route::get('project/addedit/{id?}', [ProjectController::class, 'addEdit']);
    Route::get('/project/get-contacts/{client_id}', [ProjectController::class, 'getClientDetails']);
    Route::get('project/delete/{id}', [ProjectController::class, 'delete']);
    Route::post('projectaddeditajax', [ProjectController::class, 'addEditAction']);
    Route::get('project/view/{id}', [ProjectController::class, 'view']);
    Route::post('project/status', [ProjectController::class, 'status']);
    Route::post('project/duplicate', [ProjectController::class, 'duplicate']);
    Route::get('vendordropdownajax', [ProjectController::class, 'vendorList']);
    Route::post('vendorassignajax', [ProjectController::class, 'assignVendor']);
    Route::post('loadvendorlistajax', [ProjectController::class, 'vendorListPartialView']);

    Route::get('VendorList', [VendorController::class, 'VendorList_index']);
    Route::post('VendorList/add', [VendorController::class, 'VendorList_add']);
    Route::get('VendorList/edit/{id}', [VendorController::class, 'VendorList_Edit']);
    Route::post('VendorList/edit/{id}', [VendorController::class, 'VendorList_Update']); 
    Route::get('VendorList/delete/{id}', [VendorController::class, 'VendorList_delete']);
    Route::get('vendor/filter', [VendorController::class, 'filterVendors']);


    Route::get('vendor/addedit/{id?}', [VendorController::class, 'addEdit']);
    Route::post('vendoraddeditajax', [VendorController::class, 'addEditAction']);
    Route::get('vendor/view/{id}', [VendorController::class, 'view']);
    Route::post('vendor/status', [VendorController::class, 'status']);
    Route::delete('vendor/delete/{id}', [VendorController::class, 'delete'])
    ->name('admin.vendor.delete');

    Route::post('paymentstatusajax', [PaymentsController::class, 'status']);
    //bid section routes 
    Route::get('bids/get_booking_data', [BidController::class, 'getBookingData']);
    Route::post('bids/projectadd', [BidController::class, 'projectadd']);
    Route::get('bid/add', [BidController::class, 'add']);
    Route::get('bid/list', [BidController::class, 'index'])->name('bid.list');
    Route::get('/bid/search', [BidController::class, 'search'])->name('admin.bid.search');
    Route::get('/client/get-contacts/{client_id}', [BidController::class, 'getclientContacts']);

    Route::post('bids/store_specifications', [BidController::class, 'storeSpecifications'])->name('admin.bid.storeSpecifications');
    Route::post('bids/store_options', [BidController::class, 'storeBidOptions'])->name('admin.bid.storeOptions');
    Route::post('bids/store_booking', [BidController::class, 'storeBooking'])->name('admin.bid.storeBooking');
    Route::post('bids/send_booking_email', [BidController::class, 'sendBookingEmail'])->name('admin.bid.sendBookingEmail');
    Route::post('bids/create_project_from_booking', [BidController::class, 'createProjectFromBooking'])->name('admin.bid.createProjectFromBooking');
    // Route::get('bids/view_project/{bidId}', [BidController::class, 'viewProject'])->name('admin.bid.viewProject');
    Route::get('bid/{bid_id}/projects', [BidController::class, 'viewProjects'])->name('bid.projects');
    Route::get('survey/update/{id}', [BidController::class, 'survey'])->name('bid.survey');
    Route::post('survey/updates/{id}', [BidController::class, 'updatesurvey'])->name('survey.update');
    Route::delete('bid/{id}', [BidController::class, 'delete'])
    ->name('admin.bid.delete');
    // Edit Bid Specifications
    Route::get('bid/edit/{id}', [App\Http\Controllers\Admin\BidController::class, 'editSpec'])->name('bid.editSpec');
    
    // Update Bid Specifications
    Route::post('bid/update-spec/', [App\Http\Controllers\Admin\BidController::class, 'updateSpec'])->name('bid.updateSpec');



});

Route::get('redirects/c/{client_id}/complete', [URLController::class, 'completeAction']);
Route::get('redirects/c/{client_id}/terminate', [URLController::class, 'terminateAction']);
Route::get('redirects/c/{client_id}/quotafull', [URLController::class, 'quotafullAction']);

Route::get('vendor/auth/{vendor_id}/project/{project_id}', [URLController::class, 'URLAction']); 