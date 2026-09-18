<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Models\admin\CommonDataModel;
use App\Models\admin\Vendors;
use App\Models\admin\SerialMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class VendorController extends Controller
{
public function index()
{
   
    // Supplier Login
    if (session('surveysAdmin.role') == 8) {

        $supplierCode = session('surveysAdmin.supplier_id');
        

        $vendor = DB::table('vendor')
            ->where('vendor_id', $supplierCode)
            ->first();

        if (!$vendor) {
            abort(404, 'Supplier not found.');
        }

        // Supplier ko seedha apni profile pe bhejo
        return redirect('admin/vendor/view/' . $vendor->id);
    }

    // Admin Login
    $result["vendorList"] = DB::table('vendor')
        ->orderByDesc('id')
        ->get();

    $body['bodyView'] = view('admin/vendor/vendor_list_view', $result);
    return LayoutController::loadAdmin($body);
}

  public function VendorList_index(){
      
   $data = DB::table('vendorlists')->get();

      return view('admin/vendor/VendorList', compact('data'));
     
  }
   public function VendorList_add(Request $request){
     $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:vendorlists,email',
    ]);

   DB::table('vendorlists')->insert([
         'vendor_id' => SerialMaster::generateSerialNumber('VENDOR'),
        'name' => $request->name,
        'email' => $request->email,
        'success' => $request->success,
        'terminate' => $request->terminate,
        'screenout' => $request->screenout,
        'quotafull' => $request->quotafull,
        'created_at' => now(), 
        'updated_at' => now()
    ]);
    
    return redirect()->back()->with(['success' => 'Vendor Added Successfully']); 
  }
  
  public function VendorList_Edit($id)
{
    $vendor = DB::table('vendorlists')->where('id', $id)->first();

    if (!$vendor) {
        return redirect()->back()->with('error', 'Vendor not found.');
    }
    $data = DB::table('vendorlists')->get();
    return view('admin.vendor.VendorList', compact('vendor','data'));
}

public function VendorList_Update(Request $request, $id)
    {
        // Validation
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'success' => 'nullable|url',
            'terminate' => 'nullable|url',
            'screenout' => 'nullable|url',
            'quotafull' => 'nullable|url',
        ]);

        // Check if vendor exists
        $vendor = DB::table('vendorlists')->where('id', $id)->first();
        if (!$vendor) {
            return redirect()->back()->with('error', 'Vendor not found.');
        }

        // Update vendor details
        DB::table('vendorlists')->where('id', $id)->update([
            'name' => $request->name,
            'email' => $request->email,
            'success' => $request->success,
            'terminate' => $request->terminate,
            'screenout' => $request->screenout,
            'quotafull' => $request->quotafull,
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Vendor updated successfully.');
    }

  
  public function VendorList_delete($id)
{
    $vendor = DB::table('vendorlists')->where('id', $id)->first();

    if (!$vendor) {
        return redirect()->back()->with('error', 'Vendor not found.');
    }

    DB::table('vendorlists')->where('id', $id)->delete();

    return redirect()->back()->with('success', 'Vendor deleted successfully.');
}

    public function addEdit($id = "")
    {
        $data = LayoutController::addEditCommon($id, []);
        $data["editData"] = [];
        $data["existingContacts"] = collect(); // ✅ always define empty by default
        $data["selectedCountries"] = collect();
        $data["blockedClients"] = collect();

        // ✅ Fetch main supplier/vendor record if editing
        if ($id > 0) {
            $data["editData"] = DB::table('vendor')->where('id', $id)->first();

            // ✅ Fetch selected countries for this supplier
            $data["selectedCountries"] = DB::table('supplier_country')
                ->join('countries', 'countries.id', '=', 'supplier_country.country_id')
                ->where('supplier_country.supplier_id', $id)
                ->select('countries.id', 'countries.name')
                ->get();

            // ✅ Fetch blocked clients for this supplier
            $data["blockedClients"] = DB::table('supplier_blocked_clients')
                ->join('client', 'client.id', '=', 'supplier_blocked_clients.client_id')
                ->where('supplier_blocked_clients.supplier_id', $id)
                ->select('client.id', 'client.client_name')
                ->get();

            // ✅ Fetch contacts for this supplier
            $data["existingContacts"] = DB::table('supplier_contacts')
                ->where('supplier_id', $id)
                ->get();
               
        }

        // ✅ Country list (for Settings tab)
        $data["countries"] = DB::table('countries')->orderBy('name', 'asc')->get();

        // ✅ All clients list (for Settings tab)
        $data["clients"] = DB::table('client')->orderByDesc('id')->get();

        // ✅ Pass view
        $body['bodyView'] = view('admin/vendor/vendor_add_edit', $data);
        return LayoutController::loadAdmin($body);
    }




   

public function addEditAction(Request $request)
{
   
    $mode = $request->post('mode');
    $id   = $request->post('id');

    // 🔹 STEP 1: Validation rules (Add vs Edit)
    $rules = [
        'name'             => 'required|string|max:255',
        'commission_type'  => 'nullable|in:revenue_share,flat_rate',
        'cpi_percentage'   => 'nullable|numeric',
        'per_complete'     => 'nullable|numeric',
        'monthly_cap'      => 'nullable|numeric',
        'project_type'     => 'nullable|string|max:255',
        'audience_type'    => 'nullable|string|max:255',
        'block_pii_survey' => 'nullable|boolean',
    ];

    if ($mode === 'Add') {
        // ✅ Unique email on add
        $rules['email'] = 'required|email|max:255|unique:vendor,email';
    } else {
        // ✅ Unique email on update (ignore current record)
        $rules['email'] = 'required|email|max:255|unique:vendor,email,' . $id;
    }

    $validator = Validator::make($request->all(), $rules);

    if ($validator->fails()) {
        return response()->json([
            'msg_status' => 0,
            'errors'     => $validator->errors(),
        ]);
    }

    // 🔹 STEP 2: Prepare vendor data
    $dataArray = [
        'name'             => $request->post('name'),
        'email'            => $request->post('email'),
        'currency'            => $request->post('currency'),
        'is_api_supplier'  => $request->has('is_api_supplier') ? 1 : 0,
        'commission_type'  => $request->post('commission_type') ?? null,
        'cpi_percentage'   => $request->post('cpi_percentage') ?? null,
        'per_complete'     => $request->post('per_complete') ?? null,
        'monthly_cap'      => $request->post('monthly_cap') ?? null,
        'project_type'     => $request->post('project_type') ?? null,
        'audience_type'    => $request->post('audience_type') ?? null,
        'block_pii_survey' => $request->has('block_pii_survey') ? 1 : 0,
        'encryption_method'=> $request->post('encryption_method') ?? null,
        'updated_at'       => now(),
    ];

    try {

        // 🔹 STEP 3: ADD / UPDATE
        if ($mode === "Add") {

            // ✅ SAFE vendor_id generation (no duplicates)
            do {
                $vendorId = SerialMaster::generateSerialNumber('VENDOR');
            } while (DB::table('vendor')->where('vendor_id', $vendorId)->exists());

            $dataArray['vendor_id'] = $vendorId;
            $dataArray['created_at'] = now();

            // Redirect URLs
            $dataArray['redirect_success_url']              = $request->post('redirect_success_url');
            $dataArray['redirect_fail_url']                 = $request->post('redirect_fail_url');
            $dataArray['redirect_over_quota_url']           = $request->post('redirect_over_quota_url');
            $dataArray['redirect_quality_termination_url']  = $request->post('redirect_quality_termination_url');
            $dataArray['redirect_postback_success_url']     = $request->post('redirect_postback_success_url');

            $supplierId = CommonDataModel::insertSingleTableData('vendor', $dataArray);

        } else {

            $supplierId = $id;

            // Redirect URLs
            $dataArray['redirect_success_url']              = $request->post('redirect_success_url');
            $dataArray['redirect_fail_url']                 = $request->post('redirect_fail_url');
            $dataArray['redirect_over_quota_url']           = $request->post('redirect_over_quota_url');
            $dataArray['redirect_quality_termination_url']  = $request->post('redirect_quality_termination_url');
            $dataArray['redirect_postback_success_url']     = $request->post('redirect_postback_success_url');

            CommonDataModel::UpdateSingleTableData(
                'vendor',
                $dataArray,
                ['id' => $supplierId],
                $supplierId
            );
        }

        // 🔹 STEP 4: Contacts
        if ($request->has('contacts')) {
            DB::table('supplier_contacts')->where('supplier_id', $supplierId)->delete();

            foreach ($request->contacts as $index => $contact) {
                DB::table('supplier_contacts')->insert([
                    'supplier_id' => $supplierId,
                    'name'        => $contact['name'] ?? null,
                    'email'       => $contact['email'] ?? null,
                    'phone'       => $contact['phone'] ?? null,
                    'is_primary'  => ($request->primary_contact == $index) ? 1 : 0,
                    'created_at'  => now(),
                ]);
            }
        }

        // 🔹 STEP 5: Countries
        if ($request->has('selected_countries')) {
            DB::table('supplier_country')->where('supplier_id', $supplierId)->delete();

            foreach ($request->selected_countries as $countryId) {
                DB::table('supplier_country')->insert([
                    'supplier_id' => $supplierId,
                    'country_id'  => $countryId,
                    'created_at'  => now(),
                ]);
            }
        }

        // 🔹 STEP 6: Blocked Clients
        if ($request->has('blocked_clients')) {
            DB::table('supplier_blocked_clients')->where('supplier_id', $supplierId)->delete();

            foreach ($request->blocked_clients as $clientId) {
                DB::table('supplier_blocked_clients')->insert([
                    'supplier_id' => $supplierId,
                    'client_id'   => $clientId,
                    'created_at'  => now(),
                ]);
            }
        }

        // 🔹 STEP 7: Success
        return response()->json([
            'msg_status' => 1,
            'data'       => $supplierId,
            'message'    => $mode === 'Add'
                ? 'Vendor Added Successfully'
                : 'Vendor Updated Successfully',
        ]);

    } catch (\Illuminate\Database\QueryException $e) {

        // ✅ Duplicate protection from DB
        if ($e->errorInfo[1] == 1062) {
            return response()->json([
                'msg_status' => 0,
                'message' => 'Email or Vendor ID already exists',
            ]);
        }

        throw $e;

    } catch (\Exception $e) {

        \Log::error('❌ Error in addEditAction', [
            'error' => $e->getMessage(),
        ]);

        return response()->json([
            'msg_status' => 0,
            'message' => 'Something went wrong while saving vendor',
        ]);
    }
}




   public function view($id)
{
    // ✅ Supplier can view only his own profile
    if (session('surveysAdmin.role') == 8) {

        $supplierCode = session('surveysAdmin.supplier_id');

        $vendor = DB::table('vendor')
            ->where('vendor_id', $supplierCode)
            ->first();

        if (!$vendor) {
            abort(403, 'Supplier not found.');
        }

        // Force supplier to open only his own profile
        $id = $vendor->id;
    }

    $result["vendorData"] = DB::table('vendor')
        ->where('id', $id)
        ->first();

    $result["leadList"] = DB::table('leads')
        ->join('projects', 'leads.project_id', '=', 'projects.id')
        ->join('vendor', 'vendor.id', '=', 'leads.vendor_id')
        ->select(
            'leads.*',
            'projects.project_id',
            'projects.name as project_name',
            'projects.cost_per_complete as cpi',
            'vendor.email as vendor_email',
            'vendor.id as vid'
        )
        ->where('vendor.id', $id)
        ->orderByDesc('leads.id')
        ->get();

    $body['bodyView'] = view('admin/vendor/vendor_view', $result);
    return LayoutController::loadAdmin($body);
}

    public function status(Request $request)
    {
        $id = $request->post('id');
        $status = DB::table('vendor')->where(['id' => $id])->first();
        $updatedStatus = $status->is_active == "Y" ? "N" : "Y";

        CommonDataModel::UpdateSingleTableData('vendor', ['is_active' => $updatedStatus], ['id' => $id], $id);
        return response()->json(['success' => true, 'status' => $updatedStatus, 'message' => 'Status updated successfully']);
    }
    public function filterVendors(Request $request)
    {
        $query = DB::table('vendor'); // your table name is vendor
    
        if ($request->vendor_id) {
            $query->where('vendor_id', 'LIKE', '%' . $request->vendor_id . '%');
        }
    
        if ($request->name) {
            $query->where('name', 'LIKE', '%' . $request->name . '%');
        }
    
        if ($request->email) {
            $query->where('email', 'LIKE', '%' . $request->email . '%');
        }
    
        $vendors = $query->paginate(10)->appends($request->all());
  // 50 per page (change as needed)

    
        return view('admin.vendor.vendor_rows', compact('vendors'))->render();
    }

        public function delete($id)
        {
            $vendor = Vendors::findOrFail($id);
            $vendor->delete();
        
            return response()->json([
                'status' => true,
                'message' => 'Supplier deleted successfully'
            ]);
        }

}
