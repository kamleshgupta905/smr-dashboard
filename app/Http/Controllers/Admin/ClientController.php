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
            $data["editData"]->contacts = DB::table('client_contacts')
            ->where('client_id', $id)
            ->select('id', 'name', 'email', 'phone', 'is_primary', 'billing')
            ->orderBy('id', 'asc')
            ->get();
        }
        $data['userList'] = \App\Models\admin\User::orderBy('id', 'desc')->get();
        $data['country'] = DB::table('countries')->orderBy('id', 'ASC')->get();
       
        
        $body['bodyView'] = view('admin/client/client_add_edit', $data);
        return LayoutController::loadAdmin($body);
    }
    
    

    // public function addEditAction(Request $request)
    // {
    //     $mode = $request->post('mode');
    //     $client_name = $request->post('client_name');
    //     $description = $request->post('description');

    //     $validator = Validator::make($request->all(), [
    //         'client_name' => 'required',
    //         'description' => 'required',
    //     ]);

    //     if ($validator->fails()) {
    //         $error = $validator->errors();
    //         return response()->json(['msg_status' => 0, 'errors' => $error]);
    //     } else {
    //         if ($mode == "Add") {

    //             $clint_id = md5(now());
    //             $dataArray = [
    //                 'client_id' => $clint_id,
    //                 'client_name' => $client_name,
    //                 'description' => $description,
    //                 'complete_url' => 'redirects/c/' . $clint_id . '/complete?username=xxxx',
    //                 'terminate_url' => 'redirects/c/' . $clint_id . '/terminate?username=xxxx',
    //                 'quotafull_url' => 'redirects/c/' . $clint_id . '/quotafull?username=xxxx',
    //                 'date' => now()
    //             ];

    //             $insertId = CommonDataModel::insertSingleTableData('client', $dataArray);
    //             return response()->json(['msg_status' => 1, 'data' => $insertId]);
    //         } else {
    //             $id = $request->post('id');
    //             $dataArray = [
    //                 'client_name' => $client_name,
    //                 'description' => $description,
    //                 'date' => now()
    //             ];


    //             CommonDataModel::UpdateSingleTableData('client', $dataArray, ['id' => $id], $id);
    //             return response()->json(['msg_status' => 1, 'data' => $id]);
    //         }
    //     }
    // }

  public function addEditAction(Request $request)
{
    ob_clean();
    $mode = $request->post('mode');
    $id = $request->post('id');

    \Log::info('Incoming Request', $request->all());

    // Validation
    $validator = Validator::make($request->all(), [
        'client_name' => 'required|string|max:255',
        'email'       => 'required|email|max:255',
        'sales_rep'   => 'required|string|max:255',
        'country'     => 'required|string|max:255',
        'currency'    => 'required|string|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json(['msg_status' => 0, 'errors' => $validator->errors()]);
    }

    // Prepare main data
    $dataArray = [
        'client_name' => $request->post('client_name'),
        'email'       => $request->post('email'),
        'phone'       => $request->post('phone'),
        'sales_rep'   => $request->post('sales_rep'),
        'country'     => $request->post('country'),
        'state'       => $request->post('state'),
        'street'      => $request->post('street'),
        'city'        => $request->post('city'),
        'zip'         => $request->post('zip'),
        'bank'        => $request->post('bank'),
        'iban'        => $request->post('iban'),
        'swift'       => $request->post('swift'),
        'tax_no'      => $request->post('tax_no'),
        'currency'    => $request->post('currency'),
        'vat'         => $request->post('vat'),
        'is_api'      => $request->has('is_api') ? 1 : 0,
        'date'        => now(),
    ];

    try {
        if ($mode == "Add") {
            $client_id = md5(now());
            $dataArray['client_id'] = $client_id;
            $dataArray['complete_url'] = "redirects/c/{$client_id}/complete?username=xxxx";
            $dataArray['terminate_url'] = "redirects/c/{$client_id}/terminate?username=xxxx";
            $dataArray['quotafull_url'] = "redirects/c/{$client_id}/quotafull?username=xxxx";
            $dataArray['is_active'] = 'Y';

            $insertId = CommonDataModel::insertSingleTableData('client', $dataArray);
            $clientDbId = $insertId;
        } else {
            $clientDbId = $id;
            CommonDataModel::UpdateSingleTableData('client', $dataArray, ['id' => $id], $id);

            // remove old contacts
            CommonDataModel::deleteTableData('client_contacts', ['client_id' => $id]);
        }

        /* =============================
           HANDLE MULTIPLE CONTACTS
           ============================= */

        $contactData = [];

        // ✅ Handle both array structures
        if ($request->has('contacts') && is_array($request->contacts)) {
            foreach ($request->contacts as $contact) {
                if (!empty($contact['name'])) {
                    $contactData[] = [
                        'client_id'  => $clientDbId,
                        'name'       => $contact['name'] ?? null,
                        'email'      => $contact['email'] ?? null,
                        'phone'      => $contact['phone'] ?? null,
                        'is_primary' => !empty($contact['is_primary']) ? 1 : 0,
                        'billing'    => !empty($contact['is_billing']) ? 1 : 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        } else {
            // fallback for legacy separate arrays
            $names = $request->post('contact_name', []);
            $emails = $request->post('contact_email', []);
            $phones = $request->post('contact_phone', []);
            $is_primary = $request->post('is_primary', []);
            $is_billing = $request->post('is_billing', []);

            if (is_array($names)) {
                for ($i = 0; $i < count($names); $i++) {
                    if (!empty($names[$i])) {
                        $contactData[] = [
                            'client_id'  => $clientDbId,
                            'name'       => $names[$i],
                            'email'      => $emails[$i] ?? null,
                            'phone'      => $phones[$i] ?? null,
                            'is_primary' => isset($is_primary[$i]) ? 1 : 0,
                            'billing'    => isset($is_billing[$i]) ? 1 : 0,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }
        }

        if (!empty($contactData)) {
            CommonDataModel::insertMultipleTableData('client_contacts', $contactData);
        }

        return response()->json([
            'msg_status' => 1,
            'data' => $clientDbId,
            'message' => $mode == "Add" ? "Client Added Successfully" : "Client Updated Successfully"
        ]);

    } catch (\Exception $e) {
        \Log::error('Error saving client', ['error' => $e->getMessage()]);
        return response()->json([
            'msg_status' => 0,
            'message' => 'An unexpected error occurred while saving the client.',
            'error' => $e->getMessage()
        ]);
    }
}



    // public function view($id)
    // {
    //     $result["userData"] = DB::table('client')->where('id', $id)->first();
    //     $body['bodyView'] = view('admin/client/client_view', $result);
    //     return LayoutController::loadAdmin($body);
    // }
    public function view($id)
    {
        $result["userData"] = DB::table('client')->where('id', $id)->first();
        $result["salesrep"] = DB::table('users')->where('id', $result["userData"]->sales_rep)->first();

        // ✅ Fetch contacts from correct table client_contacts
        $result["contacts"] = DB::table('client_contacts')
            ->where('client_id', $result["userData"]->id)
            ->get();

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
    public function filterClients(Request $request)
    {
        $query = DB::table('client');
    
        if ($request->name) {
            $query->where('client_name', 'LIKE', '%' . $request->name . '%');
        }
    
        if ($request->status != '') {
            $query->where('is_active', $request->status);
        }
    
        if ($request->country) {
            $query->where('country', 'LIKE', '%' . $request->country . '%');
        }
    
        $clients = $query->get();
    
        return view('admin.client.client_rows', compact('clients'))->render();
    }

}
