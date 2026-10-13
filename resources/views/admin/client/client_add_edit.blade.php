
@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif
<!-- NEW MODERN FONT -->
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
.action-button {
   background: linear-gradient(135deg, #111827, #2d80f0) !important;
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
            <div class="card card-primary list-view" style="max-width:1200px; margin:auto;">
                <div class="card-header box-shdw">
                    <h3 class="card-title">Client</h3>
                    <x-button-component title='<i class="fas fa-list"></i> List' url="{{ url('admin/client') }}" />
                    @if ($mode == 'Edit')
                        <x-button-component title='<i class="fas fa-history"></i> LOG' mclass="openModal" mtitle="LOG"
                            mhref="{{ url('admin/log/client/') }}/{{ $editData ? $editData->id : '' }}" />
                    @endif
                </div>

                <form name="clientForm" id="clientForm" enctype="multipart/form-data">
                    @csrf
                    <input type="hidden" name="mode" id="mode" value="{{ $mode }}" />
                    <input type="hidden" name="id" id="id" value="{{ $editData ? $editData->id : '' }}" />

                    <div class="card-body">

                        {{-- Client Information --}}
                        <div class="formblock-box mb-3">
                            <h5 class="mb-3">Client Information</h5>
                                <hr>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Client Name*</label>
                                    <input type="text" class="form-control" name="client_name"
                                        placeholder="Enter Client Name"
                                        value="{{ $editData ? $editData->client_name : '' }}">
                                    <div class="invalid-feedback d-block error-text" id="client_name_error"></div>
                                </div>

                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Email Address*</label>
                                    <input type="email" class="form-control" name="email"
                                        placeholder="Enter Email Address"
                                        value="{{ $editData ? $editData->email : '' }}">
                                    <div class="invalid-feedback d-block error-text" id="email_error"></div>
                                </div>

                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Phone Number</label>
                                    <input type="tel" class="form-control" name="phone"
                                        placeholder="Enter Phone Number"
                                        value="{{ $editData ? $editData->phone : '' }}">
                                    <div class="invalid-feedback d-block error-text" id="phone_error"></div>
                                </div>

                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Sales Rep*</label>
                                    <select class="select2" name="sales_rep">
                                        <option value="">Select Sales Rep</option>
                                        @if(isset($userList) && count($userList) > 0)
                                            @foreach($userList as $user)
                                                <option value="{{ $user->id }}" 
                                                    {{ ($editData && $editData->sales_rep == $user->id) ? 'selected' : '' }}>
                                                    {{ $user->name }}
                                                </option>
                                            @endforeach
                                        @endif
                                    </select>
                                    <div class="invalid-feedback d-block error-text" id="sales_rep_error"></div>
                                </div>

                            </div>
                        </div>

                        {{-- Address Information --}}
                        <div class="formblock-box mb-3">
                            <h5 class="mb-3">Address</h5>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Country*</label>
                                    <select class="select2" name="country">
                                        @foreach($country as $row)
                                            <option value="{{ $row->name }}"
                                                {{ ($editData && $editData->country == $row->name) ? 'selected' : '' }}>
                                                {{ $row->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <div class="invalid-feedback d-block error-text" id="country_error"></div>
                                </div>

                                <div class="col-md-6 mb-3">
                                    <label class="form-label">State</label>
                                    <input type="text" class="form-control" name="state"
                                        placeholder="Enter State" value="{{ $editData ? $editData->state : '' }}">
                                </div>

                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Street</label>
                                    <input type="text" class="form-control" name="street"
                                        placeholder="Enter Street" value="{{ $editData ? $editData->street : '' }}">
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label class="form-label">City</label>
                                    <input type="text" class="form-control" name="city"
                                        placeholder="Enter City" value="{{ $editData ? $editData->city : '' }}">
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Zip</label>
                                    <input type="text" class="form-control" name="zip"
                                        placeholder="Enter ZIP" value="{{ $editData ? $editData->zip : '' }}">
                                </div>
                            </div>
                        </div>

                        {{-- Banking Information --}}
                        <div class="formblock-box mb-3">
                            <h5 class="mb-3">Banking Information</h5>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Bank</label>
                                    <input type="text" class="form-control" name="bank"
                                        placeholder="Enter Bank" value="{{ $editData ? $editData->bank : '' }}">
                                </div>

                                <div class="col-md-4 mb-3">
                                    <label class="form-label">IBAN</label>
                                    <input type="text" class="form-control" name="iban"
                                        placeholder="Enter IBAN" value="{{ $editData ? $editData->iban : '' }}">
                                </div>

                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Swift</label>
                                    <input type="text" class="form-control" name="swift"
                                        placeholder="Enter Swift" value="{{ $editData ? $editData->swift : '' }}">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Vat</label>
                                    <input type="text" class="form-control" name="vat"
                                        placeholder="Enter Vat" value="{{ $editData ? $editData->vat : '' }}">
                                </div>

                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Tax Registration Number</label>
                                    <input type="text" class="form-control" name="tax_no"
                                        placeholder="Enter TRN" value="{{ $editData ? $editData->tax_no : '' }}">
                                </div>

                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Currency*</label>
                                    <select class="select2" name="currency">
                                        <option value="">Select</option>
                                         <option value="INR" {{ old('currency', $editData->currency ?? '') == 'INR' ? 'selected' : '' }}>INR - Indian Rupee</option>
                                        <option value="USD" {{ old('currency', $editData->currency ?? '') == 'USD' ? 'selected' : '' }}>USD - US Dollar</option>
                                        <option value="AUD" {{ old('currency', $editData->currency ?? '') == 'AUD' ? 'selected' : '' }}>AUD - Australian Dollar</option>
                                        <option value="CAD" {{ old('currency', $editData->currency ?? '') == 'CAD' ? 'selected' : '' }}>CAD - Canadian Dollar</option>
                                        <option value="GBP" {{ old('currency', $editData->currency ?? '') == 'GBP' ? 'selected' : '' }}>GBP - British Pound</option>
                                    </select>
                                    <div class="invalid-feedback d-block error-text" id="currency_error"></div>
                                </div>
                            </div>
                        </div>

                        {{-- Contacts --}}
                        <div class="formblock-box mb-3">
                            <h5 class="mb-3">Contacts</h5>
                            <div id="contactContainer">
                                @if(isset($editData->contacts) && count($editData->contacts) > 0)
                                   @foreach($editData->contacts as $contact)
                                <div class="contact-item mb-3 border rounded p-3">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-md-3">
                                            <input type="text" name="contact_name[]" class="form-control" placeholder="Enter name" value="{{ $contact->name }}">
                                        </div>
                                        <div class="col-md-3">
                                            <input type="email" name="contact_email[]" class="form-control" placeholder="Enter email" value="{{ $contact->email }}">
                                        </div>
                                        <div class="col-md-3">
                                            <input type="text" name="contact_phone[]" class="form-control" placeholder="Enter phone" value="{{ $contact->phone }}">
                                        </div>
                                        <div class="col-md-1 d-flex align-items-center">
                                            <div class="form-check">
                                                <input type="checkbox" name="is_primary[]" value="1" class="form-check-input" {{ $contact->is_primary ? 'checked' : '' }}>
                                                <label class="form-check-label">Primary</label>
                                            </div>
                                        </div>
                                        <div class="col-md-1 d-flex align-items-center">
                                            <div class="form-check">
                                                <input type="checkbox" name="is_billing[]" value="1" class="form-check-input" {{ $contact->billing ? 'checked' : '' }}>
                                                <label class="form-check-label">Billing</label>
                                            </div>
                                        </div>
                                        <div class="col-md-1 text-end">
                                            <button type="button" class="btn btn-sm btn-danger removeContactBtn">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                @endforeach

                                @endif
                            </div>
                            <button type="button" class="btn btn-sm btn-secondary mt-2" id="addContactBtn">+ Add Contact</button>
                        </div>

                       <div class="row mt-4 align-items-center">
                            <div class="col-md-2">
                                <div class="form-check">
                                    <input type="checkbox" name="is_api" value="1" class="form-check-input"
                                        id="is_api"
                                        {{ isset($editData->is_api) && $editData->is_api == 1 ? 'checked' : '' }}>
                                    <label class="form-check-label" for="is_api">Is API</label>
                                </div>
                            </div>

                            <div class="col-md-8"></div>

                            <div class="col-md-2 text-end">
                                <button type="submit" style="width: 135px;" class="btn btn-sm action-button">
                                    {{ $btntext }}
                                </button>
                            </div>
                        </div>


                        <span id="sussess_msg" style="padding: 5px;color: #0b6c0b;font-weight: bold;"></span>
                    </div>
                </form>
            </div>
        </div>
    </div>
</section>

<script src="{{ asset('assets/admin/js/client.js') }}"></script>


