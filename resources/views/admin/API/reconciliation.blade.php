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

.btn-primary-custom {
    background: linear-gradient(135deg, #2563EB, #3B82F6) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    font-weight: 600;
    font-size: 13px;
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
        <a href="{{ url('admin/api_survey/reconciliation') }}" class="pill-link active">
            <i class="fas fa-file-invoice-dollar me-1"></i> Reconciliation
        </a>
        <a href="{{ url('admin/api_survey/reference-data') }}" class="pill-link">
            <i class="fas fa-database me-1"></i> Reference Data
        </a>
    </div>

    {{-- MAIN CARD --}}
    <div class="card card-primary list-view">
        <div class="card-header">
            <div>
                <h3 class="card-title font-weight-bold">
                    <i class="fas fa-file-invoice-dollar text-primary me-2"></i> Zamplia Reconciliation & Financial Audit
                </h3>
                <small class="text-muted">Reconcile participant session outcomes directly with Zamplia's billing records</small>
            </div>
        </div>

        <div class="card-body p-4">
            {{-- FILTER FORM --}}
            <form method="GET" action="{{ route('admin.api_survey.reconciliation') }}" class="mb-4">
                <div class="row align-items-end">
                    <div class="col-md-3">
                        <label class="form-label font-weight-bold text-dark">Start Date</label>
                        <input type="date" name="start_date" class="form-control" value="{{ $startDate ?? '' }}" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label font-weight-bold text-dark">End Date</label>
                        <input type="date" name="end_date" class="form-control" value="{{ $endDate ?? '' }}" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label font-weight-bold text-dark">Session Status</label>
                        <select name="status" class="form-control">
                            <option value="Complete" {{ ($status ?? '') == 'Complete' ? 'selected' : '' }}>Completes Only</option>
                            <option value="Terminate" {{ ($status ?? '') == 'Terminate' ? 'selected' : '' }}>Terminates</option>
                            <option value="Overquota" {{ ($status ?? '') == 'Overquota' ? 'selected' : '' }}>Overquota</option>
                            <option value="" {{ empty($status) ? 'selected' : '' }}>All Statuses</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <button type="submit" class="btn-primary-custom w-100 py-2">
                            <i class="fas fa-search me-1"></i> Fetch Reconciliation
                        </button>
                    </div>
                </div>
            </form>

            <hr>

            {{-- RESULTS TABLE --}}
            <div class="table-responsive mt-3">
                <table class="table table-bordered table-striped" id="reconcileTable">
                    <thead>
                        <tr class="bg-light">
                            <th>#</th>
                            <th>Survey ID</th>
                            <th>Transaction / RID</th>
                            <th>Date / Timestamp</th>
                            <th>Status</th>
                            <th>CPI ($)</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                    @if(!empty($reconciliationData) && is_array($reconciliationData))
                        @foreach($reconciliationData as $idx => $row)
                            <tr>
                                <td>{{ $idx + 1 }}</td>
                                <td><code>{{ $row['SurveyId'] ?? 'N/A' }}</code></td>
                                <td><strong>{{ $row['TransactionId'] ?? $row['RespondentId'] ?? 'N/A' }}</strong></td>
                                <td>{{ $row['DateTime'] ?? $row['Date'] ?? 'N/A' }}</td>
                                <td>
                                    @if(($row['Status'] ?? '') == 'Complete')
                                        <span class="badge badge-success">Complete</span>
                                    @elseif(($row['Status'] ?? '') == 'Terminate')
                                        <span class="badge badge-danger">Terminate</span>
                                    @else
                                        <span class="badge badge-warning">{{ $row['Status'] ?? 'N/A' }}</span>
                                    @endif
                                </td>
                                <td>${{ number_format((float)($row['CPI'] ?? 0), 2) }}</td>
                                <td><small>{{ $row['IpAddress'] ?? 'N/A' }}</small></td>
                            </tr>
                        @endforeach
                    @else
                        <tr>
                            <td colspan="7" class="text-center py-4 text-muted">
                                <i class="fas fa-search me-2"></i> No reconciliation records found for the selected date range.
                            </td>
                        </tr>
                    @endif
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>

<script>
$(document).ready(function() {
    $('#reconcileTable').DataTable({
        pageLength: 15,
        ordering: true,
        searching: true
    });
});
</script>
