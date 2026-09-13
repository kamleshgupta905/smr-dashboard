<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Models\admin\Menu;
use App\Models\admin\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    public function index()
    {
        $userId = 1;
        $data['userlist'] = User::all();
        $data['userId'] = $userId;
        $data['menulist'] = $this->buildNestedMenu(DB::table('menus')->get());


        $data['userList'] = User::whereDoesntHave('role', function ($query) {
            $query->where('role', 'Customer');
        })->with('role')->get();
        
        $body['bodyView'] = view('admin/user_management/menupermission', $data);
        return LayoutController::loadAdmin($body);

    }

    private function buildNestedMenu($menuItems, $parentId = null)
    {
        $result = array();

        foreach ($menuItems as $menuItem) {
            if ($menuItem->parent_id == $parentId) {
                $children = $this->buildNestedMenu($menuItems, $menuItem->id);

                if ($children) {
                    $menuItem->children = $children;
                }

                $result[] = $menuItem;
            }
        }

        return $result;
    }

    public function getUsersPermittedMenu(Request $request)
    {

        $userId = $request->post('userId');
        $menu = new Menu();
        $menuId = $menu->getUsersPermittedMenu($userId);
        return response()->json(['data' => $menuId]);


    }

    public function assignMenu(Request $request)
    {
        $userId = $request->post('userId');
        $menuIds = explode(",", $request->post('MenuString'));

        $count = DB::table('menu_permissions')->where(['user_id' => $userId])->count();

        if ($count > 0) {
            DB::table('menu_permissions')->where(['user_id' => $userId])->delete();

        }

        foreach ($menuIds as $key => $menuid) {
            $insert_Arr = array(
                "user_id" => $userId,
                "menu_id" => $menuid,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            );
            $masterId = DB::table('menu_permissions')->insert($insert_Arr);
        }
        return response()->json(["status" => 1, "msg" => 'Menu permitted successfully']);

    }
}
