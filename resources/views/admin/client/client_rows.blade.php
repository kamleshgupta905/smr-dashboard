@foreach ($clients as $key => $client)
<tr>
    <td>{{ $key + 1 }}</td>

    <td>{{ $client->client_name }}</td>

    <td style="text-align: center;">
        @if ($client->is_active == 'Y')
            <span class="client-status" data-id="{{ $client->id }}">
                <i class="fas fa-check-circle"
                   style="font-size: 16px; cursor:pointer; color:green;"></i>
            </span>
        @else
            <span class="client-status" data-id="{{ $client->id }}">
                <i class="fa fa-times-circle"
                   style="font-size: 16px; cursor:pointer; color:red;"></i>
            </span>
        @endif
    </td>

    <td>{{ $client->country }}</td>

    <td>
        <table>
            <tr>
                <td>
                    <x-edit-button-component
                        title='<i class="fas fa-edit"></i>'
                        url="{{ url('admin/client/addedit') }}/{{ $client->id }}" />
                </td>

                <td>
                    <x-edit-button-component
                        title='<i class="fas fa-eye"></i>'
                        url="{{ url('admin/client/view/') }}/{{ $client->id }}" />
                </td>

                <td>
                    <a href="javascript:void(0);" class="btn deleteClientBtn"
                       data-url="{{ url('admin/client/delete/') }}/{{ $client->id }}">
                        <i class="fas fa-trash mb-2"></i>
                    </a>
                </td>
            </tr>
        </table>
    </td>

</tr>
@endforeach

@if(count($clients) == 0)
<tr>
    <td colspan="5" class="text-center text-muted">No records found</td>
</tr>
@endif
