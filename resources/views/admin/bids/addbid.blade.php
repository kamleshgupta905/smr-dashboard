@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">

<style>

/* ===== GLOBAL FONT (BIG DIFFERENCE) ===== */
.layout-box-content-format1,
.layout-box-content-format1 * {
    font-family: 'Inter', sans-serif !important;
}

/* headings new feel */
.layout-box-content-format1 h3,
.layout-box-content-format1 h5 {
    font-family: 'Space Grotesk', sans-serif !important;
    letter-spacing: 0.3px !important;
}

/* ===== CARD ===== */
.layout-box-content-format1 .card {
    border: none !important;
    border-radius: 14px !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.06) !important;
}

/* header */
.layout-box-content-format1 .card-header {
    background: linear-gradient(135deg, #111827, #929dac) !important;
    height: auto !important;
    padding: 10px 20px !important;
    border-radius: 12px 12px 0 0 !important;
    
    
    justify-content: space-between;
}

.layout-box-content-format1 .card-title {
    color: #fff !important;
    font-size: 18px !important;
    font-weight: 600 !important;
}

/* ===== SECTION HEADINGS ===== */
.formblock-box h5 {
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #374151 !important;
    margin-bottom: 15px !important;
    border-left: 3px solid #6366f1 !important;
    padding-left: 10px !important;
}

/* ===== LABEL ===== */
.form-label {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #9ca3af !important;
    margin-bottom: 4px !important;
}

/* ===== INPUT MODERN ===== */
.layout-box-content-format1 .form-control {
    border: none !important;
    border-bottom: 2px solid #e5e7eb !important;
    border-radius: 0 !important;
    background: transparent !important;
    padding-left: 0 !important;
    font-size: 14px !important;
    transition: 0.3s !important;
    color: #111827 !important;
}

.layout-box-content-format1 .form-control::placeholder {
    color: #9ca3af !important;
}

.layout-box-content-format1 .form-control:focus {
    border-bottom: 2px solid #6366f1 !important;
    box-shadow: none !important;
}

/* ===== SELECT2 MODERN ===== */
.layout-box-content-format1 .select2-container .select2-selection--single {
    border: none !important;
    border-bottom: 2px solid #e5e7eb !important;
    border-radius: 0 !important;
    height: 38px !important;
    background: transparent !important;
}

.layout-box-content-format1 .select2-container--default .select2-selection__rendered {
    padding-left: 0 !important;
    line-height: 34px !important;
    color: #111827 !important;
}

.layout-box-content-format1 .select2-container--default .select2-selection--single:focus {
    border-bottom: 2px solid #6366f1 !important;
}

/* ===== CONTACT BOX ===== */
.contact-item {
    border: none !important;
    border-radius: 10px !important;
    background: #f9fafb !important;
    padding: 12px !important;
    transition: 0.3s !important;
}

.contact-item:hover {
    background: #f3f4f6 !important;
}

/* ===== CHECKBOX ===== */
.form-check-input {
    cursor: pointer !important;
}

/* ===== BUTTON ===== */
.continue-btn {
   background: linear-gradient(135deg, #111827, #929dac) !important;
    border: none !important;
    color: #fff !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    padding: 8px 12px !important;
}
#savebtn {
   background: linear-gradient(135deg, #111827, #929dac) !important;
    border: none !important;
    color: #fff !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    padding: 8px 12px !important;
}

.action-button:hover {
    opacity: 0.9 !important;
}

/* add contact btn */
#addContactBtn {
    border-radius: 8px !important;
    font-size: 13px !important;
}

/* ===== ERROR TEXT ===== */
.error-text {
    font-size: 12px !important;
}

/* ===== SPACING ===== */
.formblock-box {
    margin-bottom: 20px !important;
}
.layout-box-content-format1 {
    font-family: "Montserrat", sans-serif;
    width: 100% !important; 
    margin: 0 auto;
}
/* ===== PERFECT SELECT2 MODERN INPUT ===== */

.layout-box-content-format1 .select2-container {
    width: 100% !important;
}

/* main box */
.layout-box-content-format1 .select2-container--default .select2-selection--single {
    border: none !important;
    border-bottom: 2px solid #e5e7eb !important;
    border-radius: 0 !important;
    background: transparent !important;
    height: 40px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
}

/* text inside */
.layout-box-content-format1 .select2-container--default .select2-selection__rendered {
    color: #111827 !important;
    font-size: 14px !important;
    padding-left: 0 !important;
    line-height: normal !important;
}

/* placeholder */
.layout-box-content-format1 .select2-container--default .select2-selection__placeholder {
    color: #9ca3af !important;
}

/* arrow */
.layout-box-content-format1 .select2-container--default .select2-selection__arrow {
    height: 100% !important;
    right: 0 !important;
}

/* focus + open */
.layout-box-content-format1 .select2-container--default.select2-container--focus .select2-selection--single,
.layout-box-content-format1 .select2-container--default.select2-container--open .select2-selection--single {
    border-bottom: 2px solid #6366f1 !important;
}

/* dropdown */
.select2-dropdown {
    border-radius: 10px !important;
    border: none !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
}

/* option hover */
.select2-results__option--highlighted {
    background: #6366f1 !important;
    color: #fff !important;
}

</style>
<style>
    /* Small scoped styles to keep table clean and modern */
    #bid-options .table thead th {
        white-space: nowrap;
        background-color: #f8f9fa;
        font-weight: 600;
        border-bottom: 2px solid #e9ecef;
    }

    #bid-options .table td,
    #bid-options .table th {
        vertical-align: middle;
        padding: 0.55rem 0.75rem;
    }

    /* Responsive scrollbars */
    .table-responsive-custom {
        max-height: 560px;
        overflow-y: auto;
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        padding: 8px;
        background: #fff;
    }

    .table-responsive-custom::-webkit-scrollbar {
        height: 8px;
        width: 8px;
    }

    .table-responsive-custom::-webkit-scrollbar-thumb {
        background: #adb5bd;
        border-radius: 10px;
    }

    .table-responsive-custom::-webkit-scrollbar-thumb:hover {
        background: #6c757d;
    }

    /* sticky header look */
    .table thead.sticky-top th {
        position: sticky;
        top: 0;
        background: #f8f9fa;
        z-index: 10;
    }

    /* subtle card shadow */
    .card.shadow-subtle {
        box-shadow: 0 6px 18px rgba(0,0,0,0.04);
    }
</style>

<section class="layout-box-content-format1">
    <div class="container-fluid">
        <h4 class="mb-3">Bid</h4>

        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Tabs --}}
        <ul class="nav nav-tabs" id="bidTabs" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" id="spec-tab" data-toggle="tab" href="#specifications" role="tab">Specifications</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="options-tab" data-toggle="tab" href="#bid-options" role="tab">Bid Options</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="booking-tab" data-toggle="tab" href="#booking" role="tab">Booking</a>
            </li>
        </ul>

        {{-- Tabs Content --}}
        <div class="tab-content mt-3" id="bidTabsContent">
            {{-- ================= Specifications Tab ================= --}}
            <div class="tab-pane fade show active" id="specifications" role="tabpanel">
                <div class="card shadow-subtle">
                    <div class="card-body">
                        <form id="bidForm" enctype="multipart/form-data" autocomplete="off">
                            <input type="hidden" id="bid_id" name="bid_id" value="{{ $bid->id ?? '' }}">

                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <label>Bid Name *</label>
                                    <input type="text" class="form-control" name="bid_name" id="bid_name" required value="{{ $bid->name ?? '' }}">
                                </div>

                                {{-- Client --}}
                                <div class="col-md-3">
                                    <label>Client *</label>
                                    <select class="form-select select2" name="client_id" id="client_id" required>
                                        <option value="">Select Client</option>
                                        @foreach($clients ?? [] as $c)
                                            <option value="{{ $c->id }}"
                                                    data-client-name="{{ $c->client_name ?? $c->name }}"
                                                    {{ isset($bid) && $bid->client_id==$c->id ? 'selected' : '' }}>
                                                {{ $c->client_name ?? $c->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>

                                {{-- Sales Rep (auto-filled when client selected) --}}
                                <div class="col-md-3">
                                    <label>Sales Rep *</label>
                                    <input type="text" class="form-control" name="sales_rep" id="sales_rep" required value="{{ $bid->sales_rep ?? '' }}" readonly>
                                </div>

                                {{-- Client Contact (auto-updated) --}}
                                <div class="col-md-3">
                                    <label>Client Contact *</label>
                                    <select class="form-select select2" name="client_contact" id="client_contact" required>
                                        <option value="">Select Contact</option>
                                        @if(isset($bid->client_id))
                                            <option value="{{ $bid->client_id }}" selected>
                                                {{ optional($clients->firstWhere('id', $bid->client_id))->client_name ?? optional($clients->firstWhere('id', $bid->client_id))->name }}
                                            </option>
                                        @endif
                                    </select>
                                </div>
                            </div>

                            <div class="row mb-3">
                                {{-- Created By --}}
                                <div class="col-md-3">
                                    <label>Created By *</label>
                                    <input type="hidden" name="created_by" id="created_by" value="{{ session('surveysAdmin.userId') }}">
                                    <input type="text" class="form-control" value="{{ session('surveysAdmin.userName') }}" readonly>
                                </div>

                                <div class="col-md-3">
                                     <label for="bid_type_id">Bid Type</label>

                                    <select id="bid_type_id" name="bid_type_id" class="form-control select2">
                                        <option value="">Select Bid Type</option>

                                        @foreach ($bidTypes as $bt)
                                            <option 
                                                value="{{ $bt->id }}" 
                                                title="{{ $bt->description }}"   {{-- Tooltip --}}
                                                {{ isset($editData->bid_type_id) && $editData->bid_type_id == $bt->id ? 'selected' : '' }}
                                            >
                                                {{ $bt->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>

                                <div class="col-md-3">
                                     <label>Bid Category *</label>
                                    <select name="category_id" id="category_id" class="form-control select2">
                                        <option value="">Select Category</option>
                                        @foreach($categories as $cat)
                                            <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                                        @endforeach
                                    </select>

                                </div>

                                <div class="col-md-3">
                                    <label>Audience Type *</label>
                                    <select class="form-control select2" name="audience_type" id="audience_type" required>
                                        <option value="ALL"{{ (isset($bid) && $bid->audience_type == 'ALL') ? 'selected' : '' }}>ALL</option>
                                        <option value="B2B" {{ (isset($bid) && $bid->audience_type == 'B2B') ? 'selected' : '' }}>B2B</option>
                                        <option value="B2C" {{ (isset($bid) && $bid->audience_type == 'B2C') ? 'selected' : '' }}>B2C</option>
                                        <option value="Health Care" {{ (isset($bid) && $bid->audience_type == 'Health Care') ? 'selected' : '' }}>Health Care</option>
                                        <option value="Other" {{ (isset($bid) && $bid->audience_type == 'Other') ? 'selected' : '' }}>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <label>Status *</label>
                                    <select class="form-form-select select2" name="status" id="status">
                                       <option value="">Select Status</option>
                                        <option value="Open"   {{ (isset($bid) && $bid->status == 'Open') ? 'selected' : '' }}>Open</option>
                                        <option value="Sent"   {{ (isset($bid) && $bid->status == 'Sent') ? 'selected' : '' }}>Sent</option>
                                        <option value="Won"    {{ (isset($bid) && $bid->status == 'Won') ? 'selected' : '' }}>Won</option>
                                        <option value="Closed" {{ (isset($bid) && $bid->status == 'Closed') ? 'selected' : '' }}>Closed</option>
                                        <option value="Pass"   {{ (isset($bid) && $bid->status == 'Pass') ? 'selected' : '' }}>Pass</option>

                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label>Email Reference</label>
                                    <input type="text" class="form-control" name="email_reference" id="email_reference">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Currency*</label>
                                    <select class="select2" name="currency">
                                        <option value="">Select Currency</option>

                                        <option value="INR" {{ (isset($editData) && $editData->currency == 'INR') ? 'selected' : '' }}>
                                            INR - Indian Rupee
                                        </option>

                                        <option value="USD" {{ (isset($editData) && $editData->currency == 'USD') ? 'selected' : '' }}>
                                            USD - US Dollar
                                        </option>

                                        <option value="AUD" {{ (isset($editData) && $editData->currency == 'AUD') ? 'selected' : '' }}>
                                            AUD - Australian Dollar
                                        </option>

                                        <option value="CAD" {{ (isset($editData) && $editData->currency == 'CAD') ? 'selected' : '' }}>
                                            CAD - Canadian Dollar
                                        </option>

                                        <option value="GBP" {{ (isset($editData) && $editData->currency == 'GBP') ? 'selected' : '' }}>
                                            GBP - British Pound
                                        </option>

                                    </select>
                                    <div class="invalid-feedback d-block error-text" id="currency_error"></div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label>Notes</label>
                                <textarea class="form-control" rows="3" name="notes" id="notes"></textarea>
                            </div>

                           <div class="mb-3">
                                <label for="bid_files" class="form-label">Upload Files (CSV, DOC, PDF, etc.)</label>
                                <input type="file"  class="form-control"  id="bid_files"  name="bid_files[]"  <!-- note [] for multiple files --> accept=".csv, .pdf, .doc, .docx, .xls, .xlsx, .txt"
                                    multiple>  <!-- allow multiple selection -->
                                <small class="text-muted">
                                    You can upload up to 10 files at a time. Supported formats: CSV, PDF, DOC, DOCX, XLS, XLSX, TXT.
                                </small>
                            </div>

                            <div class="text-end">
                                <button type="button" class="btn btn-primary" id="saveBidBtn">Save and Next</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

           {{-- ================= Bid Options Tab ================= --}}
            <div class="tab-pane fade" id="bid-options" role="tabpanel">
                <div class="card shadow-subtle border-0">
                    <div class="card-body">
                            <input type="hidden" id="bid_id" name="bid_id" value="{{ $bid->id ?? '' }}">


                        {{-- Bid info header (filled after first save) --}}
                        <div id="bidInfoHeader" class="alert alert-light border mb-3" >
                            <div class="row">
                                <div class="col-md-3"><strong>Bid Number:</strong> <span id="bidNumberDisplay"></span></div>
                                <div class="col-md-3"><strong>Book Value:</strong> <span id="blockValueDisplay"></span></div>
                                <div class="col-md-3"><strong>Bid Value:</strong> <span id="bidValueDisplay"></span></div>
                                <div class="col-md-3"><strong>Created On:</strong> <span id="createdDateDisplay"></span></div>
                            </div>
                        </div>

                        <h5 class="mb-3 fw-bold text-primary">Bid Options</h5>

                        <div class="table-responsive-custom">
                            <table class="table table-bordered table-hover align-middle text-center" id="bidOptionsTable">
                                <thead class="sticky-top table-light">
                                    <tr>
                                        <th style="width:40px;"><input type="checkbox" id="selectAllOptions"></th>
                                        <th style="min-width:60px;">ID</th>
                                        <th style="min-width:140px;">Country *</th>
                                        <th style="min-width:180px;">Target Audience</th>
                                        <th style="min-width:130px;">Audience Type *</th>
                                        <th style="min-width:140px;">Device Type *</th>
                                        <th style="min-width:70px;">N *</th>
                                        <th style="min-width:70px;">IR *</th>
                                        <th style="min-width:70px;">LOI *</th>
                                        <th style="min-width:90px;">CPI *</th>
                                        <th style="min-width:120px;">Feasibility (N) *</th>
                                        <th style="min-width:120px;">Fieldwork (Days)</th>
                                        <th style="min-width:100px;">Revenue</th>
                                        <th style="min-width:150px;">Notes</th>
                                        <th style="min-width:90px;">Status</th>
                                        <th style="min-width:120px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="bidOptionsBody">
                                    @if(isset($options))
                                        @foreach($options as $opt)
                                            <tr data-option-id="{{ $opt->id }}" data-saved="true">
                                                <td><input type="checkbox" class="option-select"></td>
                                                <td class="serial-no text-center">{{ $loop->iteration }}</td>
                                                <td>{{ $opt->country_name }}</td>
                                                <td>{{ $opt->target_audience }}</td>
                                                <td>{{ $opt->audience_type }}</td>
                                                <td>{{ $opt->device_type }}</td>
                                                <td>{{ $opt->n }}</td>
                                                <td>{{ $opt->ir }}</td>
                                                <td>{{ $opt->loi }}</td>
                                                <td>{{ $opt->cpi }}</td>
                                                <td>{{ $opt->feasibility }}</td>
                                                <td>{{ $opt->fieldwork_days }}</td>
                                                <td>{{ $opt->revenue }}</td>
                                                <td>{{ $opt->notes }}</td>
                                                <td><span class="badge bg-success">Saved</span></td>
                                                <td>
                                                    <div class="btn-group" role="group">
                                                        <button class="btn btn-sm btn-outline-secondary cloneRow" title="Clone">📋</button>
                                                        <button class="btn btn-sm btn-outline-danger deleteRow" data-id="{{ $opt->id }}" title="Delete">🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        @endforeach
                                    @endif
                                </tbody>
                            </table>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-outline-primary" id="addBidRow">
                                    <i class="bi bi-plus-circle me-1"></i> Add Row
                                </button>
                                <button type="button" class="btn btn-success" id="saveBidOptions">
                                    <i class="bi bi-save me-1"></i> Save Selected
                                </button>
                            </div>

                            <div>
                                <button type="button" class="btn btn-warning" id="bookSelected" style="display:none;">
                                    <i class="bi bi-book me-1"></i> Book Selected
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

           {{-- ================= Booking Tab ================= --}}
            <div class="tab-pane fade" id="booking" role="tabpanel">
                <div class="card shadow-subtle">
                    <div class="card-body ">
                        <div id="bookingHeader" class="alert alert-info  mb-3">
                            
                            <strong>Booking for Bid:</strong> <span id="bookingBidNumber"></span>
                                <div class="col-md-3"><strong>Block Value:</strong> <span id="blockValueDisplay"></span></div>
                                <div class="col-md-3"><strong>Bid Value:</strong> <span id="bookingBidValue"></span></div>
                                <div class="col-md-3"><strong>Created On:</strong> <span id="bookingCreated"></span></div>
                             </div>

                        <div class="table-responsive-custom">
                            <table class="table table-bordered table-hover align-middle text-center">
                                <thead class="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Country</th>
                                        <th>Audience Type</th>
                                        <th>Device Type</th>
                                        <th>Feasibility (N)</th>
                                        <th>IR</th>
                                        <th>LOI</th>
                                        <th>CPI</th>
                                        <th>Revenue</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody id="bookingTableBody">
                                    {{-- Populated by JS --}}
                                </tbody>
                            </table>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-3">
                                <label>Select PM User *</label>
                                <select class="form-select select2" name="pm_user" id="pm_user" required>
                                    <option value="">Select PM</option>
                                    @foreach($users ?? [] as $u)
                                        <option value="{{ $u->id }}">{{ $u->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label>Notes</label>
                                <input type="text" class="form-control" name="booking_notes" id="booking_notes" placeholder="Ready to field">
                            </div>
                            <div class="col-md-3">
                                <label>Booking Email Sent</label>
                                <input type="text" class="form-control" id="booking_email_sent" readonly>
                            </div>
                        </div>

                        <div class="text-end mt-3">
                            <button type="button" id="bookingActionBtn" class="btn btn-warning">
                                💾 Save Booking
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>

</section>
<script>
    window.countriesList = @json($countries);
</script>

<script src="{{ asset('assets/admin/js/bid.js') }}"></script>
<script>
    $(document).ready(function () {

    // Initialize Select2
    $('#bid_type_id').select2({
        placeholder: "Select Bid Type",
        width: '100%'
    });

    // Enable tooltip when hovering options
    $('#bid_type_id').on('select2:open', function() {
        $('.select2-results__option').each(function() {
            $(this).attr('title', $(this).text());
        });
    });

});


document.getElementById('bid_files').addEventListener('change', function() {
    if (this.files.length > 10) {
        alert("You can only upload a maximum of 10 files.");
        this.value = ''; // reset input
    }
});
</script>
