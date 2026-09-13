<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadsController extends Controller
{
    public function index()
    {
        $result["leadList"] =  DB::table('leads')
            ->join('projects', 'leads.project_id', '=', 'projects.id')
            ->join('vendor', 'vendor.id', '=', 'leads.vendor_id')
            ->select('leads.*', 'projects.project_id', 'projects.name as project_name', 'projects.cost_per_complete as cpi', 'vendor.email as vendor_email', 'vendor.id as vid')
            ->orderByDesc('leads.id')
            ->get();

        $body['bodyView'] = view('admin/leads/lead_list_view', $result);
        return LayoutController::loadAdmin($body);
    }
}
