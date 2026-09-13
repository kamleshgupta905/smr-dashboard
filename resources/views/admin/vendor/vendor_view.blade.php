<style>
    body {
        background: #f8f9fa;
        font-family: Arial, sans-serif;
    }

    .card {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border-radius: 15px;
        border: 1px solid black;
        margin-bottom: 20px;
    }

    .card:hover {
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
    }

    .copy-icon {
        cursor: pointer;
        color: #007bff;
        font-size: 0.9rem;
        margin-left: 5px;
    }

    .copy-icon:hover {
        color: #0056b3;
    }

    .redirect-url {
        font-size: 0.8rem;
        color: #142df8;
    }

    .redirect-url:hover {
        color: #0056b3;
        text-decoration: none;
    }

    .center-heading {
        text-align: center;
    }

    .me-2 {
        margin: 0 0 0 17px;
    }

    @media (max-width: 768px) {
        .me-2 {
            margin: 0;
        }
    }

</style>
<style>

/* ===== GLOBAL ===== */
body {
    background: #f6f8fb !important;
    font-family: "Inter", "Poppins", sans-serif !important;
}

/* ===== CARD ===== */
.card {
    border: none !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.05) !important;
    transition: 0.3s ease !important;
}
.card:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 12px 17px rgba(0,0,0,0.08) !important;
}

/* ===== HEADER ===== */
.d-flex h2 {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #1f2937 !important;
}

/* ===== BUTTON ===== */
.btn {
    border-radius: 10px !important;
    font-size: 13px !important;
}
.btn-outline-primary {
    border-color: #4f46e5 !important;
    color: #4f46e5 !important;
}
.btn-outline-primary:hover {
    background: #4f46e5 !important;
    color: #fff !important;
}

/* ===== STATS ===== */
.card-body h5 {
    font-size: 13px !important;
    color: #6b7280 !important;
}
.card-body strong {
    font-size: 17px !important;
    color: #111827 !important;
}

/* ===== INFO TEXT ===== */
.card-body p {
    font-size: 14px !important;
    color: #374151 !important;
}

/* ===== LINK ===== */
.redirect-url {
    font-size: 13px !important;
    color: #4f46e5 !important;
}
.redirect-url:hover {
    text-decoration: underline !important;
}

/* ===== COPY ICON ===== */
.copy-icon {
    color: #6366f1 !important;
    cursor: pointer !important;
}

/* ===== TABLE WRAPPER ===== */
.customTbl {
    border-radius: 14px !important;
    overflow: hidden !important;
    background: #fff !important;
}

/* ===== GLASS HEADER ===== */
.layout-box-content-format1 .table.customTbl thead {
    background: linear-gradient(135deg, #111827, #374151) !important;
}
.layout-box-content-format1 .table.customTbl thead th {
    background: transparent !important;
    color: #fff !important;
    font-size: 12px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.7px !important;
    border-bottom: 1px solid rgba(255,255,255,0.1) !important;
}

/* ===== TABLE BODY ===== */
.customTbl tbody tr {
    transition: 0.2s ease !important;
}
.customTbl tbody tr:hover {
    background: #f3f4f6 !important;
}

/* ===== STATUS BADGE ===== */
[class$="-status"] {
    padding: 4px 10px !important;
    border-radius: 20px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
}

/* ===== DATATABLE TOP ===== */
.dataTables_wrapper .dataTables_filter input {
    border: none !important;
    border-bottom: 2px solid #e5e7eb !important;
    border-radius: 0 !important;
    background: transparent !important;
}
.dataTables_wrapper .dataTables_filter input:focus {
    border-bottom: 2px solid #6366f1 !important;
    outline: none !important;
}

.dataTables_wrapper .dataTables_length select {
    border: none !important;
    border-bottom: 2px solid #e5e7eb !important;
    background: transparent !important;
}

/* ===== PAGINATION ===== */
.dataTables_wrapper .dataTables_paginate .paginate_button {
    border-radius: 8px !important;
    padding: 4px 10px !important;
}
.dataTables_wrapper .dataTables_paginate .paginate_button.current {
    background: #4f46e5 !important;
    color: #fff !important;
}

/* ===== SPACING ===== */
.container {
    max-width: 1200px !important;
}

</style>
<div class="container-fluid">
    <div class="container">
        <div class="row">
            <div class="col">

                <div class="d-flex justify-content-between align-items-center py-3">
                    <h2 class="h5 mb-0"><span class="text-muted .center-heading" style="margin: 5px 0 0 5px;">Supplier Details</span></h2>
                    <a href="{{ url('admin/vendor/addedit') }}/{{ $vendorData->id }}" class="btn btn-outline-primary">Edit</a>

                </div>
            
                <div class="row mt-4">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body" style="height: 125px;">
                                <h5>Clicks</h5>
                                <hr>
                                <p><strong style="font-size: 17px;">{{ $vendorData->clicks_count }}</strong></p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body" style="height: 125px;">
                                <h5>Completes</h5>
                                <hr>
                                <p><strong style="font-size: 17px;">{{ $vendorData->complete_count }}</strong></p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body" style="height: 125px;">
                                <h5>Terminates</h5>
                                <hr>
                                <p><strong style="font-size: 17px;">{{ $vendorData->terminates_count }}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mb-4" style="margin-top: 20px;">
                    <div class="card-body">
                        <h5>Supplier info</h5>
                        <hr>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Supplier Name: </strong>{{ $vendorData->name }}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Supplier Email: </strong>{{ $vendorData->email }}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Supplier ID: {{ $vendorData->vendor_id }}</strong></p>
                            </div>
                        </div>
                        @if(!empty($vendorData->entry_link))
                            <p><strong>Entry Link:</strong><br> <a href="{{ url('/') }}/{{ $vendorData->entry_link }}" target="_blank" style="font-size: 1rem;" class="redirect-url">{{ url('/') }}/{{ $vendorData->entry_link }}</a> <i class="fas fa-copy copy-icon"></i></p>
                        @endif
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</div>


<section class="layout-box-content-format1">
    <div class="card card-primary list-view">
        <div class="card-header box-shdw">
            <h3 class="card-title">Leads</h3>
        </div>
        <div class="card-body">
            <div class="formblock-box">
                <div class="table-responsive">
                    <table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped">
                        <thead>
                            <tr>
                                <th style="display: none;"></th>
                                <th>Id</th>
                                <th>Project Id</th>
                                <th>Project Name</th>
                                {{-- <th>Vendor</th> --}}
                                {{-- <th>CPI</th> --}}
                                <th class="text-center">Status</th>
                                <th>UID</th>
                                <th>Date</th>
                                <th>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($leadList as $key => $lead)
                                <tr>
                                    <td style="display: none;"></td>
                                    <td>{{ $lead->id }}</td>
                                    <td>{{ $lead->project_id }}</td>
                                    <td>{{ $lead->project_name }}</td>
                                    {{-- <td><a href="{{ url('/') }}/admin/vendor/view/{{ $lead->vid }}"
                                            target="_blank">{{ $lead->vendor_email }}</a></td> --}}
                                    {{-- <td><strong>${{ $lead->cpi }}</strong></td> --}}
                                    <td><span
                                            class="text-center {{ str_replace(' ', '', $lead->status) }}-status">{{ $lead->status }}</span>
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
    </div>
</section>
<script>
    $(document).ready(function() {
        $('.dataTable').DataTable({
            dom: 'Bfrtip',
            buttons: [
                'excelHtml5',
                'pdfHtml5'
            ]
        });
    });
</script>

<script src="{{ asset('assets/admin/') }}/js/vendors.js"></script>
