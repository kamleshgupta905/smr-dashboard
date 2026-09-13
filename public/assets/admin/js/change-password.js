// Author Suman
$(function () {
    var base_url = $("#base_url").val() + "/admin";

    $(document).on("submit", "#passwordForm", function (e) {
        e.preventDefault();

        var formData = new FormData($(this)[0]);
        var csrfToken = $('input[name="_token"]').val();
        var csrfToken = $('meta[name="csrf-token"]').attr("content");

        // $("#savebtn").css('display', 'none');
        $("#savebtn").html("Processing...");
        $("#loaderbtn").css("display", "block");

        var type = "POST"; //for creating new resource
        var urlpath = base_url + "/user/change_password";

        $("#successmsg").text("");
        $("#errormsg").text("");

        $.ajax({
            url: urlpath,
            type: type,
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
            success: function (response) {
                if (!$.isEmptyObject(response.errors)) {
                    $.each(response.errors, function (key, value) {
                        $("#" + key + "_error").text(value);
                        $("#" + key).css("border", "1px solid red");
                        $("#" + key)
                            .siblings(".select2-container")
                            .find(".select2-selection")
                            .css("border", "1px solid red");
                    });

                    $("#errormsg").text(response.msg_data);
                    $("#savebtn").html("Update");
                } else if (response.msg_status == 2) {
                    $("#errormsg").text(response.msg_data);
                } else if (response.msg_status == 1) {
                    window.location.href = base_url + "/logout";
                }
            },
            error: function (xhr) {
                console.log(xhr.responseText);
            },
        });
    });
});
