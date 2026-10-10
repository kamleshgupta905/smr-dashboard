$(function () {
    var base_url = $("#base_url").val();

    $(".client-status").click(function (e) {
        e.preventDefault();
        var id = $(this).data("id");
        var icon = $(this).find("i");
        var urlpath = base_url + "/admin/client/status";
        var csrfToken = $('meta[name="csrf-token"]').attr("content");

        $.ajax({
            type: "POST",
            url: urlpath,
            data: { id: id },
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
            success: function (response) {
                if (response.status === "Y") {
                    icon.removeClass("fa-times-circle")
                        .addClass("fa-check-circle")
                        .css("color", "green");
                } else {
                    icon.removeClass("fa-check-circle")
                        .addClass("fa-times-circle")
                        .css("color", "red");
                }
                showToast('success', response.message)
            },
            error: function (xhr, status, error) {
                console.error("Error updating question status:", error);
            },
        });
    });

    $(document).on("submit", "#clientForm", function (e) {
        e.preventDefault();

        var formData = new FormData($(this)[0]);
        var csrfToken = $('meta[name="csrf-token"]').attr("content");
        var mode = $("#mode").val();

        var type = "POST";
        var urlpath = base_url + "/admin/clientaddeditajax";

        $("#successmsg").text("");
        $("#errormsg").text("");

        enableButton(true);
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
                }

                if (response.msg_status == 1) {
                    if (mode == "Add") {
                        $("#clientForm")[0].reset();
                        showToast("success", "Data successfully inserted.");
                        enableButton(false, mode);
                        setTimeout(function () {
                            window.location.href = `${base_url}/admin/client/view/${response.data}`;
                        }, 1000);
                    } else {
                        showToast("success", "Data successfully updated.");
                    }
                }
                enableButton(false, mode);
            },
            error: function (xhr) {
                console.log(xhr.responseText);
            },
        });
    });
});
