<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Models\admin\CommonDataModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ClientController extends Controller
{
    public function index()
    {
        $result["clientList"] = DB::table('client')->orderByDesc('id')->get();
        $body['bodyView'] = view('admin/client/client_list_view', $result);
        return LayoutController::loadAdmin($body);
    }

    public function delete($id)
    {
        $client = DB::table('client')->where('id', $id)->first();
        
        if ($client) {
            DB::table('client')->where('id', $id)->delete();
            return back()->with('success', 'Client deleted successfully.');
        }

        return back()->with('error', 'Client not found.');
    }

    public function addEdit($id = "")
    {
        $data = LayoutController::addEditCommon($id, []);
        $data["editData"] = [];

        if ($id > 0) {
            $data["editData"] = DB::table('client')->where('id', $id)->first();
        }

        $body['bodyView'] = view('admin/client/client_add_edit', $data);
        return LayoutController::loadAdmin($body);
    }

    public function addEditAction(Request $request)
    {
        $mode = $request->post('mode');
        $client_name = $request->post('client_name');
        $description = $request->post('description');

        $validator = Validator::make($request->all(), [
            'client_name' => 'required',
            'description' => 'required',
        ]);

        if ($validator->fails()) {
            $error = $validator->errors();
            return response()->json(['msg_status' => 0, 'errors' => $error]);
        } else {
            if ($mode == "Add") {
                $clint_id = md5(now());
                $dataArray = [
                    'client_id' => $clint_id,
                    'client_name' => $client_name,
                    'description' => $description,
                    'complete_url' => 'redirects/c/' . $clint_id . '/complete?username=xxxx',
                    'terminate_url' => 'redirects/c/' . $clint_id . '/terminate?username=xxxx',
                    'quotafull_url' => 'redirects/c/' . $clint_id . '/quotafull?username=xxxx',
                    'date' => now()
                ];

                $insertId = CommonDataModel::insertSingleTableData('client', $dataArray);
                return response()->json(['msg_status' => 1, 'data' => $insertId]);
            } else {
                $id = $request->post('id');
                $dataArray = [
                    'client_name' => $client_name,
                    'description' => $description,
                    'date' => now()
                ];

                CommonDataModel::UpdateSingleTableData('client', $dataArray, ['id' => $id], $id);
                return response()->json(['msg_status' => 1, 'data' => $id]);
            }
        }
    }

    public function view($id)
    {
        $result["userData"] = DB::table('client')->where('id', $id)->first();
        $body['bodyView'] = view('admin/client/client_view', $result);
        return LayoutController::loadAdmin($body);
    }

    public function status(Request $request)
    {
        $id = $request->post('id');
        $status = DB::table('client')->where(['id' => $id])->first();
        $updatedStatus = $status->is_active == "Y" ? "N" : "Y";

        CommonDataModel::UpdateSingleTableData('client', ['is_active' => $updatedStatus], ['id' => $id], $id);
        return response()->json(['success' => true, 'status' => $updatedStatus, 'message' => 'Status updated successfully']);
    }
}
