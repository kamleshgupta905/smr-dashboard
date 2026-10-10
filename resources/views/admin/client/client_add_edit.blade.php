@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif

<section class="layout-box-content-format1">
    <div class="row">
        <div class="col-md-1"></div>
        <div class="col-md-10">
            <div class="card card-primary list-view">
                <div class="card-header box-shdw">
                    <h3 class="card-title">Client</h3>
                    <x-button-component title='<i class="fas fa-list"></i> List' url="{{ url('admin/') }}/client" />
                    @if ($mode == 'Edit')
                        <x-button-component title='<i class="fas fa-history"></i> LOG' mclass="openModal" mtitle="LOG"
                            mhref="{{ url('admin/log/client/') }}/{{ $editData ? $editData->id : '' }}" />
                    @endif

                </div>
                <form name="clientForm" id="clientForm" enctype="multipart/form-data">
                    <div class="card-body">
                        <div class="formblock-box">
                            @csrf
                            <input type="hidden" name="mode" id="mode" value="{{ $mode }}" />
                            <input type="hidden" name="id" id="id"
                                value="{{ $editData ? $editData->id : '' }}" />

                            <div class="row p-2">
                                <div class="col-md-12">
                                    <div class="form-group mb-3">
                                        <label for="" class="form-label">Client name</label>
                                        <input class="form-control" type="text" id="client_name" name="client_name"
                                            placeholder="Enter Client Name"
                                            value="{{ $editData ? $editData->client_name : '' }}" />
                                        <div id="client_name_error" class="invalid-feedback d-block error-text"></div>
                                    </div>
                                </div>

                                <div class="col-md-12">
                                    <div class="form-group mb-3">
                                        <label for="" class="form-label ckEditor">Description</label>
                                        <textarea class="form-control" id="description" name="description">{{ $editData ? $editData->description : '' }}</textarea>
                                        <div id="description_error" class="invalid-feedback d-block error-text"></div>
                                    </div>
                                </div>

                                <div class="col-md-10" id="btnDiv1"></div>
                                <div class="col-md-2 mt-2 " id="btnDiv2">
                                    <div class="form-group mt-4 ">
                                        <button type="submit" style="width: 135px; margin: 0px -28px;" class="btn btn-sm action-button"
                                            id="savebtn">{{ $btntext }}</button>
                                    </div>
                                </div>

                                <span id="sussess_msg" style="padding: 5px;color: #0b6c0b;font-weight: bold;"></span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</section>

<script src="{{ asset('assets/admin/') }}/js/client.js"></script>
<script>
    CKEDITOR.replace('description');
</script>
