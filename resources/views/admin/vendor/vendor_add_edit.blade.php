@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}');
    </script>
@endif
<style>

/* ===== GLOBAL CLEAN WHITE UI ===== */
body {
    font-family: 'Inter', sans-serif !important;
    background: #f5f7fb !important;
    color: #1f2937 !important;
}

/* ===== CARD ===== */
.layout-box-content-format1 .card {
    background: #ffffff !important;
    border-radius: 12px !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
}

/* ===== HEADER ===== */
.layout-box-content-format1 .card-header {
    background: #111827 !important;
    border-radius: 12px 12px 0 0 !important;
    padding: 14px 20px !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.layout-box-content-format1 .card-title {
    color: #ffffff !important;
    font-size: 18px !important;
    font-weight: 600 !important;
}

/* ===== TABS ===== */
.nav-tabs {
    border-bottom: 1px solid #e5e7eb !important;
}

.nav-tabs .nav-link {
    color: #6b7280 !important;
    font-size: 13px;
    font-weight: 500;
}

.nav-tabs .nav-link.active {
    color: #2563eb !important;
    border: none !important;
    border-bottom: 2px solid #2563eb !important;
    background: transparent !important;
}

/* ===== FORM SECTION ===== */
.formblock-box h5 {
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #111827 !important;
    margin-bottom: 10px !important;
}

/* ===== LABEL ===== */
label {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #374151 !important;
}

/* ===== INPUT ===== */
.layout-box-content-format1 .form-control {
    background: #ffffff !important;
    border: 1px solid #d1d5db !important;
    border-radius: 8px !important;
    height: 38px;
    font-size: 14px !important;
    color: #111827 !important;
    padding: 6px 12px !important;
    transition: all 0.2s ease;
}

.layout-box-content-format1 .form-control::placeholder {
    color: #9ca3af !important;
}

.layout-box-content-format1 .form-control:focus {
    border-color: #2563eb !important;
    box-shadow: 0 0 0 2px rgba(37,99,235,0.1) !important;
}

/* ===== SELECT2 ===== */
.select2-container {
    width: 100% !important;
}

.select2-container--default .select2-selection--single {
    height: 38px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 8px !important;
    background: #ffffff !important;
    display: flex;
    align-items: center;
}

.select2-container--default .select2-selection__rendered {
    color: #111827 !important;
    font-size: 14px !important;
}

.select2-container--default.select2-container--focus .select2-selection--single {
    border-color: #2563eb !important;
}

/* dropdown */
.select2-dropdown {
    border-radius: 8px !important;
    border: 1px solid #e5e7eb !important;
}

/* ===== CHECKBOX / RADIO ===== */
.form-check-input {
    cursor: pointer;
}

/* ===== CONTACT BOX ===== */
.contact-row {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 10px;
    border-radius: 8px;
}

.contact-row:hover {
    background: #f3f4f6;
}

/* ===== BUTTONS ===== */
.btn {
    border-radius: 8px !important;
    font-size: 13px !important;
    padding: 6px 14px !important;
}

/* PRIMARY */
.btn-primary {
    background: #2563eb !important;
    border: none !important;
}

.btn-primary:hover {
    background: #1d4ed8 !important;
}

/* SUCCESS */
.btn-success {
    background: #16a34a !important;
    border: none !important;
}

.btn-success:hover {
    background: #15803d !important;
}

/* DANGER */
.btn-danger {
    background: #ef4444 !important;
    border: none !important;
}

.btn-danger:hover {
    background: #dc2626 !important;
}

/* ===== SELECT BOXES (COUNTRY/CLIENT) ===== */
#country_checks,
#client_checks {
    background: #ffffff !important;
    border-radius: 8px;
}

#selected_countries,
#blocked_clients {
    border-radius: 8px !important;
}

/* ===== MODAL ===== */
.modal-content {
    border-radius: 12px !important;
    border: none !important;
}

.modal-header {
    background: #111827 !important;
    color: #fff !important;
    border-radius: 12px 12px 0 0;
}

.modal-body label {
    font-size: 12px;
    color: #374151;
}

/* ===== ERROR ===== */
.error-text {
    font-size: 12px !important;
    color: #ef4444 !important;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .nav-tabs .nav-link {
        font-size: 12px;
    }

    .form-control {
        font-size: 13px !important;
    }
}
</style>
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
    background: linear-gradient(135deg, #111827, #2d80f0) !important;
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
<section class="layout-box-content-format1">
    <div class="row">
        <div class="col-md-12">
            <div class="card card-primary list-view">
                <div class="card-header box-shdw d-flex justify-content-between align-items-center">
                    <h3 class="card-title">Supplier</h3>
                    <div>
                        <x-button-component title='<i class="fas fa-list"></i> List' url="{{ url('admin/vendor') }}" />
                        @if ($mode == 'Edit')
                            <x-button-component
                                title='<i class="fas fa-history"></i> LOG'
                                mclass="openModal"
                                mtitle="LOG"
                                mhref="{{ url('admin/log/vendor/') }}/{{ data_get($editData, 'id', '') }}" />
                        @endif
                    </div>
                </div>

                <form name="vendorForm" id="vendorForm" enctype="multipart/form-data">
                    @csrf
                    <input type="hidden" name="mode" id="mode" value="{{ $mode }}" />
                    <input type="hidden" name="id" id="id" value="{{ data_get($editData, 'id', '') }}" />

                    <div class="card-body">
                        <!-- Tabs -->
                        <ul class="nav nav-tabs" id="vendorTabs" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" id="basic-tab" data-toggle="tab" href="#basic" role="tab">Basic Details</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link disabled" id="settings-tab" data-toggle="tab" href="#settings" role="tab" tabindex="-1" aria-disabled="true">Settings</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link disabled" id="redirect-tab" data-toggle="tab" href="#redirect" role="tab" tabindex="-1" aria-disabled="true">Redirects</a>
                            </li>
                        </ul>

                        <div class="tab-content p-3 border border-top-0">

                            <!-- BASIC DETAILS TAB -->
                            <div class="tab-pane fade show active" id="basic" role="tabpanel">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label>Supplier Name <span class="text-danger">*</span></label>
                                        <input type="text" name="name" id="name" class="form-control"
                                            value="{{ data_get($editData, 'name', '') }}"
                                            placeholder="Enter Vendor Name">
                                        <div id="name_error" class="invalid-feedback d-block error-text"></div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label>Email Address <span class="text-danger">*</span></label>
                                        <input type="email" name="email" id="email" class="form-control"
                                            value="{{ data_get($editData, 'email', '') }}"
                                            placeholder="Enter Email Address">
                                        <div id="email_error" class="invalid-feedback d-block error-text"></div>
                                    </div>

                                    <div class="col-md-12 mb-3">
                                        <div class="form-check">
                                            <input type="checkbox" name="is_api_supplier" id="is_api_supplier"
                                                class="form-check-input"
                                                {{ data_get($editData, 'is_api_supplier', false) ? 'checked' : '' }}>
                                            <label for="is_api_supplier" class="form-check-label">API Supplier</label>
                                        </div>
                                    </div>

                                    <!-- COMMISSION SECTION -->
                                    <div class="col-md-12 mt-3">
                                        <h5>Commission Setup</h5>
                                        <hr>
                                    </div>

                                   <div class="col-md-4 mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input commission-radio" type="radio" name="commission_type" value="revenue_share"
                                                id="revenue_share" {{ data_get($editData, 'commission_type', '') == 'revenue_share' ? 'checked' : '' }}>
                                            <label class="form-check-label" for="revenue_share">Revenue Share</label>
                                        </div>

                                        <!-- always visible container -->
                                        <div class="mt-2" id="revenue_share_box">
                                            <input type="number" step="0.01" name="cpi_percentage" id="cpi_percentage"
                                                class="form-control"
                                                value="{{ data_get($editData, 'cpi_percentage', '') }}"
                                                placeholder="Enter CPI %">
                                        </div>
                                    </div>
                                     <div class="col-md-4 mb-3">
                                        <label class="form-label">Currency <span class="text-danger">*</span></label>
                                        <select class="select2 form-control" name="currency" id="currency">
                                            <option value="">Select Currency</option>
                                    
                                            <option value="INR" {{ data_get($editData, 'currency') == 'INR' ? 'selected' : '' }}>
                                                INR - Indian Rupee
                                            </option>
                                    
                                            <option value="USD" {{ data_get($editData, 'currency') == 'USD' ? 'selected' : '' }}>
                                                USD - US Dollar
                                            </option>
                                    
                                            <option value="AUD" {{ data_get($editData, 'currency') == 'AUD' ? 'selected' : '' }}>
                                                AUD - Australian Dollar
                                            </option>
                                    
                                            <option value="CAD" {{ data_get($editData, 'currency') == 'CAD' ? 'selected' : '' }}>
                                                CAD - Canadian Dollar
                                            </option>
                                    
                                            <option value="GBP" {{ data_get($editData, 'currency') == 'GBP' ? 'selected' : '' }}>
                                                GBP - British Pound
                                            </option>
                                        </select>
                                        <div class="invalid-feedback d-block error-text" id="currency_error"></div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input commission-radio" type="radio" name="commission_type" value="flat_rate"
                                                id="flat_rate" {{ data_get($editData, 'commission_type', '') == 'flat_rate' ? 'checked' : '' }}>
                                            <label class="form-check-label" for="flat_rate">Flat Rate</label>
                                        </div>

                                        <!-- always visible container -->
                                        <div class="mt-2" id="flat_rate_box">
                                            <input type="number" step="0.01" name="per_complete" id="per_complete"
                                                class="form-control"
                                                value="{{ data_get($editData, 'per_complete', '') }}"
                                                placeholder="Enter Per Complete Amount">
                                        </div>
                                    </div>


                                    <div class="col-md-4 mb-3">
                                        <label>Monthly Cap Amount</label>
                                        <input type="number" name="monthly_cap" id="monthly_cap" class="form-control"
                                            value="{{ data_get($editData, 'monthly_cap', '') }}"
                                            placeholder="Enter Monthly Cap">
                                    </div>

                                    <!-- CONTACT SECTION -->
                                <!-- <div class="col-md-12 mt-4" >
                                        <h5>Contacts</h5>
                                        <hr>
                                    <div id="contacts-container">
                                        @if(!empty($existingContacts) && count($existingContacts) > 0)
                                                @foreach($existingContacts as $i => $c)
                                                    <div class="contact-row row align-items-end mb-2">
                                                        <div class="col-md-3">
                                                            <label>Name</label>
                                                            <input type="text" name="contacts[{{ $i }}][name]" class="form-control"
                                                                value="{{ $c->name ?? '' }}">
                                                        </div>

                                                        <div class="col-md-3">
                                                            <label>Email</label>
                                                            <input type="email" name="contacts[{{ $i }}][email]" class="form-control"
                                                                value="{{ $c->email ?? '' }}">
                                                        </div>

                                                        <div class="col-md-3">
                                                            <label>Phone</label>
                                                            <input type="text" name="contacts[{{ $i }}][phone]" class="form-control"
                                                                value="{{ $c->phone ?? '' }}">
                                                        </div>

                                                        <div class="col-md-1">
                                                            <div class="form-check">
                                                                <input type="radio" name="primary_contact" value="{{ $i }}" class="form-check-input"
                                                                    {{ ($c->is_primary ?? 0) ? 'checked' : '' }}>
                                                                <label class="form-check-label">Primary</label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-1">
                                                            <div class="form-check">
                                                                <input type="checkbox" class="form-check-input billing-checkbox" name="billing_contact" value="{{ $i }}">
                                                                {{ ($c->billing ?? 0) ? 'checked' : '' }}
                                                                <label class="form-check-label">Billing</label>
                                                            </div>
                                                        </div>



                                                        <div class="col-md-1 text-right">
                                                            <button type="button" class="btn btn-danger btn-sm remove-contact"><i class="fas fa-trash"></i></button>
                                                        </div>
                                                    </div>
                                                @endforeach
                                            @else
                                                {{-- Default empty contact row if no existing contacts --}}
                                                <div class="contact-row row align-items-end mb-2">
                                                    <div class="col-md-3">
                                                        <label>Name</label>
                                                        <input type="text" name="contacts[0][name]" class="form-control">
                                                    </div>
                                                    <div class="col-md-3">
                                                        <label>Email</label>
                                                        <input type="email" name="contacts[0][email]" class="form-control">
                                                    </div>
                                                    <div class="col-md-3">
                                                        <label>Phone</label>
                                                        <input type="text" name="contacts[0][phone]" class="form-control">
                                                    </div>
                                                    <div class="col-md-1">
                                                        <div class="form-check">
                                                            <input type="radio" name="primary_contact" value="0" class="form-check-input">
                                                            <label class="form-check-label">Primary</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-1">
                                                        <div class="form-check">
                                                            <input type="checkbox" class="form-check-input billing-checkbox" name="billing_contact" value="0">
                                                            <label class="form-check-label">Billing</label>
                                                        </div>
                                                    </div>

                                                    <div class="col-md-1 text-right">
                                                        <button type="button" class="btn btn-danger btn-sm remove-contact"><i class="fas fa-trash"></i></button>
                                                    </div>
                                                </div>
                                            @endif
                                        </div>

                                        <button type="button" class="btn btn-success btn-sm mt-2" id="addContactBtn">
                                            <i class="fas fa-plus"></i> Add More
                                        </button>
                                    </div>
                                </div> -->
                                <div class="col-md-12 mt-4">
                                    <h5>Contacts</h5>
                                    <hr>

                                    <div id="contacts-container">

                                        @if (!empty($existingContacts) && count($existingContacts) > 0)
                                            @foreach ($existingContacts as $i => $c)
                                                <div class="contact-row row align-items-end mb-2">

                                                    <div class="col-md-3">
                                                        <label>Name</label>
                                                        <input type="text" name="contacts[{{ $i }}][name]" class="form-control"
                                                            value="{{ $c->name ?? '' }}">
                                                    </div>

                                                    <div class="col-md-3">
                                                        <label>Email</label>
                                                        <input type="email" name="contacts[{{ $i }}][email]" class="form-control"
                                                            value="{{ $c->email ?? '' }}">
                                                    </div>

                                                    <div class="col-md-3">
                                                        <label>Phone</label>
                                                        <input type="text" name="contacts[{{ $i }}][phone]" class="form-control"
                                                            value="{{ $c->phone ?? '' }}">
                                                    </div>

                                                    <!-- Primary Contact -->
                                                    <div class="col-md-1">
                                                        <div class="form-check">
                                                            <input type="radio" name="primary_contact" value="{{ $i }}"
                                                                class="form-check-input"
                                                                {{ ($c->is_primary ?? 0) ? 'checked' : '' }}>
                                                            <label class="form-check-label">Primary</label>
                                                        </div>
                                                    </div>

                                                    <!-- Billing Contact (fixed) -->
                                                    <div class="col-md-1">
                                                        <div class="form-check">
                                                            <input type="checkbox"
                                                                class="form-check-input billing-checkbox"
                                                                name="billing_contact"
                                                                value="{{ $i }}"
                                                                {{ ($c->billing ?? 0) ? 'checked' : '' }}>
                                                            <label class="form-check-label">Billing</label>
                                                        </div>
                                                    </div>

                                                    <!-- Remove Button -->
                                                    <div class="col-md-1 text-right">
                                                        <button type="button" class="btn btn-danger btn-sm remove-contact">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </div>

                                                </div>
                                            @endforeach

                                        @else
                                            <!-- Default row if no contacts exist -->
                                            <div class="contact-row row align-items-end mb-2">

                                                <div class="col-md-3">
                                                    <label>Name</label>
                                                    <input type="text" name="contacts[0][name]" class="form-control">
                                                </div>

                                                <div class="col-md-3">
                                                    <label>Email</label>
                                                    <input type="email" name="contacts[0][email]" class="form-control">
                                                </div>

                                                <div class="col-md-3">
                                                    <label>Phone</label>
                                                    <input type="text" name="contacts[0][phone]" class="form-control">
                                                </div>

                                                <!-- Primary -->
                                                <div class="col-md-1">
                                                    <div class="form-check">
                                                        <input type="radio" name="primary_contact" value="0"
                                                            class="form-check-input">
                                                        <label class="form-check-label">Primary</label>
                                                    </div>
                                                </div>

                                                <!-- Billing (fixed) -->
                                                <div class="col-md-1">
                                                    <div class="form-check">
                                                        <input type="checkbox"
                                                            class="form-check-input billing-checkbox"
                                                            name="billing_contact"
                                                            value="0">
                                                        <label class="form-check-label">Billing</label>
                                                    </div>
                                                </div>

                                                <div class="col-md-1 text-right">
                                                    <button type="button" class="btn btn-danger btn-sm remove-contact">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>

                                            </div>
                                        @endif

                                    </div>

                                    <button type="button" class="btn btn-success btn-sm mt-2" id="addContactBtn">
                                        <i class="fas fa-plus"></i> Add More
                                    </button>
                                </div>


                                <div class="mt-4 text-right">
                                    <button type="button" id="saveBasicBtn" class="btn btn-primary btn-sm">Save & Continue</button>
                                </div>
                            </div>
                        </div>
                            <!-- SETTINGS TAB -->
                            <div class="tab-pane fade" id="settings" role="tabpanel">
                                <div class="row">
                                    <div class="col-md-4 mt-4">
                                        <label>Project Type</label>
                                        <select  class="select2" name="project_type" id="project_type" >
                                           <option value="">Select Project Type</option>
                                            <option value="ALL Type Of Project" {{ data_get($editData, 'project_type') == 'ALL Type Of Project' ? 'selected' : '' }}>ALL Type Of Project</option>
                                            <option value="Ad Hoc" {{ data_get($editData, 'project_type') == 'Ad Hoc' ? 'selected' : '' }}>Ad Hoc</option>
                                            <option value="Community Recruit" {{ data_get($editData, 'project_type') == 'Community Recruit' ? 'selected' : '' }}>Community Recruit</option>
                                            <option value="Panel Sourcing" {{ data_get($editData, 'project_type') == 'Panel Sourcing' ? 'selected' : '' }}>Panel Sourcing</option>
                                            <option value="Tracker" {{ data_get($editData, 'project_type') == 'Tracker' ? 'selected' : '' }}>Tracker</option>
                                            <option value="IHUT" {{ data_get($editData, 'project_type') == 'IHUT' ? 'selected' : '' }}>IHUT</option>
                                        </select>
                                    </div>

                                    <div class="col-md-4 mt-4">
                                        <label>Audience Type</label>
                                        <select name="audience_type" id="audience_type" class="select2">
                                            <option value="">Select Audience Type</option>
                                            <option value="ALL Type Audience" {{ data_get($editData, 'audience_type') == 'ALL Type Audience' ? 'selected' : '' }}>ALL Type Audience</option>
                                            <option value="B2B" {{ data_get($editData, 'audience_type') == 'B2B' ? 'selected' : '' }}>B2B</option>
                                            <option value="B2C" {{ data_get($editData, 'audience_type') == 'B2C' ? 'selected' : '' }}>B2C</option>
                                            <option value="Health Care" {{ data_get($editData, 'audience_type') == 'Health Care' ? 'selected' : '' }}>Health Care</option>
                                            <option value="Other" {{ data_get($editData, 'audience_type') == 'Other' ? 'selected' : '' }}>Other</option>
                                        </select>
                                    </div>

                                    <div class="col-md-4 mt-5">
                                        <div class="form-check mt-4">
                                            <input type="checkbox" name="block_pii" id="block_pii" class="form-check-input"
                                                {{ data_get($editData, 'block_pii', false) ? 'checked' : '' }}>
                                            <label for="block_pii" class="form-check-label">Block PII Survey</label>
                                        </div>
                                    </div>

                                    <!-- Country and Client selectors -->
                                    <!-- ================== COUNTRIES ================== -->
                                     
                                      <!-- ===================== COUNTRIES ROW ===================== -->
                                       <div class="col-md-12">
                                        <div class="row">
                                                <div class="col-md-6">
                                                    <label><strong>Available Countries</strong></label>

                                                    <div class="mb-2">
                                                        <input type="checkbox" id="country_select_all">
                                                        <label for="country_select_all"> Select All</label>
                                                    </div>

                                                    <div id="country_checks"
                                                        style="max-height:220px; overflow:auto; border:1px solid #e5e5e5; padding:8px;">
                                                        @foreach($countries as $country)
                                                            <div class="form-check small">
                                                                <input class="form-check-input country-checkbox"
                                                                    type="checkbox"
                                                                    data-val="{{ $country->id }}"
                                                                    id="country_check_{{ $country->id }}"
                                                                    {{ isset($selectedCountries) && $selectedCountries->contains('id', $country->id) ? 'checked' : '' }}>
                                                                <label class="form-check-label" for="country_check_{{ $country->id }}">
                                                                    {{ $country->name }}
                                                                </label>
                                                            </div>
                                                        @endforeach
                                                    </div>
                                                </div>

                                                <div class="col-md-6 mt-5">
                                                    <label><strong>Selected Countries</strong></label>

                                                    <select multiple name="selected_countries[]" id="selected_countries"
                                                        class="form-control"
                                                        style="height:220px;">
                                                        @foreach($selectedCountries ?? [] as $country)
                                                            <option value="{{ $country->id }}">{{ $country->name }}</option>
                                                        @endforeach
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <hr class="my-4">

                                        <!-- ===================== CLIENTS ROW ===================== -->
                                       <div class="col-md-12">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <label><strong>Available Clients</strong></label>

                                                    <div class="mb-2">
                                                        <input type="checkbox" id="client_select_all">
                                                        <label for="client_select_all"> Select All</label>
                                                    </div>

                                                    <div id="client_checks"
                                                        style="max-height:220px; overflow:auto; border:1px solid #e5e5e5; padding:8px;">
                                                        @foreach($clients as $client)
                                                            <div class="form-check small">
                                                                <input class="form-check-input client-checkbox"
                                                                    type="checkbox"
                                                                    data-val="{{ $client->id }}"
                                                                    id="client_check_{{ $client->id }}"
                                                                    {{ isset($blockedClients) && $blockedClients->contains('id', $client->id) ? 'checked' : '' }}>
                                                                <label class="form-check-label" for="client_check_{{ $client->id }}">
                                                                    {{ $client->client_name ?? $client->name }}
                                                                </label>
                                                            </div>
                                                        @endforeach
                                                    </div>
                                                </div>

                                                <div class="col-md-6 mt-5">
                                                    <label><strong>Blocked Clients</strong></label>

                                                    <select multiple name="blocked_clients[]" id="blocked_clients"
                                                        class="form-control"
                                                        style="height:220px;">
                                                        @foreach($blockedClients ?? [] as $client)
                                                            <option value="{{ $client->id }}">{{ $client->client_name ?? $client->name }}</option>
                                                        @endforeach
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        

                                </div>

                                <div class="mt-4 text-right">
                                    <button type="button" id="saveSettingsBtn" class="btn btn-primary btn-sm">Save & Continue</button>
                                </div>
                            </div>

                            <!-- REDIRECT TAB -->
                            <div class="tab-pane fade" id="redirect" role="tabpanel">
                                    @php
                                        $isEdit = !empty($editData) && !empty($editData->id);
                                    @endphp

                                    <label>Success URL</label>
                                    <input type="url" name="redirect_success_url" class="form-control mb-2"
                                        value="{{ $isEdit ? data_get($editData, 'redirect_success_url') : '' }}"
                                        placeholder="Enter Success URL">

                                    <label>Fail URL</label>
                                    <input type="url" name="redirect_fail_url" class="form-control mb-2"
                                        value="{{ $isEdit ? data_get($editData, 'redirect_fail_url') : '' }}"
                                        placeholder="Enter Fail URL">

                                    <label>Over Quota URL</label>
                                    <input type="url" name="redirect_over_quota_url" class="form-control mb-2"
                                        value="{{ $isEdit ? data_get($editData, 'redirect_over_quota_url') : '' }}"
                                        placeholder="Enter Over Quota URL">

                                    <label>Quality Termination URL</label>
                                    <input type="url" name="redirect_quality_termination_url" class="form-control mb-2"
                                        value="{{ $isEdit ? data_get($editData, 'redirect_quality_termination_url') : '' }}"
                                        placeholder="Enter Quality Termination URL">

                                    <label>Postback Success URL</label>
                                    <input type="url" name="redirect_postback_success_url" class="form-control mb-2"
                                        value="{{ $isEdit ? data_get($editData, 'redirect_postback_success_url') : '' }}"
                                        placeholder="Enter Postback Success URL">

                                

                                <div class="mt-4 text-right">
                                    <button type="button" id="finalSaveBtn" class="btn btn-success btn-sm">Save</button>
                                </div>
                            </div>

                        
                        <span id="sussess_msg" style="padding: 5px;color: #0b6c0b;font-weight: bold;"></span>
                    </div>
                </form>
            </div>
        </div>
    </div>
</section>
<!-- Billing Details Modal -->
<div class="modal fade" id="billingModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">Billing Details</h5>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>

            <div class="modal-body row">

                <div class="col-md-6 mb-2">
                    <label>Legal Business Name</label>
                    <input type="text" class="form-control" id="bill_legal_name">
                </div>

                <div class="col-md-6 mb-2">
                    <label>Business Type</label>
                    <input type="text" class="form-control" id="bill_business_type">
                </div>

                <div class="col-md-6 mb-2">
                    <label>PAN Number</label>
                    <input type="text" class="form-control" id="bill_pan">
                </div>

                <div class="col-md-6 mb-2">
                    <label>GST Number</label>
                    <input type="text" class="form-control" id="bill_gst">
                </div>

                <div class="col-md-6 mb-2">
                    <label>Registered Address</label>
                    <textarea class="form-control" id="bill_reg_address"></textarea>
                </div>

                <div class="col-md-6 mb-2">
                    <label>Billing Address</label>
                    <textarea class="form-control" id="bill_bill_address"></textarea>
                </div>

                <div class="col-md-4 mb-2">
                    <label>Bank Name</label>
                    <input type="text" class="form-control" id="bill_bank">
                </div>

                <div class="col-md-4 mb-2">
                    <label>Account Holder Name</label>
                    <input type="text" class="form-control" id="bill_holder">
                </div>

                <div class="col-md-4 mb-2">
                    <label>Account Number</label>
                    <input type="text" class="form-control" id="bill_acc">
                </div>

                <div class="col-md-4 mb-2">
                    <label>IFSC Code</label>
                    <input type="text" class="form-control" id="bill_ifsc">
                </div>

                <div class="col-md-4 mb-2">
                    <label>UPI ID</label>
                    <input type="text" class="form-control" id="bill_upi">
                </div>

                <div class="col-md-4 mb-2">
                    <label>Preferred Payment Mode</label>
                    <input type="text" class="form-control" id="bill_payment_mode">
                </div>

                <div class="col-md-6 mb-2">
                    <label>Currency Preference</label>
                    <input type="text" class="form-control" id="bill_currency">
                </div>

                <div class="col-md-6 mb-2">
                    <label>Payment Terms</label>
                    <input type="text" class="form-control" id="bill_terms">
                </div>

            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="saveBillingData">Save</button>
            </div>

        </div>
    </div>
</div>

<script src="{{ asset('assets/admin/js/vendor.js') }}"></script>
<script>
let billingAssigned = false;
let billingIndex = null;

// When checkbox clicked
$(document).on('change', '.billing-checkbox', function () {

    if (this.checked) {

        // Only allow one billing contact
        $('.billing-checkbox').not(this).prop('checked', false);

        billingAssigned = true;
        billingIndex = $(this).val();

        // Open modal - disable outside click
        $('#billingModal').modal({
            backdrop: 'static',   // prevents outside click
            keyboard: false       // disables ESC key
        });
        $('#billingModal').modal('show');
    } else {
        // if unchecked manually
        billingAssigned = false;
        billingIndex = null;
    }
});


// When modal CLOSE button (X) is clicked → uncheck checkbox
$('#billingModal .close').on('click', function () {
    // uncheck the checkbox
    $(`.billing-checkbox[value="${billingIndex}"]`).prop('checked', false);

    billingAssigned = false;
    billingIndex = null;

    $('#billingModal').modal('hide');
});


// Save billing form
$('#saveBillingData').on('click', function () {

    let html = `
        <input type="hidden" name="billing[legal_name]" value="${$('#bill_legal_name').val()}">
        <input type="hidden" name="billing[business_type]" value="${$('#bill_business_type').val()}">
        <input type="hidden" name="billing[pan]" value="${$('#bill_pan').val()}">
        <input type="hidden" name="billing[gst]" value="${$('#bill_gst').val()}">
        <input type="hidden" name="billing[reg_address]" value="${$('#bill_reg_address').val()}">
        <input type="hidden" name="billing[bill_address]" value="${$('#bill_bill_address').val()}">
        <input type="hidden" name="billing[bank]" value="${$('#bill_bank').val()}">
        <input type="hidden" name="billing[holder]" value="${$('#bill_holder').val()}">
        <input type="hidden" name="billing[acc]" value="${$('#bill_acc').val()}">
        <input type="hidden" name="billing[ifsc]" value="${$('#bill_ifsc').val()}">
        <input type="hidden" name="billing[upi]" value="${$('#bill_upi').val()}">
        <input type="hidden" name="billing[payment_mode]" value="${$('#bill_payment_mode').val()}">
        <input type="hidden" name="billing[currency]" value="${$('#bill_currency').val()}">
        <input type="hidden" name="billing[terms]" value="${$('#bill_terms').val()}">
    `;

    $('#vendorForm').append(html);

    // keep checkbox checked
    billingAssigned = true;

    $('#billingModal').modal('hide');
});

</script>
<script>
$(document).ready(function () {

    /* -------------------
       COUNTRY CHECKBOXES
    --------------------*/
    $(".country-checkbox").on("change", function () {
        let id = $(this).data("val");
        let name = $(this).next("label").text();

        if ($(this).is(":checked")) {
            $("#selected_countries").append(
                `<option value="${id}" id="selected_country_${id}">${name}</option>`
            );
        } else {
            $("#selected_country_" + id).remove();
        }
    });

    // Select All Countries
    $("#country_select_all").on("change", function () {
        $(".country-checkbox").prop("checked", $(this).is(":checked")).trigger("change");
    });


    /* -------------------
        CLIENT CHECKBOXES
    --------------------*/
    $(".client-checkbox").on("change", function () {
        let id = $(this).data("val");
        let name = $(this).next("label").text();

        if ($(this).is(":checked")) {
            $("#blocked_clients").append(
                `<option value="${id}" id="blocked_client_${id}">${name}</option>`
            );
        } else {
            $("#blocked_client_" + id).remove();
        }
    });

    // Select All Clients
    $("#client_select_all").on("change", function () {
        $(".client-checkbox").prop("checked", $(this).is(":checked")).trigger("change");
    });

});
</script>


