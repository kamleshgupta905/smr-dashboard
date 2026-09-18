<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Http\Controllers\ValidationController;
use App\Models\admin\Menu;
use App\Models\admin\MenuPermission;
use App\Models\admin\Role;
use App\Models\admin\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index()
    {
        $data['userList'] = User::whereDoesntHave('role', function ($query) {
            $query->where('role', 'Developer');
        })->orderBy('id', 'desc')->with('role')->get();
        $body['bodyView'] = view('admin/user_management/userlist', $data);
        return LayoutController::loadAdmin($body);
    }

   public function addEdit(Request $request, $id = '')
{
    $data['title'] = $request->post('title') ?? 'User Management';
    $data = LayoutController::addEditCommon($id, $data);
    $data['usereditData'] = [];
    $data['userPermittedMenus'] = [];

    if ($id > 0) {
        // ✅ Get user edit data
        $data['usereditData'] = User::find($id);
        $userId = $id;

        // ✅ Get permitted menus for this user
        $menu = new Menu();
        $menuId = $menu->getPermittedMenuser($userId);
        $data['userPermittedMenus'] = $menuId; // pass to view
    }

    // ✅ Build menus and role list
    $data['menulist'] = $this->buildNestedMenu(DB::table('menus')->get());
    $data['roleList'] = Role::where('is_active', 1)
        ->where('role', '<>', 'Developer')
        ->where('role', '<>', 'Customer')
        ->get();

    // 🔹 Return JSON if AJAX (used by getUsersPermittedMenu)
    if ($request->ajax()) {
        return response()->json([
            'userPermittedMenus' => $data['userPermittedMenus'],
            'user' => $data['usereditData']
        ]);
    }

    // 🔹 Normal page load
    $body['bodyView'] = view('admin/user_management/addedit_user', $data)->render();
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

    public function addEditAction(Request $request)
    {
        //dd($request->all());
        $userId = $request->post('user_id');
        $mode = $request->post('mode');
           
        // ✅ Validate Input
        $validator = ValidationController::inputValidate($request, User::class, "", $userId);
        $customValidator = Validator::make($request->all(), [
            'imagefile' => 'image|mimes:jpeg,png,jpg,gif|max:1024',
            'mobile_no' => 'required',
            'confirm_password' => ($mode == "Add") ? 'required|same:password' : '',
            'MenuString' => 'required',
        ]);

        if ($validator['msg_status'] == 0 || $customValidator->fails()) {
            $error = $validator['errors']->merge($customValidator->errors());
            return response()->json(['msg_status' => 0, 'errors' => $error]);
        }

        try {
            DB::beginTransaction();

            $name = $request->post('name');
            $username = $request->post('username');
            $password = $request->post('password');
            $role_id = $request->post('role_id');
            $supplier_id = $request->post('supplier_id');
            $mobile_no = $request->post('mobile_no');
            $email = $request->post('email');
            $menuIds = explode(",", $request->post('MenuString'));

            if ($userId > 0) {
                // ✅ Edit Mode
                $model = User::find($userId);
                $model->password = Hash::make($password);
                $msg = "User updated successfully";
            } else {
                //dd($request->all());
                // ✅ Add Mode
                $model = new User();
                $model->password = Hash::make($password);
                $msg = "User added successfully";
            }

            // ✅ Handle Image Upload
            if ($request->hasFile('imagefile')) {
                $image = $request->file('imagefile');
                $imageName = "AN" . time() . 'IL.' . $image->getClientOriginalExtension();
                $image->storeAs('public/users', $imageName);
                $model->profile_image = $imageName;
            }

            $model->name = $name;
            $model->username = $username;
            $model->email = $email;
            $model->role_id = $role_id;
            $model->supplier_id = $supplier_id;
            $model->mobile_no = $mobile_no;
            $model->save();

            $savedUserId = $model->id;

            // ✅ Delete old menu permissions if editing
            DB::table('menu_permissions')->where('user_id', $savedUserId)->delete();

            // ✅ Insert new menu permissions
            foreach ($menuIds as $menuid) {
                if (!empty($menuid)) {
                    DB::table('menu_permissions')->insert([
                        'user_id'    => $savedUserId,
                        'menu_id'    => $menuid,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();

            // ✅ If Editing: Also Return Existing Menu Permissions for Page Load
            $menuPermissions = [];
            if ($savedUserId > 0) {
                $menuPermissions = DB::table('menu_permissions')
                    ->where('user_id', $savedUserId)
                    ->pluck('menu_id')
                    ->toArray();
            }
           
            return response()->json([
                'errors' => [],
                'msg_status' => 1,
                'msg_data' => $msg,
                'menu_permissions' => $menuPermissions, // 👈 include permitted menu ids here
                'redirect' => url('admin/user')
            ]);
              
             
        } catch (\Exception $e) {
            DB::rollback();

            if (!empty($model->id) && $userId <= 0) {
                User::where('id', $model->id)->delete();
            }

            return response()->json([
                'msg_status' => 2,
                'msg_data' => $e->getMessage(),
                
            ]);
        }
    }

    public function status(Request $request, $status, $id)
    {
        $model = User::find($id);
        $model->is_active = $status;
        $model->save();
        $request->session()->flash('message', 'User status update successfully');
        return redirect('admin/user');
    }
  public function delete(Request $request, $id)
{
    $user = User::find($id);

    if (!$user) {
        if ($request->ajax()) {
            return response()->json([
                'msg_status' => 0,
                'msg_data' => 'User not found.'
            ]);
        }

        $request->session()->flash('error', 'User not found.');
        return redirect('admin/user');
    }

    // Delete related menu_permissions records first
    \DB::table('menu_permissions')->where('user_id', $id)->delete();

    // Delete related user activity records first
    \DB::table('user_account_activitys')->where('user_id', $id)->delete();

    // Now delete the user
    $user->delete();

    if ($request->ajax()) {
        return response()->json([
            'msg_status' => 1,
            'msg_data' => 'User deleted successfully.'
        ]);
    }

    $request->session()->flash('message', 'User deleted successfully.');
    return redirect('admin/user');
}

    public function getloginLogoutDetailByUserId(Request $request)
    {


        $userid = $request->input('userid');
        $table = "";
        $userActivity = DB::table('user_account_activitys')->where(['user_id' => $userid])->get();

        $table = "<div class='formblock-box'><div class='table-responsive'>
        <table id='loginLogoutTable' class='table customTbl table-bordered table-hover dataTable'>
           <thead>
               <tr>
                   <th>Login Date & Time</th>

                   <th>Logout Date & Time</th>

                   <th>Browser</th>

                   <th>Device OS</th>
               </tr>
           </thead>

           <tbody>
               ";
        foreach ($userActivity as $Activity) {
            $logout_time = "";
            if ($Activity->logout_time != "") {
                $logout_time = date('d-m-Y h:i A', strtotime($Activity->logout_time));
            }
            $table .= "
               <tr>
                   <td>" . date('d-m-Y h:i A', strtotime($Activity->login_time)) . "</td>

                   <td>" . $logout_time . "</td>

                   <td>" . $Activity->user_browser . "</td>

                   <td>" . $Activity->user_platform . "</td>
               </tr>
               ";
        }
        $table .= "
           </tbody>
       </table></div></div>
       ";
        echo $table;
    }
}
