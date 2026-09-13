@if (session()->has('message'))
<script>
    showToast('success', '{{ session('message') }}')
</script>
@endif
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">

<style>

/* ===== GLOBAL FONT CHANGE ===== */
body, .card, .table, input, select, label, th, td {
    font-family: 'Inter', 'Poppins', sans-serif !important;
}

/* ===== TYPOGRAPHY (BIG CHANGE FEEL) ===== */
.card-title {
    font-size: 20px !important;
    font-weight: 600 !important;
    letter-spacing: 0.3px !important;
}

.table th {
    font-size: 12px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.8px !important;
    color: #6b7280 !important;
}

.table td {
    font-size: 14px !important;
    font-weight: 500 !important;
    color: #111827 !important;
}

/* ===== HEADER NEW PREMIUM LOOK ===== */
.layout-box-content-format1 .card-header {
    background: linear-gradient(135deg, #111827, #929dac) !important;
    height: auto !important;
    padding: 10px 20px !important;
    border-radius: 12px 12px 0 0 !important;
    
    
    justify-content: space-between;
}

.card-title {
    color: #fff !important;
}

/* ===== FILTER LABELS ===== */
label {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #9ca3af !important;
    margin-bottom: 4px !important;
}

/* ===== INPUT MODERN ===== */
#search_client,
#search_user,
#search_status {
    border: none !important;
    border-bottom: 2px solid #e5e7eb !important;
    border-radius: 0 !important;
    background: transparent !important;
    padding-left: 0 !important;
    transition: all 0.3s ease !important;
    font-size: 14px !important;
    color: #111827 !important;
}

#search_client::placeholder,
#search_user::placeholder {
    color: #9ca3af !important;
}

#search_client:focus,
#search_user:focus,
#search_status:focus {
    border-bottom: 2px solid #6366f1 !important;
    box-shadow: none !important;
    outline: none !important;
}

/* ===== SELECT2 MODERN ===== */
.select2-container .select2-selection--single {
    border: none !important;
    border-bottom: 2px solid #e5e7eb !important;
    border-radius: 0 !important;
    height: 38px !important;
    padding-left: 0 !important;
    background: transparent !important;
}

.select2-container--default .select2-selection--single .select2-selection__rendered {
    line-height: 34px !important;
    padding-left: 0 !important;
    color: #111827 !important;
}

.select2-container--default .select2-selection--single:focus {
    border-bottom: 2px solid #6366f1 !important;
}

/* ===== TABLE NEW LOOK ===== */
.customTbl {
    border-radius: 12px !important;
    overflow: hidden !important;
    background: #fff !important;
}

.customTbl thead {
    background: #f9fafb !important;
}

.customTbl tbody tr {
    transition: all 0.2s ease !important;
}

.customTbl tbody tr:hover {
    background: #f3f4f6 !important;
}

/* ===== BUTTON STYLE ===== */
.btn {
    border-radius: 8px !important;
    font-size: 13px !important;
}

/* ===== ALERT ===== */
.alert {
    font-size: 13px !important;
    border-radius: 8px !important;
}

/* ===== SPACING IMPROVEMENT ===== */
.filter-bar .col-md-4 {
    margin-bottom: 10px !important;
}
/* ===== GLASS EFFECT TABLE HEADER ===== */

/* ===== SCOPED GLASS THEAD (PREMIUM LOOK) ===== */

.layout-box-content-format1 .table.customTbl thead {
   background: linear-gradient(135deg, #111827, #929dac) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
}

.layout-box-content-format1 .table.customTbl thead th {
    background: transparent !important;
    color: #ffffff !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    font-family: "Inter", "Poppins", sans-serif !important;
    font-size: 12px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.8px !important;
    padding: 14px 12px !important;
}

/* optional: slight separation */
.layout-box-content-format1 .table.customTbl thead tr {
    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
}
.layout-box-content-format1 {
    font-family: "Montserrat", sans-serif;
    width: 100% !important; 
    margin: 0 auto;
}
.filter-bar .col-md-4 {
    margin-bottom: 10px !important;
    left: 1rem !important;
}
.layout-box-content-format1 .table.customTbl .tbl-action-btn {
    background: linear-gradient(90deg, #2e3094 0%, #8f8f8f 100%);
}
</style>
<section class="layout-box-content-format1">
    <div class="card card-primary list-view">

        <div class="card-header box-shdw">
            <h3 class="card-title">Bids List</h3>
            <x-button-component 
                title='<i class="fas fa-plus"></i> Create Bid' 
                url="{{ url('admin/bid/add') }}" 
            />
        </div>

        <div class="card-body">

            {{-- SEARCH FILTERS (structure unchanged, only design) --}}
            <div class="formblock-box mb-3">
                <div class="row">

                    <div class="col-md-3">
                        <label>Keywords</label>
                        <input type="text" id="search_keyword" class="form-control" placeholder="Search bid or client...">
                    </div>

                    <div class="col-md-3">
                        <label>User</label>
                        <select id="search_user" class="form-control">
                            <option value="">All Users</option>
                            @foreach ($users as $u)
                                <option value="{{ $u->id }}">{{ $u->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-md-3">
                        <label>Client</label>
                        <select id="search_client" class="form-control">
                            <option value="">All Clients</option>
                            @foreach ($clients as $c)
                                <option value="{{ $c->id }}">{{ $c->client_name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-md-2">
                        <label>Status</label>
                        <select id="search_status" class="form-control">
                            <option value="">All Status</option>
                            <option>Won</option>
                            <option>Lost</option>
                            <option>Open</option>
                        </select>
                    </div>

                    <div class="col-md-1">
                        <label>&nbsp;</label>
                        <button class="btn btn-primary w-100" id="btn_search">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>

                    <div class="col-md-1">
                        <label>&nbsp;</label>
                        <button class="btn btn-outline-secondary w-100" id="btn_clear">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>

                </div>
            </div>

            {{-- TABLE --}}
            <div class="formblock-box">
                <div class="table-responsive" id="bids_table_wrapper">
                    <table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped" id="bidsTable">
                        <thead>
                            <tr>
                                <th>SR.NO</th>
                                <th>ID</th>
                                <th>Bid Name</th>
                                <th>User</th>
                                <th>Client</th>
                                <th>Client Contact</th>
                                <th>Status</th>
                                <th>Info</th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            @php $i = 1; @endphp
                        @forelse ($bids as $bid)
                            <tr>
                                <td>{{ $i++ }}</td>
                                <td>{{ $bid->bid_id }}</td>
                                <td>{{ $bid->bid_name }}</td>
                                <td>{{ $bid->user_name ?? '-' }}</td>
                                <td>{{ $bid->client_name ?? '-' }}</td>
                                <td>{{ $bid->contact_name ?? '-' }}</td>

                                <td>
                                    @if($bid->status == 'Won')
                                        <span class="badge bg-success">Won</span>
                                    @elseif($bid->status == 'Lost')
                                        <span class="badge bg-danger">Lost</span>
                                    @else
                                        <span class="badge bg-warning text-dark">Open</span>
                                    @endif
                                </td>

                                <td>
                                    {{ $bid->created_at ? date('m/d/Y', strtotime($bid->created_at)) : '-' }}
                                </td>

                                <td>
                                    <table>
                                        <tr>
                                            <td>
                                                <x-edit-button-component 
                                                    title='<i class="fas fa-edit"></i>' 
                                                    url="{{ url('admin/bid/edit/'.$bid->id) }}" />
                                            </td>
                                            <td>
                                                <!--<x-edit-button-component -->
                                                <!--    title='<i class="fas fa-eye"></i>' -->
                                                <!--    url="{{ url('admin/bid/view/'.$bid->id) }}" />-->
                                            </td>
                                            <td>
                                                <a href="javascript:void(0)"
                                       onclick="deleteBid({{ $bid->id }})"
                                       class="btn btn-danger btn-sm">
                                        <i class="fas fa-trash"></i>
                                    </a>

                                    {{-- HIDDEN DELETE FORM --}}
                                    <form id="delete-form-{{ $bid->id }}"
                                          action="{{ route('admin.bid.delete', $bid->id) }}"
                                          method="POST" style="display:none;">
                                        @csrf
                                        @method('DELETE')
                                    </form>
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="text-center">No records found</td>
                            </tr>
                        @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</section>


<script>
  function deleteBid(id) {
    if (confirm('Delete this bid?')) {
        document.getElementById('delete-form-' + id).submit();
    }
}  
$(document).ready(function () {
    if ($.fn.DataTable.isDataTable('#bidsTable')) {
        $('#bidsTable').DataTable().destroy();
    }

    $('#bidsTable').DataTable({
        paging: true,
        pageLength: 10,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        responsive: true
    });
});
</script>

<script src="{{ asset('assets/admin/js/bidlist.js') }}"></script>

