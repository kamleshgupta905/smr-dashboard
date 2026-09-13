@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<section class="layout-box-content-format1">
    <div class="container-fluid">
    <form action="{{ url('admin/survey/updates/'.$editdata->id) }}" method="POST" id="surveyForm" novalidate>
            @csrf
        @if(!empty($editdata))

        <p class="mb-3">
            <input type="hidden" name="bid" value="{{$editdata->bid}}">
            <strong>
                {{$editdata->id}} / {{$editdata->target_audience}} - {{$editdata->project_id}} / {{$editdata->pm_name}} / {{$editdata->bid_id}}
            </strong>
        </p>

        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Tabs --}}
        <ul class="nav nav-tabs" id="surveyTabs" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" data-toggle="tab" href="#settings" role="tab">Setting</a>
            </li>
        </ul>

        <div class="tab-content pt-3">

            {{-- ================= SETTINGS TAB ================= --}}
            <div class="tab-pane fade show active" id="settings" role="tabpanel">

                <div class="row">

                    {{-- Survey Name --}}
                    <div class="col-md-3 mb-3">
                        <label>Survey Name *</label>
                        <input type="text" class="form-control" 
                            name="s_name" id="s_name"
                            value="{{ $editdata->target_audience }}" required>
                    </div>

                    {{-- Country --}}
                    <div class="col-md-3 mb-3">
                        <label>Country *</label>
                        <select class="form-control select2" name="country" required>
                            <option value="">Select</option>
                            @foreach($countries as $c)
                                <option value="{{ $c->id }}"
                                    {{ $c->name == $editdata->country_name ? 'selected' : '' }}>
                                    {{ $c->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    {{-- Language --}}
                    <div class="col-md-3 mb-3">
                        <label>Language *</label>
                        <select class="form-control select2" name="language" required>
                            <option value="">Select Language</option>
                            <option value="English" {{ $editdata->language == 'English' ? 'selected' : '' }}>English</option>
                            <option value="Hindi" {{ $editdata->language == 'Hindi' ? 'selected' : '' }}>Hindi</option>
                            <option value="Native Language" {{ $editdata->language == 'Native Language' ? 'selected' : '' }}>Native Language</option>
                        </select>
                    </div>

                    {{-- Device Type --}}
                    <div class="col-md-3 mb-3">
                        <label>Device Type *</label>
                        <select class="form-control select2" name="device_type" required>
                            <option value="ALL Devices" {{ $editdata->device_type=='ALL Devices' ? 'selected':'' }}>All Devices</option>
                            <option value="Desktop/Laptop" {{ $editdata->device_type=='Desktop/Laptop' ? 'selected':'' }}>Desktop / Laptop</option>
                            <option value="Mobile" {{ $editdata->device_type=='Mobile' ? 'selected':'' }}>Mobile</option>
                            <option value="Tablet" {{ $editdata->device_type=='Tablet' ? 'selected':'' }}>Tablet</option>
                        </select>
                    </div>

                    {{-- N --}}
                    <div class="col-md-3 mb-3">
                        <label class="fw-bold">N *</label>
                        <input type="number" name="n" value="{{ $editdata->feasibility_n }}" class="form-control" required>
                    </div>

                    {{-- LOI --}}
                    <div class="col-md-3 mb-3">
                        <label class="fw-bold">LOI *</label>
                        <input type="number" name="loi" value="{{ $editdata->loi }}" class="form-control" required>
                    </div>

                    {{-- IR --}}
                    <div class="col-md-3 mb-3">
                        <label class="fw-bold">IR *</label>
                        <input type="number" name="ir" value="{{ $editdata->ir }}" class="form-control" required>
                    </div>

                    {{-- Client CPI --}}
                   <div class="col-md-3 mb-3">
                        <label class="fw-bold">Client CPI *</label>
                        <div class="input-group">
                            <input type="number"
                                   name="client_cpi"
                                   value="{{ $editdata->client_cpi }}"
                                   class="form-control"
                                   step="0.01" required>
                            <span class="input-group-text">%</span>
                        </div>
                    </div>
                    
                    {{-- CPI --}}
                    <div class="col-md-3 mb-4">
                        <label class="fw-bold">CPI *</label>
                        <div class="input-group">
                            <input type="number"
                                   name="cpi"
                                   value="{{ $editdata->cpi }}"
                                   class="form-control"
                                   step="0.01" required>
                            <span class="input-group-text">%</span>
                        </div>
                    </div>

                    <hr class="my-4 w-100">

                    {{-- ================= LIVE URL SECTION ================= --}}
                    <div class="col-md-12 mb-2">
                        <label class="me-3">
                            <input type="radio" name="live_url_type" value="single"
                                {{ $editdata->live_url_type=='single' ? 'checked':'' }}> 
                                Single Live URL
                        </label>

                        <label class="ms-4">
                            <input type="radio" name="live_url_type" value="unique"
                                {{ $editdata->live_url_type=='unique' ? 'checked':'' }}> 
                                Upload Live Unique URL
                        </label>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="fw-bold">Live URL *</label>
                        <input type="text" name="live_url" class="form-control"
                            value="{{ $editdata->live_url }}" required>
                    </div>

                    <hr class="my-4 w-100">

                    {{-- ================= TEST URL SECTION ================= --}}
                    <div class="col-md-12 mb-2">
                        <label class="me-3">
                            <input type="radio" name="test_url_type" value="single"
                                {{ $editdata->test_url_type=='single' ? 'checked':'' }}> 
                                Single Test URL
                        </label>

                        <label class="ms-4">
                            <input type="radio" name="test_url_type" value="unique"
                                {{ $editdata->test_url_type=='unique' ? 'checked':'' }}> 
                                Upload Test Unique URL
                        </label>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="fw-bold">Test URL *</label>
                        <input type="text" name="test_url" class="form-control"
                            value="{{ $editdata->test_url }}" required>
                    </div>

                    <hr class="my-4 w-100">

                    {{-- ================= CHECKBOXES ================= --}}
                    <div class="col-md-3 mb-3">
                        <label>
                            <input type="checkbox" name="collects_pii"
                                   {{ $editdata->collects_pii ? 'checked' : '' }}>
                            Collects PII
                        </label>
                    </div>

                    <div class="col-md-3 mb-3">
                        <label>
                            <input type="checkbox" name="exclude_survey"
                                   {{ $editdata->exclude_survey ? 'checked' : '' }}>
                            Exclude Survey
                        </label>
                    </div>

                    <hr class="my-4 w-100">

                    {{-- ===================== RESEARCH DEFENDER ===================== --}}
                    <div class="col-md-12">
                        <h5 class="fw-bold mb-3">Research Defender</h5>
                    </div>

                    {{-- Threat Score --}}
                    <div class="col-md-4 mb-4">
                        <div class="border rounded p-3">
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" name="rd_enabled"
                                       {{ $editdata->rd_enabled ? 'checked':'' }}>
                                <label class="form-check-label fw-bold">Enable Research Defender</label>
                            </div>

                            <label class="fw-bold">Threat Score *</label>
                            <input type="number" name="threat_score"
                                   value="{{ $editdata->threat_score }}"
                                   class="form-control" required>
                        </div>
                    </div>

                    {{-- Activity --}}
                    <div class="col-md-4 mb-4">
                        <div class="border rounded p-3">
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" name="rd_activity_enabled"
                                       {{ $editdata->rd_activity_enabled ? 'checked':'' }}>
                                <label class="form-check-label fw-bold">Enable Activity Check</label>
                            </div>

                            <label class="fw-bold">Activity Score *</label>
                            <input type="number" name="activity_score"
                                   value="{{ $editdata->activity_score }}"
                                   class="form-control" required>
                        </div>
                    </div>

                </div>

                {{-- ================= BUTTONS ================= --}}
                <div class="text-end mt-4">
                    <button class="btn btn-primary">Update</button>
                    <a href="{{ url()->previous() }}" class="btn btn-secondary">Cancel</a>
                </div>

            </div>

        </div>

         @endif
    </form>
    </div>
</section>

{{-- ========= ONLY ADDITION: CLIENT SIDE VALIDATION ========= --}}
<script>
document.getElementById('surveyForm').addEventListener('submit', function(e) {

    let valid = true;

    this.querySelectorAll('[required]').forEach(function(el){
        if(!el.value || el.value.trim() === ''){
            valid = false;
            el.classList.add('is-invalid');
        } else {
            el.classList.remove('is-invalid');
        }
    });

    if(!valid){
        e.preventDefault(); // stop refresh
        alert('Please fill all required fields');
    }
});
</script>
