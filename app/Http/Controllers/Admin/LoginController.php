<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Models\admin\CommonDataModel;
use App\Models\admin\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    public function index(Request $request)
    {
        if ($request->session()->has('surveysAdmin.userId')) {
            return redirect('admin/dashboard');
        } else {
            $data = [];
            $data["yearList"] = [];
            return view('admin/login/login', $data);
        }
    }
    public function auth(Request $request)
    {
        $username = $request->post('username');
        $password = $request->post('password');
        $year_id = NULL;

        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $result = User::whereDoesntHave('role', function ($query) {
            $query->where('role', 'Customer');
        })->with('role')->where(['username' => $username, 'users.is_active' => 'Y'])->first();
        if ($result) {
            if (Hash::check($password, $result->password)) {
                $user_id = $result->id;
                $userName = $result->name;

                $user = User::find($user_id);
                $user->is_online = 1;
                $user->save();

                $ipAddress = $request->ip();
                $arr = [
                    "user_id" => $user_id,
                    "ip_address" => $ipAddress,
                    "user_browser" => getUserBrowserName(),
                    "user_platform" => getUserPlatform(),
                    "login_time" => now(),
                ];
                $user_activity_id = DB::table('user_account_activitys')->insertGetId($arr);

                $result = ['userId' => $user_id, 'userName' => $userName, 'userActivityId' => $user_activity_id, 'year_id' => $year_id];
                $this->setSessionData($result);

                return redirect('admin/dashboard');
            } else {
                $request->session()->flash('error', 'Invalid password');
                return redirect('admin');
            }
        } else {
            $request->session()->flash('error', 'Please enter valid login details');
            return redirect('admin');
        }
    }

    public function logout()
    {
        $surveysAdmin = session()->get('surveysAdmin');
        $userId = $surveysAdmin['userId'];
        $user_activity_id = $surveysAdmin['userActivityId'];

        $user = User::find($userId);
        $user->is_online = "0";
        $user->save();

        $arr = [
            "logout_time" => now(),
        ];
        DB::table('user_account_activitys')->where(['id' => $user_activity_id])->update($arr);
        CommonDataModel::insertLogData('user_account_activitys', $arr, $user_activity_id, config('constants.LOG_U'));

        session()->forget('surveysAdmin');
        session()->flash('logout', 'Logout sucessfully');
        return redirect('admin');
    }

    private function setSessionData($result)
    {

        session(['surveysAdmin' => $result]);
    }

    public function renderChangePassword()
    {
        $body['bodyView'] = view('admin/user_management/reset_password');
        return LayoutController::loadAdmin($body);
    }

    public function changePassword(Request $request)
    {
        $user_id = $request->post('user_id');
        $old_password = $request->post('old_password');
        $new_password = $request->post('new_password');
        $confirm_password = $request->post('confirm_password');

        $result = User::find($user_id);

        $validator = Validator::make($request->all(), [
            'old_password' => 'required',
            'new_password' => 'required',
            'confirm_password' => 'required|same:new_password',
        ], [
            'old_password.required' => 'The old password is required.',
            'new_password.required' => 'The new password is required',
            'confirm_password.required' => 'The confirm password is required',
            'confirm_password.same' => 'The confirm password must match the new password',
        ]);

        if ($validator->fails()) {
            $error = $validator->errors();
            return response()->json(['msg_status' => 0, 'errors' => $error]);
        } else {

            if (Hash::check($old_password, $result->password)) {
                $user = User::find($user_id);
                $user->password = Hash::make($new_password);
                $user->save();

                CommonDataModel::insertLogData('users', [], $user_id, config('constants.LOG_U'), $user_id);
                return response()->json(['msg_status' => 1, 'errors' => ""]);
            } else {
                return response()->json(['msg_status' => 0, 'errors' => ["old_password" => "Invalid Password"]]);
            }
        }
    }
}
