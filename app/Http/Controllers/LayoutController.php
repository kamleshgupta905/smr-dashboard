<?php

namespace App\Http\Controllers;

use App\Models\admin\Menu;
use App\Models\admin\MenuPermission;
use Illuminate\Support\Facades\URL;

class LayoutController extends Controller
{
    public static function loadAdmin($data = [])
    {
        $lastSlug = request()->segment(count(request()->segments()));
        $menu = Menu::where('route', $lastSlug)->first();
        if ($menu) {
            $isUserAllowed = MenuPermission::where('menu_id', $menu->id)->where('user_id', session('surveysAdmin.userId'))->first();
            if (empty($isUserAllowed)) {
                session()->flash('error', 'You are not authorized to access this URL');
                return redirect('admin/dashboard');
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
