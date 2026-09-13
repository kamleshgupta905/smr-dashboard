$(document).ready(function () {
	var basepath = $("#basepath").val();
	var Toast = Swal.mixin({
		toast: true,

		position: "top-end",

		showConfirmButton: false,

		timer: 3000,
	});

	$(document).on("input", "#user_name", function () {
		var username = $(this).val();
		var urlpath = basepath + "user/checkUserName";
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
					//location.reload();
				} else {
					$("#create_btn").show();
				}
			},
			error: function (jqXHR, exception) {
				var msg = "";
				if (jqXHR.status === 0) {
					msg = "Not connect.\n Verify Network.";
				} else if (jqXHR.status == 404) {
					msg = "Requested page not found. [404]";
				} else if (jqXHR.status == 500) {
					msg = "Internal Server Error [500].";
				} else if (exception === "parsererror") {
					msg = "Requested JSON parse failed.";
				} else if (exception === "timeout") {
					msg = "Time out error.";
				} else if (exception === "abort") {
					msg = "Ajax request aborted.";
				} else {
					msg = "Uncaught Error.\n" + jqXHR.responseText;
				}
				alert(msg);
			},
		}); /*end ajax call*/
	});

}); // end of document ready

function CreateUserFrmValidate() {
	var Toast = Swal.mixin({
		toast: true,

		position: "top-end",

		showConfirmButton: false,

		timer: 3000,
	});

	$(".err-border").removeClass("err-border");

	if ($("#name").val() == "") {
		$("#name").focus().addClass("err-border");

		Toast.fire({
			type: "error",

			title: "Enter name",
		});

		return false;
	}

	if ($("#user_name").val() == "") {
		$("#user_name").focus().addClass("err-border");

		Toast.fire({
			type: "error",

			title: "Enter username",
		});

		return false;
	}

	if ($("#user_name").val() != "") {
		var email = $("#user_name").val();
		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		if (!emailReg.test(email)) {
			$("#user_name").focus().addClass("err-border");
			Toast.fire({
				type: "error",
				title: "Enter a valid email",
			});
			return false;
		}
	}

	if ($("#access_permission").val() == "") {
		$("#access_permissionerr").focus().addClass("err-border");
		Toast.fire({
			type: "error",

			title: "Select a access permission",
		});

		return false;
	}

	if ($("#user_role_id option:selected").val() == 0) {
		Toast.fire({
			type: "error",

			title: "Select a role",
		});

		return false;
	}

	if ($("#sel_chapter").val() == "") {
		Toast.fire({
			type: "error",

			title: "Select a chapter",
		});

		return false;
	}

	var password = $("#password").val();

	var cpassword = $("#cpassword").val();

	if (password == "") {
		$("#password").focus().addClass("err-border");

		Toast.fire({
			type: "error",

			title: "Enter password",
		});

		return false;
	}

	if (cpassword == "") {
		$("#cpassword").focus().addClass("err-border");

		Toast.fire({
			type: "error",

			title: "Confirm password",
		});

		return false;
	}

	if (password != cpassword) {
		Toast.fire({
			type: "error",

			title: "Password is not matching",
		});

		$("#cpassword").focus().addClass("err-border");

		return false;
	}

	return true;
}

function openUserloginLogoutDetailModal(userid) {
	// alert(userid);

	$("#ModalBody").html("");

	$.ajax({
		type: "POST",

		url: "user/getloginLogoutDetailByUserId",

		data: {
			userid: userid,
		},

		success: function (result) {
			$("#ModalBody").html(result);

			$("#loginLogoutTable").DataTable({
				order: [[0, "desc"]],
			});

			$("#myModal").modal("show");
		},

		error: function (jqXHR, exception) {
			var msg = "";

			if (jqXHR.status === 0) {
				msg = "Not connect.\n Verify Network.";
			} else if (jqXHR.status == 404) {
				msg = "Requested page not found. [404]";
			} else if (jqXHR.status == 500) {
				msg = "Internal Server Error [500].";
			} else if (exception === "parsererror") {
				msg = "Requested JSON parse failed.";
			} else if (exception === "timeout") {
				msg = "Time out error.";
			} else if (exception === "abort") {
				msg = "Ajax request aborted.";
			} else {
				msg = "Uncaught Error.\n" + jqXHR.responseText;
			}

			// alert(msg);
		},
	}); /*end ajax call*/
}
