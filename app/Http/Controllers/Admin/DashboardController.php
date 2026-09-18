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

    // ==================================================
    // SUPPLIER DASHBOARD
    // ==================================================
    if (session('surveysAdmin.role') == 8) {

        $supplierCode = session('surveysAdmin.supplier_id');

        $vendor = DB::table('vendor')
            ->where('vendor_id', $supplierCode)
            ->first();

        if ($vendor) {

            // Assigned SurveyIds
            $surveyIds = DB::table('vendor_entry_links')
                ->where('vendor_id', $vendor->id)
                ->pluck('project_id')
                ->toArray();

            // Convert SurveyId -> api_surveys.id
            $apiSurveyIds = DB::table('api_surveys')
                ->whereIn('SurveyId', $surveyIds)
                ->pluck('id')
                ->toArray();

            // Dashboard Cards
            $data['totalVendors'] = 1;

            $data['pendingPayments'] = DB::table('payments')
                ->where('vendor_id', $vendor->id)
                ->whereNotIn('status', ['Rejected', 'Paid'])
                ->sum('amount');

            $data['totalClick'] = DB::table('leads')
                ->whereIn('project_id', $apiSurveyIds)
                ->count();

            $data['pendingLeads'] = DB::table('leads')
                ->whereIn('project_id', $apiSurveyIds)
                ->whereNotIn('status', ['Complete', 'Terminates', 'Quota Full'])
                ->count();

            $data['activeProjects'] = count($apiSurveyIds);

            // ===========================
            // Bar Chart
            // ===========================
            $formattedData = [];

            $surveys = DB::table('api_surveys')
                ->whereIn('id', $apiSurveyIds)
                ->get();

            foreach ($surveys as $survey) {

                $clicks = DB::table('leads')
                    ->where('project_id', $survey->id)
                    ->count();

                $formattedData[$survey->Name] = [
                    'quantity' => $clicks
                ];
            }

            $data['chartData'] = json_encode($formattedData);

            // ===========================
            // Donut Chart
            // ===========================
            $data['donutChartData'] = json_encode([
                [
                    'category' => 'Assigned',
                    'value' => count($apiSurveyIds)
                ],
                [
                    'category' => 'Pending',
                    'value' => $data['pendingLeads']
                ],
                [
                    'category' => 'Clicks',
                    'value' => $data['totalClick']
                ]
            ]);

        } else {

            $data['totalVendors'] = 0;
            $data['pendingPayments'] = 0;
            $data['totalClick'] = 0;
            $data['pendingLeads'] = 0;
            $data['activeProjects'] = 0;
            $data['chartData'] = json_encode([]);
            $data['donutChartData'] = json_encode([]);
        }

        $data['bodyView'] = view('admin/dashboard/dashboard_view', $data);
        return LayoutController::loadAdmin($data);
    }

    // ==================================================
    // ADMIN DASHBOARD (Existing Code)
    // ==================================================

    $data['totalVendors'] = DB::table('vendor')
        ->where('is_active', 'Y')
        ->count();

    $data['pendingPayments'] = DB::table('payments')
        ->whereNotIn('status', ['Rejected', 'Paid'])
        ->sum('amount');

    $data['totalClick'] = DB::table('leads')->count();

    $data['pendingLeads'] = DB::table('leads')
        ->whereNotIn('status', ['Complete', 'Terminates', 'Quota Full'])
        ->count();

    $data['activeProjects'] = DB::table('projects')
        ->where('status', '!=', 'Pause')
        ->count();

    $projectsChart = Projects::with('vendors')->get();

    $formattedData = [];

    foreach ($projectsChart as $project) {

        $totalClicks = 0;

        foreach ($project->vendors as $vendor) {
            $totalClicks += (int) $vendor->clicks_count;
        }

        $formattedData[$project->name] = [
            'quantity' => $totalClicks
        ];
    }

    $data['chartData'] = json_encode($formattedData);

    // Donut Chart
    $data['donutChartData'] = json_encode([
        [
            'category' => 'Vendors',
            'value' => $data['totalVendors']
        ],
        [
            'category' => 'Projects',
            'value' => $data['activeProjects']
        ],
        [
            'category' => 'Leads',
            'value' => $data['totalClick']
        ]
    ]);

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
