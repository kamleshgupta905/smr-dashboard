@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif
<!-- ✅ DATATABLE REQUIRED -->
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>

@if (session()->has('message'))
<script>
    showToast('success', '{{ session('message') }}');
</script>
@endif


<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
/* ===== PREMIUM LIGHT RESPONSIVE UI ===== */

body {
    font-family: 'Inter', sans-serif !important;
    background: #F8FAFC !important;
    color: #0F172A !important;
    overflow-x: hidden;
}

/* soft background glow */
body::before {
    content: "";
    position: fixed;
    width: 500px;
    height: 500px;
    background: #2563eb;
    filter: blur(140px);
    opacity: 0.05;
    top: -150px;
    left: -150px;
    z-index: 0;
    pointer-events: none;
}
.layout-box-content-format1 .card-header .btn-group {
    background: white;
    border-radius: 40px;
    padding: 4px 16px;
    margin-left: 10px;
    margin-right: 10px;
}
/* ===== MAIN CARD ===== */

.card.list-view {
    position: relative;
    z-index: 1;
    background: #ffffff !important;
    border-radius: 18px !important;
    border: 1px solid #E5E7EB !important;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05) !important;
    transition: all 0.3s ease;
    overflow: hidden;
}

.card.list-view:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08) !important;
}

/* ===== HEADER ===== */

.layout-box-content-format1 .card-header {
    background: linear-gradient(135deg, #ffffff, #f8fbff) !important;
    border-bottom: 1px solid #E5E7EB !important;
    min-height: 72px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 24px !important;
    flex-wrap: wrap;
    gap: 14px;
}

.card-title {
    font-size: 20px !important;
    font-weight: 700 !important;
    color: #0F172A !important;
    margin: 0 !important;
}

/* ===== BUTTONS ===== */

.btn,
.btn-group .btn {
    background: linear-gradient(135deg, #2563EB, #3B82F6) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 9px 16px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    transition: all 0.25s ease;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
}

.btn:hover,
.btn-group .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 24px rgba(37, 99, 235, 0.20);
}

/* ===== TABLE ===== */

.card-body {
    padding: 22px !important;
}

.customTbl {
    width: 100% !important;
    border-collapse: separate !important;
    border-spacing: 0 12px !important;
}

.tablehead {
    background: transparent !important;
}

.customTbl thead th {
    font-size: 11px !important;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700 !important;
    color: #64748B !important;
    padding: 14px !important;
    border: none !important;
    white-space: nowrap;
}

.customTbl tbody tr {
    background: #ffffff !important;
    border: 1px solid #E5E7EB !important;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
    transition: all 0.25s ease;
}

.customTbl tbody tr:hover {
    transform: translateY(-2px);
    background: #F8FBFF !important;
    box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
}

.customTbl td {
    padding: 15px !important;
    font-size: 14px !important;
    color: #334155 !important;
    vertical-align: middle !important;
    border-top: 1px solid #F1F5F9 !important;
    border-bottom: 1px solid #F1F5F9 !important;
}

.customTbl tbody tr td:first-child {
    border-left: 1px solid #F1F5F9 !important;
    border-radius: 12px 0 0 12px;
}

.customTbl tbody tr td:last-child {
    border-right: 1px solid #F1F5F9 !important;
    border-radius: 0 12px 12px 0;
}

/* ===== STATUS ===== */

.open-status,
.active-status {
    background: #ECFDF5;
    color: #16A34A;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
}

.pause-status,
.pending-status {
    background: #FFF7ED;
    color: #EA580C;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
}

.close-status,
.inactive-status {
    background: #FEF2F2;
    color: #DC2626;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
}

/* ===== ALERTS ===== */

.alert-success {
    background: #ECFDF5 !important;
    border: 1px solid #BBF7D0 !important;
    color: #166534 !important;
    border-radius: 12px !important;
}

.alert-danger {
    background: #FEF2F2 !important;
    border: 1px solid #FECACA !important;
    color: #991B1B !important;
    border-radius: 12px !important;
}

/* ===== BID DETAILS BOX ===== */

.bid-box {
    background: #ffffff !important;
    border: 1px solid #E5E7EB !important;
    border-radius: 14px !important;
    padding: 20px !important;
    box-shadow: 0 8px 20px rgba(15,23,42,0.03);
}

.bid-box strong {
    color: #0F172A !important;
}

/* ===== DATATABLE ===== */

.dataTables_filter input,
.dataTables_length select {
    background: #ffffff !important;
    border: 1px solid #D1D5DB !important;
    color: #0F172A !important;
    border-radius: 10px !important;
    padding: 8px 12px !important;
    min-height: 40px;
}

.dataTables_filter input:focus,
.dataTables_length select:focus {
    border-color: #2563EB !important;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.08) !important;
}

.dataTables_paginate .paginate_button.current {
    background: linear-gradient(135deg, #2563EB, #3B82F6) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 8px !important;
}

/* ===== RESPONSIVE ===== */

.layout-box-content-format1 {
    width: 100%;
    margin: 0 auto;
}

@media (max-width: 991px) {
    .card-header {
        padding: 18px !important;
    }

    .card-body {
        padding: 18px !important;
    }

    .customTbl td,
    .customTbl th {
        white-space: nowrap;
    }
}

@media (max-width: 768px) {
    .card-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .card-title {
        font-size: 18px !important;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }

    .bid-box .row > div {
        margin-bottom: 12px;
    }
}
</style>

<section class="layout-box-content-format1">
    <div class="card card-primary list-view">
        <div class="card-header box-shdw">
            <h3 class="card-title">Projects List</h3>
          
        </div>
        <div class="card-body">
            <div class="formblock-box">
                            @if(session('success'))
    <div class="alert alert-success">
        {{ session('success') }}
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger">
        {{ session('error') }}
    </div>
@endif

                <div class="table-responsive">
                   
                    <table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped">
                        <thead class="tablehead">
                            <tr>
                                <th>Sl No.</th>
                                <th>Project Name</th>
                                <th>Client</th>
                                <th>PID</th>
                                <th class="text-center">Status</th>
                               
                                 <th class="cpi_column">CPI</th>
                               
                                <th>IR</th>
                                <th>LOI</th>
                                <th>Completes</th>
                                <th>Terminates</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                      <tbody>
                        @if(isset($surveys) && $surveys->count() > 0)
                        
                            @foreach($surveys as $key => $survey)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>{{ $survey['Name'] ?? 'N/A' }}</td>
                                    <td>{{ $survey['StudyTypes'] ?? 'N/A' }}</td>
                                    <td>{{ $survey['SurveyId'] ?? 'N/A' }}</td>

                                    <td class="text-center">
                                        @if(($survey['status'] ?? '') == 'Live')
                                            <span class="open-status">Live</span>
                                        @elseif(($survey['status'] ?? '') == 'Paused')
                                            <span class="pause-status">Paused</span>
                                        @else
                                            <span class="close-status">
                                                {{ $survey['status'] ?? 'N/A' }}
                                            </span>
                                        @endif
                                    </td>

                                   <td class="cpi_column">{{ $survey['CPI'] ?? 'N/A' }}</td>
                                    <td>{{ $survey['IR'] ?? 'N/A' }}%</td>
                                    <td>{{ $survey['LOI'] ?? 'N/A' }} min</td>
                                    <td>{{ $survey['TotalCompleteRequired'] ?? '0' }}</td>
                                    <td>0</td>

                                    <td class="text-center">
                                        <a href="{{ url('admin/survey/view/' . ($survey['SurveyId'] ?? 0)) }}"
                                        class="btn btn-sm">
                                            View
                                        </a>
                                    </td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td>--</td>
                                <td>No Data Found</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                            </tr>
                        @endif
                        </tbody>
                    </table>
                   
                </div>
            </div>
        </div>
    </div>
</section>
<script>
    $(document).on("click", ".survey-row", function () {
    let url = $(this).data("url");
    window.location.href = url;
});

@if(session('surveysAdmin.role') == 8)
    $('.cpi_column').hide();
@endif
</script>
<!-- ✅ DATATABLE INIT -->
<script>
$(document).ready(function () {
    $('.dataTable').DataTable({
        "pageLength": 10,
        "lengthMenu": [5, 10, 25, 50],
        "ordering": true,
        "searching": true,
        "paging": true,
        "info": true
    });
});
</script>