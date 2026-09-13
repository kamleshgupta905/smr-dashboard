<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>

<style>
body {
    font-family: 'Inter', sans-serif !important;
    background: #F8FAFC !important;
}

.card.list-view {
    background: #ffffff !important;
    border-radius: 16px !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04) !important;
}

.card-header {
    background: linear-gradient(135deg, #ffffff, #F8FAFC) !important;
    border-bottom: 1px solid #E2E8F0 !important;
    padding: 18px 24px !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-pills-custom {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 12px;
}

.nav-pills-custom .pill-link {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    text-decoration: none;
    transition: all 0.2s;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
}

.nav-pills-custom .pill-link.active,
.nav-pills-custom .pill-link:hover {
    background: #2563EB;
    color: #ffffff;
    border-color: #2563EB;
}
</style>

<section class="layout-box-content-format1">
    {{-- SUB-NAVIGATION PILLS --}}
    <div class="nav-pills-custom">
        <a href="{{ url('admin/api_survey') }}" class="pill-link">
            <i class="fas fa-th-list me-1"></i> Allocated Surveys
        </a>
        <a href="{{ url('admin/api_survey?tab=top_picks') }}" class="pill-link">
            <i class="fas fa-fire me-1"></i> Top Pick Surveys
        </a>
        <a href="{{ url('admin/api_survey/reconciliation') }}" class="pill-link">
            <i class="fas fa-file-invoice-dollar me-1"></i> Reconciliation
        </a>
        <a href="{{ url('admin/api_survey/reference-data') }}" class="pill-link active">
            <i class="fas fa-database me-1"></i> Reference Data
        </a>
    </div>

    {{-- MAIN CARD --}}
    <div class="card card-primary list-view">
        <div class="card-header">
            <div>
                <h3 class="card-title font-weight-bold">
                    <i class="fas fa-database text-primary me-2"></i> Zamplia Reference Data & Master Catalogs
                </h3>
                <small class="text-muted">Master codes for Languages, Industry Categories, Survey Types, and Blocked Fraud IPs</small>
            </div>
        </div>

        <div class="card-body p-4">
            {{-- INNER TABS --}}
            <ul class="nav nav-tabs mb-4" id="refTabs" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active font-weight-bold" id="lang-tab" data-toggle="tab" href="#tab-languages" role="tab">
                        <i class="fas fa-language me-1 text-primary"></i> Languages ({{ count($languages ?? []) }})
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link font-weight-bold" id="ind-tab" data-toggle="tab" href="#tab-industries" role="tab">
                        <i class="fas fa-building me-1 text-success"></i> Industries ({{ count($industries ?? []) }})
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link font-weight-bold" id="type-tab" data-toggle="tab" href="#tab-types" role="tab">
                        <i class="fas fa-tags me-1 text-warning"></i> Survey Types ({{ count($surveyTypes ?? []) }})
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link font-weight-bold" id="block-tab" data-toggle="tab" href="#tab-blocked" role="tab">
                        <i class="fas fa-shield-alt me-1 text-danger"></i> Blocked IPs ({{ count($blockedIps ?? []) }})
                    </a>
                </li>
            </ul>

            <div class="tab-content">
                {{-- LANGUAGES TAB --}}
                <div class="tab-pane fade show active" id="tab-languages" role="tabpanel">
                    <table class="table table-bordered table-striped" id="langTable">
                        <thead>
                            <tr class="bg-light">
                                <th>Language ID</th>
                                <th>Language Name</th>
                                <th>Language Code</th>
                            </tr>
                        </thead>
                        <tbody>
                        @foreach(($languages ?? []) as $lang)
                            <tr>
                                <td><code>{{ $lang['LanguageId'] ?? $lang['id'] ?? 'N/A' }}</code></td>
                                <td><strong>{{ $lang['Language'] ?? $lang['name'] ?? 'N/A' }}</strong></td>
                                <td><span class="badge badge-info">{{ $lang['LanguageCode'] ?? $lang['code'] ?? 'N/A' }}</span></td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>

                {{-- INDUSTRIES TAB --}}
                <div class="tab-pane fade" id="tab-industries" role="tabpanel">
                    <table class="table table-bordered table-striped" id="indTable">
                        <thead>
                            <tr class="bg-light">
                                <th>Industry ID</th>
                                <th>Industry Name</th>
                            </tr>
                        </thead>
                        <tbody>
                        @foreach(($industries ?? []) as $ind)
                            <tr>
                                <td><code>{{ $ind['IndustryId'] ?? $ind['id'] ?? 'N/A' }}</code></td>
                                <td><strong>{{ $ind['IndustryName'] ?? $ind['name'] ?? 'N/A' }}</strong></td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>

                {{-- SURVEY TYPES TAB --}}
                <div class="tab-pane fade" id="tab-types" role="tabpanel">
                    <table class="table table-bordered table-striped" id="typeTable">
                        <thead>
                            <tr class="bg-light">
                                <th>Type ID</th>
                                <th>Study Type Name</th>
                            </tr>
                        </thead>
                        <tbody>
                        @foreach(($surveyTypes ?? []) as $st)
                            <tr>
                                <td><code>{{ $st['StudyTypeId'] ?? $st['id'] ?? 'N/A' }}</code></td>
                                <td><strong>{{ $st['StudyTypeName'] ?? $st['name'] ?? 'N/A' }}</strong></td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>

                {{-- BLOCKED IPS TAB --}}
                <div class="tab-pane fade" id="tab-blocked" role="tabpanel">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i> These IP addresses have been flagged by Zamplia for fraud or suspicious survey activity. Traffic from these IPs will be rejected.
                    </div>
                    <table class="table table-bordered table-striped" id="blockTable">
                        <thead>
                            <tr class="bg-light">
                                <th>Blocked IP Address</th>
                                <th>Reason / Flag</th>
                            </tr>
                        </thead>
                        <tbody>
                        @foreach(($blockedIps ?? []) as $ip)
                            <tr>
                                <td><code class="text-danger font-weight-bold">{{ is_array($ip) ? ($ip['IpAddress'] ?? $ip['ip'] ?? 'N/A') : $ip }}</code></td>
                                <td><span class="badge badge-danger">Blacklisted / Fraud</span></td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</section>

<script>
$(document).ready(function() {
    $('#langTable, #indTable, #typeTable, #blockTable').DataTable({
        pageLength: 10,
        searching: true
    });
});
</script>
