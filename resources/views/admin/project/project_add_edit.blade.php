@if (session()->has('message')) <script>
showToast('success', '{{ session('message') }}'); </script>
@endif
<!-- NEW MODERN FONT -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">

<style>

/* ===== GLOBAL ===== */
.layout-box-content-format1,
.layout-box-content-format1 * {
    font-family: 'Inter', sans-serif !important;
}

.layout-box-content-format1 {
    width: 100% !important;
    margin: 0 auto;
    background: linear-gradient(135deg, #eef2ff, #f8fafc);
}

/* ===== HEADINGS ===== */
.layout-box-content-format1 h3,
.layout-box-content-format1 h5 {
    font-family: 'Space Grotesk', sans-serif !important;
    letter-spacing: 0.4px !important;
}

/* ===== CARD GLASS FIX (BACKDROP WORKING ✅) ===== */
.layout-box-content-format1 .card {
    border-radius: 16px !important;
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.4) !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
    transition: all 0.3s ease;
}

/* subtle hover animation */
.layout-box-content-format1 .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.12) !important;
}

/* ===== HEADER ===== */
.layout-box-content-format1 .card-header {
    background: linear-gradient(135deg, #111827, #2d80f0) !important;
    padding: 12px 20px !important;
    border-radius: 16px 16px 0 0 !important;
}

.layout-box-content-format1 .card-title {
    color: #fff !important;
    font-size: 18px !important;
    font-weight: 600 !important;
}

/* ===== TABS ===== */
.nav-tabs {
    border-bottom: none !important;
}

.nav-tabs .nav-link {
    border: none !important;
    color: #6b7280 !important;
    font-size: 13px;
    position: relative;
    transition: 0.3s;
}

.nav-tabs .nav-link.active {
    color: #2d80f0 !important;
    font-weight: 600;
}

/* animated underline */
.nav-tabs .nav-link::after {
    content: "";
    position: absolute;
    width: 0%;
    height: 2px;
    left: 0;
    bottom: -6px;
    background: #2d80f0;
    transition: 0.3s;
}

.nav-tabs .nav-link.active::after {
    width: 100%;
}

/* ===== INPUT MODERN ===== */
.layout-box-content-format1 .form-control {
    border: none !important;
    border-bottom: 2px solid #e5e7eb !important;
    background: transparent !important;
    border-radius: 0 !important;
    padding-left: 0 !important;
    transition: all 0.3s ease !important;
}

/* glow animation on focus */
.layout-box-content-format1 .form-control:focus {
    border-bottom: 2px solid #2d80f0 !important;
    box-shadow: 0 6px 12px rgba(45,128,240,0.15);
    transform: scale(1.02);
}

/* ===== SELECT2 ===== */
.layout-box-content-format1 .select2-container--default .select2-selection--single {
    border: none !important;
    border-bottom: 2px solid #e5e7eb !important;
    background: transparent !important;
    height: 40px !important;
}

.layout-box-content-format1 .select2-container--default.select2-container--focus .select2-selection--single {
    border-bottom: 2px solid #2d80f0 !important;
}

/* dropdown glass */
.select2-dropdown {
    background: rgba(255,255,255,0.9) !important;
    backdrop-filter: blur(10px);
    border-radius: 10px !important;
    border: none !important;
}

/* ===== BUTTON ===== */
.action-button {
    background: linear-gradient(135deg, #111827, #2d80f0) !important;
    border-radius: 10px !important;
    transition: 0.3s;
}

/* hover animation */
.action-button:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

/* ===== CONTINUE BUTTON ===== */
.continue-btn {
    border-radius: 10px !important;
    transition: 0.3s;
}

.continue-btn:hover {
    transform: translateY(-2px);
}

/* ===== CONTACT BOX ===== */
.contact-item {
    border-radius: 12px !important;
    background: rgba(255,255,255,0.6) !important;
    backdrop-filter: blur(10px);
    transition: 0.3s;
}

.contact-item:hover {
    transform: scale(1.02);
}

/* ===== CHECKBOX ===== */
.form-check-input {
    cursor: pointer;
    transition: 0.2s;
}

.form-check-input:checked {
    transform: scale(1.1);
}

/* ===== SMOOTH PAGE LOAD ===== */
.layout-box-content-format1 {
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
/* ===== TEXT COLOR FIX (IMPORTANT 🔥) ===== */

/* Normal input text */
.layout-box-content-format1 .form-control {
    color: #111827 !important; /* dark text */
}

/* Placeholder color */
.layout-box-content-format1 .form-control::placeholder {
    color: #9ca3af !important;
}

/* On focus */
.layout-box-content-format1 .form-control:focus {
    color: #111827 !important;
}

/* ===== SELECT2 TEXT FIX ===== */

/* Selected text */
.select2-container--default .select2-selection--single .select2-selection__rendered {
    color: #111827 !important;
}

/* Dropdown options */
.select2-results__option {
    color: #111827 !important;
}

/* Highlighted option */
.select2-results__option--highlighted {
    background: #2d80f0 !important;
    color: #fff !important;
}

/* Search input inside dropdown */
.select2-container--default .select2-search--dropdown .select2-search__field {
    color: #111827 !important;
    background: #fff !important;
}

/* Dropdown box */
.select2-dropdown {
    color: #111827 !important;
}

/* ===== LABEL COLOR ===== */
.layout-box-content-format1 label {
    color: #374151 !important;
}

/* ===== TAB CONTENT TEXT ===== */
.tab-content {
    color: #111827 !important;
}
</style>
<section class="layout-box-content-format1">
    <div class="row">
        <div class="col-md-12">
            <div class="card card-primary list-view">
                <div class="card-header box-shdw">
                    <div>
                        <h3 class="card-title">Project</h3>
                    </div>
                    <div class="d-flex gap-2">
                        <x-button-component title='<i class="fas fa-list"></i> List' url="{{ url('admin/projects') }}" />
                        @if ($mode == 'Edit')
                            <x-button-component title='<i class="fas fa-history"></i> LOG' mclass="openModal" mtitle="LOG"
                                mhref="{{ url('admin/log/projects/') }}/{{ $editData ? $editData->id : '' }}" />
                        @endif
                    </div>
                </div>


            <form name="projectForm" id="projectForm" enctype="multipart/form-data" autocomplete="off">
                <div class="card-body">
                    @csrf
                    <input type="hidden" name="mode" id="mode" value="{{ $mode }}" />
                    <input type="hidden" name="id" id="id" value="{{ $editData->id ?? '' }}" />
                    <input type="hidden" name="bid_id" id="bid_id" value="{{ request('bid_id') ?? ($editData->bid_id ?? '') }}">

                    {{-- Tabs --}}
                    <ul class="nav nav-tabs" id="projectTabs" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="tab-info" data-toggle="tab" href="#tabInfo" role="tab">Info</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="tab-notes" data-toggle="tab" href="#tabNotes" role="tab">Notes</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="tab-redirect" data-toggle="tab" href="#tabRedirect" role="tab">Redirect</a>
                        </li>
                    </ul>

                    <div class="tab-content p-3 border border-top-0" id="projectTabsContent">

                        {{-- Info Tab --}}
                        <div class="tab-pane fade show active" id="tabInfo" role="tabpanel">
                            <div class="row g-2">
                                <div class="col-md-4">
                                    <label>Project Name</label>
                                    <input type="text" class="form-control" id="name" name="name"
                                        value="{{ old('name', $editData->name ?? '') }}" placeholder="Enter Project Name">
                                    <div id="name_error" class="invalid-feedback d-block error-text"></div>
                                </div>

                                {{-- Client (from bids -> client_id join) --}}
                                <div class="col-md-4">
                                    <label>Client</label>
                                    <select class="form-control select2" id="client_id" name="client_id" data-placeholder="Select Client">
                                        <option value="">Select</option>
                                        @foreach ($clientList as $List)
                                            <option value="{{ $List->id }}" {{ old('client_id', $editData->client_id ?? '') == $List->id ? 'selected' : '' }}>
                                                {{ $List->client_name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <div id="client_id_error" class="invalid-feedback d-block error-text"></div>
                                </div>

                                {{-- Client Contact (from bids -> client_contact join) --}}
                                <div class="col-md-4">
                                    <label>Client Contact</label>
                                    <select class="form-control select2" id="client_contact_id" name="client_contact_id" data-placeholder="Select Client Contact">
                                        <option value="">Select</option>
                                        @if (!empty($clientContacts))
                                            @foreach ($clientContacts as $cc)
                                                <option value="{{ $cc->id }}" {{ old('client_contact_id', $editData->client_contact_id ?? '') == $cc->id ? 'selected' : '' }}>
                                                    {{ $cc->name }}{{ $cc->email ? ' (' . $cc->email . ')' : '' }}
                                                </option>
                                            @endforeach
                                        @endif
                                    </select>
                                </div>

                                {{-- Project Type --}}
                                <div class="col-md-4">
                                    <label>Project Type</label>
                                    <select class="form-control select2" id="project_type" name="project_type" data-placeholder="Select Project Type">
                                        <option value="">Select</option>

                                        @if (!empty($ptype))
                                            @foreach ($ptype as $pt)
                                                <option value="{{ $pt->id }}"
                                                    {{ old('project_type', $editData->project_type ?? '') == $pt->id ? 'selected' : '' }}>
                                                    {{ $pt->name }}
                                                </option>
                                            @endforeach
                                        @endif
                                    </select>

                                </div>

                                {{-- Category (from bids -> bid_category join if provided) --}}
                                <div class="col-md-4">
                                    <label>Category</label>
                                    <select class="form-control select2" id="category" name="category" data-placeholder="Select Category">
                                        <option value="">Select</option>
                                        @if (!empty($pcategory))
                                            @foreach ($pcategory as $pc)
                                                <option value="{{ $pt->id }}"
                                                    {{ old('category', $editData->category ?? '') == $pc->id ? 'selected' : '' }}>
                                                    {{ $pc->name }}
                                                </option>
                                            @endforeach
                                        @endif
                                    </select>
                                </div>

                                {{-- Audience Type --}}
                                <div class="col-md-4">
                                    <label>Audience Type</label>
                                    <select class="form-control select2" id="audience_type" name="audience_type" data-placeholder="Select Audience Type">
                                        <option value="">Select</option>
                                        <option value="B2B" {{ old('audience_type', $editData->audience_type ?? '') == 'B2B' ? 'selected' : '' }}>B2B</option>
                                        <option value="B2C" {{ old('audience_type', $editData->audience_type ?? '') == 'B2C' ? 'selected' : '' }}>B2C</option>
                                        <option value="Health Care" {{ old('audience_type', $editData->audience_type ?? '') == 'Health Care' ? 'selected' : '' }}>Health Care</option>
                                    </select>
                                </div>

                                {{-- Currency --}}
                                <div class="col-md-4">
                                    <label>Currency</label>
                                    <select class="form-control select2" id="currency" name="currency" data-placeholder="Select Currency">
                                        <option value="">Select</option>
                                        <option value="INR" {{ old('currency', $editData->currency ?? '') == 'INR' ? 'selected' : '' }}>INR - Indian Rupee</option>
                                        <option value="USD" {{ old('currency', $editData->currency ?? '') == 'USD' ? 'selected' : '' }}>USD - US Dollar</option>
                                        <option value="AUD" {{ old('currency', $editData->currency ?? '') == 'AUD' ? 'selected' : '' }}>AUD - Australian Dollar</option>
                                        <option value="CAD" {{ old('currency', $editData->currency ?? '') == 'CAD' ? 'selected' : '' }}>CAD - Canadian Dollar</option>
                                        <option value="GBP" {{ old('currency', $editData->currency ?? '') == 'GBP' ? 'selected' : '' }}>GBP - British Pound</option>
                                    

                                    </select>
                                </div>

                                {{-- Sales Rep --}}
                                <div class="col-md-4">
                                    <label>Sales Rep</label>
                                    <input type="text" class="form-control" id="sales_rep"
                                        name="sales_rep"
                                        value="{{ old('sales_rep', $editData->sales_rep ?? '') }}"
                                        placeholder="Sales Representative">

                                </div>

                                {{-- Project Manager --}}
                                <div class="col-md-4">
                                    <label>Project Manager</label>
                                    <select class="form-control select2" id="pm_user" name="pm_user" data-placeholder="Select Project Manager">
                                        <option value="">Select</option>
                                        @foreach ($pmUsers as $user)
                                            <option value="{{ $user->id }}" {{ old('pm_user', $editData->pm_user ?? '') == $user->id ? 'selected' : '' }}>
                                                {{ $user->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>

                                {{-- Sub Project Manager --}}
                                <div class="col-md-4">
                                    <label>Sub Project Manager</label>
                                    <select class="form-control select2" id="sub_pm_user" name="sub_pm_user" data-placeholder="Select Sub PM">
                                        <option value="">Select</option>
                                        @foreach ($pmUsers ?? [] as $user)
                                            <option value="{{ $user->id }}" {{ old('sub_pm_user', $editData->sub_pm_user ?? '') == $user->id ? 'selected' : '' }}>
                                                {{ $user->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>

                                {{-- Remaining fields --}}
                                <div class="col-md-4 mt-2">
                                    <label>Start Date</label>
                                    <input type="date" class="form-control" id="start_date" name="start_date"
                                        value="{{ old('start_date', isset($editData->created_at) ? \Carbon\Carbon::parse($editData->start_date)->format('Y-m-d') : '') }}">
                                </div>

                                <div class="col-md-4 mt-2">
                                    <label>No. of Days</label>
                                    <input type="number" class="form-control" id="no_of_days" name="no_of_days"
                                        value="{{ old('no_of_days', $editData->no_of_days ?? '') }}">
                                </div>

                                <div class="col-md-4 mt-2">
                                    <label>Email Reference</label>
                                    <input type="text" class="form-control" id="email_reference" name="email_reference"
                                        value="{{ old('email_reference', $editData->email_reference ?? '') }}" placeholder="Email reference">
                                </div>

                                <div class="col-md-4 mt-3">
                                    <label>CPI</label>
                                    <input type="text" class="form-control numberwithdecimal" id="cost_per_complete" name="cost_per_complete"
                                        value="{{ old('cost_per_complete', $editData->cost_per_complete ?? '') }}" placeholder="Enter CPI">
                                    <div id="cost_per_complete_error" class="invalid-feedback d-block error-text"></div>
                                </div>

                                <div class="col-md-4 mt-3">
                                    <label>Max Completes</label>
                                    <input type="text" class="form-control onlynumber" id="max_limit" name="max_limit"
                                        value="{{ old('max_limit', $editData->max_limit ?? '') }}" placeholder="Max completes">
                                    <div id="max_limit_error" class="invalid-feedback d-block error-text"></div>
                                </div>

                                <div class="col-md-6 mt-3">
                                    <label>LOI (mins)</label>
                                    <input type="text" class="form-control onlynumber" id="loi" name="loi"
                                        value="{{ old('loi', $editData->loi ?? '') }}" placeholder="LOI">
                                    <div id="loi_error" class="invalid-feedback d-block error-text"></div>
                                </div>

                                <div class="col-md-6 mt-3">
                                    <label>IR</label>
                                    <input type="text" class="form-control numberwithdecimal" id="ir" name="ir"
                                        value="{{ old('ir', $editData->ir ?? '') }}" placeholder="IR">
                                    <div id="ir_error" class="invalid-feedback d-block error-text"></div>
                                </div>
                                       {{-- =================== SECURITY SETTINGS CHECKBOXES =================== --}}
                                <div class="col-12 mt-3">
                                    <label class="fw-bold">Security Settings</label>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" name="project_token" id="project_token"
                                           >
                                        <label class="form-check-label" for="project_token">Project Token is required</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" name="geo_ip_check" id="geo_ip_check"
                                           >
                                        <label class="form-check-label" for="geo_ip_check">GEO IP Check</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" name="unique_member_pid" id="unique_member_pid"
                                          >
                                        <label class="form-check-label" for="unique_member_pid">Unique Member PID</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" name="hashing" id="hashing"
                                           >
                                        <label class="form-check-label" for="hashing">Hashing</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" name="s2s" id="s2s"
                                           >
                                        <label class="form-check-label" for="s2s">S2S</label>
                                    </div>
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" name="speeder" id="speeder"
                                           >
                                        <label class="form-check-label" for="speeder">Speeder</label>
                                    </div>
                                </div>

                                {{-- Research Defender Scores --}}
                                <div class="col-md-6 mt-3">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" name="rd_enabled" id="rd_enabled"
                                           >
                                        <label class="form-check-label" for="rd_enabled">Research Defender</label>
                                    </div>
                                    <label>Threat Potential Score *</label>
                                    <input type="number" class="form-control" name="threat_score" value="">
                                </div>

                                <div class="col-md-6 mt-3">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" name="rd_activity_enabled" id="rd_activity_enabled"
                                            >
                                        <label class="form-check-label" for="rd_activity_enabled">Research Defender Activity</label>
                                    </div>
                                    <label>Activity Surveys Count *</label>
                                    <input type="number" class="form-control" name="activity_score" value="">
                                </div>
                                <!--<div class="col-12 mt-3">-->
                                <!--    <label>Description</label>-->
                                <!--    <textarea class="form-control" id="description" name="description">{{ old('description', $editData->description ?? '') }}</textarea>-->
                                <!--</div>-->
                            </div>

                            <div class="mt-3 text-end">
                                <button type="button" class="btn btn-primary continue-btn" data-tab="info">Save & Next</button>
                            </div>
                        </div>

                        {{-- Notes Tab --}}
                        <div class="tab-pane fade" id="tabNotes" role="tabpanel">
                            <div class="row">
                                <div class="col-12">
                                    <label>Notes</label>
                                    <textarea class="form-control" id="notes" name="notes" rows="6">{{ old('notes', $editData->notes ?? '') }}</textarea>
                                </div>
                            </div>
                            <div class="mt-3 text-end">
                                <button type="button" class="btn btn-primary continue-btn" data-tab="notes">Save & Next</button>
                            </div>
                        </div>

                        {{-- Redirect Tab --}}
                        <div class="tab-pane fade" id="tabRedirect" role="tabpanel">
                            <div class="row g-2">
                                <div class="col-md-6">
                                    <label>Success Redirect URL</label>
                                    <input type="text" class="form-control" id="redirect_success" name="redirect_success"
                                        value="{{ old('redirect_success', $editData->redirect_success ?? '') }}" placeholder="Success Redirect URL">
                                    <div id="redirect_success_error" class="invalid-feedback d-block error-text"></div>
                                </div>

                                <div class="col-md-6">
                                    <label>Termination Redirect URL</label>
                                    <input type="text" class="form-control" id="redirect_termination" name="redirect_termination"
                                        value="{{ old('redirect_termination', $editData->redirect_termination ?? '') }}" placeholder="Termination Redirect URL">
                                </div>

                                <div class="col-md-6 mt-2">
                                    <label>Quota Termination Redirect URL</label>
                                    <input type="text" class="form-control" id="redirect_quota" name="redirect_quota"
                                        value="{{ old('redirect_quota', $editData->redirect_quota ?? '') }}" placeholder="Quota Termination URL">
                                </div>

                                <div class="col-md-6 mt-2">
                                    <label>Quality Termination Redirect URL</label>
                                    <input type="text" class="form-control" id="redirect_quality" name="redirect_quality"
                                        value="{{ old('redirect_quality', $editData->redirect_quality ?? '') }}" placeholder="Quality Termination URL">
                                </div>

                                <div class="col-12 mt-3">
                                    <label>Project Unique ID (readonly)</label>
                                    <input type="text" class="form-control" readonly value="{{ $editData->project_id ?? '' }}">
                                </div>
                            </div>

                            <div class="mt-3 text-end">
                                <button type="submit" class="btn btn-success" id="savebtn">{{ $btntext }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>


</section>

<script src="{{ asset('assets/admin/js/projects.js') }}"></script>

<script>
    $(document).ready(function() {
        $('.select2').select2({
            width: '100%',
            theme: 'bootstrap4',
            placeholder: function(){
                return $(this).data('placeholder');
            },
            allowClear: true
        });
    });
    // CKEDITOR.replace('description');
</script>
