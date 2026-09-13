$(document).ready(function () {

    function loadBids() {

        // Destroy existing DataTable before replacing HTML
        if ($.fn.DataTable.isDataTable('#bidsTable')) {
            $('#bidsTable').DataTable().destroy();
        }

        $.ajax({
            url: "/admin/bid/search",
            method: "GET",
            data: {
                keyword: $("#search_keyword").val(),
                user: $("#search_user").val(),
                client: $("#search_client").val(),
                status: $("#search_status").val()
            },
            success: function (res) {

                // Replace table HTML
                $("#bids_table_wrapper").html(res.html);

                // Re-initialize DataTable AFTER html update
                $('#bidsTable').DataTable({
                    paging: true,
                    pageLength: 10,
                    lengthChange: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    autoWidth: false,
                    responsive: true
                });
            }
        });
    }

    // Search button click
    $("#btn_search").on("click", function () {
        loadBids();
    });

    // Enter key search
    $("#search_keyword").on("keyup", function (e) {
        if (e.keyCode === 13) {
            loadBids();
        }
    });

    // Clear filters
    $("#btn_clear").on("click", function () {

        $("#search_keyword").val('');
        $("#search_user").val('').trigger('change');
        $("#search_client").val('').trigger('change');
        $("#search_status").val('');

        loadBids();
    });

});
