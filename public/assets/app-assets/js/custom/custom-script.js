/*================================================================================
	Item Name: Materialize - Material Design Admin Template
	Version: 5.0
	Author: PIXINVENT
	Author URL: https://themeforest.net/user/pixinvent/portfolio
================================================================================

NOTE:
------
PLACE HERE YOUR OWN JS CODES AND IF NEEDED.
WE WILL RELEASE FUTURE UPDATES SO IN ORDER TO NOT OVERWRITE YOUR CUSTOM SCRIPT IT'S BETTER LIKE THIS. */

var base_url = $("#base_url").val();
var urlpath = base_url + "/reload-captach";
var csrfToken = $('meta[name="csrf-token"]').attr("content");
$("#reload").click(function () {
    $.ajax({
        type: "POST",
        url: urlpath,
        headers: {
            "X-CSRF-TOKEN": csrfToken,
        },
        success: function (data) {
            $("#captcha").val(data.operand1 + " + " + data.operand2);
        },
    });
});

$(document).ready(function () {
    $(".dataTable").DataTable();

    var page_heading = $("#page_heading").val();
    $("#span_page_title").html(page_heading);
}); /* end of document ready  */
