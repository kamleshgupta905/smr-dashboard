@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif
<section class="layout-box-content-format1">
    <div class="card card-primary list-view">
        <div class="card-header box-shdw">
            <h3 class="card-title">Projects List</h3>
            <x-button-component title='<i class="fas fa-plus"></i> Add' url="{{ url('admin/') }}/project/addedit" />
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
                                <th>Project Name</th>
                                <th>Client</th>
                                <th>PID</th>
                                <th class="text-center">Status</th>
                                <th>CPI</th>
                                <th>IR</th>
                                <th>LOI</th>
                                <th>Completes</th>
                                <th>Terminates</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($projectsList as $key => $project)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>{{ $project->name }}</td>
                                    <td>{{ $project->client_name }}</td>
                                    <td>{{ $project->project_id }}</td>
                                    <td><span class="{{ $project->status }}-status">{{ $project->status }}</span></td>
                                    <td>{{ $project->cost_per_complete }}</td>
                                    <td>{{ $project->ir ?? 0 }}</td>
                                    <td>{{ $project->loi }}</td>
                                    <td>{{ $project->complete_count ?? 0 }}</td>
                                    <td>{{ $project->terminates_count ?? 0 }}</td>
                                    <td>
                                        <table>
                                            <tr>
                                                <td>
                                                    <x-edit-button-component title='<i class="fas fa-edit"></i>'
                                                        url="{{ url('admin/project/addedit') }}/{{ $project->id }}" />
                                                </td>
                                                <td>
                                                    <x-edit-button-component title='<i class="fas fa-eye"></i>'
                                                        url="{{ url('admin/project/view/') }}/{{ $project->id }}" />
                                                </td>
                                                 <td>
                                                 
 <a href="{{ url('admin/project/delete/') }}/{{ $project->id }}" class="btn " 
    onclick="return confirm('Are you sure you want to delete this client?')">
        ❌ </a>

                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</section>