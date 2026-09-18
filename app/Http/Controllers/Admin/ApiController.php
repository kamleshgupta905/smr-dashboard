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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ApiSurvey;

class ApiController extends Controller
{
    // protected $baseUrl = 'https://surveysupplysandbox.zamplia.com/api/v1';
    // protected $apiKey = 's5YnczOM9ahIKuSdwzKvPyTlBUvBLfqG';
    protected $baseUrl = 'https://surveysupply.zamplia.com/api/v1/';
    protected $apiKey = 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u';

    /**
     * Get Allocated Surveys
     */

// public function getAllocatedSurveys()
// {
//     try {
//         $response = Http::withHeaders([
//             'ZAMP-KEY' => $this->apiKey,
//             'Accept'   => 'application/json',
//         ])->get($this->baseUrl . '/Surveys/GetAllocatedSurveys');

//         if ($response->successful()) {

//             $apiResponse = $response->json();

//             // Corrected path
//             $result['surveys'] = $apiResponse['result']['data'] ?? [];

//             // Save surveys to database
//             foreach ($result['surveys'] as $survey) {

//                 ApiSurvey::updateOrCreate(
//                     [
//                         'SurveyId' => $survey['SurveyId'],
//                     ],
//                     [
//                         'Name'                   => $survey['Name'] ?? null,
//                         'TotalCompleteRequired' => $survey['TotalCompleteRequired'] ?? null,
//                         'CPI'                    => $survey['CPI'] ?? null,
//                         'LOI'                    => $survey['LOI'] ?? null,
//                         'IR'                     => $survey['IR'] ?? null,

//                         'LastUpdateTimeStamp'   => !empty($survey['LastUpdateTimeStamp'])
//                             ? date('Y-m-d H:i:s', strtotime($survey['LastUpdateTimeStamp']))
//                             : null,

//                         'IsSurveyGroupExist'    => $survey['IsSurveyGroupExist'] ?? 0,
//                         'LanguageCode'          => $survey['LanguageCode'] ?? null,

//                         'SurveyEndDate'         => !empty($survey['SurveyEndDate'])
//                             ? date('Y-m-d H:i:s', strtotime($survey['SurveyEndDate']))
//                             : null,

//                         'Device'                => $survey['Device'] ?? null,
//                         'IndustryId'            => $survey['IndustryId'] ?? null,
//                         'StudyTypes'            => $survey['StudyTypes'] ?? null,
//                         'IsRecontactSurvey'     => $survey['IsRecontactSurvey'] ?? 0,
//                         'CollectPII'            => $survey['CollectPII'] ?? null,
//                         'LanguageId'            => $survey['LanguageId'] ?? null,
//                         'FieldDays'             => $survey['FieldDays'] ?? null,

//                         'SurveyCreatedAt'       => !empty($survey['SurveyCreatedAt'])
//                             ? date('Y-m-d H:i:s', strtotime($survey['SurveyCreatedAt']))
//                             : null,

//                         'status'                => $survey['status'] ?? null,
//                     ]
//                 );
//             }

//             $body['bodyView'] = view('admin.API.survey', $result);

//             return LayoutController::loadAdmin($body);
//         }

//         return redirect()->back()->with('error', 'Failed to fetch survey data');

//     } catch (\Exception $e) {
       
//         return redirect()->back()->with('error', $e->getMessage());
//     }
// }

public function getAllocatedSurveys()
{
    try {

        // ===========================
        // Supplier Login
        // ===========================
        if (session('surveysAdmin.role') == 8) {

            $supplierCode = session('surveysAdmin.supplier_id');

            // Vendor Record
            $vendor = DB::table('vendor')
                ->where('vendor_id', $supplierCode)
                ->first();
               

            if (isset($vendor)) {

                // Assigned SurveyIds
                $surveyIds = DB::table('vendor_entry_links')
                    ->where('vendor_id', $vendor->id)
                    ->pluck('project_id')
                    ->toArray();
                    

                $result['surveys'] = ApiSurvey::whereIn('SurveyId', $surveyIds)
                    ->orderByDesc('id')
                    ->get();
                   

            } else {

                $result['surveys'] = collect();
            }

            $body['bodyView'] = view('admin.API.survey', $result);

            return LayoutController::loadAdmin($body);
        }

        // ===========================
        // Admin Login
        // ===========================

        $response = Http::withHeaders([
            'ZAMP-KEY' => $this->apiKey,
            'Accept'   => 'application/json',
        ])->get($this->baseUrl . '/Surveys/GetAllocatedSurveys');

        if ($response->successful()) {

            $apiResponse = $response->json();

            $result['surveys'] = $apiResponse['result']['data'] ?? [];

            // Save surveys
            foreach ($result['surveys'] as $survey) {

                ApiSurvey::updateOrCreate(
                    [
                        'SurveyId' => $survey['SurveyId'],
                    ],
                    [
                        'Name'                  => $survey['Name'] ?? null,
                        'TotalCompleteRequired' => $survey['TotalCompleteRequired'] ?? null,
                        'CPI'                   => $survey['CPI'] ?? null,
                        'LOI'                   => $survey['LOI'] ?? null,
                        'IR'                    => $survey['IR'] ?? null,

                        'LastUpdateTimeStamp' => !empty($survey['LastUpdateTimeStamp'])
                            ? date('Y-m-d H:i:s', strtotime($survey['LastUpdateTimeStamp']))
                            : null,

                        'IsSurveyGroupExist' => $survey['IsSurveyGroupExist'] ?? 0,
                        'LanguageCode'       => $survey['LanguageCode'] ?? null,

                        'SurveyEndDate' => !empty($survey['SurveyEndDate'])
                            ? date('Y-m-d H:i:s', strtotime($survey['SurveyEndDate']))
                            : null,

                        'Device'            => $survey['Device'] ?? null,
                        'IndustryId'        => $survey['IndustryId'] ?? null,
                        'StudyTypes'        => $survey['StudyTypes'] ?? null,
                        'IsRecontactSurvey' => $survey['IsRecontactSurvey'] ?? 0,
                        'CollectPII'        => $survey['CollectPII'] ?? null,
                        'LanguageId'        => $survey['LanguageId'] ?? null,
                        'FieldDays'         => $survey['FieldDays'] ?? null,

                        'SurveyCreatedAt' => !empty($survey['SurveyCreatedAt'])
                            ? date('Y-m-d H:i:s', strtotime($survey['SurveyCreatedAt']))
                            : null,

                        'status' => $survey['status'] ?? null,
                    ]
                );
            }

            // Admin always sees latest DB data
            $result['surveys'] = ApiSurvey::orderByDesc('id')->get();

            $body['bodyView'] = view('admin.API.survey', $result);

            return LayoutController::loadAdmin($body);
        }

        return redirect()->back()->with('error', 'Failed to fetch survey data');

    } catch (\Exception $e) {

        return redirect()->back()->with('error', $e->getMessage());
    }
}

public function viewSurvey($surveyId)
{
    try {

        $response = Http::withHeaders([
            'ZAMP-KEY' => $this->apiKey,
            'Accept'   => 'application/json',
        ])->get($this->baseUrl . '/Surveys/GetSurveyById', [
            'SurveyId' => $surveyId
        ]);

        if ($response->successful()) {

            $apiResponse = $response->json();

            $surveyData = $apiResponse['result']['data'][0] ?? [];

            if (empty($surveyData)) {
                return redirect()->back()->with(
                    'error',
                    'Survey details not found'
                );
            }

            /*
            =====================================
            PROJECT DATA FROM API
            =====================================
            */
            $result['projectsData'] = $surveyData;

            /*
            =====================================
            API SURVEY FLAG
            =====================================
            */
            $result['is_api_survey'] = 1;

            /*
            =====================================
            OPTIONAL: BID OPTIONS
            =====================================
            */
            $result['bidOptions'] = [];

            /*
            =====================================
            OPTIONAL: VENDORS
            =====================================
            */
            $result['vendors'] = DB::table('vendor')
                ->where('project_id', $surveyId)
                ->get()
                ->filter();

            /*
            =====================================
            LOAD VIEW
            =====================================
            */
            $body['bodyView'] = view(
                'admin.API.viewsurvey',
                $result
            );

            return LayoutController::loadAdmin($body);
        }

        return redirect()->back()->with(
            'error',
            'Failed to fetch survey details'
        );

    } catch (\Exception $e) {

        \Log::error('View Survey API Error', [
            'survey_id' => $surveyId,
            'error'     => $e->getMessage()
        ]);

        return redirect()->back()->with(
            'error',
            $e->getMessage()
        );
    }
}
 
}

