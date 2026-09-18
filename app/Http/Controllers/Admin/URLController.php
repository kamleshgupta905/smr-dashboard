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
     protected $baseUrl = 'https://surveysupply.zamplia.com/api/v1/Surveys/GenerateLink';
    protected $apiKey = 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u';
   private function checkVendorRedirect($vendorId, $status)
{
    $vendor = DB::table('vendor')
        ->where('vendor_id', $vendorId)
        ->first();

    if (!$vendor) {
        return null;
    }

    switch ($status) {

        case 'success':
            return $vendor->redirect_success_url ?: null;

        case 'terminate':
            return $vendor->redirect_quality_termination_url ?: null;

        case 'quotafull':
            return $vendor->redirect_over_quota_url ?: null;

        case 'screenout':
            return $vendor->redirect_fail_url ?: null;

        default:
            return null;
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

    // API Survey me username = uid
    $leadsInfo = DB::table('leads')
        ->where('uid', $username)
        ->first();

    if (empty($leadsInfo)) {
        abort(404);
    }

    // Zamplia Client
    $clientInfo = DB::table('client')
        ->where('client_id', $clientId)
        ->first();

    if (empty($clientInfo)) {
        abort(404);
    }

    // Survey Details
    $surveyInfo = DB::table('api_surveys')
        ->where('id', $leadsInfo->project_id)
        ->first();

    if (empty($surveyInfo)) {
        abort(404);
    }

    $vendorInfo = DB::table('vendor')
        ->where('id', $leadsInfo->vendor_id)
        ->first();

    if (empty($vendorInfo)) {
        abort(404);
    }

    // LOI Check
    $leadDate = Carbon::parse($leadsInfo->date);
    $loiInterval = $leadDate->copy()->addMinutes((int)$surveyInfo->LOI);

    $userInfo = $this->getUserInfo($request);

    $userHitInfo = [
        'name' => $surveyInfo->Name,
        'uid'  => $leadsInfo->uid,
        'pid'  => $surveyInfo->SurveyId,
        'ip'   => $userInfo['ip_address']
    ];

    /*
    |--------------------------------------------------------------------------
    | LOI FAIL / ALREADY COMPLETED
    |--------------------------------------------------------------------------
    */

    if (
        Carbon::now()->lte($loiInterval) ||
        ($leadsInfo->status != "Pending" && $leadsInfo->status != "Complete")
    ) {

        CommonDataModel::UpdateSingleTableData(
            'leads',
            [
                'status'    => 'Terminates',
                'client_id' => $clientInfo->id
            ],
            ['id' => $leadsInfo->id],
            $leadsInfo->id
        );

        /*
        |--------------------------------------------------------------------------
        | OVERALL VENDOR TERMINATE COUNT
        |--------------------------------------------------------------------------
        */

        DB::table('vendor')
            ->where('id', $vendorInfo->id)
            ->increment('terminates_count');

        /*
        |--------------------------------------------------------------------------
        | PROJECT-WISE VENDOR TERMINATE COUNT
        |--------------------------------------------------------------------------
        */

        DB::table('vendor_projects')
            ->where('vendor_id', $vendorInfo->id)
            ->where('project_id', $surveyInfo->SurveyId)
            ->increment('terminates_count');


        $redirect = $this->checkVendorRedirect(
            $vendorInfo->vendor_id,
            'terminate'
        );

        if ($redirect) {
            return redirect()->away(
                $this->ReplaceUID($redirect, $leadsInfo->uid)
            );
        }

        $data['userHitInfo'] = array_merge($userHitInfo, [
            'status' => 'Terminated'
        ]);

        return view('admin/url/terminates', $data);
    }

    /*
    |--------------------------------------------------------------------------
    | COMPLETE
    |--------------------------------------------------------------------------
    */

    if ($leadsInfo->status == "Pending") {

        CommonDataModel::UpdateSingleTableData(
            'leads',
            [
                'status'    => 'Complete',
                'client_id' => $clientInfo->id
            ],
            ['id' => $leadsInfo->id],
            $leadsInfo->id
        );

        /*
        |--------------------------------------------------------------------------
        | VENDOR PAYMENT
        |--------------------------------------------------------------------------
        */

        $paymentInfo = DB::table('payments')
            ->where([
                'vendor_id'  => $vendorInfo->id,
                'project_id' => $surveyInfo->SurveyId
            ])
            ->orderByDesc('id')
            ->first();

        if ($paymentInfo) {

            CommonDataModel::UpdateSingleTableData(
                'payments',
                [
                    'amount' => $paymentInfo->amount + $surveyInfo->CPI
                ],
                [
                    'vendor_id'  => $vendorInfo->id,
                    'project_id' => $surveyInfo->SurveyId
                ],
                $paymentInfo->id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | OVERALL VENDOR COMPLETE COUNT
        |--------------------------------------------------------------------------
        */

        DB::table('vendor')
            ->where('id', $vendorInfo->id)
            ->increment('complete_count');

        /*
        |--------------------------------------------------------------------------
        | PROJECT-WISE VENDOR COMPLETE COUNT
        |--------------------------------------------------------------------------
        */

        DB::table('vendor_projects')
            ->where('vendor_id', $vendorInfo->id)
            ->where('project_id', $surveyInfo->SurveyId)
            ->increment('complete_count');
    }

    /*
    |--------------------------------------------------------------------------
    | VENDOR REDIRECT
    |--------------------------------------------------------------------------
    */

    $redirect = $this->checkVendorRedirect(
        $vendorInfo->vendor_id,
        'success'
    );

    if ($redirect) {
        return redirect()->away(
            $this->ReplaceUID($redirect, $leadsInfo->uid)
        );
    }

    $data['userHitInfo'] = array_merge($userHitInfo, [
        'status' => 'Completed'
    ]);

    return view('admin/url/complete', $data);
}

    public function terminateAction(Request $request, $clientId)
{
    if (!$request->has('username')) {
        abort(404);
    }

    // Zamplia Client
    $clientInfo = DB::table('client')
        ->where('client_id', $clientId)
        ->first();

    $username = $request->get('username');

    // API survey me username = uid
    $leadsInfo = DB::table('leads')
        ->where('uid', $username)
        ->first();

    if (empty($clientInfo) || empty($leadsInfo)) {
        abort(404);
    }

    // Survey Details
    $surveyInfo = DB::table('api_surveys')
        ->where('id', $leadsInfo->project_id)
        ->first();

    if (empty($surveyInfo)) {
        abort(404);
    }

    $userInfo = $this->getUserInfo($request);

    if ($leadsInfo->status == "Pending") {

        CommonDataModel::UpdateSingleTableData(
            'leads',
            [
                'status'    => 'Terminates',
                'client_id' => $clientInfo->id
            ],
            ['id' => $leadsInfo->id],
            $leadsInfo->id
        );

        $vendorInfo = DB::table('vendor')
            ->where('id', $leadsInfo->vendor_id)
            ->first();

        DB::table('vendor_projects')
            ->where('vendor_id', $vendorInfo->id)
            ->where('project_id', $surveyInfo->SurveyId)
            ->increment('terminates_count');
    }

    $data['userHitInfo'] = [
        'name'   => $surveyInfo->Name,
        'uid'    => $leadsInfo->uid,
        'pid'    => $surveyInfo->SurveyId,
        'ip'     => $userInfo['ip_address'],
        'status' => 'Terminated'
    ];

    // Vendor Redirect
    $vendorInfo = DB::table('vendor')
        ->where('id', $leadsInfo->vendor_id)
        ->first();

    $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'terminate');

    if ($redirect) {
        return redirect()->away(
            $this->ReplaceUID($redirect, $leadsInfo->uid)
        );
    }

    return view('admin/url/terminates', $data);
}

    public function quotafullAction(Request $request, $clientId)
{
    if (!$request->has('username')) {
        abort(404);
    }

    // Zamplia Client
    $clientInfo = DB::table('client')
        ->where('client_id', $clientId)
        ->first();

    $username = $request->get('username');

    // API Survey me username = uid
    $leadsInfo = DB::table('leads')
        ->where('uid', $username)
        ->first();

    if (empty($clientInfo) || empty($leadsInfo)) {
        abort(404);
    }

    // Survey Info
    $surveyInfo = DB::table('api_surveys')
        ->where('id', $leadsInfo->project_id)
        ->first();

    if (empty($surveyInfo)) {
        abort(404);
    }

    if ($leadsInfo->status == "Pending") {

        CommonDataModel::UpdateSingleTableData(
            'leads',
            [
                'status'    => 'Quota Full',
                'client_id' => $clientInfo->id
            ],
            ['id' => $leadsInfo->id],
            $leadsInfo->id
        );
    }

    $userInfo = $this->getUserInfo($request);

    $data['userHitInfo'] = [
        'name'   => $surveyInfo->Name,
        'uid'    => $leadsInfo->uid,
        'pid'    => $surveyInfo->SurveyId,
        'ip'     => $userInfo['ip_address'],
        'status' => 'Quota exceeded',
    ];

    // Vendor Redirect
    $vendorInfo = DB::table('vendor')
        ->where('id', $leadsInfo->vendor_id)
        ->first();

    $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'quotafull');

    if ($redirect) {
        return redirect()->away(
            $this->ReplaceUID($redirect, $leadsInfo->uid)
        );
    }

    return view('admin/url/quotafull', $data);
}

   public function URLAction(Request $request, $vendorId, $projectUniqueId)
{
    
    if (!$request->has('user')) {
        abort(404);
    }

    $optId = $request->get('opt');
    // if (!$optId) {
    //     abort(404);
    // }

    // NEW
    $isApiProject = (int) $request->get('api', 1);
    

    $userId = $request->get('user');
    $userInfo = $this->getUserInfo($request);

    // ===========================
    // FETCH PROJECT
    // ===========================
    if ($isApiProject) {

        $projectsInfo = DB::table('api_surveys')
            ->where('SurveyId', $projectUniqueId)
            ->first();

    } else {

        $projectsInfo = DB::table('projects')
            ->where([
                'project_id' => $projectUniqueId,
                'status' => 'Live'
            ])
            ->first();
    }

    $vendorInfo = DB::table('vendor')
        ->where([
            'id' => $vendorId,
            'is_active' => 'Y'
        ])
        ->first();

    if (empty($projectsInfo) || empty($vendorInfo)) {
        return view('admin/url/inactive', []);
    }

    // ===========================
    // ENTRY LINK
    // ===========================
if (!$isApiProject) {
\Log::info('URLAction Started', [
    'api' => $request->get('api'),
    'isApiProject' => $isApiProject,
    'vendorId' => $vendorId,
    'projectUniqueId' => $projectUniqueId,
    'all' => $request->all(),
]);
    $entryLink = DB::table('vendor_entry_links')
        ->where([
            'vendor_id'     => $vendorId,
            'project_id'    => $projectsInfo->project_id,
            'bid_option_id' => $optId
        ])
        ->first();

    if (!$entryLink) {
        return "Invalid entry link – option not found.";
    }
}

    // ===========================
    // QUOTA CHECK
    // ===========================
    $isMaxQuotaReached = Projects::getEventCounts($projectsInfo->id, $isApiProject);

    $userHitInfo = [
        'name' => $isApiProject ? $projectsInfo->Name : $projectsInfo->name,
        'uid'  => $userId,
        'pid'  => $isApiProject ? $projectsInfo->SurveyId : $projectsInfo->project_id,
        'ip'   => $userInfo['ip_address']
    ];

    if ($isMaxQuotaReached->complete_count > $isMaxQuotaReached->max_limit) {

        $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'quotafull');

        if ($redirect) {
            return redirect()->away($this->ReplaceUID($redirect, $userId));
        }

        $data['userHitInfo'] = array_merge($userHitInfo, [
            'status' => 'Quota exceeded'
        ]);

        return view('admin/url/quotafull', $data);
    }

    // ===========================
    // DUPLICATE CHECK
    // ===========================
    $existingLeads = DB::table('leads')
        ->where([
            'project_id' => $projectsInfo->id,
            'vendor_id'  => $vendorId
        ])
        ->whereRaw("JSON_EXTRACT(user_info, '$.ip_address') = ?", [$userInfo['ip_address']])
        ->orderByDesc('id')
        ->first();

    if (empty($existingLeads)) {

        $existingUsername = DB::table('leads')
            ->where([
                'uid'        => $userId,
                'project_id' => $projectsInfo->id,
                'vendor_id'  => $vendorId
            ])
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

            // Overall vendor count
            DB::table('vendor')
            ->where('id', $vendorId)
            ->increment('clicks_count');
            
            // Project-wise vendor count
            DB::table('vendor_projects')
            ->where('vendor_id', $vendorId)
            ->where('project_id', $projectsInfo->SurveyId)
            ->increment('clicks_count');
        } else {

            $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'terminate');

            if ($redirect) {
                return redirect()->away($this->ReplaceUID($redirect, $userId));
            }

            $data['userHitInfo'] = array_merge($userHitInfo, [
                'status' => 'Terminated'
            ]);

            return view('admin/url/terminates', $data);
        }

    } else {

        if ($existingLeads->uid != $userId) {

            $redirect = $this->checkVendorRedirect($vendorInfo->vendor_id, 'terminate');

            if ($redirect) {
                return redirect()->away($this->ReplaceUID($redirect, $userId));
            }

            $data['userHitInfo'] = array_merge($userHitInfo, [
                'status' => 'Terminated'
            ]);

            return view('admin/url/terminates', $data);
        }

        $insertedLeadsId = $existingLeads->id;
    }

    // ===========================
    // FINAL REDIRECT
    // ===========================
   if ($isApiProject) {

    \Log::info('URL Started', [
    'api' => $request->get('api'),
    'isApiProject' => $isApiProject,
    'vendorId' => $vendorId,
    'projectUniqueId' => $projectUniqueId,
    'all' => $request->all(),
]);

    $response = Http::withHeaders([
        'ZAMP-KEY' => $this->apiKey,
        'Accept'   => 'application/json',
    ])->get(
        'https://surveysupply.zamplia.com/api/v1/Surveys/GenerateLink',
        [
            'SurveyId'      => $projectsInfo->SurveyId,
            'IpAddress'     => $userInfo['ip_address'],
            'TransactionId' => $userId,
        ]
    );

    if (!$response->successful()) {

        \Log::error('GenerateLink API Error', [
            'response' => $response->body()
        ]);

        abort(500, 'Unable to generate survey link.');
    }

   $apiResponse = $response->json();

if (
    empty($apiResponse['success']) ||
    empty($apiResponse['result']['success'])
) {

    \Log::error('GenerateLink Failed', [
        'response' => $apiResponse
    ]);

    abort(500, 'Generate Link API Failed.');
}

$liveLink = $apiResponse['result']['data'][0]['LiveLink'] ?? null;

if (empty($liveLink)) {

    \Log::error('GenerateLink LiveLink Missing', [
        'response' => $apiResponse
    ]);

    abort(500, 'Survey link not received.');
}
\Log::info('Generate Link Response', $apiResponse);
\Log::info('Live Link', [
    'url' => $liveLink
]);
return redirect()->away($liveLink);

// NON API PROJECT
$finalUrl = $entryLink->live_url . $insertedLeadsId;

return redirect()->away($finalUrl);
}
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
