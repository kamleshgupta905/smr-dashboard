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

<section class="layout-box-content-format1">
    <div class="container-fluid">
        <h4 class="mb-3">Edit Bid Specifications</h4>

       <form id="bidSpecForm"  action="{{ route('bid.updateSpec', $bid->id) }}"  method="POST"  enctype="multipart/form-data"  autocomplete="off">
      
    @csrf
    

            <input type="hidden" name="bid_id" value="{{ $bid->id }}">

            <div class="row mb-3">
                <div class="col-md-3">
                    <label>Bid Name *</label>
                    <input type="text" class="form-control" name="bid_name" required value="{{ $bid->bid_name ?? '' }}">
                </div>

                <div class="col-md-3">
                    <label>Client *</label>
                    <select class="form-select select2" name="client_id"  id="client_id" required>
                        <option value="">Select Client</option>
                        @foreach($clients ?? [] as $c)
                            <option value="{{ $c->id }}" {{ $bid->client_id==$c->id ? 'selected' : '' }}>
                                {{ $c->client_name ?? $c->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div class="col-md-3">
                    <label>Sales Rep *</label>
                    <input type="text" class="form-control" name="sales_rep" id="sales_rep" value="{{ $bid->sales_rep ?? '' }}" readonly>
                </div>

                <div class="col-md-3">
                    <label>Client Contact *</label>
                    <select class="form-select select2" name="client_contact" id="client_contact" required>
                        <option value="">Select Contact</option>
                        @if(isset($bid->client_contact))
                            <option value="{{ $bid->client_contact }}" selected>{{ $bid->client_contact_name ?? '' }}</option>
                        @endif
                    </select>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-3">
                    <label>Created By</label>
                    <input type="text" class="form-control" value="{{ session('surveysAdmin.userName') }}" readonly>
                    <input type="hidden" name="created_by" value="{{ session('surveysAdmin.userId') }}">
                </div>

                <div class="col-md-3">
                    <label>Bid Type</label>
                    <select class="form-control select2" name="bid_type_id">
                        <option value="">Select Bid Type</option>
                        @foreach($bidTypes as $bt)
                            <option value="{{ $bt->id }}" {{ $bid->bid_type==$bt->id ? 'selected' : '' }} title="{{ $bt->description }}">
                                {{ $bt->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div class="col-md-3">
                    <label>Bid Category *</label>
                    <select class="form-control select2" name="category_id">
                        <option value="">Select Category</option>
                        @foreach($categories as $cat)
                            <option value="{{ $cat->id }}" {{ $bid->bid_category==$cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="col-md-3">
                    <label>Audience Type *</label>
                    <select class="form-control select2" name="audience_type" required>
                        @foreach(['ALL','B2B','B2C','Health Care','Other'] as $type)
                            <option value="{{ $type }}" {{ $bid->audience_type==$type ? 'selected' : '' }}>{{ $type }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-4">
                    <label>Status *</label>
                    <select class="form-control select2" name="status">
                        @foreach(['Open','Sent','Won','Closed','Pass'] as $status)
                            <option value="{{ $status }}" {{ $bid->status==$status ? 'selected' : '' }}>{{ $status }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="col-md-4">
                    <label>Email Reference</label>
                    <input type="text" class="form-control" name="email_reference" value="{{ $bid->email_reference ?? '' }}">
                </div>

                <div class="col-md-4">
                    <label>Currency *</label>
                    <select class="form-control select2" name="currency">
                        @foreach(['INR'=>'INR - Indian Rupee','USD'=>'USD - US Dollar','AUD'=>'AUD - Australian Dollar','CAD'=>'CAD - Canadian Dollar','GBP'=>'GBP - British Pound'] as $key=>$label)
                            <option value="{{ $key }}" {{ $bid->currency==$key ? 'selected' : '' }}>{{ $label }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <label>Notes</label>
                <textarea class="form-control" name="notes" rows="3">{{ $bid->notes ?? '' }}</textarea>
            </div>

            <div class="mb-3">
                <label>Upload Files (CSV, DOC, PDF, etc.)</label>
                <input type="file" class="form-control" name="bid_files[]" multiple accept=".csv,.pdf,.doc,.docx,.xls,.xlsx,.txt">
                <small class="text-muted">You can upload up to 10 files at a time.</small>
            </div>

            <div class="text-end">
                <button type="submit" class="btn btn-primary" id="saveBidBtn">Save</button>
            </div>
        </form>
    </div>
</section>
<script src="{{ asset('assets/admin/js/bid.js') }}"></script>
<script>
$(document).ready(function(){
    $('.select2').select2({ width:'100%' });

    document.querySelector('#bid_files').addEventListener('change', function() {
        if(this.files.length>10) {
            alert('You can only upload a maximum of 10 files.');
            this.value = '';
        }
    });
});
</script>
