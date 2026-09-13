@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif
<section class="layout-box-content-format1">
    <div class="card card-primary list-view">
        <div class="card-header box-shdw">
            <h3 class="card-title">Team List</h3>
            <x-button-component title='<i class="fas fa-plus"></i> Add' url="{{ url('admin/') }}/team/add" />
        </div>
        <div class="card-body">
            <div class="formblock-box">
                @if(session('success'))
    <div class="alert alert-success">
        {{ session('success') }}
    </div>
@endif

@if(session('error'))
    <div class="alert alert-danger">
        {{ session('error') }}
    </div>
@endif

                <div class="table-responsive">
                   
                    <table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped">
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th> name</th>
                                <th class="text-center">Status</th>
                               
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                           
                               
                           
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</section>

