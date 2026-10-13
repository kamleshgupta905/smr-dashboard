<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Models\admin\CommonDataModel;
use App\Models\admin\SerialMaster;
use App\Rules\URLRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;

class ProjectController extends Controller
{
    protected $baseUrl = 'https://surveysupply.zamplia.com/api/v1/Surveys/GenerateLink';
    protected $apiKey = 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u';

public function index(Request $request)
{
    $query = DB::table('projects')
        ->join('client', 'client.id', '=', 'projects.client_id')
        ->leftJoin('vendor', 'vendor.project_id', '=', 'projects.id')
        ->select(
            'projects.id',
            'projects.project_id',
            'projects.client_id',
            'projects.bid_id',
            'projects.name',
            'projects.description',
            'projects.cost_per_complete',
            'projects.ir',
            'projects.loi',
            'projects.max_limit',
            'projects.live_url',
            'projects.status',
            'projects.date',
            'client.client_name',
            DB::raw('
                COALESCE(SUM(vendor.complete_count), 0) AS complete_count,
                COALESCE(SUM(vendor.terminates_count), 0) AS terminates_count
            ')
        )
        ->groupBy(
            'projects.id',
            'projects.project_id',
            'projects.client_id',
            'projects.bid_id',
            'projects.name',
            'projects.description',
            'projects.cost_per_complete',
            'projects.ir',
            'projects.loi',
            'projects.max_limit',
            'projects.live_url',
            'projects.status',
            'projects.date',
            'client.client_name'
        )
        ->orderBy('projects.id', 'DESC');

    // If a bid_id query param provided, filter results to that bid
    if ($request->has('bid_id') && !empty($request->get('bid_id'))) {
        $bidId = (int) $request->get('bid_id');
        $query->where('projects.bid_id', $bidId);
    }

    $result["projectsList"] = $query->get();

    $body['bodyView'] = view('admin/project/project_list_view', $result);
    return LayoutController::loadAdmin($body);
}
public function delete($id)
{
    // Find the project by ID
    $project = DB::table('projects')->where('id', $id)->first();

    // Check if project exists
    if (!$project) {
        return back()->with('error', 'Project not found.');
    }

    // Delete the project
    DB::table('projects')->where('id', $id)->delete();

    // Redirect back with success message
    return back()->with('success', 'Project deleted successfully.');
}

    
public function addEdit($id = "")
{
    $data = LayoutController::addEditCommon($id, []);
    $data["editData"] = [];

    if ($id > 0) {
       
   
            // dd($data["editData"]);
$data["editData"] = DB::table('projects as p')
    ->leftJoin('client as c', 'c.id', '=', 'p.client_id')
    ->leftJoin('client_contacts as cc', 'cc.client_id', '=', 'p.client_contact_id')
    ->leftJoin('bid_types as bt', 'bt.id', '=', 'p.project_type')
    ->leftJoin('bid_categories as bc', 'bc.id', '=', 'p.category')
    ->where('p.id', $id)
    ->select(
        'p.*',

        // ✅ Client data
        'c.id as client_id',
        'c.client_name',

        // ✅ Client Contact data
        'cc.id as contact_id',
        'cc.name as contact_name',
        'cc.email as contact_email',
        'cc.phone as contact_phone',

        // ✅ Project Type & Category names
        'bt.name as bid_type_name',
        'bc.name as bid_category_name'
    )
    ->first();
// dd($data["editData"]);
        // Build full redirect URLs for view mode
        if (!empty($data["editData"])) {
            $client_id = $data["editData"]->client_id ?? '';
            $project_id = $data["editData"]->id ?? '';
            // $data["clientContacts"] = DB::table('client_contacts')->where('client_id', $data["editData"]->client_id)->get();
            // $data["editData"]->redirect_success = url("redirects/c/{$client_id}/complete");
            // $data["editData"]->redirect_termination = url("redirects/c/{$client_id}/terminate");
            // $data["editData"]->redirect_quota = url("redirects/c/{$client_id}/quotafull");
            // $data["editData"]->redirect_quality = url("vendor/auth/{vendor_id}/project/{$project_id}");
        }
    } else {
       
        // Adding new project
        // Default placeholders for redirect URLs
        // $data["editData"] = (object) [
        //     'redirect_success' => url("redirects/c/{client_id}/complete"),
        //     'redirect_termination' => url("redirects/c/{client_id}/terminate"),
        //     'redirect_quota' => url("redirects/c/{client_id}/quotafull"),
        //     'redirect_quality' => url("vendor/auth/{vendor_id}/project/{project_id}")
        // ];
    }

    // Clients and PM users for dropdowns
    $data["clientList"] = DB::table('client')->where(['is_active' => 'Y'])->get();
    // 
    $data["ptype"] = DB::table('bid_types')->get();
    $data["pcategory"] = DB::table('bid_categories')->get();
    $data["pmUsers"] = DB::table('users')->where('is_active', 'Y')->get();

    $body['bodyView'] = view('admin/project/project_add_edit', $data);
    return LayoutController::loadAdmin($body);
}


    
    public function getClientDetails($client_id)
{
    // Get primary contact
    // $primaryContact = DB::table('client_contacts')
    //     ->where('client_id', $client_id)
    //     ->where('is_primary', 1)
    //     ->first();

    // Get all contacts (for dropdown)
    $allContacts = DB::table('client_contacts')
        ->where('client_id', $client_id)
        ->get();

    // Get sales rep from client table
    $client = DB::table('client')->where('id', $client_id)->first();
    $salesRep = DB::table('client as c')
        ->leftJoin('users as u', 'c.sales_rep', '=', 'u.id')
        ->where('c.id', $client_id)
        ->select('u.name')
        ->first();
       
    return response()->json([
        // 'primary_contact' => $primaryContact,
        'all_contacts' => $allContacts,
        'sales_rep' => $salesRep 
    ]);
}

public function addEditAction(Request $request)
{
    $mode = $request->post('mode');

    $validator = Validator::make($request->all(), [
        'client_id' => 'required|integer',
        'name' => 'required|string|max:255',
        'cost_per_complete' => 'required|numeric',
        'ir' => 'required|numeric',
        'max_limit' => 'required|integer',
    ], [
        'cost_per_complete.required' => 'CPI field required',
    ]);

    if ($validator->fails()) {
        return response()->json(['msg_status' => 0, 'errors' => $validator->errors()]);
    }

    $dataArray = [
        'bid_id' => $request->post('bid_id'),
        'option_id' => $request->post('option_id'),
        'bid_option_id' => $request->post('bid_option_id'),
        'project_id' => SerialMaster::generateSerialNumber('PROJECT'),

        'client_id' => $request->post('client_id'),
        'client_contact_id' => $request->post('client_contact_id'),

        'project_type' => $request->post('project_type'),
        'category' => $request->post('category'),
        'currency' => $request->post('currency'),
        'sales_rep' => $request->post('sales_rep'),

        'country' => $request->post('country'),
        'audience_type' => $request->post('audience_type'),
        'device_type' => $request->post('device_type'),

        'pm_user' => $request->post('pm_user'),
        'sub_pm_user' => $request->post('sub_pm_user'),

        'start_date' => $request->post('start_date'),
        'no_of_days' => $request->post('no_of_days'),
        'email_reference' => $request->post('email_reference'),

        'booking_notes' => $request->post('booking_notes'),
        'name' => $request->post('name'),
        'description' => $request->post('description'),
        'notes' => $request->post('notes'),

        'cost_per_complete' => $request->post('cost_per_complete'),
        'ir' => $request->post('ir'),
        'loi' => $request->post('loi'),
        'max_limit' => $request->post('max_limit'),
        'feasibility' => $request->post('feasibility'),
        'fieldwork_days' => $request->post('fieldwork_days'),
        'revenue' => $request->post('revenue'),

        'redirect_success' => $request->post('redirect_success'),
        'redirect_termination' => $request->post('redirect_termination'),
        'redirect_quota' => $request->post('redirect_quota'),
        'redirect_quality' => $request->post('redirect_quality'),

        'live_url' => $request->post('live_url'),
        'status' => $request->post('status') ?? 'Pending',
        'date' => now(),
    ];

    if ($mode === "Add") {

        $insertId = CommonDataModel::insertSingleTableData('projects', $dataArray);

        return response()->json([
            'msg_status' => 1,
            'message' => 'Project added successfully',
            'data' => $insertId
        ]);

    } else {

        
        $id = $request->post('id');
        unset($dataArray['project_id']); // prevent changing project_id on edit

        CommonDataModel::UpdateSingleTableData('projects', $dataArray, ['id' => $id], $id);

        return response()->json([
            'msg_status' => 1,
            'message' => 'Project updated successfully',
            'data' => $id
        ]);
    }
}


    // public function view($id)
    // {
    //     $result["projectsData"] = DB::table('projects')
    //         ->join('client', 'client.id', '=', 'projects.client_id')
    //         ->leftJoin('vendor', 'vendor.project_id', '=', 'projects.id')
    //         ->select('projects.*', 'client.client_name', DB::raw('SUM(vendor.complete_count) as complete_count, SUM(vendor.terminates_count) as terminates_count, SUM(vendor.clicks_count) as clicks_count'))
    //         ->groupBy('projects.id', 'projects.project_id', 'projects.client_id', 'projects.name', 'projects.description', 'projects.cost_per_complete', 'projects.ir', 'projects.loi', 'projects.max_limit', 'projects.live_url', 'projects.status', 'projects.date', 'client.client_name')
    //         ->where('projects.id', $id)
    //         ->first();
        
    //     $body['bodyView'] = view('admin/project/project_view', $result);
    //     return LayoutController::loadAdmin($body);
    // }

    public function status(Request $request)
    {
        $id = $request->post('id');
        $status = DB::table('projects')->where(['id' => $id])->first();
        $updatedStatus = $status->status == "Live" ? "Pause" : "Live";

        CommonDataModel::UpdateSingleTableData('projects', ['status' => $updatedStatus], ['id' => $id], $id);
        return response()->json(['success' => true, 'status' => $updatedStatus, 'message' => 'Status updated successfully']);
    }


public function view($id)
{
    // =======================
    //  FETCH PROJECT DETAILS
    // =======================
    $result["projectsData"] = DB::table('projects')
        ->join('client', 'client.id', '=', 'projects.client_id')
        ->leftJoin('vendor', 'vendor.project_id', '=', 'projects.id')
        ->select(
            'projects.id',
            'projects.project_id',
            'projects.client_id',
            'projects.bid_id',
            'projects.name',
            'projects.description',
            'projects.cost_per_complete',
            'projects.ir',
            'projects.loi',
            'projects.max_limit',
            'projects.live_url',
            'projects.status',
            'projects.date',
            'projects.pm_user',
            'projects.booking_notes',
            'client.client_name',
            DB::raw('COALESCE(SUM(vendor.complete_count), 0) as complete_count,
                     COALESCE(SUM(vendor.terminates_count), 0) as terminates_count,
                     COALESCE(SUM(vendor.clicks_count), 0) as clicks_count')
        )
        ->where('projects.id', $id)
        ->groupBy(
            'projects.id',
            'projects.project_id',
            'projects.client_id',
            'projects.bid_id',
            'projects.name',
            'projects.description',
            'projects.cost_per_complete',
            'projects.ir',
            'projects.loi',
            'projects.max_limit',
            'projects.live_url',
            'projects.status',
            'projects.date',
            'projects.pm_user',
            'projects.booking_notes',
            'client.client_name'
        )
        ->first();

    // ===============================
    //  GET COUNTRIES
    // ===============================
    $countries = DB::table('countries')->pluck('name', 'id')->toArray();
    $countryCodes = DB::table('countries')->pluck('iso_code', 'id')->toArray();

    // Flag generator
    function flagEmoji($code) {
        if(!$code || strlen($code) != 2) return '';
        $code = strtoupper($code);
        return mb_convert_encoding(
            '&#' . (127397 + ord($code[0])) . ';' .
            '&#' . (127397 + ord($code[1])) . ';',
            'UTF-8',
            'HTML-ENTITIES'
        );
    }

    // =======================================
    //  GET LIVE URL & TEST URL FROM BID OPTIONS
    // =======================================
    $bidId = $result["projectsData"]->bid_id;

    $bidOptions = DB::table('bid_options')
        ->where('bid_id', $bidId)
        ->select('id', 'live_url', 'test_url', 'country')
        ->get();

   // Flag generator (returns actual emoji)

// Process countries for each bid option
foreach($bidOptions as $option) {
    $countryIds = explode(',', $option->country); // multiple countries supported
    $names = [];
    $flags = [];
    foreach($countryIds as $id) {
        $id = trim($id);
        if (isset($countries[$id])) {
            $names[] = $countries[$id];
            $flags[] = flagEmoji($countryCodes[$id] ?? null);
        }
    }
    $option->country_names = implode(', ', $names);
    $option->country_flags = implode(' ', $flags);
}


    $result["bidOptions"] = $bidOptions;

    // ====================================
    // SEND TO VIEW
    // ====================================
    $body['bodyView'] = view('admin/project/project_view', $result);
    return LayoutController::loadAdmin($body);
}

    public function duplicate(Request $request)
    {
        $id = $request->post('id');
        $projectData = DB::table('projects')->where(['id' => $id])->first();
        if ($projectData) {
            $projectDataArray = (array) $projectData;
            foreach ($projectDataArray as $key => $value) {
                if (is_string($value)) {
                    $projectDataArray[$key] = trim($value);
                }
            }
            unset($projectDataArray['id']);
            $projectDataArray['project_id'] = SerialMaster::generateSerialNumber('PROJECT');
            $insertedId = CommonDataModel::insertSingleTableData('projects', $projectDataArray);
            return response()->json(['status' => true, 'insertedid' => $insertedId]);
        }
        return response()->json(['status' => false]);
    }

// public function vendorListPartialView(Request $request)
// {
//     $project_id = $request->post('project_id');

//     $result["assignedVendorList"] = DB::table('vendor_projects as vp')
//         ->join('vendor as v', 'v.id', '=', 'vp.vendor_id')
//         ->where('vp.project_id', $project_id)
//         ->where('v.is_active', 'Y')
//         ->select(
//             'v.id',
//             'v.vendor_id',
//             'v.name',
//             'v.email',
//             'v.clicks_count',
//             'v.complete_count',
//             'v.terminates_count',
//             'vp.assigned_at'
//         )
//         ->orderBy('vp.id', 'DESC')
//         ->get();

//     /*
//     |--------------------------------------------------------------------------
//     | Check Normal Project First
//     |--------------------------------------------------------------------------
//     */

//     $project = DB::table('projects')
//         ->where('id', $project_id)
//         ->first();

//     if ($project) {

//         $result['isApiProject'] = false;
//         $result['projectsData'] = $project;

//     } else {

//         /*
//         |--------------------------------------------------------------------------
//         | API Survey
//         |--------------------------------------------------------------------------
//         */

//         $project = DB::table('api_surveys')
//             ->where('SurveyId', $project_id)
//             ->first();

//         $result['isApiProject'] = true;
//         $result['projectsData'] = $project;
//     }

//     return view('admin/project/vendor_list_partial_view', $result)->render();
// }


public function vendorListPartialView(Request $request)
{
    $project_id = $request->post('project_id');

    /*
    |--------------------------------------------------------------------------
    | Assigned Vendor List
    |--------------------------------------------------------------------------
    */

    $vendorQuery = DB::table('vendor_projects as vp')
        ->join('vendor as v', 'v.id', '=', 'vp.vendor_id')
        ->where('vp.project_id', $project_id)
        ->where('v.is_active', 'Y')
        ->select(
            'v.id',
            'v.vendor_id',
            'v.name',
            'v.commission_type',
            'v.cpi_percentage',
            'v.per_complete',
            'v.email',
            'vp.clicks_count',
            'vp.complete_count',
            'vp.terminates_count',
            'vp.assigned_at'
        );
        

    /*
    |--------------------------------------------------------------------------
    | Vendor Login - Show Only Logged-in Vendor
    |--------------------------------------------------------------------------
    */

    if (session('surveysAdmin.role') == 8) {

        $supplierCode = session('surveysAdmin.supplier_id');

        $vendorQuery->where('v.vendor_id', $supplierCode);
    }

    $result["assignedVendorList"] = $vendorQuery
        ->orderBy('vp.id', 'DESC')
        ->get();


    /*
    |--------------------------------------------------------------------------
    | Check Normal Project First
    |--------------------------------------------------------------------------
    */

    $project = DB::table('projects')
        ->where('id', $project_id)
        ->first();

    if ($project) {

        $result['isApiProject'] = false;
        $result['projectsData'] = $project;

    } else {

        /*
        |--------------------------------------------------------------------------
        | API Survey
        |--------------------------------------------------------------------------
        */

        $project = DB::table('api_surveys')
            ->where('SurveyId', $project_id)
            ->first();

        $result['isApiProject'] = true;
        $result['projectsData'] = $project;
    }

    return view('admin/project/vendor_list_partial_view', $result)->render();
}


   public function vendorList()
{
    if (session('surveysAdmin.role') == 8) {

        $supplierCode = session('surveysAdmin.supplier_id');

        $vendorList = DB::table('vendor')
            ->where('is_active', 'Y')
            ->whereNull('project_id')
            ->whereNull('client_id')
            ->where('vendor_id', $supplierCode)
            ->first();

    } else {

        $vendorList = DB::table('vendor')
            ->where('is_active', 'Y')
            ->whereNull('project_id')
            ->whereNull('client_id')
            ->get();
    }

    return response()->json([
        'vendorList' => $vendorList
    ]);
}
    

    
    
  public function assignVendor(Request $request)
{
    
    $assignVendor      = $request->assign_vendor_id;
    $project_id        = $request->project_id;
    $project_unique_id = $request->project_unique_id;
    $client_id         = $request->client_id;
    $api               = $request->api;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    $validator = Validator::make($request->all(), [
        'assign_vendor_id' => 'required|array',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ]);
    }

    DB::beginTransaction();

    try {

        /*
        |--------------------------------------------------------------------------
        | NON API PROJECT ONLY
        |--------------------------------------------------------------------------
        */

        $project = null;
        $bidOptions = collect();

        if (empty($api)) {

            $project = DB::table('projects')
                ->where('id', $project_id)
                ->first();

            if (!$project) {
                throw new \Exception('Project not found');
            }

            $bidOptions = DB::table('bid_options')
                ->where('bid_id', $project->bid_id)
                ->get();
        }

        /*
        |--------------------------------------------------------------------------
        | ASSIGN VENDORS LOOP
        |--------------------------------------------------------------------------
        */

        foreach ($assignVendor as $vendorId) {

            /*
            |--------------------------------------------------------------------------
            | FETCH VENDOR
            |--------------------------------------------------------------------------
            */

            $vendor = DB::table('vendor')
                ->where('id', $vendorId)
                ->first();

            if (!$vendor) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | INSERT INTO vendor_projects
            |--------------------------------------------------------------------------
            */

            DB::table('vendor_projects')->updateOrInsert(
                [
                    'vendor_id'  => $vendorId,
                    'project_id' => $project_id
                ],
                [
                    'client_id'   => $client_id,
                    'assigned_at' => now(),
                    'created_at'  => now(),
                    'updated_at'  => now()
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | API PROJECT ENTRY LINK
            |--------------------------------------------------------------------------
            */

          if ($request->is_api_survey == 1) {

    $entryUrl = "vendor/auth/{$vendorId}/project/{$project_unique_id}?user=xxxx&api=1";

    DB::table('vendor_entry_links')->updateOrInsert(
        [
            'vendor_id'  => $vendorId,
            'project_id' => $project_id
        ],
        [
            'entry_link' => $entryUrl,
            'live_url'   => null,
            'test_url'   => null,
            'created_at' => now(),
            'updated_at' => now()
        ]
    );

    $mailData = (object)[
        'email'        => $vendor->email,
        'project_id'   => $project_unique_id,
        'project_name' => 'Survey Project',
        'cpi'          => 'N/A',
        'client_id'    => $client_id
    ];
}
            /*
            |--------------------------------------------------------------------------
            | NON API PROJECT ENTRY LINKS
            |--------------------------------------------------------------------------
            */

            else {

                foreach ($bidOptions as $opt) {

                    $entryUrl = "vendor/auth/{$vendorId}/project/{$project_unique_id}?opt={$opt->id}&user=xxxx";

                    DB::table('vendor_entry_links')->updateOrInsert(
                        [
                            'vendor_id'     => $vendorId,
                            'project_id'    => $project_id,
                            'bid_option_id' => $opt->id
                        ],
                        [
                            'entry_link' => $entryUrl,
                            'live_url'   => $opt->live_url,
                            'test_url'   => $opt->test_url,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]
                    );
                }

                $mailData = DB::table('vendor')
                    ->join('vendor_projects', 'vendor.id', '=', 'vendor_projects.vendor_id')
                    ->join('projects', 'projects.id', '=', 'vendor_projects.project_id')
                    ->join('client', 'client.id', '=', 'vendor_projects.client_id')
                    ->where('vendor.id', $vendorId)
                    ->where('projects.id', $project_id)
                    ->select(
                        'vendor.*',
                        'projects.project_id',
                        'projects.name as project_name',
                        'projects.cost_per_complete as cpi',
                        'client.client_id'
                    )
                    ->first();
            }

            /*
            |--------------------------------------------------------------------------
            | SEND EMAIL
            |--------------------------------------------------------------------------
            */

            if (!empty($mailData) && !empty($mailData->email)) {

                sendEmail(
                    $mailData->email,
                    $mailData->project_id . ' Project Assigned Successfully!',
                    view('admin/mail/vendor_assign', [
                        'mailData' => $mailData
                    ])
                );
            }
        }

        DB::commit();

        return response()->json([
            'status' => true,
            'message' => 'Vendor assigned successfully'
        ]);

    } catch (\Exception $e) {

        DB::rollBack();

        \Log::error('Assign Vendor Error', [
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'status' => false,
            'message' => $e->getMessage()
        ]);
    }
}


    
    function flagEmoji($code) {
    if (!$code || strlen($code) != 2) return '';
    $code = strtoupper($code);
    $offset = 127397;
    $first  = mb_chr(ord($code[0]) + $offset, 'UTF-8');
    $second = mb_chr(ord($code[1]) + $offset, 'UTF-8');
    return $first . $second;
}


}
