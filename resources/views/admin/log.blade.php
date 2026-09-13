<div class="formblock-box">
    <div class="table-responsive">
        <table class="table customTbl table-bordered table-hover dataTable dataContainer">
            <thead>
                <tr>
                    <th>Sl No</th>
                    <th>Log Date</th>
                    <th>User</th>
                    <th class="text-center">Action</th>
                    @foreach ($tableCol as $colKey => $colValue)
                        <th>{{ $colValue }}</th>
                    @endforeach
                </tr>
            </thead>
            @foreach ($logData as $key => $value)
                <tbody>
                    @php 
                        $dataArray = json_decode($value->data_array);
                    @endphp
                    <td>{{ $key + 1 }}</td>
                    <td>{{ date("d-m-Y h:i A", strtotime($value->log_date)) }}</td>
                    <td>{{ $value->user->name }}</td>
                    <td>{{ $value->action }}</td>
                    @foreach ($tableCol as $colKey => $colValue)
                        <td>{{ $dataArray->$colValue ?? "" }}</td>
                    @endforeach
                </tbody>
            @endforeach
        </table>
    </div>
</div>