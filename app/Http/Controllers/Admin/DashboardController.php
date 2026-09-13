<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Models\admin\LogTable;
use App\Models\admin\Projects;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use SebastianBergmann\CodeCoverage\Report\Xml\Project;

class DashboardController extends Controller
{
    public function index()
    {
        $data['title'] = [];
        $data['totalVendors'] = DB::table('vendor')->where('is_active', 'Y')->count();
        $data['pendingPayments'] = DB::table('payments')
            ->whereNotIn('status', ['Rejected', 'Paid'])
            ->sum('amount');
        $data['totalClick'] = DB::table('leads')->count();

        $data['pendingLeads'] = DB::table('leads')->whereNotIn('status', ['Complete', 'Terminates', 'Quota Full'])->count();
        $data['activeProjects'] = DB::table('projects')->whereNot('status', 'Pause')->count();

        $projectsChart = Projects::with('vendors')->get();

        $formattedData = [];
        foreach ($projectsChart as $project) {
            $projectName = $project->name;
            if (!isset($formattedData[$projectName])) {
                $formattedData[$projectName] = [];
            }

            foreach ($project->vendors as $vendor) {
                $vendorName = $vendor->name;
                if (!isset($formattedData[$projectName][$vendorName])) {
                    $formattedData[$projectName][$vendorName] = (int) $vendor->clicks_count;
                }
            }

            if(empty($formattedData[$projectName])) {
                unset($formattedData[$projectName]);
            }
        }

        $data['chartData'] = json_encode($formattedData, JSON_PRETTY_PRINT);
        // pre($formattedData);exit;

        $data['bodyView'] = view('admin/dashboard/dashboard_view', $data);
        return LayoutController::loadAdmin($data);
    }

    public function logActivity($table, $rowId)
    {
        $table = str_replace(' ', '', $table);
        $result["logData"] = LogTable::where(['table_name' => $table, 'row_id' => $rowId])->with('user')->get();
        $result["tableCol"] = Schema::getColumnListing($table);
        return view('admin/log', $result)->render();
    }
}
