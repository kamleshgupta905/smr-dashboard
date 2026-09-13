<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Models\ApiSurvey;
use App\Services\ZampliaSupplyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ApiController extends Controller
{
    protected ZampliaSupplyService $zampliaService;

    public function __construct(ZampliaSupplyService $zampliaService)
    {
        $this->zampliaService = $zampliaService;
    }

    /**
     * Get Allocated Surveys (Main Dashboard View)
     */
    public function getAllocatedSurveys(Request $request)
    {
        try {
            $tab = $request->get('tab', 'allocated');
            $forceSync = $request->boolean('sync', false);

            if ($tab === 'top_picks') {
                $response = $this->zampliaService->getTopPickSurveys();
                $surveys = $response['data'] ?? [];
            } else {
                // If requested or if local DB is empty, sync from Zamplia
                $localCount = ApiSurvey::count();
                if ($forceSync || $localCount === 0) {
                    $this->zampliaService->syncSurveysToDatabase();
                }

                $surveysFromApi = $this->zampliaService->getAllocatedSurveys();
                if ($surveysFromApi['success'] && !empty($surveysFromApi['data'])) {
                    $surveys = $surveysFromApi['data'];
                    // Asynchronously/silently keep local DB up to date
                    $this->zampliaService->syncSurveysToDatabase($surveys);
                } else {
                    // Fallback to local DB if API call returns empty or error
                    $surveys = ApiSurvey::orderBy('created_at', 'desc')->get()->toArray();
                }
            }

            $result['surveys'] = $surveys;
            $result['activeTab'] = $tab;
            $result['stats'] = [
                'total' => count($surveys),
                'live'  => collect($surveys)->filter(fn($s) => ($s['status'] ?? '') === 'Live')->count(),
                'avg_cpi' => collect($surveys)->avg('CPI') ? number_format(collect($surveys)->avg('CPI'), 2) : '0.00',
            ];

            $body['bodyView'] = view('admin.API.survey', $result);
            return LayoutController::loadAdmin($body);

        } catch (\Exception $e) {
            Log::error('getAllocatedSurveys error', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Error loading surveys: ' . $e->getMessage());
        }
    }

    /**
     * AJAX action to sync surveys with Zamplia on demand
     */
    public function ajaxSyncSurveys()
    {
        try {
            $syncResult = $this->zampliaService->syncSurveysToDatabase();
            return response()->json([
                'status'  => $syncResult['success'] ? 'success' : 'error',
                'message' => $syncResult['message'],
                'count'   => $syncResult['count'] ?? 0,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * View Single Survey Details with Qualifications and Quotas
     */
    public function viewSurvey($surveyId)
    {
        try {
            $response = $this->zampliaService->getSurveyById($surveyId);

            if (!$response['success'] || empty($response['data'])) {
                return redirect()->back()->with('error', 'Survey details not found on Zamplia');
            }

            $surveyData = $response['data'][0] ?? $response['data'];

            // Fetch Qualifications and Quotas in parallel for this survey
            $qualsResponse = $this->zampliaService->getSurveyQualifications($surveyId);
            $quotasResponse = $this->zampliaService->getSurveyQuotas($surveyId);
            $statsResponse = $this->zampliaService->getSurveyGlobalStats($surveyId);

            $result['projectsData'] = $surveyData;
            $result['qualifications'] = $qualsResponse['data'] ?? [];
            $result['quotas'] = $quotasResponse['data'] ?? [];
            $result['globalStats'] = $statsResponse['data'][0] ?? null;
            $result['is_api_survey'] = 1;
            $result['bidOptions'] = [];

            // Fetch assigned vendors from local DB
            $result['vendors'] = DB::table('vendor')
                ->where('project_id', $surveyId)
                ->get()
                ->filter();

            $body['bodyView'] = view('admin.API.viewsurvey', $result);
            return LayoutController::loadAdmin($body);

        } catch (\Exception $e) {
            Log::error('viewSurvey error', ['surveyId' => $surveyId, 'error' => $e->getMessage()]);
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * AJAX endpoint to fetch qualifications for modal popup
     */
    public function getSurveyQualificationsAjax($surveyId)
    {
        $response = $this->zampliaService->getSurveyQualifications($surveyId);
        return response()->json([
            'status' => $response['success'] ? 'success' : 'error',
            'data'   => $response['data'] ?? [],
            'message'=> $response['message'] ?? null,
        ]);
    }

    /**
     * AJAX endpoint to fetch quotas for modal popup
     */
    public function getSurveyQuotasAjax($surveyId)
    {
        $response = $this->zampliaService->getSurveyQuotas($surveyId);
        return response()->json([
            'status' => $response['success'] ? 'success' : 'error',
            'data'   => $response['data'] ?? [],
            'message'=> $response['message'] ?? null,
        ]);
    }

    /**
     * AJAX endpoint to fetch survey stats
     */
    public function getGlobalStatsAjax($surveyId = null)
    {
        $response = $this->zampliaService->getSurveyGlobalStats($surveyId);
        return response()->json([
            'status' => $response['success'] ? 'success' : 'error',
            'data'   => $response['data'] ?? [],
        ]);
    }

    /**
     * Reconciliation View
     */
    public function reconciliationView(Request $request)
    {
        try {
            $startDate = $request->get('start_date', date('Y-m-d', strtotime('-7 days')));
            $endDate = $request->get('end_date', date('Y-m-d'));
            $status = $request->get('status', 'Complete');

            $response = $this->zampliaService->getReconciliation($startDate, $endDate, $status);

            $result['reconciliationData'] = $response['data'] ?? [];
            $result['startDate'] = $startDate;
            $result['endDate'] = $endDate;
            $result['status'] = $status;
            $result['apiSuccess'] = $response['success'];

            $body['bodyView'] = view('admin.API.reconciliation', $result);
            return LayoutController::loadAdmin($body);

        } catch (\Exception $e) {
            Log::error('reconciliationView error', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Error fetching reconciliation data: ' . $e->getMessage());
        }
    }

    /**
     * Reference Data View (Demographics, Languages, Industry, Blocked IPs)
     */
    public function referenceDataView()
    {
        try {
            $languages = $this->zampliaService->getLanguages();
            $industries = $this->zampliaService->getIndustry();
            $surveyTypes = $this->zampliaService->getSurveyTypes();
            $blockedIps = $this->zampliaService->getBlockedIps();

            $result['languages'] = $languages['data'] ?? [];
            $result['industries'] = $industries['data'] ?? [];
            $result['surveyTypes'] = $surveyTypes['data'] ?? [];
            $result['blockedIps'] = $blockedIps['data'] ?? [];

            $body['bodyView'] = view('admin.API.reference_data', $result);
            return LayoutController::loadAdmin($body);

        } catch (\Exception $e) {
            Log::error('referenceDataView error', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Error fetching reference data: ' . $e->getMessage());
        }
    }
}
