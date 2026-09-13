<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\admin\CommonDataModel;
use App\Models\admin\Projects;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Jenssegers\Agent\Agent;

class URLController extends Controller
{
      private function checkVendorRedirect($vendorId, $status)
    {
        $vendorList = DB::table('vendorlists')->where('vendor_id', $vendorId)->first();
        
        // if ($vendorList) {
        //     switch ($status) {
        //         case 'success':
        //             return redirect()->away($vendorList->success)??'';
        //         case 'terminate':
        //             return redirect()->away($vendorList->terminate)??'';
        //         case 'quotafull':
        //             return redirect()->away($vendorList->quotafull)??'';
        //         case 'screenout':
        //             return redirect()->away($vendorList->screenout)??'';
        //     }
        // }

        // return null;
        
                if ($vendorList) {
         switch ($status) {
        case 'success':
            return $vendorList->success ?: null;
        case 'terminate':
            return $vendorList->terminate ?: null;
        case 'quotafull':
            return $vendorList->quotafull ?: null;
        case 'screenout':
            return $vendorList->screenout ?: null;
        default:
            return null;
    }
                }
    }
    
     private function ReplaceUID($redirect, $uid)
{
    // return str_replace("vmhgroups", $uid, $redirect);
        return str_replace("vmhgroupss", $uid, $redirect);
}

    
    public function completeAction(Request $request, $clientId)
    {
        if (!$request->has('username')) {
            abort(404);
        }


        $username = $request->get('username');

        $leadsInfo = DB::table('leads')->where('id', $username)->first();
        if (empty($leadsInfo)) {
            abort(404);
        }
         $vendorInfo = DB::table('vendor')->where('id', $leadsInfo->vendor_id)->first();
        $pname = DB::table('projects')
    ->where('id', $vendorInfo->project_id)
    ->value('name');
        $clientInfo = DB::table('client')->join('projects', 'projects.client_id', '=', 'client.id')->where(['client.client_id' => $clientId, 'projects.id' => $leadsInfo->project_id])->first();
        
        if (empty($clientInfo) || empty($leadsInfo)) {
            abort(404);
        }

        $leadDate = Carbon::parse($leadsInfo->date);
        $loiInterval = $leadDate->copy()->addMinutes(intval($clientInfo->loi));

        $userInfo = $this->getUserInfo($request);
        // if (strtolower($userInfo['country']) != "india" || Carbon::now()->lte($loiInterval)) {
        //     $vendorInfo = DB::table('vendor')->where('id', $leadsInfo->vendor_id)->first();
        //     CommonDataModel::UpdateSingleTableData('leads', ['status' => 'Terminates', 'client_id' => $clientInfo->id], ['id' => $leadsInfo->id], $leadsInfo->id);
        //     CommonDataModel::UpdateSingleTableData('vendor', ['terminates_count' => $vendorInfo->terminates_count + 1], ['id' => $vendorInfo->id]);
        //     return view('admin/url/terminates', []);
        // }
        $userHitInfo = [
              'name' =>  $pname,
            'uid' => $leadsInfo->uid,
            'pid' => $clientInfo->project_id,
            'ip' => $userInfo['ip_address']
        ];
        
    //     if (Carbon::now()->lte($loiInterval) || $leadsInfo->status != "Pending" && $leadsInfo->status != "Complete") {
    //         $vendorInfo = DB::table('vendor')->where('id', $leadsInfo->vendor_id)->first();
    //         CommonDataModel::UpdateSingleTableData('leads', ['status' => 'Terminates', 'client_id' => $clientInfo->id], ['id' => $leadsInfo->id], $leadsInfo->id);
    //         CommonDataModel::UpdateSingleTableData('vendor', ['terminates_count' => $vendorInfo->terminates_count + 1], ['id' => $vendorInfo->id]);
           
    //         $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'terminate');
    // if ($redirect){
        
    //  $redirectUrl = $redirect;
    // $userId = $leadsInfo->uid;
    // return redirect()->away($this->ReplaceUID($redirectUrl, $userId)); 
    // } else{
    //       $data['userHitInfo'] = array_merge($userHitInfo, ['status' => 'Terminated']);
    //         return view('admin/url/terminates', $data);
    // }
            
          
    //     }
 $vendorInfo = DB::table('vendor')->where('id', $leadsInfo->vendor_id)->first();
        if ($leadsInfo->status == "Pending") {

            CommonDataModel::UpdateSingleTableData('leads', ['status' => 'Complete', 'client_id' => $clientInfo->id], ['id' => $leadsInfo->id], $leadsInfo->id);
            // $vendorInfo = DB::table('vendor')->where('id', $leadsInfo->vendor_id)->first();

            $paymentInfo = DB::table('payments')
                ->join('projects', 'projects.id', '=', 'payments.project_id')
                ->where(['payments.vendor_id' => $vendorInfo->id, 'payments.project_id' => $vendorInfo->project_id])
                ->select('payments.*', 'projects.cost_per_complete as cpi')
                ->orderByDesc('payments.id')
                ->first();

            CommonDataModel::UpdateSingleTableData('payments', ['amount' => $paymentInfo->amount + $paymentInfo->cpi], ['vendor_id' => $vendorInfo->id, 'project_id' => $vendorInfo->project_id], $paymentInfo->id);
            CommonDataModel::UpdateSingleTableData('vendor', ['complete_count' => $vendorInfo->complete_count + 1], ['id' => $vendorInfo->id]);
        }
 $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'success');
    if ($redirect){
          $redirectUrl = $redirect;
          $userId = $leadsInfo->uid;
    return redirect()->away($this->ReplaceUID($redirectUrl, $userId)); 
    }else{
         $data['userHitInfo'] = array_merge($userHitInfo, ['status' => 'Completed']);
        return view('admin/url/complete', $data);
    }
       
    }

    public function terminateAction(Request $request, $clientId)
    {
        if (!$request->has('username')) {
            abort(404);
        }

        $clientInfo = DB::table('client')->join('projects', 'projects.client_id', '=', 'client.id')->where(['client.client_id' => $clientId])->first();
     
        $username = $request->get('username');
        $leadsInfo = DB::table('leads')->where('id', $username)->first();
        if (empty($clientInfo) || empty($leadsInfo)) {
            abort(404);
        }
         
        $userInfo = $this->getUserInfo($request);
         $vendorInfo = DB::table('vendor')->where('id', $leadsInfo->vendor_id)->first();
        $pname = DB::table('projects')
    ->where('id', $vendorInfo->project_id)
    ->value('name');
        
        if ($leadsInfo->status == "Pending") {
            CommonDataModel::UpdateSingleTableData('leads', ['status' => 'Terminates', 'client_id' => $clientInfo->id], ['id' => $leadsInfo->id], $leadsInfo->id);
            // $vendorInfo = DB::table('vendor')->where('id', $leadsInfo->vendor_id)->first();
            CommonDataModel::UpdateSingleTableData('vendor', ['terminates_count' => $vendorInfo->terminates_count + 1], ['id' => $vendorInfo->id]);
        }
  
         $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'terminate');
                
    if ($redirect){
          $redirectUrl = $redirect;
          $userId = $leadsInfo->uid;
    return redirect()->away($this->ReplaceUID($redirectUrl, $userId)); 
    }else{

     $data['userHitInfo'] = [
           'name' => $pname,
            'uid' => $leadsInfo->uid,
            'pid' => $clientInfo->project_id,
            'ip' => $userInfo['ip_address'],
            'status' => 'Terminated'
        ];
        return view('admin/url/terminates', $data);
    }

    }

    public function quotafullAction(Request $request, $clientId)
    {
        if (!$request->has('username')) {
            abort(404);
        }

        $clientInfo = DB::table('client')->join('projects', 'projects.client_id', '=', 'client.id')->where(['client.client_id' => $clientId])->first();
        $username = $request->get('username');
        $leadsInfo = DB::table('leads')->where('id', $username)->first();
        if (empty($clientInfo) || empty($leadsInfo)) {
            abort(404);
        }
         $vendorInfo = DB::table('vendor')->where('id', $leadsInfo->vendor_id)->first();
             $pname = DB::table('projects')
    ->where('id', $vendorInfo->project_id)
    ->value('name');
  $vendorInfo = DB::table('vendor')->where('id', $leadsInfo->vendor_id)->first();
        if ($leadsInfo->status == "Pending") {
            CommonDataModel::UpdateSingleTableData('leads', ['status' => 'Quota Full', 'client_id' => $clientInfo->id], ['id' => $leadsInfo->id], $leadsInfo->id);
        }
        $userInfo = $this->getUserInfo($request);
        $data['userHitInfo'] = [
              'name' => $pname,
            'uid' => $leadsInfo->uid,
            'pid' => $clientInfo->project_id,
            'ip' => $userInfo['ip_address'],
            'status' => 'Quota exceeded',
        ];
                $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'quotafull');
    if ($redirect){
          $redirectUrl = $redirect;
          $userId = $leadsInfo->uid;
    return redirect()->away($this->ReplaceUID($redirectUrl, $userId)); 
    }else{
        return view('admin/url/quotafull', $data);
    }
    }

    public function URLAction(Request $request, $vendorId, $projectUniqueId)
{
    if (!$request->has('user')) {
        abort(404);
    }

    // NEW: Get option ID from URL
    $optId = $request->get('opt'); 
    // IMPORTANT
    if (!$optId) abort(404);

    $userId = $request->get('user');
    $userInfo = $this->getUserInfo($request);

    // FETCH PROJECT FROM project_unique_id
    $projectsInfo = DB::table('projects')
        ->where(['project_id' => $projectUniqueId, 'status' => 'Live'])
        ->first();

    $vendorInfo = DB::table('vendor')
        ->where(['id' => $vendorId, 'is_active' => 'Y'])
        ->first();

    if (empty($projectsInfo) || empty($vendorInfo)) {
        return view('admin/url/inactive', []);
    }

    // NEW: Fetch Entry Link Row
    $entryLink = DB::table('vendor_entry_links')
        ->where([
            'vendor_id'     => $vendorId,
            'project_id'    => $projectsInfo->id,
            'bid_option_id' => $optId
        ])
        ->first();

    if (!$entryLink) {
        return "Invalid entry link – option not found.";
    }

    // Quota check
    $isMaxQuotaReached = Projects::getEventCounts($projectsInfo->id);

    $userHitInfo = [
        'name' => $projectsInfo->name,
        'uid'  => $userId,
        'pid'  => $projectsInfo->project_id,
        'ip'   => $userInfo['ip_address']
    ];

    if ($isMaxQuotaReached->complete_count > $isMaxQuotaReached->max_limit) {

        $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'quotafull');
        if ($redirect) {
            return redirect()->away($this->ReplaceUID($redirect, $userId));
        }

        $data['userHitInfo'] = array_merge($userHitInfo, ['status' => 'Quota exceeded']);
        return view('admin/url/quotafull', $data);
    }

    // Lead duplicate check
    $existingLeads = DB::table('leads')
        ->where(['project_id' => $projectsInfo->id, 'vendor_id' => $vendorId])
        ->whereRaw("JSON_EXTRACT(user_info, '$.ip_address') = ?", [$userInfo['ip_address']])
        ->orderByDesc('id')
        ->first();

    if (empty($existingLeads)) {

        $existingUsername = DB::table('leads')
            ->where(['uid' => $userId, 'project_id' => $projectsInfo->id, 'vendor_id' => $vendorId])
            ->orderByDesc('id')
            ->first();

        if (empty($existingUsername)) {

            $insertedLeadsId = CommonDataModel::insertSingleTableData('leads', [
                'project_id' => $projectsInfo->id,
                'vendor_id'  => $vendorInfo->id,
                'uid'        => $userId,
                'user_info'  => json_encode($userInfo),
                'date'       => now()
            ]);

            DB::table('vendor')->where('id', $vendorId)
                ->update(['clicks_count' => $vendorInfo->clicks_count + 1]);

        } else {

            $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'terminate');
            if ($redirect) {
                return redirect()->away($this->ReplaceUID($redirect, $userId));
            }

            $data['userHitInfo'] = array_merge($userHitInfo, ['status' => 'Terminated']);
            return view('admin/url/terminates', $data);
        }

    } else {

        if ($existingLeads->uid != $userId) {

            $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'terminate');
            if ($redirect) {
                return redirect()->away($this->ReplaceUID($redirect, $userId));
            }

            $data['userHitInfo'] = array_merge($userHitInfo, ['status' => 'Terminated']);
            return view('admin/url/terminates', $data);
        }

        $insertedLeadsId = $existingLeads->id;
    }

    // ⭐ FINAL REDIRECT URL — using vendor_entry_links.live_url
    $finalUrl = $entryLink->live_url . $insertedLeadsId;

    return redirect()->away($finalUrl);
}


    public function getUserInfo(Request $request)
    {
        $agent = new Agent();
        $ip = $request->ip();
        $apiKey = '0F6A60C1B4EB021FD703558A61067E37';
        $url = "https://api.ip2location.io/?key={$apiKey}&ip={$ip}";

        try {
            $response = Http::get($url);
            if ($response->successful()) {
                $data = $response->json();
                $userInfo = [
                    'user_agent' => [
                        'browser' => $agent->browser(),
                        'platform' => $agent->platform(),
                        'device' => $agent->device(),
                    ],
                    'ip_address' => $ip,
                    'country' => $data['country_name'],
                    'region' => $data['region_name'],
                    'city' => $data['city_name'],
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'zip_code' => $data['zip_code'],
                    'time_zone' => $data['time_zone'],
                    'asn' => $data['asn'],
                    'as' => $data['as'],
                    'is_proxy' => $data['is_proxy'],
                ];
                return $userInfo;
            } else {
                return response()->json(['error' => 'Failed to retrieve geolocation information.']);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }
}
