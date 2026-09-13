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
            <x-button-component title='<i class="fas fa-plus"></i> Add' url="{{ url('admin/') }}/project/addedit" />
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
                   
                   @if(!empty($bidDetails))
                        <div class="mb-3 p-3" style="background:#f8f9fa;border:1px solid #ddd;border-radius:6px;">
                            <div class="row text-center">
                                <div class="col"><strong>Bid No:</strong> {{ $bidDetails->bid_id }}</div>
                                <div class="col"><strong>Bid Name:</strong> {{ $bidDetails->bid_name }}</div>
                                <div class="col"><strong>Client:</strong> {{ $bidDetails->client_name }}</div>
                                <div class="col"><strong>Status:</strong> {{ $bidDetails->status }}</div>
                                <div class="col"><strong>PM:</strong> {{ $bidDetails->pm_name ?? 'N/A' }}</div>
                               <div class="col"><strong>Clicks:</strong> {{ $bidDetails->clicks ?? 0 }}</div>
                                <div class="col"><strong>Completes:</strong> {{ $bidDetails->completes ?? 0 }}</div>
                                <div class="col"><strong>Fails:</strong> {{ $bidDetails->fails ?? 0 }}</div>
                                <div class="col"><strong>OQ:</strong> {{ $bidDetails->oq ?? 0 }}</div>
                                <div class="col"><strong>QT:</strong> {{ $bidDetails->qt ?? 0 }}</div>
                                <div class="col"><strong>Revenue:</strong> {{ $bidDetails->revenue ?? 0 }}</div>
                                <div class="col"><strong>Profit:</strong> {{ $bidDetails->profit ?? 0 }}</div>

                            </div>
                        </div>
                          <table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped">
                        <thead class="tablehead">
                            <tr>
                                <th>Status</th>
                                <th>Id</th>
                                <th>Survey Name</th>
                                <th>Country</th>
                                <th>N</th>
                                <th>Cpi</th>
                                <th>Clicks</th>
                               
                                <th>Complete</th>
                                <th>Fails</th>
                                <th>OQ</th>
                                <th>QT</th>
                                <th>LOI</th>
                                <th>IR</th>
                                <th>Revenue</th>
                                <th>Profit</th>
                                <th>Last Complete</th>
                                <th>Last attempt</th>
                                <th>Info</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            
                                @foreach ($optionsList as $item)
                               <tr class="survey-row" data-url="{{ url('admin/survey/update/'.$item->id) }}">
                                    {{-- Status --}}
                                    <td>
                                        <span class="badge bg-warning text-dark">Open</span>
                                    </td>

                                    {{-- Id --}}
                                    <td>{{ $item->id }}</td>

                                    {{-- Survey Name --}}
                                    <td>{{ $item->target_audience }}</td>

                                    {{-- Country --}}
                                    <td>{{ $item->country_name }}</td>

                                    {{-- N --}}
                                    <td>{{ $item->feasibility_n }}</td>

                                    {{-- CPI --}}
                                    <td>{{ $item->cpi }}</td>

                                    {{-- Clicks  (not in data, showing 0) --}}
                                    <td>0</td>

                                    {{-- Complete (not in data, showing 0) --}}
                                    <td>0</td>

                                    {{-- Fails (not in data, showing 0) --}}
                                    <td>0</td>

                                    {{-- OQ (not in data, showing 0) --}}
                                    <td>0</td>

                                    {{-- QT (not in data, showing 0) --}}
                                    <td>0</td>

                                    {{-- LOI --}}
                                    <td>{{ $item->loi }}</td>

                                    {{-- IR --}}
                                    <td>{{ $item->ir }}</td>

                                    {{-- Revenue --}}
                                    <td>{{ $item->revenue }}</td>

                                    {{-- Profit = revenue - (cpi * completes) → no data, so temporary 0 --}}
                                    <td>0</td>

                                    {{-- Last Complete → no field in data --}}
                                    <td>--</td>

                                    {{-- Last Attempt → no field in data --}}
                                    <td>--</td>

                                    {{-- Info button --}}
                                    <td>
                                        <button class="btn btn-sm btn-info">Info</button>
                                    </td>
                                     <td>
                                        <table>
                                            <tr>
                                                <td>
                                                    <x-edit-button-component title='<i class="fas fa-edit"></i>'
                                                        url="{{ url('admin/project/addedit') }}" />
                                                </td>
                                                <td>
                                                    <x-edit-button-component title='<i class="fas fa-eye"></i>'
                                                        url="{{ url('admin/project/view/') }}" />
                                                </td>
                                            
                                            </tr>
                                        </table>
                                    </td>
                                                
                                </tr>
                                @endforeach
                            
                            
                        </tbody>
                    </table>
                        @else



                    <table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped">
                        <thead class="tablehead">
                            <tr>
                                <th>Sl No.</th>
                                <th>Project Name</th>
                                <th>Client</th>
                                <th>PID</th>
                                <th class="text-center">Status</th>
                                <th>CPI</th>
                                <th>IR</th>
                                <th>LOI</th>
                                <th>Completes</th>
                                <th>Terminates</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($projectsList as $key => $project)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>{{ $project->name }}</td>
                                    <td>{{ $project->client_name }}</td>
                                    <td>{{ $project->project_id }}</td>
                                    <td><span class="{{ $project->status }}-status">{{ $project->status }}</span></td>
                                    <td>{{ $project->cost_per_complete }}</td>
                                    <td>{{ $project->ir ?? 0 }}</td>
                                    <td>{{ $project->loi }}</td>
                                    <td>{{ $project->complete_count ?? 0 }}</td>
                                    <td>{{ $project->terminates_count ?? 0 }}</td>
                                    <td>
                                        <table>
                                            <tr>
                                                <td>
                                                    <x-edit-button-component title='<i class="fas fa-edit"></i>'
                                                        url="{{ url('admin/project/addedit') }}/{{ $project->id }}" />
                                                </td>
                                                <td>
                                                    <x-edit-button-component title='<i class="fas fa-eye"></i>'
                                                        url="{{ url('admin/project/view/') }}/{{ $project->id }}" />
                                                </td>
                                                 <td>
                                                 
                <a href="{{ url('admin/project/delete/') }}/{{ $project->id }}" class="btn " 
                 onclick="return confirm('Are you sure you want to delete this client?')">
                    ❌ </a>

                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @endif
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