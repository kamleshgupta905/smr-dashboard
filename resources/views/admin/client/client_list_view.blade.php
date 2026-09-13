<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="{{ asset('assets/admin/js/client.js') }}"></script>

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

/* =======================================================
   PREMIUM LIGHT UI - CLIENT LIST
   (NO HTML STRUCTURE CHANGE / RESPONSIVE)
======================================================= */

body {
    font-family: 'Inter', sans-serif !important;
    background: #F8FAFC !important;
    color: #0F172A !important;
    overflow-x: hidden;
}

/* subtle background glow */
body::before {
    content: '';
    position: fixed;
    width: 500px;
    height: 500px;
    background: #2563eb;
    filter: blur(150px);
    opacity: 0.05;
    top: -150px;
    left: -150px;
    z-index: 0;
    pointer-events: none;
}

/* remove hard background */
.card,
.table,
input,
select,
label,
th,
td {
    background: transparent !important;
    color: inherit !important;
}

/* =======================================================
   MAIN CARD
======================================================= */

.card.list-view {
    position: relative;
    z-index: 1;
    background: #FFFFFF !important;
    border-radius: 18px !important;
    border: 1px solid #E5E7EB !important;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06) !important;
    transition: all 0.3s ease;
    overflow: hidden;
}

.card.list-view:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08) !important;
}

/* =======================================================
   HEADER
======================================================= */

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
    gap: 12px;
}

.card-header .btn-group {
    margin-left: auto !important;
}

.card-title {
    font-size: 20px !important;
    font-weight: 700 !important;
    color: #0F172A !important;
    margin: 0 !important;
    letter-spacing: 0.3px;
}

/* =======================================================
   TOP BUTTON
======================================================= */

.btn-group .btn {
    background: linear-gradient(135deg, #2563EB, #3B82F6) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 10px 18px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    transition: all 0.25s ease;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15);
}

.btn-group .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(37, 99, 235, 0.22);
}

/* =======================================================
   TABLE
======================================================= */

.card-body {
    padding: 22px !important;
}

.customTbl {
    width: 100% !important;
    border-collapse: separate !important;
    border-spacing: 0 12px !important;
}

/* table header */
.customTbl thead th {
    font-size: 11px !important;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700 !important;
    color: #64748B !important;
    padding: 14px 14px !important;
    border: none !important;
    white-space: nowrap;
}

/* rows */
.customTbl tbody tr {
    background: #FFFFFF !important;
    border: 1px solid #E5E7EB !important;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
    transition: all 0.25s ease;
}

.customTbl tbody tr:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
    background: #F8FBFF !important;
}

/* cells */
.customTbl td {
    padding: 16px 14px !important;
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

/* =======================================================
   STATUS ICONS
======================================================= */

.status-active {
    color: #16A34A !important;
    font-size: 18px;
}

.status-inactive {
    color: #DC2626 !important;
    font-size: 18px;
}

/* =======================================================
   ACTION BUTTONS
======================================================= */

.btn-group-sm .btn {
    background: #F8FAFC !important;
    color: #2563EB !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: 8px !important;
    padding: 8px 12px !important;
    box-shadow: none !important;
}

.btn-group-sm .btn:hover {
    background: #2563EB !important;
    color: #ffffff !important;
    border-color: #2563EB !important;
    transform: translateY(-1px);
}

.deleteClientBtn {
    background: #FEF2F2 !important;
    color: #DC2626 !important;
    border: 1px solid #FECACA !important;
    border-radius: 8px !important;
    margin-left: 6px;
    padding: 8px 12px;
    transition: all 0.25s ease;
}

.deleteClientBtn:hover {
    background: #DC2626 !important;
    color: #ffffff !important;
    border-color: #DC2626 !important;
}

/* =======================================================
   DATATABLE CONTROLS
======================================================= */

.dataTables_wrapper .dataTables_length,
.dataTables_wrapper .dataTables_filter {
    margin-bottom: 18px;
}

.dataTables_filter input,
.dataTables_length select {
    background: #FFFFFF !important;
    border: 1px solid #D1D5DB !important;
    color: #0F172A !important;
    border-radius: 10px !important;
    padding: 8px 12px !important;
    min-height: 40px;
    outline: none !important;
}

.dataTables_filter input:focus,
.dataTables_length select:focus {
    border-color: #2563EB !important;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08) !important;
}

.dataTables_info {
    color: #64748B !important;
    font-size: 13px !important;
}

.dataTables_paginate .paginate_button {
    border-radius: 8px !important;
    margin: 0 2px !important;
}

.dataTables_paginate .paginate_button.current {
    background: linear-gradient(135deg, #2563EB, #3B82F6) !important;
    color: #ffffff !important;
    border: none !important;
}

/* =======================================================
   CONTAINER
======================================================= */

.layout-box-content-format1 {
    width: 100%;
    margin: 0 auto;
    font-family: 'Inter', sans-serif !important;
}

/* =======================================================
   RESPONSIVE
======================================================= */

@media (max-width: 991px) {

    .card-header {
        padding: 18px !important;
    }

    .card-body {
        padding: 18px !important;
    }

    .btn-group .btn {
        padding: 9px 14px !important;
    }
}

@media (max-width: 768px) {

    .card-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .card-header .btn-group {
        margin-left: 0 !important;
        width: 100%;
    }

    .card-header .btn-group .btn {
        width: 100%;
        justify-content: center;
    }

    .card-title {
        font-size: 18px !important;
    }

    .customTbl td,
    .customTbl th {
        white-space: nowrap;
    }
}

</style>

<section class="layout-box-content-format1">
    <div class="card card-primary list-view">

        <div class="card-header">
            <h3 class="card-title">Client List</h3>

            <div class="btn-group btn-group-sm">
                <a href="{{ url('admin/client/addedit') }}" class="btn">
                    <i class="fas fa-plus"></i> Add Client
                </a>
            </div>
        </div>

        <div class="card-body">
            <div class="table-responsive">

                <!-- ✅ SAME CLASS, NO CHANGE -->
                <table class="table customTbl dataTable dataContainer">

                    <thead>
                        <tr>
                            <th>Sl No.</th>
                            <th>Client Name</th>
                            <th class="text-center">Status</th>
                            <th>Country</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        @foreach ($clientList as $key => $client)
                        <tr id="clientRow_{{ $client->id }}">
                            <td>{{ $key + 1 }}</td>
                            <td>{{ $client->client_name }}</td>

                            <td class="text-center">
                                @if ($client->is_active == 'Y')
                                    <i class="fas fa-check-circle status-active"></i>
                                @else
                                    <i class="fas fa-times-circle status-inactive"></i>
                                @endif
                            </td>

                            <td>{{ $client->country }}</td>

                            <td class="text-center">
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ url('admin/client/addedit') }}/{{ $client->id }}" class="btn">
                                        <i class="fas fa-edit"></i>
                                    </a>

                                    <a href="{{ url('admin/client/view') }}/{{ $client->id }}" class="btn">
                                        <i class="fas fa-eye"></i>
                                    </a>

                                    <button class="deleteClientBtn" data-id="{{ $client->id }}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>

                </table>

            </div>
        </div>

    </div>
</section>

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