$(function() {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });



});

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000
});

function showToast(icon = 'success', title = 'Update successfully') {
    Toast.fire({
        type: icon,
        title: '<span class="fa">' + title + '</span>'

    })
}

function enableButton(status, mode = 'Save') {
    if (status) {
        $("#savebtn").html("Processing...");
        $("#savebtn").prop("disabled", true);
    } else {
        if(mode == "Add") {
            var text = "Save";
        } else {
            var text = "Update";
        }
        $("#savebtn").html(text);
        $("#savebtn").prop("disabled", false);
    }
}

function goBack() {
    window.history.back();
}

function refreshData(listUrl) {
    $.ajax({
        url: listUrl,
        method: 'GET',
        success: function(response) {
            var specificDivData = $(response).find('.dataContainer').html();
            $('.dataContainer').html(specificDivData);
            $(".dataTable").DataTable();
            // initializeModal();
        },
        error: function(xhr) {
            // Handle error case
        }
    });

    $('input').keyup(function() {
        $("#success_msg").text("");
    });
}


function validateForm(form) {
    var isValid = true;

    // Reset any previous validation errors
    form.find('.input-validate').remove();

    form.find('.validate, .selectpicker').each(function() {
        var element = $(this);
        var value = element.hasClass('selectpicker') ? element.val() : element.val().trim();

        var name = element.attr('name');
        var label = form.find('label[for="' + element.attr('id') + '"]').clone().find('.login-danger').remove().end().text();
        var errorMessage = '';
        var errorMessageAdded = false;

        if (value == '' || (element.is(":checkbox") && !element.prop("checked"))) {
            isValid = false;
            errorMessage = (element.is('input')) ? 'Enter ' + label.toLowerCase() : 'Select ' + label.toLowerCase();
            if (element.is('textarea')) {
                errorMessage = 'Please enter ' + label.toLowerCase();
            }

            if (element.is(':checkbox') && !element.prop("checked")) {
                errorMessage = 'This filed is required';
            }
            if (!errorMessageAdded) {
                // element.after('<span class="invalid-feedback d-block input-validate">' + errorMessage + '</span>');
                element.closest('.validate-input').after('<span class="invalid-feedback d-block input-validate">' + errorMessage + '</span>');
                errorMessageAdded = true;
            }
        }

        // Additional validation checks can be added here

    });

    return isValid;
}