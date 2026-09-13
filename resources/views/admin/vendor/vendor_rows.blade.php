@foreach ($vendors as $key => $vendor)
<tr>
    <td>{{ $key + 1 }}</td>

    <td><strong>{{ $vendor->vendor_id }}</strong></td>

    <td>{{ $vendor->name }}</td>

    <td>{{ $vendor->email }}</td>

    <td>{{ $vendor->clicks_count }}</td>

    <td>{{ $vendor->complete_count }}</td>

    <td>{{ $vendor->terminates_count }}</td>

    <td style="text-align: center;">
        @if ($vendor->is_active == 'Y')
            <span class="vendor-status" data-id="{{ $vendor->id }}">
                <i class="fas fa-check-circle"
                   style="font-size: 16px; cursor:pointer; color:green;"></i>
            </span>
        @else
            <span class="vendor-status" data-id="{{ $vendor->id }}">
                <i class="fa fa-times-circle"
                   style="font-size: 16px; cursor:pointer; color:red;"></i>
            </span>
        @endif
    </td>

    <td>
        <table>
            <tr>
                <td>
                    <x-edit-button-component 
                        title='<i class="fas fa-edit"></i>'
                        url="{{ url('admin/vendor/addedit') }}/{{ $vendor->id }}" />
                </td>

                <td>
                    <x-edit-button-component 
                        title='<i class="fas fa-eye"></i>'
                        url="{{ url('admin/vendor/view') }}/{{ $vendor->id }}" />
                </td>
                 <td>
                    <button class="btn btn-sm btn-danger delete-vendor"
                            data-id="{{ $vendor->id }}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        </table>
    </td>
</tr>
@endforeach


@if(count($vendors) == 0)
<tr>
    <td colspan="9" class="text-center text-muted">No records found</td>
</tr>
@endif
