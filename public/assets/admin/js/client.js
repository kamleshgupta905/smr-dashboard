// $(function () {
//     var base_url = $("#base_url").val();

//     $(".client-status").click(function (e) {
//         e.preventDefault();
//         var id = $(this).data("id");
//         var icon = $(this).find("i");
//         var urlpath = base_url + "/admin/client/status";
//         var csrfToken = $('meta[name="csrf-token"]').attr("content");

//         $.ajax({
//             type: "POST",
//             url: urlpath,
//             data: { id: id },
//             headers: {
//                 "X-CSRF-TOKEN": csrfToken,
//             },
//             success: function (response) {
//                 if (response.status === "Y") {
//                     icon.removeClass("fa-times-circle")
//                         .addClass("fa-check-circle")
//                         .css("color", "green");
//                 } else {
//                     icon.removeClass("fa-check-circle")
//                         .addClass("fa-times-circle")
//                         .css("color", "red");
//                 }
//                 showToast('success', response.message)
//             },
//             error: function (xhr, status, error) {
//                 console.error("Error updating question status:", error);
//             },
//         });
//     });

//     $(document).on("submit", "#clientForm", function (e) {
//         e.preventDefault();

//         var formData = new FormData($(this)[0]);
//         var csrfToken = $('meta[name="csrf-token"]').attr("content");
//         var mode = $("#mode").val();

//         var type = "POST";
//         var urlpath = base_url + "/admin/clientaddeditajax";

//         $("#successmsg").text("");
//         $("#errormsg").text("");

//         enableButton(true);
//         $.ajax({
//             url: urlpath,
//             type: type,
//             data: formData,
//             processData: false,
//             contentType: false,
//             headers: {
//                 "X-CSRF-TOKEN": csrfToken,
//             },
//             success: function (response) {
//                 if (!$.isEmptyObject(response.errors)) {
//                     $.each(response.errors, function (key, value) {
//                         $("#" + key + "_error").text(value);
//                         $("#" + key).css("border", "1px solid red");
//                         $("#" + key)
//                             .siblings(".select2-container")
//                             .find(".select2-selection")
//                             .css("border", "1px solid red");
//                     });
//                 }

//                 if (response.msg_status == 1) {
//                     if (mode == "Add") {
//                         $("#clientForm")[0].reset();
//                         showToast("success", "Data successfully inserted.");
//                         enableButton(false, mode);
//                         setTimeout(function () {
//                             window.location.href = `${base_url}/admin/client/view/${response.data}`;
//                         }, 1000);
//                     } else {
//                         showToast("success", "Data successfully updated.");
//                     }
//                 }
//                 enableButton(false, mode);
//             },
//             error: function (xhr) {
//                 console.log(xhr.responseText);
//             },
//         });
//     });
// });
// $(document).ready(function() {

//     // Add new contact
//     $('#addContactBtn').on('click', function() {
//         let contactHtml = `
//             <div class="contact-item mb-2">
//                 <input type="text" name="contacts[]" class="form-control mb-1" placeholder="Enter Contact">
//                 <button type="button" class="btn btn-sm btn-danger removeContactBtn">Remove</button>
//             </div>`;
//         $('#contactContainer').append(contactHtml);
//     });

//     // Remove contact
//     $(document).on('click', '.removeContactBtn', function() {
//         $(this).closest('.contact-item').remove();
//     });

//     // AJAX form submission
//     $('#clientForm').on('submit', function(e) {
//         e.preventDefault();

//         // Update CKEditor content
//         for (instance in CKEDITOR.instances) {
//             CKEDITOR.instances[instance].updateElement();
//         }

//         let formData = new FormData(this);
//         let url = "{{ url('admin/client/store') }}"; // Update with your store route

//         $.ajax({
//             url: url,
//             type: 'POST',
//             data: formData,
//             processData: false,
//             contentType: false,
//             headers: {
//                 'X-CSRF-TOKEN': $('input[name="_token"]').val()
//             },
//             success: function(resp) {
//                 if(resp.status == 1){
//                     $('#sussess_msg').text(resp.message);
//                     $('#clientForm')[0].reset();
//                     $('#contactContainer').html('');
//                     CKEDITOR.instances['description'].setData('');
//                 } else {
//                     // Display errors
//                     $('.error-text').text('');
//                     $.each(resp.errors, function(key, value){
//                         $('#' + key + '_error').text(value[0]);
//                     });
//                 }
//             },
//             error: function(err) {
//                 alert("Something went wrong!");
//                 console.log(err);
//             }
//         });
//     });

// });
$(function () {
    var base_url = $("#base_url").val();

    // Toggle Client Status
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
            headers: { "X-CSRF-TOKEN": csrfToken },
            success: function (response) {
                if (response.status === "Y") {
                    icon.removeClass("fa-times-circle").addClass("fa-check-circle").css("color", "green");
                } else {
                    icon.removeClass("fa-check-circle").addClass("fa-times-circle").css("color", "red");
                }
                showToast('success', response.message);
            },
            error: function (xhr, status, error) {
                console.error("Error updating client status:", error);
            },
        });
    });

    // Add new contact field
    $('#addContactBtn').on('click', function () {
        let contactHtml = `
                <div class="contact-item mb-3 border rounded p-3">
                    <div class="row g-2 align-items-center">
                        <div class="col-md-3">
                            <input type="text" name="contact_name[]" class="form-control" placeholder="Enter name">
                        </div>
                        <div class="col-md-3">
                            <input type="email" name="contact_email[]" class="form-control" placeholder="Enter email">
                        </div>
                        <div class="col-md-3">
                            <input type="text" name="contact_phone[]" class="form-control" placeholder="Enter phone">
                        </div>
                        <div class="col-md-1 d-flex align-items-center">
                            <div class="form-check">
                                <input type="checkbox" name="is_primary[]" value="1" class="form-check-input">
                                <label class="form-check-label">Primary</label>
                            </div>
                        </div>
                        <div class="col-md-1 d-flex align-items-center">
                            <div class="form-check">
                                <input type="checkbox" name="is_billing[]" value="1" class="form-check-input">
                                <label class="form-check-label">Billing</label>
                            </div>
                        </div>
                        <div class="col-md-1 text-end">
                            <button type="button" class="btn btn-sm btn-danger removeContactBtn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        $('#contactContainer').append(contactHtml);
    });

    // Remove contact field
    $(document).on('click', '.removeContactBtn', function () {
        $(this).closest('.contact-item').remove();
    });
// Client Form Submission with Validation
$(document).on("submit", "#clientForm", function (e) {
    e.preventDefault();

    // Clear previous errors
    $('.error-text').text('');
    $('input, select').css('border', '');

    // Update CKEditor content if present
    // if (typeof CKEDITOR !== "undefined") {
    //     for (instance in CKEDITOR.instances) {
    //         CKEDITOR.instances[instance].updateElement();
    //     }
    // }

    // Basic validation
    let isValid = true;

    // Required fields
    const requiredFields = [
        { name: 'client_name', type: 'text', label: 'Client Name' },
        { name: 'email', type: 'email', label: 'Email Address' },
        { name: 'sales_rep', type: 'select', label: 'Sales Rep' },
        { name: 'country', type: 'select', label: 'Country' },
        { name: 'currency', type: 'select', label: 'Currency' },
    ];

    requiredFields.forEach(function (field) {
        let value = $(`[name="${field.name}"]`).val()?.trim() || "";
        if (value === '') {
            $(`#${field.name}_error`).text(`${field.label} is required`);
            $(`[name="${field.name}"]`).css('border', '1px solid red');
            isValid = false;
        } else if (field.type === 'email') {
            let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                $(`#${field.name}_error`).text('Enter a valid email');
                $(`[name="${field.name}"]`).css('border', '1px solid red');
                isValid = false;
            }
        }
    });

    if (!isValid) return;

    // Submit form via AJAX
    let formData = new FormData(this);
    let url = base_url + "/admin/clientaddeditajax"; // Your route
    let csrfToken = $('meta[name="csrf-token"]').attr("content");

    enableButton(true);

    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        headers: { "X-CSRF-TOKEN": csrfToken },
        success: function (resp) {
            enableButton(false);

            if (resp.errors) {
                $.each(resp.errors, function (key, value) {
                    $("#" + key + "_error").text(value[0]);
                    $("#" + key).css("border", "1px solid red");
                });
                return;
            }

            if (resp.msg_status == 1) {
                // ✅ Success toast
                showToast("success", resp.message || "Data successfully saved.");

                // ✅ Redirect logic
             const mode = $('#mode').val()?.toLowerCase();
                
                if (mode === "add") {
                    // Reset and redirect for add
                    $('#clientForm')[0].reset();
                    $('#contactContainer').html('');
                
                    setTimeout(function () {
                        window.location.href = `${base_url}/admin/client/view/${resp.data}`;
                    }, 800);
                }
                
                if (mode === "edit") {
                    // Redirect for update
                    showToast("success", resp.message);
                    
                    setTimeout(function () {
                        window.location.href = `${base_url}/admin/client/view/${resp.data}`;
                    }, 800);
                }

            }
        },
        error: function (xhr) {
            console.error(xhr.responseText);
            enableButton(false);
        }
    });
});

    $(document).ready(function() {
        // Delete client with SweetAlert2 confirmation
        $('.deleteClientBtn').on('click', function(e) {
            e.preventDefault();
            var url = $(this).data('url');

            Swal.fire({
                title: 'Are you sure?',
                text: "You want to delete this client!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirect to delete URL
                    window.location.href = url;
                }
            })
        });
    });
});
