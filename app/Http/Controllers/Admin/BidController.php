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

class BidController extends Controller
{




public function index()
{
    $bids = DB::table('bids')
        ->leftJoin('client', 'bids.client_id', '=', 'client.id')
        ->leftJoin('client_contacts', 'client.id', '=', 'client_contacts.client_id')
        ->leftJoin('users', 'bids.created_by', '=', 'users.id') // join users
        ->select(
            'bids.*',
            'client.client_name',
            'client.phone',
            'users.name as created_by_name', // fetch creator name
            'client_contacts.name as contact_name'
        )
        ->orderBy('bids.id', 'desc')
        ->get();

    $users = DB::table('users')->get();
    $clients = DB::table('client')->get();

    $body['bids'] = $bids;
    $body['users'] = $users;
    $body['clients'] = $clients;

    $body['bodyView'] = view('admin/bids/bidslist', $body);
    return LayoutController::loadAdmin($body);
}


// public function search(Request $request)
// {
//     dd($request->all());
//     $keyword = $request->keyword;
//     $user = $request->user;       // <-- user filter
//     $client = $request->client;
//     $status = $request->status;

//     $query = DB::table('bids')
//         ->leftJoin('client', 'bids.client_id', '=', 'client.id')
//         ->leftJoin('users', 'bids.created_by', '=', 'users.id') // join users
//         ->select(
//             'bids.*',
//             'client.client_name',
//             'client.phone',
//             'users.name as created_by_name' // fetch creator name
//         )
//         ->orderBy('bids.id', 'DESC');

//     // Keyword search (bid name or client)
//     if ($keyword) {
//         $query->where(function ($q) use ($keyword) {
//             $q->where('bids.bid_name', 'LIKE', "%$keyword%")
//               ->orWhere('client.client_name', 'LIKE', "%$keyword%");
//         });
//     }

//     // Filter by User
//     if ($user) {
//         $query->where('bids.created_by', $user);
//     }

//     // Filter by Client
//     if ($client) {
//         $query->where('bids.client_id', $client);
//     }

//     // Filter by Status
//     if ($status) {
//         $query->where('bids.status', $status);
//     }

//     $bids = $query->get();

//     // ==============================
//     //        HTML OUTPUT
//     // ==============================
//     $html = '<div class="table-responsive mt-3">
//         <table class="table table-bordered table-hover table-striped" id="bidsTable">
//             <thead>
//                 <tr>
//                     <th>SR.NO</th>
//                     <th>ID</th>
//                     <th>Bid Name</th>
//                     <th>Client</th>
//                     <th>Phone</th>
//                     <th>Status</th>
//                     <th>Created By</th>
//                     <th>Info</th>
//                     <th class="text-center">Actions</th>
//                 </tr>
//             </thead>
//             <tbody>';

//     if ($bids->count() == 0) {
//         $html .= '<tr><td colspan="8" class="text-center">No Records Found</td></tr>';
//     }
// $i=1;
//     foreach ($bids as $bid) {
//         $html .= '<tr>
//             <td>'.( $i++ ).'</td>
//             <td>'.($bid->bid_id).'</td>
//             <td>'.($bid->bid_name ?? '-').'</td>
//             <td>'.($bid->client_name ?? '-').'</td>
//             <td>'.($bid->phone ?? '-').'</td>
//             <td>'.($bid->status ?? '-').'</td>
//             <td>'.($bid->created_by_name ?? '-').'</td>
//             <td>
//                 '.date("m/d/Y h:i A", strtotime($bid->created_at)).'
               
//             </td>
//             <td class="text-center">
//                 <a class="btn btn-primary btn-sm" href="/admin/bid/edit/'.$bid->id.'">
//                     <i class="fas fa-edit"></i>
//                 </a>
//                 <a class="btn btn-info btn-sm" href="/admin/bid/view/'.$bid->id.'">
//                     <i class="fas fa-eye"></i>
//                 </a>
//                 <a class="btn btn-danger btn-sm"
//                     onclick="return confirm(\'Delete this bid?\')"
//                     href="/admin/bid/delete/'.$bid->id.'">❌</a>
//             </td>
//         </tr>';
//     }

//     $html .= '</tbody></table></div>';

//     return response()->json(['html' => $html]);
// }

public function search(Request $request)
{
    $keyword = $request->keyword;
    $user    = $request->user;
    $client  = $request->client;
    $status  = $request->status;

    $query = DB::table('bids')
        ->leftJoin('client', 'bids.client_id', '=', 'client.id')
        ->leftJoin('users', 'bids.created_by', '=', 'users.id')
        ->select(
            'bids.*',
            'client.client_name',
            'client.phone',
            'users.name as created_by_name'
        )
        ->orderBy('bids.id', 'DESC');

    // ✅ Keyword Filter
    if ($request->filled('keyword')) {
        $query->where(function ($q) use ($keyword) {
            $q->where('bids.bid_name', 'LIKE', "%{$keyword}%")
              ->orWhere('client.client_name', 'LIKE', "%{$keyword}%");
        });
    }

    // ✅ User Filter
    if ($request->filled('user')) {
        $query->where('bids.created_by', $user);
    }

    // ✅ CLIENT FILTER (FIXED)
    if ($request->filled('client')) {
        $query->where('bids.client_id', '=', $client);
    }

    // ✅ Status Filter
    if ($request->filled('status')) {
        $query->where('bids.status', $status);
    }

    $bids = $query->get();

    $html = '<div class="table-responsive mt-3">
    <table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped" id="bidsTable">
    <thead>
        <tr>
            <th>SR.NO</th>
            <th>ID</th>
            <th>Bid Name</th>
            <th>Client</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Info</th>
            <th class="text-center">Actions</th>
        </tr>
    </thead>
    <tbody>';

    if ($bids->isEmpty()) {
        $html .= '<tr><td colspan="9" class="text-center">No Records Found</td></tr>';
    } else {
        $i = 1;
        foreach ($bids as $bid) {
            $statusBadge = '';
            if ($bid->status == 'Won') {
                $statusBadge = '<span class="badge bg-success">Won</span>';
            } elseif ($bid->status == 'Lost') {
                $statusBadge = '<span class="badge bg-danger">Lost</span>';
            } else {
                $statusBadge = '<span class="badge bg-warning text-dark">Open</span>';
            }
            $html .= '<tr>
                <td>'.$i++.'</td>
                <td>'.$bid->bid_id.'</td>
                <td>'.$bid->bid_name.'</td>
                <td>'.$bid->client_name.'</td>
                <td>'.$bid->phone.'</td>
                <td>'.$statusBadge.'</td>
                <td>'.$bid->created_by_name.'</td>
                <td>'.date("m/d/Y h:i A", strtotime($bid->created_at)).'</td>
                <td class="text-center">
                    <a class="btn btn-primary btn-sm" href="/admin/bid/edit/'.$bid->id.'">
                        <i class="fas fa-edit"></i>
                    </a>
                    <a class="btn btn-info btn-sm" href="/admin/bid/view/'.$bid->id.'">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a class="btn btn-danger btn-sm" onclick="return confirm(\'Delete this bid?\')" href="/admin/bid/delete/'.$bid->id.'">
                        ❌
                    </a>
                </td>
            </tr>';
        }
    }

    $html .= '</tbody></table></div>';

    return response()->json(['html' => $html]);
}





    // ------------------------------
    // 1️⃣ ADD VIEW
    // ------------------------------
   public function add()
{
    // Get users except developers
    $data['users'] = User::whereDoesntHave('role', function ($q) {
        $q->where('role', 'Developer');
    })
    ->with('role')
    ->get();

    // Get clients list
    $data["clients"] = DB::table('client')
                        ->orderByDesc('id')
                        ->get();
    $data["countries"] = DB::table('countries')
                        ->orderBy('id','ASC')
                        ->get();

    // Get Bid Categories List (from bid_categories table)
    $data["categories"] = DB::table('bid_categories')
                            ->orderBy('name', 'ASC')
                            ->get();

                            // Fetch Bid Types (with description)
    $data["bidTypes"] = DB::table('bid_types')
        ->orderBy('name', 'ASC')
        ->get();
    // Load Add View
    $body['bodyView'] = view('admin/bids/addbid', $data);
    return LayoutController::loadAdmin($body);
}

public function getclientContacts($client_id)
{
    // Get client contacts
    $contacts = DB::table('client_contacts as cc')
        ->where('cc.client_id', $client_id)
        ->orderByDesc('cc.is_primary')
        ->orderBy('cc.name')
        ->select('cc.id', 'cc.name', 'cc.phone', 'cc.is_primary')
        ->get();

    // Get Sales Rep name from client table via users table
    $salesRep = DB::table('client as c')
        ->leftJoin('users as u', 'c.sales_rep', '=', 'u.id')
        ->where('c.id', $client_id)
        ->select('u.name as sales_rep_name')
        ->first();

    return response()->json([
        'contacts'      => $contacts,
        'sales_rep'     => $salesRep->sales_rep_name ?? ''
    ]);
}


    public function getBookingData(Request $request)
    {
        $bidId = $request->input('bid_id') ?? $request->query('bid_id');

        if (empty($bidId)) {
            return response()->json(['status' => 0, 'message' => 'Missing bid_id.']);
        }

        $rows = DB::table('bid_options as bo')
            ->leftJoin('countries as c', 'bo.country', '=', 'c.id')
            ->leftJoin('bids as b', 'bo.bid_id', '=', 'b.id')
            ->select(
                'bo.id as option_id',
                'bo.bid_id',
                'c.name as country_name',
                'bo.target_audience',
                'bo.audience_type',
                'bo.device_type',
                'bo.n',
                'bo.ir',
                'bo.loi',
                'bo.cpi',
                'bo.revenue',
                'bo.notes',
                'b.bid_id',
                'b.bid_amount',
                'b.created_at'
            )
            ->where('bo.bid_id', $bidId)
            ->get();

        if ($rows->isEmpty()) {
            return response()->json(['status' => 0, 'message' => 'No options found for this bid.']);
        }

        return response()->json([
            'status' => 1,
            'bid_info' => [
                'bid_number' => $rows[0]->bid_id,
                'bid_value'  => $rows[0]->bid_amount,
                'created_at' => $rows[0]->created_at
            ],
            'booked_rows' => $rows
        ]);
    }



    // ------------------------------
    // 2️⃣ STORE SPECIFICATIONS
    // ------------------------------
//    public function storeSpecifications(Request $request)
// {

//    // dd($request->all());
//     $validator = Validator::make($request->all(), [
//         'bid_name'        => 'required|string|max:255',
//         'client_id'       => 'required|integer',
//         'sales_rep'       => 'required|string|max:100',
//         'client_contact'  => 'required|string|max:100',
//         'created_by'      => 'required|integer',
//         'bid_type_id'        => 'required|string|max:50',
//         'category_id'    => 'required|string|max:100',
//         'audience_type'   => 'required|string|max:100',
//         'status'          => 'required|in:Open,Closed',
//         'email_reference' => 'nullable|string|max:255',
//         'notes'           => 'nullable|string',

//         // ✅ multiple files validation
//         'bid_files.*'     => 'file|mimes:csv,txt,pdf,doc,docx,xls,xlsx|max:5120',
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
//     }

//     // ================= BID INSERT / UPDATE =================

//     if ($request->bid_id) {

//         DB::table('bids')->where('id', $request->bid_id)->update([
//             'bid_name'        => $request->bid_name,
//             'client_id'       => $request->client_id,
//             'sales_rep'       => $request->sales_rep,
//             'client_contact'  => $request->client_contact,
//             'created_by'      => $request->created_by,
//             'bid_type'        => $request->bid_type_id,
//             'bid_category'    => $request->category_id,
//             'audience_type'   => $request->audience_type,
//             'status'          => $request->status,
//             'email_reference' => $request->email_reference,
//             'notes'           => $request->notes,
//             'updated_at'      => now(),
//         ]);

//         $bidId = $request->bid_id;

//     } else {

//         $bidId = DB::table('bids')->insertGetId([
//             'bid_id'          => 'BID-' . strtoupper(uniqid()),
//             'bid_name'        => $request->bid_name,
//             'client_id'       => $request->client_id,
//             'sales_rep'       => $request->sales_rep,
//             'client_contact'  => $request->client_contact,
//             'created_by'      => $request->created_by,
//             'bid_type'        => $request->bid_type_id,
//             'bid_category'    => $request->category_id,
//             'audience_type'   => $request->audience_type,
//             'status'          => $request->status,
//             'email_reference' => $request->email_reference,
//             'notes'           => $request->notes,
//             'created_at'      => now(),
//             'updated_at'      => now(),
//         ]);
//     }

//     // ================= MULTIPLE FILE SAVE =================

//     if ($request->hasFile('bid_files')) {

//         foreach ($request->file('bid_files') as $file) {

//             $filename = time() . '_' . uniqid() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());

//             $filePath = $file->storeAs('uploads/bids', $filename, 'public');

//             DB::table('bidfiles')->insert([
//                 'bid_id'     => $bidId,
//                 'file'       => $filePath,
//                 'created_at' => now(),
//                 'updated_at' => now(),
//             ]);
//         }
//     }

//    return response()->json([
//     'status'  => 1,
//     'message' => 'Bid saved successfully',
//     'bid_id'  => $bidId
// ]);

// }

public function storeSpecifications(Request $request)
{
    $validator = Validator::make($request->all(), [
        'bid_name'        => 'required|string|max:255',
        'client_id'       => 'required|integer',
        'sales_rep'       => 'required|string|max:100',
        'client_contact'  => 'required|string|max:100',
        'created_by'      => 'required|integer',
        'bid_type_id'     => 'required|string|max:50',
        'category_id'     => 'required|string|max:100',
        'audience_type'   => 'required|string|max:100',
        'status'          => 'required|in:Open,Sent,Won,Closed,Pass',
        'email_reference' => 'nullable|string|max:255',
        'notes'           => 'nullable|string',
        'bid_files.*'     => 'file|mimes:csv,txt,pdf,doc,docx,xls,xlsx|max:5120',
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
    }

    // ================= CHECK EXISTING BID =================

    $existingBid = null;

    // Priority 1: if bid_id is sent from frontend
    if ($request->bid_id) {
        $existingBid = DB::table('bids')->where('id', $request->bid_id)->first();
    }

    // Priority 2 (SAFETY): prevent duplicates if button clicked again
    if (!$existingBid) {
        $existingBid = DB::table('bids')
            ->where('bid_name', $request->bid_name)
            ->where('client_id', $request->client_id)
            ->first();
    }

    // ================= INSERT OR UPDATE =================

    if ($existingBid) {

        // ✅ UPDATE EXISTING
        DB::table('bids')->where('id', $existingBid->id)->update([
            'bid_name'        => $request->bid_name,
            'client_id'       => $request->client_id,
            'sales_rep'       => $request->sales_rep,
            'client_contact'  => $request->client_contact,
            'created_by'      => $request->created_by,
            'bid_type'        => $request->bid_type_id,
            'bid_category'    => $request->category_id,
            'audience_type'   => $request->audience_type,
            'status'          => $request->status,
            'email_reference' => $request->email_reference,
            'notes'           => $request->notes,
            'updated_at'      => now(),
        ]);

        $bidId = $existingBid->id;

    } else {

        // ✅ INSERT ONLY IF NOT EXISTS
        $bidId = DB::table('bids')->insertGetId([
            'bid_id'          => 'BID-' . strtoupper(uniqid()),
            'bid_name'        => $request->bid_name,
            'client_id'       => $request->client_id,
            'sales_rep'       => $request->sales_rep,
            'client_contact'  => $request->client_contact,
            'created_by'      => $request->created_by,
            'bid_type'        => $request->bid_type_id,
            'bid_category'    => $request->category_id,
            'audience_type'   => $request->audience_type,
            'status'          => $request->status,
            'email_reference' => $request->email_reference,
            'notes'           => $request->notes,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
    }

    // ================= MULTIPLE FILE SAVE =================

    if ($request->hasFile('bid_files')) {
        foreach ($request->file('bid_files') as $file) {

            $filename = time() . '_' . uniqid() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $filePath = $file->storeAs('uploads/bids', $filename, 'public');

            DB::table('bidfiles')->insert([
                'bid_id'     => $bidId,
                'file'       => $filePath,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
  $q=DB::table('bids')->where('id',$bidId)->first();
 
    return response()->json([
        'status'  => 1,
        'message' => 'Bid saved successfully',
        'bid_id'  => $bidId,
        'bidnumber'  => $q->bid_id,
        'created'  => $q->created_at
    ]);
}

    // ------------------------------
    // 3️⃣ STORE BID OPTIONS
    // ------------------------------
    // public function storeBidOptions(Request $request)
    // {
        
    //     $validator = Validator::make($request->all(), [
    //         'bid_id' => 'required|integer',
    //         'options' => 'required|array',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
    //     }

    //     foreach ($request->options as $opt) {
    //         DB::table('bid_options')->insert([
    //             'bid_id' => $request->bid_id,
    //             'country' => $opt['country'] ?? '',
    //             'target_audience' => $opt['target_audience'] ?? '',
    //             'audience_type' => $opt['audience_type'] ?? '',
    //             'device_type' => $opt['device_type'] ?? '',
    //             'n' => $opt['n'] ?? 0,
    //             'ir' => $opt['ir'] ?? 0,
    //             'loi' => $opt['loi'] ?? 0,
    //             'cpi' => $opt['cpi'] ?? 0,
    //             'feasibility' => $opt['feasibility'] ?? 0,
    //             'fieldwork_days' => $opt['fieldwork_days'] ?? 0,
    //             'revenue' => $opt['revenue'] ?? 0,
    //             'notes' => $opt['notes'] ?? '',
    //             'created_at' => now(),
    //             'updated_at' => now(),
    //         ]);
    //     }

    //     // ✅ Update project with bid options data
    //     $firstOpt = $request->options[0] ?? [];
    //     DB::table('projects')->where('bid_id', $request->bid_id)->update([
    //         'cost_per_complete' => $firstOpt['cpi'] ?? 0,
    //         'ir' => $firstOpt['ir'] ?? 0,
    //         'loi' => $firstOpt['loi'] ?? 0,
    //         'max_limit' => $firstOpt['n'] ?? 0,
           
    //     ]);

    //     return response()->json([
    //         'status' => 1,
    //         'message' => 'Bid options saved successfully!',
    //     ]);
    // }
   public function storeBidOptions(Request $request)
{
    $validator = Validator::make($request->all(), [
        'bid_id' => 'required|integer',
        'options' => 'required|array',
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
    }
$bidId = $request->bid_id;

// ✅ remove old options of this bid first
DB::table('bid_options')->where('bid_id', $bidId)->delete();
    foreach ($request->options as $opt) {

        // ✅ CHECK IF SAME OPTION ALREADY EXISTS
        $exists = DB::table('bid_options')
            ->where('bid_id', $request->bid_id)
            ->where('country', $opt['country'] ?? '')
            ->where('target_audience', $opt['target_audience'] ?? '')
            ->where('audience_type', $opt['audience_type'] ?? '')
            ->where('device_type', $opt['device_type'] ?? '')
            ->where('n', $opt['n'] ?? 0)
            ->where('ir', $opt['ir'] ?? 0)
            ->where('loi', $opt['loi'] ?? 0)
            ->where('cpi', $opt['cpi'] ?? 0)
            ->exists();

        if ($exists) {
            continue;
        }

        DB::table('bid_options')->insert([
            'bid_id' => $request->bid_id,
            'country' => $opt['country'] ?? '',
            'target_audience' => $opt['target_audience'] ?? '',
            'audience_type' => $opt['audience_type'] ?? '',
            'device_type' => $opt['device_type'] ?? '',
            'n' => $opt['n'] ?? 0,
            'ir' => $opt['ir'] ?? 0,
            'loi' => $opt['loi'] ?? 0,
            'cpi' => $opt['cpi'] ?? 0,
            'feasibility_n' => $opt['feasibility_n'] ?? 0,
            'fieldwork_days' => $opt['fieldwork_days'] ?? 0,
            'revenue' => $opt['revenue'] ?? 0,
            'notes' => $opt['notes'] ?? '',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    // ✅ Update project with first option data
    $firstOpt = $request->options[0] ?? [];

    DB::table('projects')->where('bid_id', $request->bid_id)->update([
        'cost_per_complete' => $firstOpt['cpi'] ?? 0,
        'ir' => $firstOpt['ir'] ?? 0,
        'loi' => $firstOpt['loi'] ?? 0,
        'max_limit' => $firstOpt['n'] ?? 0,
    ]);

    // ✅ CALCULATE TOTAL REVENUE = BID VALUE
    $bidValue = DB::table('bid_options')
        ->where('bid_id', $request->bid_id)
        ->sum('revenue');

    // ✅ Update bids table
    DB::table('bids')
        ->where('id', $request->bid_id)
        ->update([
            'bid_amount' => $bidValue,
            'updated_at' => now()
        ]);

    // ✅ Get latest bid info for header display
    $bid = DB::table('bids')->where('id', $request->bid_id)->first();

    return response()->json([
        'status'     => 1,
        'message'    => 'Bid options saved & Bid value updated!',
        'bid_value'  => $bidValue,
        'bidnumber'  => $bid->bid_id ?? '',
        'created'    => $bid->created_at ?? '',
        'bidvalue'    => $bidValue
    ]);
}


    // ------------------------------
    // 4️⃣ STORE BOOKING
    // ------------------------------
   public function storeBooking(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bid_id' => 'required|integer',
            'pm_user' => 'required|integer',
            'booking_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // ✅ Insert new booking record
            $bookingId = DB::table('bookings')->insertGetId([
                'bid_id'        => $request->bid_id,
                'pm_user'       => $request->pm_user,
                'notes' => $request->booking_notes ?? null,
                'status'        => 'Pending',
                'created_at'    => now(),
               
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Booking saved successfully!',
                'booking_id' => $bookingId,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to store booking: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ------------------------------
// 5️⃣ SEND BOOKING EMAIL
// ------------------------------
public function sendBookingEmail(Request $request)
{
    $validator = Validator::make($request->all(), [
        'bid_id' => 'required|integer',
        'pm_user' => 'required|integer',
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
    }

    $pm = DB::table('users')->find($request->pm_user);
    $bid = DB::table('bids')->find($request->bid_id);

    if (!$pm || !$bid) {
        return response()->json(['status' => false, 'message' => 'Invalid PM or Bid data.']);
    }

    try {
        // ⚙️ Optional mail logic (safe even if mail not set up)
        if (config('mail.mailers.smtp.transport')) {
            \Mail::raw(
                "Booking assigned for Bid: {$bid->bid_name} ({$bid->bid_id})",
                function ($message) use ($pm, $bid) {
                    $message->to($pm->email)
                            ->subject("New Booking Assigned - {$bid->bid_name}");
                }
            );
        }

        DB::table('projects')->where('bid_id', $bid->id)->update([
            'booking_email_sent' => 1,
            'updated_at' => now(),
        ]);

        return response()->json(['status' => true, 'message' => 'Booking email sent successfully!']);
    } catch (\Throwable $e) {
        return response()->json(['status' => false, 'message' => 'Mail not sent: ' . $e->getMessage()]);
    }
}

// ------------------------------
// 6️⃣ CREATE PROJECT FROM BOOKING
// ------------------------------
// public function projectadd(Request $request)
// {
//     $validator = Validator::make($request->all(), [
//         'bid_id'    => 'required|integer',
//         'option_id' => 'required|integer',
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
//     }

//     try {
//         DB::beginTransaction();

//         // 1️⃣ Fetch Bid
//         $bid = DB::table('bids')->where('id', $request->bid_id)->first();
//         if (!$bid) {
//             return response()->json(['status' => false, 'message' => 'Bid not found.']);
//         }

//         // 2️⃣ Fetch ONLY selected option (IMPORTANT FIX)
//         $bidOption = DB::table('bid_options')
//             ->where('bid_id', $request->bid_id)
//             ->where('id', $request->option_id)
//             ->first();

//         if (!$bidOption) {
//             return response()->json(['status' => false, 'message' => 'Selected option not found.']);
//         }

//         // 3️⃣ Check if project already exists for this option
//         $existingProject = DB::table('projects')
//             ->where('bid_id', $bid->id)
//             ->where('option_id', $bidOption->id)
//             ->first();

//         if ($existingProject) {
//             return response()->json([
//                 'status' => false,
//                 'message' => 'Project already exists for this option.'
//             ]);
//         }

//         // Fetch booking info
//         $booking = DB::table('bookings')->where('bid_id', $bid->id)->first();

//         // 4️⃣ Create Project for ONLY this option
//         $projectId = DB::table('projects')->insertGetId([
//             'project_id' => SerialMaster::generateSerialNumber('PROJECT'),
//             'bid_id'     => $bid->id,
//             'option_id'  => $bidOption->id,
//             'client_id'  => $bid->client_id,
//             'project_type'  => $bid->bid_type,
//             'category'  => $bid->bid_category,
//             'audience_type'  => $bid->audience_type,
//             'sales_rep'  => $bid->sales_rep,
//             'sales_rep'  => $bid->sales_rep,
//             'currency'  => $bid->currency,
//             'email_reference'  => $bid->email_reference,
//             'client_contact_id'  => $bid->client_contact,
//             'name'       => $bid->bid_name . ' - ' . ($bidOption->option_name ?? 'Option ' . $bidOption->id),
//             'pm_user'    => $booking->pm_user ?? null,
//             'booking_notes' => $booking->booking_notes ?? null,
//             'country'       => $bidOption->country,
//             'audience_type' => $bidOption->audience_type,
//             'device_type'   => $bidOption->device_type,
//             'max_limit'     => $bidOption->n ?? 0,
//             'ir'            => $bidOption->ir ?? 0,
//             'loi'           => $bidOption->loi ?? 0,
//             'cost_per_complete' => $bidOption->cpi ?? 0,
//             'feasibility'   => $bidOption->feasibility ?? 0,
//             'fieldwork_days'=> $bidOption->fieldwork_days ?? 0,
//             'revenue'       => $bidOption->revenue ?? 0,
//             'status'        => 'Live',
//             'date'          => now(),
//             'created_at'    => now(),
//         ]);

//         DB::commit();
//         $project=DB::table('projects')->where('id',$projectId)->first();
//         return response()->json([
//             'status' => true,
//             'message' => 'Project created successfully!',
//             'project_id' => $project->project_id
//         ]);

//     } catch (\Exception $e) {
//         DB::rollBack();

//         return response()->json([
//             'status' => false,
//             'message' => 'Error creating project: ' . $e->getMessage()
//         ], 500);
//     }
// }

public function projectadd(Request $request)
{
    $validator = Validator::make($request->all(), [
        'bid_id' => 'required|integer'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        DB::beginTransaction();

        // 1️⃣ Fetch Bid
        $bid = DB::table('bids')->where('id', $request->bid_id)->first();
        if (!$bid) {
            return response()->json([
                'status' => false,
                'message' => 'Bid not found.'
            ]);
        }

        // 2️⃣ Fetch ANY option of this bid (first one)
        $bidOption = DB::table('bid_options')
            ->where('bid_id', $bid->id)
            ->first();

        if (!$bidOption) {
            return response()->json([
                'status' => false,
                'message' => 'No options found for this bid.'
            ]);
        }

        // 3️⃣ Check if project already exists for this bid
        $existingProject = DB::table('projects')
            ->where('bid_id', $bid->id)
            ->first();

        if ($existingProject) {
            return response()->json([
                'status' => false,
                'message' => 'Project already created for this bid.'
            ]);
        }

        // Fetch booking info
        $booking = DB::table('bookings')
            ->where('bid_id', $bid->id)
            ->first();

        // 4️⃣ Create new project
        $projectId = DB::table('projects')->insertGetId([
            'project_id' => SerialMaster::generateSerialNumber('PROJECT'),
            'bid_id'     => $bid->id,
            'option_id'  => $bidOption->id, // still store option id internally
            'client_id'  => $bid->client_id,
            'project_type'  => $bid->bid_type,
            'category'      => $bid->bid_category,
            'audience_type' => $bid->audience_type,
            'sales_rep'     => $bid->sales_rep,
            'currency'      => $bid->currency,
            'email_reference' => $bid->email_reference,
            'client_contact_id' => $bid->client_contact,

            // project name format
            'name' => $bid->bid_name . ' - ' . ($bidOption->option_name ?? 'Default Option'),

            // booking info
            'pm_user'       => $booking->pm_user ?? null,
            'booking_notes' => $booking->booking_notes ?? null,

            // option details
            'country'        => $bidOption->country,
            'audience_type'  => $bidOption->audience_type,
            'device_type'    => $bidOption->device_type,
            'max_limit'      => $bidOption->n ?? 0,
            'ir'             => $bidOption->ir ?? 0,
            'loi'            => $bidOption->loi ?? 0,
            'cost_per_complete' => $bidOption->cpi ?? 0,
            'feasibility'    => $bidOption->feasibility ?? 0,
            'fieldwork_days' => $bidOption->fieldwork_days ?? 0,
            'revenue'        => $bidOption->revenue ?? 0,

            'status'        => 'Live',
            'date'          => now(),
            'created_at'    => now(),
        ]);

        DB::commit();

        $project = DB::table('projects')->where('id', $projectId)->first();

        return response()->json([
            'status' => true,
            'message' => 'Project created successfully!',
            'project_id' => $project->project_id
        ]);

    } catch (\Exception $e) {

        DB::rollBack();

        return response()->json([
            'status' => false,
            'message' => 'Error creating project: ' . $e->getMessage()
        ], 500);
    }
}




// ------------------------------
// 7️⃣ VIEW PROJECT REDIRECT
// ------------------------------
public function viewProjects($bid_id)
{
    // dd('viewProjects triggered with ID => ' . $bid_id);

    // ================= BID HEADER =================
    $result['bidDetails'] = DB::table('bids as b')
        ->leftJoin('client as c', 'c.id', '=', 'b.client_id')
        ->leftJoin('bookings as bk', 'bk.bid_id', '=', 'b.id') // ✅ join bookings
        ->leftJoin('users as u', 'u.id', '=', 'bk.pm_user')     // ✅ pm user from bookings
        ->leftJoin('projects as p', 'p.bid_id', '=', 'b.id')
        ->leftJoin('vendor as v', 'v.project_id', '=', 'p.id')
        ->where('b.id', $bid_id)
        ->select(
            'b.id as bid_id',
            'b.bid_id',
            'b.bid_name',
            'b.status',
            'c.client_name',
            'u.name as pm_name', // ✅ now correct PM name
            DB::raw('COALESCE(SUM(b.bid_amount),0) as revenue')
        )
        ->groupBy(
            'b.id',
            'b.bid_id',
            'b.bid_name',
            'b.status',
            'c.client_name',
            'u.name'
        )
        ->first();


    // ================= PROJECT LIST =================
   

// Query 1: Project List
$result["projectsList"] = DB::table('projects')
    ->join('client', 'client.id', '=', 'projects.client_id')
    ->leftJoin('vendor', 'vendor.project_id', '=', 'projects.id')
    ->select(
        'projects.id',
        'projects.project_id',
        'projects.client_id',
        'projects.bid_id',
        'projects.name',
        'projects.cost_per_complete',
        'projects.ir',
        'projects.loi',
        'projects.status',
        'client.client_name',
        DB::raw('COALESCE(SUM(vendor.complete_count),0) AS complete_count'),
        DB::raw('COALESCE(SUM(vendor.terminates_count),0) AS terminates_count')
    )
    ->where('projects.bid_id', $bid_id)
    ->groupBy(
        'projects.id',
        'projects.project_id',
        'projects.client_id',
        'projects.bid_id',
        'projects.name',
        'projects.cost_per_complete',
        'projects.ir',
        'projects.loi',
        'projects.status',
        'client.client_name'
    )
    ->orderBy('projects.id','DESC')
    ->get();

// Query 2: Bid Options List
$result["optionsList"] = DB::table('bid_options')
    ->leftJoin('countries', 'countries.id', '=', 'bid_options.country')
    ->select(
        'bid_options.*',
        'countries.name as country_name'
    )
    ->where('bid_options.bid_id', $bid_id)
    ->orderBy('bid_options.id','DESC')
    ->get();

            // dd($result["optionsList"]);
    $body['bodyView'] = view('admin/project/project_list_view', $result);
    return LayoutController::loadAdmin($body);
}


public function survey(Request $request, $id)
{
    $data["countries"] = DB::table('countries')
    ->orderBy('id','ASC')
    ->get();

$data['editdata'] = DB::table('bid_options as opt')
    ->leftJoin('bids as b', 'b.id', '=', 'opt.bid_id')
    ->leftJoin('projects as p', 'p.bid_id', '=', 'b.id')
    ->leftJoin('countries as c', 'c.id', '=', 'opt.country')
    ->leftJoin('users as u', 'u.id', '=', 'p.pm_user') // PM User Join
    ->select(
        'opt.*',
        'b.bid_id',
        'b.id as bid',
        'p.project_id as project_id',
        'p.status as project_status',
        'c.name as country_name',
        'u.name as pm_name'         
    )
    ->where('opt.id', $id)
    ->first();

    // dd($data["editdata"]);
    $body['bodyView'] = view('admin/bids/survey', $data);
    return LayoutController::loadAdmin($body);
}
public function updatesurvey(Request $request, $id)
{
    // Validate required fields
    $request->validate([
        's_name'        => 'required|string',
        'country'       => 'required|string',
        'language'      => 'required|string',
        'device_type'   => 'required|string',
        'n'             => 'required|numeric',
        'loi'           => 'required|numeric',
        'ir'            => 'required|numeric',
        'client_cpi'    => 'required|numeric',
        'cpi'           => 'required|numeric',
        'live_url'      => 'nullable|string',
        'test_url'      => 'nullable|string',
        'threat_score'  => 'nullable|numeric',
        'activity_score'=> 'nullable|numeric',
    ]);

    // Convert checkboxes to boolean
    $collects_pii        = $request->has('collects_pii') ? 1 : 0;
    $exclude_survey      = $request->has('exclude_survey') ? 1 : 0;
    $rd_enabled          = $request->has('rd_enabled') ? 1 : 0;
    $rd_activity_enabled = $request->has('rd_activity_enabled') ? 1 : 0;

    try {
        DB::transaction(function () use ($request, $id, $collects_pii, $exclude_survey, $rd_enabled, $rd_activity_enabled) {
            // Update bid_options table
            DB::table('bid_options')
                ->where('id', $id)
                ->update([
                    'target_audience'  => $request->s_name,
                    'country'          => $request->country,
                    'language'         => $request->language,
                    'device_type'      => $request->device_type,
                    'feasibility_n'    => $request->n,
                    'loi'              => $request->loi,
                    'ir'               => $request->ir,
                    'client_cpi'       => $request->client_cpi,
                    'cpi'              => $request->cpi,
                    'live_url_type'    => $request->live_url_type,
                    'live_url'         => $request->live_url,
                    'test_url_type'    => $request->test_url_type,
                    'test_url'         => $request->test_url,
                    'collects_pii'     => $collects_pii,
                    'exclude_survey'   => $exclude_survey,
                    'rd_enabled'       => $rd_enabled,
                    'threat_score'     => $request->threat_score,
                    'rd_activity_enabled'=> $rd_activity_enabled,
                    'activity_score'   => $request->activity_score,
                ]);

        });
$bidr=$request->bid;
        // Success: redirect to your route
        return redirect()->to("admin/bid/{$bidr}/projects")
                         ->with('success', 'Survey updated successfully!');

    } catch (\Exception $e) {
        // Failed: stay on page & show error
        return redirect()->back()
                         ->withInput()
                         ->with('error', 'Update failed: ' . $e->getMessage());
    }
}

public function delete($id)
{
    DB::beginTransaction();

    try {

        // Delete related data (safe even if no rows exist)
        if (Schema::hasTable('bid_option')) {
            DB::table('bid_option')->where('bid_id', $id)->delete();
        }

        if (Schema::hasTable('bidfiles')) {
            DB::table('bidfiles')->where('bid_id', $id)->delete();
        }

        if (Schema::hasTable('booking')) {
            DB::table('booking')->where('bid_id', $id)->delete();
        }

        if (Schema::hasTable('projects')) {
            DB::table('projects')->where('bid_id', $id)->delete();
        }

        // Delete main bid
        $deleted = DB::table('bids')->where('id', $id)->delete();

        if ($deleted === 0) {
            throw new \Exception('Bid not found or already deleted.');
        }

        DB::commit();

        return redirect()->back()
            ->with('message', 'Bid and all related data deleted successfully!');

    } catch (\Exception $e) {

        DB::rollBack();

        // IMPORTANT: show real error during development
        return redirect()->back()
            ->with('error', $e->getMessage());
    }
}
public function editSpec($id)
{
    // Fetch the bid
    $bid = DB::table('bids')->where('id', $id)->first();
    if (!$bid) {
        return redirect()->back()->with('error', 'Bid not found.');
    }

    // Get users except developers
    $users = User::whereDoesntHave('role', function ($q) {
        $q->where('role', 'Developer');
    })
    ->with('role')
    ->get();

    // Get clients list
    $clients = DB::table('client')
                ->orderByDesc('id')
                ->get();

    // Get countries list
    $countries = DB::table('countries')
                ->orderBy('id', 'ASC')
                ->get();

    // Get Bid Categories List
    $categories = DB::table('bid_categories')
                    ->orderBy('name', 'ASC')
                    ->get();

    // Fetch Bid Types (with description)
    $bidTypes = DB::table('bid_types')
        ->orderBy('name', 'ASC')
        ->get();

    // Prepare data for view
    $data = [
        'bid' => $bid,
        'users' => $users,
        'clients' => $clients,
        'countries' => $countries,
        'categories' => $categories,
        'bidTypes' => $bidTypes
    ];

    // Load Edit View (reuse addbid blade or create separate edit blade)
    $body['bodyView'] = view('admin/bids/editbid', $data);
    return LayoutController::loadAdmin($body);
}
public function updateSpec (Request $request)
{
    // Validate input
    $request->validate([
        'bid_name'       => 'required|string|max:255',
        'client_id'      => 'required|integer|exists:client,id',
        'sales_rep'      => 'required|string|max:255',
        'client_contact' => 'required|string|max:255',
        'bid_type_id'    => 'nullable|integer|exists:bid_types,id',
        'category_id'    => 'required|integer|exists:bid_categories,id',
        'audience_type'  => 'required|string',
        'status'         => 'required|string',
        'currency'       => 'required|string',
        'notes'          => 'nullable|string',
        'bid_files.*'    => 'nullable|file|mimes:csv,pdf,doc,docx,xls,xlsx,txt|max:10240', // 10MB max
    ]);


$id=$request->bid_id;
    // Find the bid
    $bid = \DB::table('bids')->where('id', $id)->first();
    if (!$bid) {
        return redirect()->back()->with('error', 'Bid not found');
    }

    // Update fields
    $updateData = [
        'bid_name'           => $request->bid_name,
        'client_id'      => $request->client_id,
        'sales_rep'      => $request->sales_rep,
        'client_contact' => $request->client_contact,
        'bid_type'    => $request->bid_type_id,
        'bid_category'    => $request->category_id,
        'audience_type'  => $request->audience_type,
        'email_reference'  => $request->email_reference,
        'status'         => $request->status,
        'currency'       => $request->currency,
        'notes'          => $request->notes,
        'updated_at'     => now(),
    ];

    \DB::table('bids')->where('id', $id)->update($updateData);

    // Handle uploaded files
    if ($request->hasFile('bidfiles')) {
        foreach ($request->file('bid_files') as $file) {
            $filename = time().'_'.$file->getClientOriginalName();
            $file->storeAs('public/bid_files', $filename);

            // Save file info to bid_files table (or any file relation)
            \DB::table('bidfiles')->insert([
                'bid_id'    => $id,
                'file_name' => $filename,
                'created_at'=> now(),
                'updated_at'=> now(),
            ]);
        }
    }

    return redirect()->route('bid.list')->with('message', 'Bid updated successfully');
}



}
