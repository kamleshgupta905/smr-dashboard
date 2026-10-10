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

class ProjectController extends Controller
{
    public function index()
    {
        $result["projectsList"] = DB::table('projects')
            ->join('client', 'client.id', '=', 'projects.client_id')
            ->leftJoin('vendor', 'vendor.project_id', '=', 'projects.id')
            ->select('projects.*', 'client.client_name', DB::raw('SUM(vendor.complete_count) as complete_count, SUM(vendor.terminates_count) as terminates_count'))
            ->groupBy('projects.id', 'projects.project_id', 'projects.client_id', 'projects.name', 'projects.description', 'projects.cost_per_complete', 'projects.ir', 'projects.loi', 'projects.max_limit', 'projects.live_url', 'projects.status', 'projects.date', 'client.client_name')
            ->orderBy('projects.id', 'DESC')
            ->get();


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
            $data["editData"] = DB::table('projects')->where('id', $id)->first();
        }

        $data["clientList"] = DB::table('client')->where(['is_active' => 'Y'])->get();
        $body['bodyView'] = view('admin/project/project_add_edit', $data);
        return LayoutController::loadAdmin($body);
    }

    public function addEditAction(Request $request)
    {
        $mode = $request->post('mode');
        $client_id = $request->post('client_id');
        $name = $request->post('name');
        $cpi = $request->post('cost_per_complete');
        $ir = $request->post('ir');
        $loi = $request->post('loi');
        $max_limit = $request->post('max_limit');
        $live_url = $request->post('live_url');
        $description = $request->post('description');

        $validator = Validator::make($request->all(), [
            'client_id' => 'required',
            'name' => 'required',
            'cost_per_complete' => 'required',
            'ir' => 'required',
            'max_limit' => 'required',
            'live_url' => ['required', 'url'],
            'description' => 'required',
        ], [
            'cost_per_complete.required' => 'CPI field required'
        ]);

        if ($validator->fails()) {
            $error = $validator->errors();
            return response()->json(['msg_status' => 0, 'errors' => $error]);
        } else {
            if ($mode == "Add") {

                $dataArray = [
                    'project_id' => SerialMaster::generateSerialNumber('PROJECT'),
                    'client_id' => $client_id,
                    'name' => $name,
                    'cost_per_complete' => $cpi,
                    'ir' => $ir,
                    'loi' => $loi,
                    'max_limit' => $max_limit,
                    'live_url' => $live_url,
                    'description' => $description,
                    'date' => now()
                ];

                $insertId = CommonDataModel::insertSingleTableData('projects', $dataArray);
                return response()->json(['msg_status' => 1, 'data' => $insertId]);
            } else {
                $id = $request->post('id');
                $dataArray = [
                    'name' => $name,
                    'cost_per_complete' => $cpi,
                    'ir' => $ir,
                    'loi' => $loi,
                    'max_limit' => $max_limit,
                    'live_url' => $live_url,
                    'description' => $description,
                    'date' => now()
                ];

                CommonDataModel::UpdateSingleTableData('projects', $dataArray, ['id' => $id], $id);
                return response()->json(['msg_status' => 1, 'data' => $id]);
            }
        }
    }

    public function view($id)
    {
        $result["projectsData"] = DB::table('projects')
            ->join('client', 'client.id', '=', 'projects.client_id')
            ->leftJoin('vendor', 'vendor.project_id', '=', 'projects.id')
            ->select('projects.*', 'client.client_name', DB::raw('SUM(vendor.complete_count) as complete_count, SUM(vendor.terminates_count) as terminates_count, SUM(vendor.clicks_count) as clicks_count'))
            ->groupBy('projects.id', 'projects.project_id', 'projects.client_id', 'projects.name', 'projects.description', 'projects.cost_per_complete', 'projects.ir', 'projects.loi', 'projects.max_limit', 'projects.live_url', 'projects.status', 'projects.date', 'client.client_name')
            ->where('projects.id', $id)
            ->first();
        
        $body['bodyView'] = view('admin/project/project_view', $result);
        return LayoutController::loadAdmin($body);
    }

    public function status(Request $request)
    {
        $id = $request->post('id');
        $status = DB::table('projects')->where(['id' => $id])->first();
        $updatedStatus = $status->status == "Live" ? "Pause" : "Live";

        CommonDataModel::UpdateSingleTableData('projects', ['status' => $updatedStatus], ['id' => $id], $id);
        return response()->json(['success' => true, 'status' => $updatedStatus, 'message' => 'Status updated successfully']);
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

    public function vendorListPartialView(Request $request)
    {
        $project_id = $request->post('project_id');
        $result["assignedVendorList"] = DB::table('vendor')->where(['is_active' => 'Y', 'project_id' => $project_id])->get();
        $result['projectsData'] = DB::table('projects')->where('id', $project_id)->first();
        return view('admin/project/vendor_list_partial_view', $result)->render();
    }

    public function vendorList()
    {
        $vendorList = DB::table('vendorlists')->get();
        return response()->json(['vendorList' => $vendorList]);
    }

    public function assignVendor(Request $request)
    {
        $assignVendor = $request->post('assign_vendor_id');
        $project_id = $request->post('project_id');
        $project_unique_id = $request->post('project_unique_id');
        $client_id = $request->post('client_id');

        $validator = Validator::make($request->all(), [
            'assign_vendor_id' => 'required',
        ], [
            'assign_vendor_id.required' => 'Vendor field required'
        ]);

        if ($validator->fails()) {
            $error = $validator->errors();
            return response()->json(['status' => false, 'errors' => $error]);
        } else {
            // Fetch last ID before loop starts
            $lastVendor = DB::table('vendor')->orderBy('id', 'DESC')->first();
            $vid = $lastVendor ? $lastVendor->id + 1 : 1;
            
            foreach ($assignVendor as $vendorId) {
                $vendor_data = DB::table('vendorlists')->where('id', $vendorId)->first();
                if (!$vendor_data) {
                    continue; 
                } 
                
                $dataArr = [
                    'vendor_id' => $vendor_data->vendor_id, 
                    'name' => $vendor_data->name,
                    'email' => $vendor_data->email, 
                    'project_id' => $project_id,
                    'client_id' => $client_id,
                    'entry_link' => 'vendor/auth/' . $vid . '/' . 'project/' . $project_unique_id . '?user=xxxx'
                ];

                $paymentDataArr = [
                    'payment_id' => SerialMaster::generateSerialNumber('PAYMENT'),
                    'project_id' => $project_id,
                    'vendor_id' => $vid
                ];

                CommonDataModel::insertSingleTableData('vendor', $dataArr);
                CommonDataModel::insertSingleTableData('payments', $paymentDataArr);

                $result["mailData"] = DB::table('vendor')
                    ->join('projects', 'vendor.project_id', '=', 'projects.id')
                    ->join('client', 'client.id', '=', 'vendor.client_id')
                    ->where('vendor.id', $vid)
                    ->select('vendor.*', 'projects.project_id', 'client.client_id', 'projects.name as project_name', 'projects.cost_per_complete as cpi')
                    ->first();

                sendEmail($result['mailData']->email, $result['mailData']->project_id . " Project Assigned Successfully!", view('admin/mail/vendor_assign', $result));
            }

            return response()->json(['status' => true]);
        }
    }
}
