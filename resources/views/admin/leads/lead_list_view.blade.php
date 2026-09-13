@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif

<style>
/* ===== GLOBAL ===== */
body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(120deg, #eef2ff, #f8fafc);
}

/* ===== CARD ===== */
.card.list-view {
    border-radius: 18px;
    border: none;
    background: #fff;
    box-shadow: 0 12px 35px rgba(0,0,0,0.06);
    overflow: hidden;
}

/* ===== HEADER (GLASS EFFECT 🔥) ===== */
.layout-box-content-format1 .card-header {
    background: linear-gradient(135deg, #111827, #929dac) !important;
    height: auto !important;
    padding: 10px 20px !important;
    border-radius: 12px 12px 0 0 !important;
    justify-content: space-between;
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin: 0;
}

/* ===== TABLE ===== */
.customTbl {
    width: 100% !important;
    border-collapse: separate !important;
    border-spacing: 0 10px !important;
}

/* GLASS HEADER */
.customTbl thead {
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(10px);
}

.customTbl thead th {
    font-size: 11px;
    text-transform: uppercase;
    color: #6b7280;
    font-weight: 600;
    padding: 14px;
    border: none !important;
}

/* ROW CARD STYLE */
.customTbl tbody tr {
    background: #fff !important;
    box-shadow: 0 6px 18px rgba(0,0,0,0.05);
    border-radius: 12px;
    transition: 0.25s;
}

/* HOVER EFFECT */
.customTbl tbody tr:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

/* CELLS */
.customTbl tbody td {
    padding: 16px;
    border: none !important;
    background: transparent !important;
    font-size: 14px;
    color: #1f2937;
}

/* ROUND CORNERS */
.customTbl tbody tr td:first-child {
    border-radius: 12px 0 0 12px;
}
.customTbl tbody tr td:last-child {
    border-radius: 0 12px 12px 0;
}

/* ===== STATUS BADGE ===== */
.status-badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.Completed-status {
    background: #ecfdf5;
    color: #059669;
}
.Pending-status {
    background: #fef3c7;
    color: #d97706;
}
.Terminated-status {
    background: #fee2e2;
    color: #dc2626;
}

/* ===== DATATABLE FIX ===== */
.dataTables_wrapper .dataTables_filter input {
    border-radius: 8px;
    border: 1px solid #ddd;
    padding: 6px 10px;
}

.dataTables_wrapper .dataTables_paginate .paginate_button {
    border-radius: 8px !important;
    padding: 4px 10px;
}

/* ===== RESPONSIVE ===== */
.table-responsive {
    padding: 10px;
}
</style>

<section class="layout-box-content-format1">
    <div class="card list-view">
        
        <div class="card-header">
            <h3 class="card-title">Leads</h3>
        </div>

        <div class="card-body">
            <div class="table-responsive">

                <!-- ❗ IMPORTANT: Removed bootstrap conflicting classes -->
                <table class="customTbl dataTable">
                    <thead>
                        <tr>
                            <th style="display:none;"></th>
                            <th>ID</th>
                            <th>Project ID</th>
                            <th>Project Name</th>
                            <th class="text-center">Status</th>
                            <th>UID</th>
                            <th>Date</th>
                            <th>IP</th>
                        </tr>
                    </thead>

                    <tbody>
                        @foreach ($leadList as $lead)
                        <tr>
                            <td style="display:none;"></td>
                            <td>{{ $lead->id }}</td>
                            <td>{{ $lead->project_id }}</td>
                            <td>{{ $lead->project_name }}</td>

                            <td class="text-center">
                                <span class="status-badge {{ str_replace(' ', '', $lead->status) }}-status">
                                    {{ $lead->status }}
                                </span>
                            </td>

                            <td><strong>{{ $lead->uid }}</strong></td>
                            <td>{{ $lead->date }}</td>
                            <td>{{ json_decode($lead->user_info)->ip_address }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>

            </div>
        </div>
    </div>
</section>

<script>
$(document).ready(function () {
    $('.dataTable').DataTable({
        dom: 'Bfrtip',
        buttons: ['excelHtml5','pdfHtml5'],
        pageLength: 10,
        responsive: true
    });
});
</script>