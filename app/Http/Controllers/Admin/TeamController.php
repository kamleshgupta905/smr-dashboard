<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Models\admin\CommonDataModel;
use App\Models\admin\SerialMaster;
use App\Rules\URLRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use App\Models\admin\User;

class TeamController extends Controller
{
    public function index()
    {
        $body['bodyView'] = view('admin/team/list');
    return LayoutController::loadAdmin($body);
    }
    public function add()
    {
        $body['bodyView'] = view('admin/team/add');
         return LayoutController::loadAdmin($body);
    }
}