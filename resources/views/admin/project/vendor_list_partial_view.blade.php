@php
    $isApiProject = $isApiProject ?? false;
@endphp
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<button id="downloadExcel" class="btn btn-primary">Download Excel</button>

<table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped"
    style="border-radius: 2px;">
    <thead>
        <tr>
            <th>VID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Commission</th>
            <th>Limit</th>
            <th>Status</th>
            <th>Clicks</th>
            <th>Complete</th>
            <th>Terminates</th>
            <th>Entry Links</th>
        </tr>
    </thead>

    <tbody>
        @foreach ($assignedVendorList as $List)
          @if(!$isApiProject)

<?php

$links = collect();
if ($projectsData && isset($projectsData->id)) {
    $linksQuery = DB::table('vendor_entry_links as vel')
        ->where('vel.vendor_id', $List->id)
        ->where('vel.project_id', $projectsData->id);

    if (\Illuminate\Support\Facades\Schema::hasTable('bid_options')) {
        $linksQuery->leftJoin('bid_options as bo', 'bo.id', '=', 'vel.bid_option_id');
        if (\Illuminate\Support\Facades\Schema::hasTable('countries')) {
            $linksQuery->leftJoin('countries as c', 'c.id', '=', 'bo.country');
        }
    }

    $links = $linksQuery->select(
        'vel.entry_link',
        'vel.live_url',
        'vel.test_url',
        'vel.bid_option_id',
        DB::raw('NULL as country')
    )->get();
}

?>

@else

<?php

$surveyIdVal = $projectsData->SurveyId ?? $projectsData->id ?? 0;
$links = DB::table('vendor_entry_links')
    ->where('vendor_id', $List->id)
    ->where('project_id', $surveyIdVal)
    ->select(
        'entry_link',
        'live_url',
        'test_url',
        DB::raw('NULL as bid_option_id'),
        DB::raw('"API Project" as country')
    )
    ->get();

?>

@endif

            <tr>
                <td>
                    <a href="{{ url('/') }}/admin/vendor/view/{{ $List->id }}" target="_blank">
                        <strong>{{ $List->vendor_id }}</strong>
                    </a>
                </td>

                <td>{{ $List->name }}</td>
                <td><a href="mailto:{{ $List->email }}">{{ $List->email }}</a></td>

                <td>
                    {{ $List->commission_type === 'flat_rate'? ($List->per_complete ?? 0): ($List->cpi_percentage ?? 0) . '%' }}
                </td>
                <td>
                    {{ $isApiProject ? ($projectsData->TotalCompleteRequired ?? 0) : ($projectsData->max_limit ?? 0) }}
                </td>

               <td>
                    @php
                        $status = $projectsData->status ?? 'Live';
                    @endphp

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
                        data-email="{{ $List->email }}"
                        data-vendor_id="{{ $List->vendor_id }}"
                        style="cursor:pointer; color:#142df8;">
                        <i class="fa fa-link"></i> View Links
                    </span>
                </td>
            </tr>
        @endforeach
    </tbody>
</table>
<input type="hidden"id="is_api_survey" value="{{ $isApiProject ? 1 : 0 }}">
<!-- Entry Link Modal -->
<div id="entrylinkmodel" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="border-radius:15px;">
            <div class="modal-body">
                <h3 id="vendor_id_model" style="font-size:1.1rem; font-weight:bold;"></h3>
                <p style="font-size:0.9rem;">
                    {{ $isApiProject ? ($projectsData->Name ?? '') : ($projectsData->name ?? '') }}
                    project for <span id="email_model"></span>
                </p>

                <div id="entry_link_model"></div>
            </div>
        </div>
    </div>
</div>

<script>
$(document).ready(function () {

    // Reset modal
    $('#entrylinkmodel').on('hidden.bs.modal', function() {
        $("#vendor_id_model").empty();
        $("#email_model").empty();
        $("#entry_link_model").empty();
    });

    // Open modal
    $(".entryLinkModel").click(function () {

        let links     = $(this).data("links");
        let email     = $(this).data("email");
        let vendor_id = $(this).data("vendor_id");

        $("#vendor_id_model").text("Entry Links for Vendor " + vendor_id);
        $("#email_model").text(email);

        let html = "";

        if (!links || links.length === 0) {
            html = "<p>No entry links found.</p>";
        } else {

           links.forEach(function(link) {

    let liveUrl, testUrl;

                @if($isApiProject)

                    // API Project
                    liveUrl = link.live_url;
                    testUrl = link.test_url;
                   entry_link = link.entry_link + (link.entry_link.includes('?') ? '&api=1' : '?api=1');

                @else

                    // Normal Project
                    liveUrl = "{{ url('/') }}/" + link.entry_link;
                    testUrl = "{{ url('/') }}/" + link.entry_link;

                @endif

                html += `
                    <div style="border:1px solid #ddd;padding:12px;border-radius:8px;margin-bottom:12px;">

                        ${link.bid_option_id ? `<strong>Bid Option ID:</strong> ${link.bid_option_id}<br>` : ''}

                        <strong>Country:</strong> ${link.country ?? 'All'}
                        <br><br>

                        <div>
                            🔴 <strong>Live URL</strong><br>

                            <a href="{{ url('/') }}/${entry_link}" target="_blank" style="font-size: 1rem;" class="redirect-url">{{ url('/') }}/${entry_link}</a> <i class="fas fa-copy copy-icon"></i>
                           
                        </div>

                        @if(!$isApiProject)
                        <div style="margin-top:8px;">
                            🧪 <strong>Test URL</strong><br>

                            <a href="${testUrl}" target="_blank">
                                ${testUrl}
                            </a>

                            <i class="fas fa-copy"
                                style="cursor:pointer;margin-left:8px;"
                                onclick="navigator.clipboard.writeText('${testUrl}')">
                            </i>
                        </div>
                        @endif

                    </div>
                `;
            });
        }

        $("#entry_link_model").html(html);
        $("#entrylinkmodel").modal('show');
    });

});
</script>

<script>
// Excel Export
$(document).ready(function () {
    $("#downloadExcel").click(function () {
        let table = document.querySelector("table");
        let workbook = XLSX.utils.table_to_book(table, { sheet: "Vendors" });
        XLSX.writeFile(workbook, "vendor_list.xlsx");
    });
});
</script>
