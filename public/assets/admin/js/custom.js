$(function () {

    if ($.fn.selectpicker) {
        $('.selectpicker').selectpicker();
    }

    if ($.fn.DataTable) {
        $('.dataTable').DataTable();
    }

    if ($.fn.select2) {
        $('.select2').select2();
    }

    if ($.fn.datepicker) {
    $('.datepicker').datepicker({
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        autoclose: true,
        orientation: 'bottom'
    });
}

   if ($.fn.inputmask) {
        $('.datemask').inputmask('dd/mm/yyyy', {
            placeholder: 'dd/mm/yyyy'
        });
    }

    if ($.fn.niceScroll) {
        $(".customscrollbar").niceScroll({
            cursorborder: "",
            cursorwidth: "7px",
            autohidemode: false,
            cursorcolor: "#F4AFD9",
            boxzoom: false,
            smoothscroll: true,
        });
    }
    $(document).on('click', '.openModal', function(e) {
        e.preventDefault();

        var urlpath = $(this).attr('data-href');
        var title = $(this).attr('data-title');

        var type = "POST";

        $.ajax({
            url: urlpath,
            type: type,
            data: { title: title },
            async: false,
            success: function(response) {
                $('#commonModal').modal('show');
                $('#bodyContent').html(response);
                $('#header_title').text(title);
                getCommon();

            },
            error: function(xhr) {
                console.log(xhr.responseText);
                var errors = xhr.responseJSON.errors;
                if (errors) {
                    $.each(errors, function(field, messages) {
                        var errorHtml = '<ul class="list-unstyled">';
                        $.each(messages, function(index, message) {
                            errorHtml += '<li>' + message + '</li>';
                        });
                        errorHtml += '</ul>';
                        $('#my-form').find('[name="' + field + '"]').after(errorHtml);
                    });
                }
            }
        });

    });

    $(document).on('keyup change', 'input, select, teaxtarea', function() {

        var inputValue = $(this).val();
        var id = $(this).attr('id');

        if (inputValue !== "") {
            $("#" + id + "_error").text("");
            $("#" + id).css('border', '1px solid #c7ccd0');
            $("#" + id).siblings('.select2-container').find('.select2-selection').css('border', '1px solid #c7ccd0');
        }
    });


    $(document).on('change', '.readUrl', function() {
        var imagePreview = $(this).attr('data-showImage');
        $(".upload-text").hide();
        readURL(this, imagePreview);
    });

    $(".numberwithdecimal").bind("keyup paste", function() {
        this.value = this.value.replace(/[^0-9\.]/g, "");
    });

    $(".onlynumber").bind("keyup paste", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
    });


})

function getCommon() {

    $(function() {
        var t = $(".select2");
        t.length && t.each(function() {
            var e = $(this);
            e.wrap('<div class="position-relative"></div>').select2({ placeholder: "Select value", dropdownParent: e.parent() })
        })
    });

    $(".numberwithdecimal").bind("keyup paste", function() {
        this.value = this.value.replace(/[^0-9\.]/g, "");
    });

    $(".onlynumber").bind("keyup paste", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
    });

    $('.numberlength').on('keyup paste', function() {
        var maxLength = parseInt($(this).attr('maxlength'));
        var currentLength = $(this).val().length;

        if (currentLength > maxLength) {
            $(this).val($(this).val().substr(0, maxLength));
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        var noAutocompleteFields = document.querySelectorAll('.no-autocomplete');
        noAutocompleteFields.forEach(function(field) {
            field.setAttribute('autocomplete', 'new-password');
        });
    });


}

function readURL(input, imagePreview) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $('#' + imagePreview).attr('src', e.target.result).fadeIn('slow');
        }
        reader.readAsDataURL(input.files[0]);
    }
}
