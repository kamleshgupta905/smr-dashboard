$(function () {
    var base_url = $("#base_url").val();

    $(".dataTable").DataTable({
        dom: "Bfrtip",
        buttons: ["excelHtml5", "pdfHtml5"],
    });

    $(".status-button").on("click", function () {
        const paymentId = $(this).data("payment-id");
        const actionType = $(this).hasClass("rejected") ? "Rejected" : "Paid";

        $("#paymentId").val(paymentId);
        $("#actionType").val(actionType);
        $("#remarksModal").modal("show");
    });

    $("#remarksModal").on("hidden.bs.modal", function () {
        $(this).find("form")[0].reset();
        $("#paymentId").val("");
        $("#actionType").val("");
    });

    $(document).on("submit", "#remarksForm", function (e) {
        e.preventDefault();

        var formData = new FormData($(this)[0]);
        var csrfToken = $('meta[name="csrf-token"]').attr("content");

        var type = "POST";
        var urlpath = base_url + "/admin/paymentstatusajax";

        $("#remarksbtn").prop("disabled", true);
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
                if (response.status) {
                    setTimeout(function () {
                        window.location.href = `${base_url}/admin/payments`;
                    }, 1000);

                    showToast("success", "Payment status successfully updated.");
                } else {
                    showToast("error", "Failed to update payment status. Please try again.");
                }
            },
            error: function (xhr) {
                console.log(xhr.responseText);
            },
        });
    });
});
