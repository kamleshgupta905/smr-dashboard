@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif
<!-- ✅ DATATABLE REQUIRED -->
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
/* ===== MODERN ZAMPLIA SURVEYS DASHBOARD UI ===== */
body {
    font-family: 'Inter', sans-serif !important;
    background: #F8FAFC !important;
    color: #0F172A !important;
}

.card.list-view {
    position: relative;
    background: #ffffff !important;
    border-radius: 16px !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04) !important;
    overflow: hidden;
}

.card-header {
    background: linear-gradient(135deg, #ffffff, #F8FAFC) !important;
    border-bottom: 1px solid #E2E8F0 !important;
    padding: 18px 24px !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.card-title {
    font-size: 20px !important;
    font-weight: 700 !important;
    color: #0F172A !important;
    margin: 0 !important;
}

/* STATS BAR */
.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
}

.stat-card {
    background: #ffffff;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

.stat-card .stat-info h5 {
    font-size: 12px;
    color: #64748B;
    margin: 0;
    text-transform: uppercase;
    font-weight: 600;
}

.stat-card .stat-info h2 {
    font-size: 22px;
    font-weight: 700;
    color: #0F172A;
    margin: 4px 0 0 0;
}

.stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}

/* BUTTONS */
.btn-primary-custom {
    background: linear-gradient(135deg, #2563EB, #3B82F6) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    font-weight: 600;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    cursor: pointer;
}

.btn-primary-custom:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    color: #fff !important;
}

.btn-secondary-custom {
    background: #F1F5F9 !important;
    color: #475569 !important;
    border: 1px solid #CBD5E1 !important;
    border-radius: 8px !important;
    padding: 8px 14px !important;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
}

.btn-secondary-custom:hover {
    background: #E2E8F0 !important;
    color: #1E293B !important;
}

/* TAB PILLS */
.nav-pills-custom {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 12px;
    flex-wrap: wrap;
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

/* BADGES */
.open-status {
    background: #ECFDF5;
    color: #059669;
    border: 1px solid #A7F3D0;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 11px;
}

.pause-status {
    background: #FFFBEB;
    color: #D97706;
    border: 1px solid #FDE68A;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 11px;
}

.close-status {
    background: #FEF2F2;
    color: #DC2626;
    border: 1px solid #FECACA;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 11px;
}

/* ACTION BADGES */
.btn-action-badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #CBD5E1;
    background: #ffffff;
    color: #1E293B;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.btn-action-badge:hover {
    background: #F1F5F9;
    border-color: #94A3B8;
}

.btn-action-badge.blue {
    color: #2563EB;
    border-color: #BFDBFE;
    background: #EFF6FF;
}

.btn-action-badge.blue:hover {
    background: #DBEAFE;
}

.btn-action-badge.purple {
    color: #7C3AED;
    border-color: #DDD6FE;
    background: #F5F3FF;
}

.btn-action-badge.purple:hover {
    background: #EDE9FE;
}
</style>

<section class="layout-box-content-format1">
    {{-- STATS CARDS --}}
    <div class="stats-container">
        <div class="stat-card">
            <div class="stat-info">
                <h5>Total Surveys</h5>
                <h2>{{ $stats['total'] ?? count($surveys) }}</h2>
            </div>
            <div class="stat-icon" style="background:#EFF6FF; color:#2563EB;">
                <i class="fas fa-clipboard-list"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h5>Live Surveys</h5>
                <h2>{{ $stats['live'] ?? 0 }}</h2>
            </div>
            <div class="stat-icon" style="background:#ECFDF5; color:#059669;">
                <i class="fas fa-broadcast-tower"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h5>Average CPI</h5>
                <h2>${{ $stats['avg_cpi'] ?? '0.00' }}</h2>
            </div>
            <div class="stat-icon" style="background:#FFFBEB; color:#D97706;">
                <i class="fas fa-dollar-sign"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h5>Zamplia Status</h5>
                <h2 style="font-size:16px; color:#059669;"><i class="fas fa-check-circle"></i> Connected</h2>
            </div>
            <div class="stat-icon" style="background:#F3E8FF; color:#7C3AED;">
                <i class="fas fa-network-wired"></i>
            </div>
        </div>
    </div>

    {{-- SUB-NAVIGATION PILLS --}}
    <div class="nav-pills-custom">
        <a href="{{ url('admin/api_survey') }}" class="pill-link {{ ($activeTab ?? 'allocated') == 'allocated' ? 'active' : '' }}">
            <i class="fas fa-th-list me-1"></i> Allocated Surveys
        </a>
        <a href="{{ url('admin/api_survey?tab=top_picks') }}" class="pill-link {{ ($activeTab ?? '') == 'top_picks' ? 'active' : '' }}">
            <i class="fas fa-fire me-1"></i> Top Pick Surveys
        </a>
        <a href="{{ url('admin/api_survey/reconciliation') }}" class="pill-link">
            <i class="fas fa-file-invoice-dollar me-1"></i> Reconciliation
        </a>
        <a href="{{ url('admin/api_survey/reference-data') }}" class="pill-link">
            <i class="fas fa-database me-1"></i> Reference Data
        </a>
    </div>

    {{-- MAIN CARD --}}
    <div class="card card-primary list-view">
        <div class="card-header box-shdw">
            <div>
                <h3 class="card-title">
                    @if(($activeTab ?? '') == 'top_picks')
                        <i class="fas fa-fire text-warning me-2"></i> Top Pick Surveys (High Yield)
                    @else
                        <i class="fas fa-layer-group text-primary me-2"></i> Zamplia Allocated Surveys
                    @endif
                </h3>
                <small class="text-muted">Direct real-time inventory from Zamplia Supply API</small>
            </div>

            <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn-primary-custom" id="syncBtn" onclick="triggerSync()">
                    <i class="fas fa-sync-alt" id="syncIcon"></i> <span id="syncText">Sync Now</span>
                </button>
            </div>
        </div>

        <div class="card-body p-3">
            @if(session('success'))
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="fas fa-check-circle me-2"></i> {{ session('success') }}
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                </div>
            @endif

            @if(session('error'))
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i> {{ session('error') }}
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                </div>
            @endif

            <div class="table-responsive">
                <table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped" id="zampliaSurveysTable">
                    <thead class="tablehead">
                        <tr>
                            <th>#</th>
                            <th>Survey Name</th>
                            <th>PID (ID)</th>
                            <th>Category</th>
                            <th class="text-center">Status</th>
                            <th>CPI</th>
                            <th>IR</th>
                            <th>LOI</th>
                            <th>Completes</th>
                            <th class="text-center">Targeting & Quota</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    @if(!empty($surveys) && is_array($surveys))
                        @foreach($surveys as $key => $survey)
                            <tr>
                                <td>{{ $key + 1 }}</td>
                                <td>
                                    <strong class="text-dark">{{ $survey['Name'] ?? 'Untitled Survey' }}</strong>
                                    @if(!empty($survey['LanguageCode']))
                                        <span class="badge badge-light border ms-1">{{ $survey['LanguageCode'] }}</span>
                                    @endif
                                </td>
                                <td><code>{{ $survey['SurveyId'] ?? 'N/A' }}</code></td>
                                <td><span class="badge badge-info">{{ $survey['StudyTypes'] ?? 'General' }}</span></td>

                                <td class="text-center">
                                    @if(($survey['status'] ?? '') == 'Live')
                                        <span class="open-status"><i class="fas fa-circle" style="font-size:7px;"></i> Live</span>
                                    @elseif(($survey['status'] ?? '') == 'Paused')
                                        <span class="pause-status"><i class="fas fa-pause-circle"></i> Paused</span>
                                    @else
                                        <span class="close-status">{{ $survey['status'] ?? 'N/A' }}</span>
                                    @endif
                                </td>

                                <td><strong class="text-success">${{ number_format((float)($survey['CPI'] ?? 0), 2) }}</strong></td>
                                <td>{{ $survey['IR'] ?? 'N/A' }}%</td>
                                <td>{{ $survey['LOI'] ?? 'N/A' }} min</td>
                                <td><strong>{{ $survey['TotalCompleteRequired'] ?? '0' }}</strong></td>

                                <td class="text-center">
                                    <button type="button" class="btn-action-badge blue" onclick="openQuotasModal('{{ $survey['SurveyId'] }}', '{{ addslashes($survey['Name'] ?? '') }}')">
                                        <i class="fas fa-chart-pie"></i> Quotas
                                    </button>
                                    <button type="button" class="btn-action-badge purple" onclick="openQualsModal('{{ $survey['SurveyId'] }}', '{{ addslashes($survey['Name'] ?? '') }}')">
                                        <i class="fas fa-user-check"></i> Quals
                                    </button>
                                </td>

                                <td class="text-center">
                                    <a href="{{ url('admin/survey/view/' . ($survey['SurveyId'] ?? 0)) }}"
                                       class="btn-primary-custom" style="padding: 4px 10px !important; font-size: 11px;">
                                        <i class="fas fa-share-alt"></i> Assign & View
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    @else
                        <tr>
                            <td colspan="11" class="text-center py-4 text-muted">No surveys found. Click "Sync Now" to fetch live surveys from Zamplia.</td>
                        </tr>
                    @endif
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>

{{-- MODAL: QUOTAS INSPECTION --}}
<div class="modal fade" id="quotasModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content" style="border-radius:14px;">
            <div class="modal-header bg-light">
                <h5 class="modal-title font-weight-bold">
                    <i class="fas fa-chart-pie text-primary me-2"></i> Survey Quotas & Remaining Capacity
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body p-3">
                <div id="quotasModalLoading" class="text-center py-4">
                    <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
                    <p class="mt-2 text-muted">Fetching live quota limits from Zamplia...</p>
                </div>
                <div id="quotasModalContent" style="display:none;"></div>
            </div>
        </div>
    </div>
</div>

{{-- MODAL: QUALIFICATIONS INSPECTION --}}
<div class="modal fade" id="qualsModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content" style="border-radius:14px;">
            <div class="modal-header bg-light">
                <h5 class="modal-title font-weight-bold">
                    <i class="fas fa-user-check text-purple me-2" style="color:#7C3AED;"></i> Survey Qualifications & Targeting
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body p-3">
                <div id="qualsModalLoading" class="text-center py-4">
                    <i class="fas fa-spinner fa-spin fa-2x text-purple" style="color:#7C3AED;"></i>
                    <p class="mt-2 text-muted">Fetching targeting criteria from Zamplia...</p>
                </div>
                <div id="qualsModalContent" style="display:none;"></div>
            </div>
        </div>
    </div>
</div>

<script>
$(document).ready(function () {
    if (!$.fn.DataTable.isDataTable('#zampliaSurveysTable')) {
        $('#zampliaSurveysTable').DataTable({
            "pageLength": 10,
            "lengthMenu": [10, 25, 50, 100],
            "ordering": true,
            "searching": true,
            "paging": true,
            "info": true,
            "language": {
                "search": "Filter Surveys:"
            }
        });
    }
});

// Trigger AJAX sync
function triggerSync() {
    let icon = $('#syncIcon');
    let text = $('#syncText');
    let btn = $('#syncBtn');

    icon.addClass('fa-spin');
    text.text('Syncing...');
    btn.prop('disabled', true);

    $.ajax({
        url: "{{ route('admin.api_survey.sync') }}",
        type: 'GET',
        success: function(response) {
            icon.removeClass('fa-spin');
            text.text('Sync Now');
            btn.prop('disabled', false);

            if (response.status === 'success') {
                toastr.success(response.message || 'Surveys synchronized successfully!');
                setTimeout(function() {
                    location.reload();
                }, 1000);
            } else {
                toastr.error(response.message || 'Sync failed.');
            }
        },
        error: function(xhr) {
            icon.removeClass('fa-spin');
            text.text('Sync Now');
            btn.prop('disabled', false);
            toastr.error('Error contacting sync API.');
        }
    });
}

// Open Quotas Modal
function openQuotasModal(surveyId, surveyName) {
    $('#quotasModal').modal('show');
    $('#quotasModalLoading').show();
    $('#quotasModalContent').hide();

    $.ajax({
        url: "{{ url('admin/api_survey/quotas') }}/" + surveyId,
        type: 'GET',
        success: function(res) {
            $('#quotasModalLoading').hide();
            let html = '<div class="alert alert-light border mb-3"><strong>Survey:</strong> ' + surveyName + ' (PID: ' + surveyId + ')</div>';

            if (res.status === 'success' && res.data && res.data.length > 0) {
                html += '<table class="table table-bordered table-sm"><thead><tr class="bg-light"><th>Quota Name / ID</th><th>Completes Required</th><th>Remaining</th><th>Status</th></tr></thead><tbody>';
                res.data.forEach(function(q) {
                    let isClosed = q.IsClosed == 1 || q.RemainingQuota <= 0;
                    html += '<tr>';
                    html += '<td><strong>' + (q.QuotaName || q.QuotaId || 'General Quota') + '</strong></td>';
                    html += '<td>' + (q.NumberOfRespondents || q.CompletesRequired || 'N/A') + '</td>';
                    html += '<td><span class="badge badge-' + (isClosed ? 'danger' : 'success') + '">' + (q.RemainingQuota !== undefined ? q.RemainingQuota : 'Open') + '</span></td>';
                    html += '<td>' + (isClosed ? '<span class="close-status">Closed</span>' : '<span class="open-status">Open</span>') + '</td>';
                    html += '</tr>';
                });
                html += '</tbody></table>';
            } else {
                html += '<div class="alert alert-info"><i class="fas fa-info-circle me-1"></i> No individual quota constraints found for this survey (All demographic traffic accepted).</div>';
            }

            $('#quotasModalContent').html(html).show();
        },
        error: function() {
            $('#quotasModalLoading').hide();
            $('#quotasModalContent').html('<div class="alert alert-danger">Failed to fetch quotas from Zamplia.</div>').show();
        }
    });
}

// Open Qualifications Modal
function openQualsModal(surveyId, surveyName) {
    $('#qualsModal').modal('show');
    $('#qualsModalLoading').show();
    $('#qualsModalContent').hide();

    $.ajax({
        url: "{{ url('admin/api_survey/qualifications') }}/" + surveyId,
        type: 'GET',
        success: function(res) {
            $('#qualsModalLoading').hide();
            let html = '<div class="alert alert-light border mb-3"><strong>Survey:</strong> ' + surveyName + ' (PID: ' + surveyId + ')</div>';

            if (res.status === 'success' && res.data && res.data.length > 0) {
                html += '<table class="table table-bordered table-sm"><thead><tr class="bg-light"><th>Qualification / Question</th><th>Condition</th><th>Required Answers / Values</th></tr></thead><tbody>';
                res.data.forEach(function(item) {
                    let answers = Array.isArray(item.Answers) ? item.Answers.join(', ') : (item.Answers || 'Any');
                    html += '<tr>';
                    html += '<td><strong>' + (item.Name || item.QualificationId || 'Demographic Question') + '</strong></td>';
                    html += '<td><span class="badge badge-secondary">' + (item.Operator || 'Equals') + '</span></td>';
                    html += '<td><code>' + answers + '</code></td>';
                    html += '</tr>';
                });
                html += '</tbody></table>';
            } else {
                html += '<div class="alert alert-info"><i class="fas fa-info-circle me-1"></i> No specific qualification conditions specified. Open to general population.</div>';
            }

            $('#qualsModalContent').html(html).show();
        },
        error: function() {
            $('#qualsModalLoading').hide();
            $('#qualsModalContent').html('<div class="alert alert-danger">Failed to fetch qualifications from Zamplia.</div>').show();
        }
    });
}
</script>