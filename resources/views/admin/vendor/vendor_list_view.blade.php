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

/* =========================================================
   PREMIUM LIGHT SAAS UI — REAL VISIBLE CHANGES
   (Backend untouched | class names untouched)
========================================================= */

/* ===== PAGE BACKGROUND ===== */
body {
    font-family: 'Inter', sans-serif !important;
    background: #f4f7fc !important;
    color: #1e293b !important;
    overflow-x: hidden;
}

/* REMOVE DARK GLOW */
body::before {
    display: none !important;
}

/* remove transparent forced bg */
.card,
.table,
input,
select,
label,
th,
td {
    background: unset !important;
    color: unset !important;
}

/* ===== MAIN CARD ===== */
.card.list-view {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 18px !important;
    box-shadow: 0 10px 35px rgba(15, 23, 42, 0.06) !important;
    overflow: hidden;
    transition: 0.3s;
}

.card.list-view:hover {
    transform: translateY(-2px);
}

/* ===== HEADER ===== */
.layout-box-content-format1 .card-header {
    background: #ffffff !important;
    border-bottom: 1px solid #e5e7eb !important;
    min-height: 72px !important;
    padding: 18px 24px !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* title */
.card-title {
    color: #0f172a !important;
    font-size: 20px !important;
    font-weight: 700 !important;
    letter-spacing: 0px !important;
    margin: 0;
}

/* ===== ADD SUPPLIER BUTTON ===== */
.btn-group .btn {
    background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 10px 20px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15);
    transition: 0.25s;
}

.btn-group .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(37, 99, 235, 0.22);
}

/* ===== FILTER BAR ===== */
.filter-bar {
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 16px !important;
    padding: 20px !important;
    margin-bottom: 22px !important;
}

/* labels */
.filter-bar label {
    color: #334155 !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    margin-bottom: 8px !important;
    display: block;
}

/* inputs */
.form-control,
.dataTables_filter input,
.dataTables_length select {
    background: #ffffff !important;
    border: 1px solid #dbe4f0 !important;
    color: #0f172a !important;
    border-radius: 10px !important;
    height: 44px !important;
    font-size: 14px !important;
    padding: 10px 14px !important;
    box-shadow: none !important;
}

.form-control:focus,
.dataTables_filter input:focus {
    border-color: #3b82f6 !important;
    background: #ffffff !important;
    color: #111827 !important;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.08) !important;
}

/* ===== TABLE ===== */
.table-responsive {
    border-radius: 14px;
    overflow-x: auto;
}

.customTbl {
    width: 100%;
    border-collapse: separate !important;
    border-spacing: 0 10px !important;
}

/* table header */
.customTbl thead th {
    background: transparent !important;
    color: #64748b !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    padding: 14px 12px !important;
    border: none !important;
    white-space: nowrap;
}

/* table row */
.customTbl tbody tr {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
    transition: 0.25s;
}

/* hover */
.customTbl tbody tr:hover {
    background: #f8fbff !important;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

/* cells */
.customTbl td {
    background: #ffffff !important;
    color: #1e293b !important;
    padding: 15px 12px !important;
    font-size: 14px !important;
    vertical-align: middle !important;
    border-top: 1px solid #f1f5f9 !important;
}

/* ===== ACTION BUTTONS ===== */
.btn-group-sm .btn {
    background: #f1f5f9 !important;
    color: #2563eb !important;
    border: 1px solid #dbe4f0 !important;
    border-radius: 8px !important;
    box-shadow: none !important;
}

.btn-group-sm .btn:hover {
    background: #2563eb !important;
    color: #ffffff !important;
    transform: translateY(-1px);
}

/* delete button */
.delete-vendor {
    background: #fff1f2 !important;
    color: #dc2626 !important;
    border: 1px solid #fecdd3 !important;
    border-radius: 8px !important;
}

.delete-vendor:hover {
    background: #dc2626 !important;
    color: #ffffff !important;
}

/* ===== DATATABLE TEXT ===== */
.dataTables_info,
.dataTables_length label,
.dataTables_filter label {
    color: #475569 !important;
    font-size: 13px !important;
    font-weight: 500;
}

/* pagination */
.dataTables_paginate .paginate_button {
    border-radius: 8px !important;
}

.dataTables_paginate .paginate_button.current {
    background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
    color: #ffffff !important;
    border: none !important;
}

/* ===== MOBILE ===== */
@media (max-width: 768px) {

    .layout-box-content-format1 .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 14px;
    }

    .btn-group {
        width: 100%;
    }

    .btn-group .btn {
        width: 100%;
        justify-content: center;
    }

    .card-title {
        font-size: 18px !important;
    }

    .customTbl {
        min-width: 900px;
    }
}

</style>

<section class="layout-box-content-format1">
    <div class="card card-primary list-view">

        <!-- HEADER -->
       <div class="card-header">
            <div class="row align-items-center w-100">
                <div class="col">
                    <h3 class="card-title mb-0">
                        Supplier List
                    </h3>
                </div>

                <div class="col-auto">
                    <a href="{{ url('admin/') }}/vendor/addedit" class="btn btn-primary btn-sm">
                        <i class="fas fa-plus"></i> Add Supplier
                    </a>
                </div>
            </div>
        </div>

        <!-- BODY -->
        <div class="card-body">
            <div class="table-responsive">
                    <div class="filter-bar mb-3">
                        <div class="row">
                    
                            <div class="col-md-4">
                                <label>Supplier ID</label>
                                <input type="text" id="filter_vendor_id" class="form-control" placeholder="Search supplier ID">
                            </div>
                    
                            <div class="col-md-4">
                                <label>Name</label>
                                <input type="text" id="filter_name" class="form-control" placeholder="Search name">
                            </div>
                    
                            <div class="col-md-4">
                                <label>Email</label>
                                <input type="text" id="filter_email" class="form-control" placeholder="Search email">
                            </div>
                    
                        </div>
                    </div>

                    <table class="table customTbl  table-hover dataTable dataContainer table-striped">
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>Supplier ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Clicks</th>
                                <th>Complete</th>
                                <th>Terminates</th>
                                <th class="text-center">Status</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            @foreach ($vendorList as $key => $vendor)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td><strong>{{ $vendor->vendor_id }}</strong></td>
                                    <td>{{ $vendor->name }}</td>
                                    <td>{{ $vendor->email }}</td>
                                    <td>{{ $vendor->clicks_count }}</td>
                                    <td>{{ $vendor->complete_count }}</td>
                                    <td>{{ $vendor->terminates_count }}</td>

                                    <td style="text-align: center;">
                                        @if ($vendor->is_active == 'Y')
                                            <span class="vendor-status" data-id="{{ $vendor->id }}">
                                                <i class="fas fa-user-check" style="color:#34d399;"></i>
                                            </span>
                                        @else
                                            <span class="vendor-status" data-id="{{ $vendor->id }}">
                                                <i class="fas fa-user-times" style="color:#ef4444;"></i>
                                            </span>
                                        @endif
                                    </td>

                                    <td>
                                        <div class="btn-group btn-group-sm">
                                       
                                                <x-edit-button-component title='<i class="fas fa-edit"></i>'
                                                    url="{{ url('admin/vendor/addedit') }}/{{ $vendor->id }}" />
                                           
                                                <x-edit-button-component title='<i class="fas fa-eye"></i>'
                                                    url="{{ url('admin/vendor/view/') }}/{{ $vendor->id }}" />
                                            
                                                <button class="btn btn-sm btn-danger delete-vendor"
                                                    data-id="{{ $vendor->id }}">
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
    </div>
</section>

<script src="{{ asset('assets/admin/') }}/js/vendor.js"></script>

<script>
$(document).ready(function () {

    function loadFilteredVendors() {
        let vendor_id = $("#filter_vendor_id").val();
        let name = $("#filter_name").val();
        let email = $("#filter_email").val();

        $.ajax({
            url: "{{ url('admin/vendor/filter') }}",
            type: "GET",
            data: {
                vendor_id: vendor_id,
                name: name,
                email: email
            },
            success: function (response) {
                $("tbody").html(response);
            }
        });
    }

    $("#filter_vendor_id").on("keyup", loadFilteredVendors);
    $("#filter_name").on("keyup", loadFilteredVendors);
    $("#filter_email").on("keyup", loadFilteredVendors);

});
</script>

<script>
$(document).on('click', '.delete-vendor', function () {

    let vendorId = $(this).data('id');
    let row = $(this).closest('tr');

    Swal.fire({
        title: 'Are you sure?',
        text: 'This supplier will be permanently deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {

        if (result.isConfirmed) {

            $.ajax({
                url: "{{ url('admin/vendor/delete') }}/" + vendorId,
                type: "DELETE",
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {

                    if (response.status) {

                        row.fadeOut(400, function () {
                            $(this).remove();
                        });

                        Swal.fire('Deleted!', response.message, 'success');

                        window.location.reload();
                    }
                }
            });

        }
    });

});
</script>

<script>
$(document).ready(function () {
    $('.dataTable').DataTable({
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50],
        ordering: true,
        searching: true,
        paging: true,
        info: true
    });
});
</script>