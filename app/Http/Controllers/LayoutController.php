<?php

namespace App\Http\Controllers;

use App\Models\admin\Menu;
use App\Models\admin\MenuPermission;
use Illuminate\Support\Facades\URL;

class LayoutController extends Controller
{
   public static function loadAdmin($data = [])
{
    $currentRoute = request()->segment(2);

    $roleId = session('surveysAdmin.role_id');

    // Supplier Access Control
    if ($roleId == 8) {

        // Supplier ke liye sirf ye routes allowed hain
        $allowedRoutes = [
            'dashboard',
            'api_survey',
            'vendor'
        ];

        if (!in_array($currentRoute, $allowedRoutes)) {
            abort(403, 'Unauthorized');
        }
    }

    // Existing Menu Permission Check
    $lastSlug = request()->segment(count(request()->segments()));
    $menu = Menu::where('route', $lastSlug)->first();

    if ($menu) {

        $isUserAllowed = MenuPermission::where([
            'menu_id' => $menu->id,
            'user_id' => session('surveysAdmin.userId')
        ])->first();

        if (empty($isUserAllowed)) {

            // Redirect Loop se bachne ke liye
            abort(403, 'You are not authorized to access this page.');

        }
    }

    return view('admin/layout', $data);
}
    public static function loadWeb($data = [])
    {
        return view('web/layout', $data);
    }

    public static function addEditCommon($id, $data)
    {
        if ($id > 0) {
            $data['mode'] = "Edit";
            $data['btntext'] = "Update";
            $data['btnloadertext'] = "Updating";
            $data['id'] = $id;
        } else {
            $data['mode'] = "Add";
            $data['btntext'] = "Save";
            $data['btnloadertext'] = "Saving";
            $data['mode'] = "Add";
            $data['id'] = 0;
        }
        return $data;
    }
}
