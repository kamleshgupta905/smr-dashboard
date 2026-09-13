@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif

<section class="layout-box-content-format1" style="width="auto !important;">
    <div class="row">
        <div class="col-md-12">
            <div class="card card-primary list-view" style="max-width:1200px; margin:auto;">
                <div class="card-header box-shdw">
                    <h3 class="card-title">Team </h3>
                    <x-button-component title='<i class="fas fa-list"></i> List' url="{{ url('admin/team/list') }}" />
                   
                </div>

                <form name="clientForm" id="clientForm" enctype="multipart/form-data">
                    @csrf
                   
                   

                    <div class="card-body">

                        {{-- Client Information --}}
                        <div class="formblock-box mb-3">
                            <h5 class="mb-3"> Team Info</h5>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label"> Name*</label>
                                    <input type="text" class="form-control" name="name"
                                        placeholder="Enter Member Name"
                                       >
                                    <div class="invalid-feedback d-block error-text" id="client_name_error"></div>
                                </div>
                            </di>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</section>