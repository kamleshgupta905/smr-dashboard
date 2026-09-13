// $(function () {
//     var base_url = $("#base_url").val();

//     $(document).on("submit", "#userForm", function (e) {
//         e.preventDefault();

//         if (1) {
//             var formData = new FormData($(this)[0]);
//             var csrfToken = $('input[name="_token"]').val();
//             var mode = $("#mode").val();

//             $("#savebtn").css("display", "none");
//             $("#loaderbtn").css("display", "block");

//             var type = "POST";
//             var urlpath = base_url + "/admin/user/addeditaction";

//             $("#successmsg").text("");
//             $("#errormsg").text("");

//             $.ajax({
//                 url: urlpath,
//                 type: type,
//                 data: formData,
//                 processData: false,
//                 contentType: false,
//                 headers: {
//                     "X-CSRF-TOKEN": csrfToken,
//                 },
//                 success: function (response) {
//                     if (!$.isEmptyObject(response.errors)) {
//                         $.each(response.errors, function (key, value) {
//                             $("#" + key + "_error").text(value);
//                             $("#" + key).css("border", "1px solid red");
//                             $("#" + key)
//                                 .siblings(".select2-container")
//                                 .find(".select2-selection")
//                                 .css("border", "1px solid red");
//                         });
//                     }
//                     if (response.msg_status == 2) {
//                         $("#errormsg").text(response.msg_data);
//                     }

//                     if (response.msg_status == 1) {
//                         if (mode == "Add") {
//                             $("#userForm")[0].reset();
//                             $("#role_id").val("").change();
//                         } else {
//                             $("#successmsg").text(response.msg_data);
//                         }
//                         $("#commonModal").modal("hide");
//                         refreshData(base_url + "/admin/user");
//                     }
//                 },
//                 error: function (xhr) {
//                     console.log(xhr.responseText);
//                     var errors = xhr.responseJSON.errors;
//                     if (errors) {
//                         $.each(errors, function (field, messages) {
//                             var errorHtml = '<ul class="list-unstyled">';
//                             $.each(messages, function (index, message) {
//                                 errorHtml += "<li>" + message + "</li>";
//                             });
//                             errorHtml += "</ul>";
//                             $("#my-form")
//                                 .find('[name="' + field + '"]')
//                                 .after(errorHtml);
//                         });
//                     }
//                 },
//             });
//         }
//     });

//     $(".activeInactive").click(function () {
//         var memberId = $(this).data("id");
//         var urlpath = base_url + "/admin/close/accountclose";
//         var type = "POST";

//         $.ajax({
//             url: urlpath,
//             type: type,
//             data: {
//                 memberId: memberId,
//             },
//             headers: {
//                 "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
//             },

//             success: function (response) {
//                 $("#activeinactiveview").html(response);
//                 var dueAmount = $("#totaldueamount").val();

//                 if (dueAmount != 0) {
//                     $("#remarksDiv").css("display", "none");
//                     $("#closesavebtn").prop("disabled", true);
//                     $("#inactive_msg").text("Before close this account clear the members due amount");
//                 } else {
//                     $("#inactive_msg").text("");

//                     submitForCloseAccount(base_url);
//                 }

//                 $("#activeInactiveModal").modal("show");
//             },
//             error: function (xhr) {
//                 console.log(xhr.responseText);
//             },
//         });
//     });
// });

// function openUserloginLogoutDetailModal(userid) {
//     $("#bodyContent").html("");

//     var base_url = $("#base_url").val();
//     $.ajax({
//         type: "POST",
//         url: base_url + "/admin/user/getloginLogoutDetailByUserId",
//         datatype: "html",
//         data: {
//             userid: userid,
//         },
//         success: function (response) {
//             $("#commonModal").modal("show");
//             $("#bodyContent").html(response);
//             $("#loginLogoutTable").DataTable({
//                 order: [[0, "desc"]],
//             });

//             $("#header_title").text("User Login Details");
//         },
//         error: function (xhr) {
//             console.log(xhr.responseText);
//             var errors = xhr.responseJSON.errors;
//             if (errors) {
//                 $.each(errors, function (field, messages) {
//                     var errorHtml = '<ul class="list-unstyled">';
//                     $.each(messages, function (index, message) {
//                         errorHtml += "<li>" + message + "</li>";
//                     });
//                     errorHtml += "</ul>";
//                     $("#my-form")
//                         .find('[name="' + field + '"]')
//                         .after(errorHtml);
//                 });
//             }
//         },
//     });
// }

$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    }
});


$(function () {
    var base_url = $("#base_url").val();

    // Username availability check
    $(document).on("input", "#user_name", function () {
        var username = $(this).val();
        var urlpath = base_url + "user/checkUserName";
        $("#username").removeClass("err-border");
        $("#username_err").text("");
        $.ajax({
            type: "POST",
            url: urlpath,
            data: { username: username },
            dataType: "json",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            success: function (result) {
                if (result.msg_status == 1) {
                    $("#create_btn").hide();
                    $("#username_err").text(" ( username not available!)");
                    $("#username").focus().addClass("err-border");
                } else {
                    $("#create_btn").show();
                }
            },
            error: function (jqXHR, exception) {
                var msg = "";
                if (jqXHR.status === 0) msg = "Not connect.\n Verify Network.";
                else if (jqXHR.status == 404) msg = "Requested page not found. [404]";
                else if (jqXHR.status == 500) msg = "Internal Server Error [500].";
                else if (exception === "parsererror") msg = "Requested JSON parse failed.";
                else if (exception === "timeout") msg = "Time out error.";
                else if (exception === "abort") msg = "Ajax request aborted.";
                else msg = "Uncaught Error.\n" + jqXHR.responseText;
                alert(msg);
            },
        });
    });

    // User form submit
    $(document).on("submit", "#userForm", function (e) {
        e.preventDefault();

        if (typeof CreateUserFrmValidate === "function") {
            if (!CreateUserFrmValidate()) return false;
        }

        var formData = new FormData($(this)[0]);
        var csrfToken = $('input[name="_token"]').val();
        var mode = $("#mode").val();

        $("#savebtn").hide();
        $("#loaderbtn").show();

        $.ajax({
            url: base_url + "/admin/user/addeditaction",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
            success: function (response) {
                $("#savebtn").show();
                $("#loaderbtn").hide();

                if (response.msg_status == 1) {
                    // Show success SweetAlert
                    if (typeof Swal !== "undefined") {
                        Swal.fire({
                            icon: "success",
                            title: response.msg_data,
                            showConfirmButton: false,
                            timer: 1500,
                            position: "center",
                        });
                    } else {
                        alert(response.msg_data);
                    }

                    // Redirect after short delay
                    setTimeout(function () {
                        if (response.redirect) window.location.href = response.redirect;
                    }, 1600);

                    if (mode == "Add") {
                        $("#userForm")[0].reset();
                        $("#role_id").val("").change();
                    } else {
                        $("#successmsg").text(response.msg_data);
                    }

                    $("#commonModal").modal("hide");
                    refreshData(base_url + "/admin/user");
                } else if (response.msg_status == 0) {
                    // Validation errors
                    $.each(response.errors, function (key, val) {
                        $("#" + key + "_error").text(val[0]);
                        $("#" + key).css("border", "1px solid red");
                    });
                    if (typeof Swal !== "undefined") {
                        Swal.fire({
                            icon: "error",
                            title: "Please fix the errors.",
                            showConfirmButton: false,
                            timer: 2000,
                            position: "center",
                        });
                    } else {
                        alert("Please fix the errors.");
                    }
                } else {
                    if (typeof Swal !== "undefined") {
                        Swal.fire({
                            icon: "error",
                            title: response.msg_data,
                            showConfirmButton: false,
                            timer: 2000,
                            position: "center",
                        });
                    } else {
                        alert(response.msg_data);
                    }
                }
            },
            error: function (xhr) {
                $("#savebtn").show();
                $("#loaderbtn").hide();
                if (typeof Swal !== "undefined") {
                    Swal.fire({
                        icon: "error",
                        title: "Server error. Please try again.",
                        showConfirmButton: false,
                        timer: 2000,
                        position: "center",
                    });
                } else {
                    alert("Server error. Please try again.");
                }
                console.log(xhr.responseText);
            },
        });
    });

    // Active/Inactive click
    $(".activeInactive").click(function () {
        var memberId = $(this).data("id");
        var urlpath = base_url + "/admin/close/accountclose";

        $.ajax({
            url: urlpath,
            type: "POST",
            data: { memberId: memberId },
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (response) {
                $("#activeinactiveview").html(response);
                var dueAmount = $("#totaldueamount").val();

                if (dueAmount != 0) {
                    $("#remarksDiv").hide();
                    $("#closesavebtn").prop("disabled", true);
                    $("#inactive_msg").text(
                        "Before close this account clear the members due amount"
                    );
                } else {
                    $("#inactive_msg").text("");
                    submitForCloseAccount(base_url);
                }

                $("#activeInactiveModal").modal("show");
            },
            error: function (xhr) {
                console.log(xhr.responseText);
            },
        });
    });
});

// Open login/logout modal
function openUserloginLogoutDetailModal(userid) {
    $("#bodyContent").html("");
    var base_url = $("#base_url").val();
    $.ajax({
        type: "POST",
        url: base_url + "/admin/user/getloginLogoutDetailByUserId",
        datatype: "html",
        data: { userid: userid },
        success: function (response) {
            $("#commonModal").modal("show");
            $("#bodyContent").html(response);
            $("#loginLogoutTable").DataTable({
                order: [[0, "desc"]],
            });
            $("#header_title").text("User Login Details");
        },
        error: function (xhr) {
            console.log(xhr.responseText);
            var errors = xhr.responseJSON?.errors;
            if (errors) {
                $.each(errors, function (field, messages) {
                    var errorHtml = '<ul class="list-unstyled">';
                    $.each(messages, function (index, message) {
                        errorHtml += "<li>" + message + "</li>";
                    });
                    errorHtml += "</ul>";
                    $("#my-form")
                        .find('[name="' + field + '"]')
                        .after(errorHtml);
                });
            }
        },
    });
}
// $(document).ready(function() {
//     $(document).on('click', '.deleteUserBtn', function() {
//         var userId = $(this).data('id');
//         var base_url = $("#base_url").val(); // now this is guaranteed to exist
//         var deleteUrl = base_url + '/admin/user/delete/' + userId;

//         console.log('Delete URL:', deleteUrl); // check this in console
//         alert(deleteUrl);
//         Swal.fire({
//             title: 'Are you sure?',
//             text: "Do you really want to delete this user?",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#d33',
//             cancelButtonColor: '#3085d6',
//             confirmButtonText: 'Yes, delete it!',
//             cancelButtonText: 'Cancel'
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 $.ajax({
//                     url: deleteUrl,
//                     type: 'POST',
//                     headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') },
//                     success: function(response) {
//                         console.log('AJAX Response:', response);
//                         if(response.msg_status == 1){
//                             Swal.fire({
//                                 icon:'success',
//                                 title: response.msg_data,
//                                 showConfirmButton:false,
//                                 timer:1500
//                             });
//                             setTimeout(function(){ location.reload(); }, 1600);
//                         } else {
//                             Swal.fire({
//                                 icon:'error',
//                                 title: response.msg_data,
//                                 showConfirmButton:true
//                             });
//                         }
//                     },
//                     error: function(xhr, status, error) {
//                         console.log('AJAX Error:', xhr.responseText);
//                         Swal.fire({
//                             icon:'error',
//                             title:'Server error. Please try again.',
//                             showConfirmButton:true
//                         });
//                     }
//                 });
//             }
//         });
//     });
// });

$(document).on('click', '.deleteUserBtn', function () {

    let userId = $(this).data('id');
    console.log("Deleting user ID:", userId);

    if (!userId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'User ID not found!'
        });
        return;
    }

    Swal.fire({
        title: "Are you sure?",
        text: "This user will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "No, cancel!",
    }).then((result) => {
        if (result.isConfirmed) {

            $.ajax({
                url: '/admin/user/delete/' + userId,
                type: 'POST',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (resp) {
                    console.log("Response:", resp);

                    if (resp.msg_status === 1) {

                        Swal.fire({
                            icon: "success",
                            title: "Deleted!",
                            text: resp.msg_data,
                            timer: 1500,
                            showConfirmButton: false
                        });

                        setTimeout(() => {
                            location.reload(); // ✅ Page Refresh after Delete
                        }, 1600);

                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Oops!",
                            text: resp.msg_data
                        });
                    }
                },
                error: function (err) {
                    console.log("Ajax Error:", err);
                    Swal.fire("Error", "Something went wrong!", "error");
                }
            });

        }
    });

});

