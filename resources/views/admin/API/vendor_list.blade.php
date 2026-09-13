<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<button id="downloadExcel" class="btn btn-primary">Download Excel</button>

<table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped"
    style="border-radius: 2px;">
    <thead>
        <tr>
            <th>VID</th>
            <th>Name</th>
            <th>Email</th>
            <th>CPI</th>
            <th>Limit</th>
            <th>Status</th>
            <th>Clicks</th>
            <th>Complete</th>
            <th>Terminates</th>
            <th>Entry Links</th>
        </tr>
    </thead>

    <tbody>
        @forelse ($assignedVendorList as $List)

            @php

                /*
                |--------------------------------------------------------------------------
                | SAFE VENDOR ID
                |--------------------------------------------------------------------------
                */

                $vendorDbId = $List->id ?? $List->vendor_id ?? null;

                /*
                |--------------------------------------------------------------------------
                | API PROJECT + NON API PROJECT SUPPORT
                |--------------------------------------------------------------------------
                */

                $links = collect();
                $cpi = 0;
                $limit = 0;
                $status = 'Live';
                $projectName = '';
                $projectId = null;

                if (!empty($api)) {

                    /*
                    |--------------------------------------------------------------------------
                    | API PROJECT CASE
                    |--------------------------------------------------------------------------
                    */

                    $projectId = $projectsData['SurveyId'] ?? null;
                    $projectName = $projectsData['Name'] ?? '';

                    $cpi = $projectsData['CPI'] ?? 0;
                    $limit = $projectsData['TotalCompleteRequired'] ?? 0;
                    $status = (($projectsData['SurveyStatus'] ?? 0) == 1)
                        ? 'Live'
                        : 'Paused';

                    if (!empty($vendorDbId) && !empty($projectId)) {
                        $links = DB::table('vendor_entry_links')
                            ->where('vendor_id', $vendorDbId)
                            ->where('project_id', $projectId)
                            ->select(
                                'entry_link',
                                'live_url',
                                'test_url',
                                DB::raw('NULL as bid_option_id'),
                                DB::raw('"API Project" as country')
                            )
                            ->get();
                    }

                } else {

                    /*
                    |--------------------------------------------------------------------------
                    | NON API PROJECT CASE
                    |--------------------------------------------------------------------------
                    */

                    $projectId = $projectsData->id ?? null;
                    $projectName = $projectsData->name ?? '';

                    $cpi = $projectsData->cost_per_complete ?? 0;
                    $limit = $projectsData->max_limit ?? 0;
                    $status = $projectsData->status ?? 'Live';

                    if (!empty($vendorDbId) && !empty($projectId)) {
                        $links = DB::table('vendor_entry_links as vel')
                            ->leftJoin('bid_options as bo', 'bo.id', '=', 'vel.bid_option_id')
                            ->leftJoin('countries as c', 'c.id', '=', 'bo.country')
                            ->where('vel.vendor_id', $vendorDbId)
                            ->where('vel.project_id', $projectId)
                            ->select(
                                'vel.entry_link',
                                'vel.live_url',
                                'vel.test_url',
                                'vel.bid_option_id',
                                'c.name as country'
                            )
                            ->get();
                    }
                }

            @endphp

            <tr>
                <td>
                    @if(!empty($vendorDbId))
                        <a href="{{ url('/') }}/admin/vendor/view/{{ $vendorDbId }}" target="_blank">
                            <strong>{{ $List->vendor_id ?? '-' }}</strong>
                        </a>
                    @else
                        <strong>{{ $List->vendor_id ?? '-' }}</strong>
                    @endif
                </td>

                <td>{{ $List->name ?? '-' }}</td>

                <td>
                    @if(!empty($List->email))
                        <a href="mailto:{{ $List->email }}">
                            {{ $List->email }}
                        </a>
                    @else
                        -
                    @endif
                </td>

                <td>{{ $cpi }}</td>
                <td>{{ $limit }}</td>

                <td>
                    <span class="{{ strtolower($status) }}-status">
                        {{ $status }}
                    </span>
                </td>

                <td>{{ $List->clicks_count ?? 0 }}</td>
                <td>{{ $List->complete_count ?? 0 }}</td>
                <td>{{ $List->terminates_count ?? 0 }}</td>

                <td>
                    <span class="entryLinkModel"
                        data-links='@json($links)'
                        data-email="{{ $List->email ?? '' }}"
                        data-vendor_id="{{ $List->vendor_id ?? '' }}"
                        style="cursor:pointer; color:#142df8;">

                        <i class="fa fa-link"></i> View Links
                    </span>
                </td>
            </tr>

        @empty
            <tr>
                <td colspan="10" class="text-center">
                    No assigned vendors found
                </td>
            </tr>
        @endforelse
    </tbody>
</table>


<!-- ENTRY LINK MODAL -->

<div id="entrylinkmodel" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="border-radius:15px;">
            <div class="modal-body">

                <h3 id="vendor_id_model"
                    style="font-size:1.1rem; font-weight:bold;">
                </h3>

                <p style="font-size:0.9rem;">
                    {{ !empty($api)
                        ? ($projectsData['Name'] ?? '')
                        : ($projectsData->name ?? '') }}
                    project for
                    <span id="email_model"></span>
                </p>

                <div id="entry_link_model"></div>

            </div>
        </div>
    </div>
</div>


<script>
$(document).ready(function () {

    /*
    |--------------------------------------------------------------------------
    | RESET MODAL
    |--------------------------------------------------------------------------
    */

    $('#entrylinkmodel').on('hidden.bs.modal', function () {
        $("#vendor_id_model").empty();
        $("#email_model").empty();
        $("#entry_link_model").empty();
    });


    /*
    |--------------------------------------------------------------------------
    | OPEN ENTRY LINK MODAL
    |--------------------------------------------------------------------------
    */

    $(".entryLinkModel").click(function () {

        let links = $(this).data("links");
        let email = $(this).data("email");
        let vendor_id = $(this).data("vendor_id");

        $("#vendor_id_model").text(
            "Entry Links for Vendor " + vendor_id
        );

        $("#email_model").text(email);

        let html = "";

        if (!links || links.length === 0) {

            html = "<p>No entry links found.</p>";

        } else {

            links.forEach(function (link) {

                let finalUrl = "{{ url('/') }}/" + (link.entry_link ?? '');

                html += `
                    <div style="
                        border:1px solid #ddd;
                        padding:12px;
                        border-radius:8px;
                        margin-bottom:12px;
                    ">

                        ${
                            link.bid_option_id
                                ? `<strong>Bid Option ID:</strong> ${link.bid_option_id}<br>`
                                : ``
                        }

                        <strong>Country:</strong>
                        ${link.country ?? 'All'}
                        <br><br>

                        <div>
                            🔴 <strong>Entry URL</strong><br>

                            <a href="${finalUrl}" target="_blank">
                                ${finalUrl}
                            </a>

                            <i class="fas fa-copy"
                                style="cursor:pointer; margin-left:8px;"
                                onclick="navigator.clipboard.writeText('${finalUrl}')">
                            </i>
                        </div>

                    </div>
                `;
            });
        }

        $("#entry_link_model").html(html);
        $("#entrylinkmodel").modal("show");
    });


    /*
    |--------------------------------------------------------------------------
    | EXCEL EXPORT
    |--------------------------------------------------------------------------
    */

    $("#downloadExcel").click(function () {

        let table = document.querySelector("table");

        let workbook = XLSX.utils.table_to_book(table, {
            sheet: "Vendors"
        });

        XLSX.writeFile(
            workbook,
            "vendor_list.xlsx"
        );
    });

});
</script>