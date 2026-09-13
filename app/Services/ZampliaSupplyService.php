<?php

namespace App\Services;

use App\Models\ApiSurvey;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZampliaSupplyService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected int $timeout;
    protected int $cacheTtl;
    protected ZampliaHmacService $hmacService;

    public function __construct(?ZampliaHmacService $hmacService = null)
    {
        $this->baseUrl = rtrim(config('zamplia.active_base_url', 'https://surveysupply.zamplia.com/api/v1'), '/');
        $this->apiKey = config('zamplia.active_api_key', 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u');
        $this->timeout = (int) config('zamplia.timeout', 30);
        $this->cacheTtl = (int) config('zamplia.cache_ttl', 300);
        $this->hmacService = $hmacService ?? new ZampliaHmacService();
    }

    /**
     * Core HTTP request handler
     */
    protected function makeRequest(string $endpoint, array $queryParams = [], string $method = 'GET')
    {
        $url = $this->baseUrl . '/' . ltrim($endpoint, '/');

        try {
            $client = Http::withHeaders([
                'ZAMP-KEY' => $this->apiKey,
                'Accept'   => 'application/json',
            ])->timeout($this->timeout);

            $response = ($method === 'POST')
                ? $client->post($url, $queryParams)
                : $client->get($url, $queryParams);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'status'  => $response->status(),
                    'data'    => $data['result']['data'] ?? $data['result'] ?? $data['data'] ?? $data,
                    'raw'     => $data,
                ];
            }

            Log::error('Zamplia API Request Failed', [
                'endpoint' => $endpoint,
                'status'   => $response->status(),
                'response' => $response->body(),
                'params'   => $queryParams,
            ]);

            return [
                'success' => false,
                'status'  => $response->status(),
                'message' => $response->json('message') ?? 'Zamplia API returned status ' . $response->status(),
                'data'    => [],
            ];
        } catch (\Exception $e) {
            Log::error('Zamplia API Exception', [
                'endpoint' => $endpoint,
                'error'    => $e->getMessage(),
                'params'   => $queryParams,
            ]);

            return [
                'success' => false,
                'status'  => 500,
                'message' => $e->getMessage(),
                'data'    => [],
            ];
        }
    }

    // =========================================================================
    // 1. SURVEY DISCOVERY APIS
    // =========================================================================

    /**
     * 1. Get Allocated Surveys
     * Returns a list of surveys allocated to the supplier.
     */
    public function getAllocatedSurveys(array $filters = []): array
    {
        return $this->makeRequest('/Surveys/GetAllocatedSurveys', $filters);
    }

    /**
     * 2. Get Top Pick Surveys
     * Returns highest-yield / top-priority surveys allocated to the supplier.
     */
    public function getTopPickSurveys(array $filters = []): array
    {
        return $this->makeRequest('/Surveys/GetTopPickSurveys', $filters);
    }

    // =========================================================================
    // 2. SURVEY INSPECTION & TARGETING APIS
    // =========================================================================

    /**
     * 3. Get Survey By ID
     * Fetches detailed attributes of a specific survey.
     */
    public function getSurveyById($surveyId): array
    {
        return $this->makeRequest('/Surveys/GetSurveyById', ['SurveyId' => $surveyId]);
    }

    /**
     * 4. Get Survey Qualifications
     * Fetches the demographic and profiling qualifications required for a survey.
     */
    public function getSurveyQualifications($surveyId): array
    {
        return $this->makeRequest('/Surveys/GetSurveyQualifications', ['SurveyId' => $surveyId]);
    }

    /**
     * 5. Get Survey Quotas
     * Fetches quota limits and remaining capacity for a survey.
     */
    public function getSurveyQuotas($surveyId): array
    {
        return $this->makeRequest('/Surveys/GetSurveyQuotas', ['SurveyId' => $surveyId]);
    }

    /**
     * 6. Get Survey Types
     * Returns standard survey types (Consumer, B2B, etc.). Cached.
     */
    public function getSurveyTypes(): array
    {
        return Cache::remember('zamplia_survey_types', $this->cacheTtl, function () {
            return $this->makeRequest('/Surveys/GetSurveyTypes');
        });
    }

    /**
     * 7. Get Survey Groups
     * Returns survey groups and exclusion rules. Cached.
     */
    public function getSurveyGroups(): array
    {
        return Cache::remember('zamplia_survey_groups', $this->cacheTtl, function () {
            return $this->makeRequest('/Surveys/GetSurveyGroups');
        });
    }

    // =========================================================================
    // 3. REFERENCE DATA APIS (CACHED)
    // =========================================================================

    /**
     * 8. Get Languages
     * Returns supported language codes and language IDs.
     */
    public function getLanguages(): array
    {
        return Cache::remember('zamplia_languages', $this->cacheTtl * 2, function () {
            return $this->makeRequest('/Surveys/GetLanguages');
        });
    }

    /**
     * 9. Get Demographics
     * Returns master demographic question catalog and answer codes.
     */
    public function getDemographics(): array
    {
        return Cache::remember('zamplia_demographics', $this->cacheTtl * 2, function () {
            return $this->makeRequest('/Surveys/GetDemoGraphics');
        });
    }

    /**
     * 10. Get Industry
     * Returns industry categories.
     */
    public function getIndustry(): array
    {
        return Cache::remember('zamplia_industries', $this->cacheTtl * 2, function () {
            return $this->makeRequest('/Surveys/GetIndustry');
        });
    }

    // =========================================================================
    // 4. TRAFFIC ROUTING & LINK GENERATION APIS
    // =========================================================================

    /**
     * 11. Generate Link
     * Generates a unique participant entry link.
     */
    public function generateLink($surveyId, ?string $ipAddress = null, ?string $transactionId = null, array $extra = []): array
    {
        $params = array_merge([
            'SurveyId'      => $surveyId,
            'IpAddress'     => $ipAddress ?? request()->ip() ?? '127.0.0.1',
            'TransactionId' => $transactionId ?? uniqid('zamp_'),
        ], $extra);

        $res = $this->makeRequest('/Surveys/GenerateLink', $params);

        // If HMAC signature is enabled, sign the live link
        if ($res['success'] && !empty($res['data'][0]['LiveLink']) && $this->hmacService->isConfigured()) {
            $res['data'][0]['SignedLiveLink'] = $this->hmacService->signUrl($res['data'][0]['LiveLink']);
        }

        return $res;
    }

    /**
     * 12. Entry Link with Qualifications
     * Builds/Generates entry link appending pre-screening qualification parameters.
     */
    public function getEntryLinkWithQualifications($surveyId, string $transactionId, array $qualificationAnswers = [], ?string $ipAddress = null): array
    {
        $baseLinkResult = $this->generateLink($surveyId, $ipAddress, $transactionId);
        if (!$baseLinkResult['success']) {
            return $baseLinkResult;
        }

        $liveLink = $baseLinkResult['data'][0]['LiveLink'] ?? null;
        if (!$liveLink) {
            return $baseLinkResult;
        }

        // Append qualification answer codes to query string
        if (!empty($qualificationAnswers)) {
            $separator = (strpos($liveLink, '?') !== false) ? '&' : '?';
            $qualQuery = http_build_query($qualificationAnswers);
            $liveLink .= $separator . $qualQuery;
            $baseLinkResult['data'][0]['LiveLink'] = $liveLink;
        }

        if ($this->hmacService->isConfigured()) {
            $baseLinkResult['data'][0]['SignedLiveLink'] = $this->hmacService->signUrl($liveLink);
        }

        return $baseLinkResult;
    }

    // =========================================================================
    // 5. TRACKING, FRAUD PREVENTION & RECONCILIATION APIS
    // =========================================================================

    /**
     * 13. Get Survey Global Stats
     * Returns overall health and delivery conversion metrics.
     */
    public function getSurveyGlobalStats($surveyId = null): array
    {
        $params = $surveyId ? ['SurveyId' => $surveyId] : [];
        return $this->makeRequest('/Surveys/GetSurveyGlobalStats', $params);
    }

    /**
     * 14. Get Blocked IPs
     * Returns list of fraudulent or blocked IP addresses.
     */
    public function getBlockedIps(): array
    {
        return $this->makeRequest('/Surveys/GetBlockIp');
    }

    /**
     * 15. Users Session Events
     * Tracks participant journey events (starts, drops, completes).
     */
    public function getUsersSessionEvents($surveyId = null, array $filters = []): array
    {
        if ($surveyId) {
            $filters['SurveyId'] = $surveyId;
        }
        return $this->makeRequest('/Surveys/UsersSessionEvents', $filters);
    }

    /**
     * 16. Get Reconciliation
     * Confirms final session outcomes and financials for a given date range.
     */
    public function getReconciliation(?string $startDate = null, ?string $endDate = null, ?string $status = null): array
    {
        $params = [];
        if ($startDate) {
            $params['StartDate'] = $startDate;
        }
        if ($endDate) {
            $params['EndDate'] = $endDate;
        }
        if ($status) {
            $params['Status'] = $status;
        }

        return $this->makeRequest('/Surveys/GetReconciliation', $params);
    }

    // =========================================================================
    // 6. DATABASE SYNC & PERSISTENCE HELPER
    // =========================================================================

    /**
     * Synchronize fetched surveys into the local api_surveys database table
     */
    public function syncSurveysToDatabase(?array $surveys = null): array
    {
        if ($surveys === null) {
            $response = $this->getAllocatedSurveys();
            if (!$response['success']) {
                return [
                    'success' => false,
                    'message' => $response['message'] ?? 'Failed to fetch surveys from Zamplia',
                    'count'   => 0,
                ];
            }
            $surveys = $response['data'] ?? [];
        }

        $syncedCount = 0;

        foreach ($surveys as $survey) {
            if (empty($survey['SurveyId'])) {
                continue;
            }

            ApiSurvey::updateOrCreate(
                [
                    'SurveyId' => $survey['SurveyId'],
                ],
                [
                    'Name'                  => $survey['Name'] ?? null,
                    'TotalCompleteRequired'=> $survey['TotalCompleteRequired'] ?? null,
                    'CPI'                   => $survey['CPI'] ?? null,
                    'LOI'                   => $survey['LOI'] ?? null,
                    'IR'                    => $survey['IR'] ?? null,
                    'LastUpdateTimeStamp'  => !empty($survey['LastUpdateTimeStamp'])
                        ? date('Y-m-d H:i:s', strtotime($survey['LastUpdateTimeStamp']))
                        : null,
                    'IsSurveyGroupExist'   => $survey['IsSurveyGroupExist'] ?? 0,
                    'LanguageCode'         => $survey['LanguageCode'] ?? null,
                    'SurveyEndDate'        => !empty($survey['SurveyEndDate'])
                        ? date('Y-m-d H:i:s', strtotime($survey['SurveyEndDate']))
                        : null,
                    'Device'               => $survey['Device'] ?? null,
                    'IndustryId'           => $survey['IndustryId'] ?? null,
                    'StudyTypes'           => $survey['StudyTypes'] ?? null,
                    'IsRecontactSurvey'    => $survey['IsRecontactSurvey'] ?? 0,
                    'CollectPII'           => $survey['CollectPII'] ?? null,
                    'LanguageId'           => $survey['LanguageId'] ?? null,
                    'FieldDays'            => $survey['FieldDays'] ?? null,
                    'SurveyCreatedAt'      => !empty($survey['SurveyCreatedAt'])
                        ? date('Y-m-d H:i:s', strtotime($survey['SurveyCreatedAt']))
                        : null,
                    'status'               => $survey['status'] ?? 'Live',
                ]
            );

            $syncedCount++;
        }

        return [
            'success' => true,
            'message' => "Successfully synced {$syncedCount} surveys.",
            'count'   => $syncedCount,
        ];
    }
}
