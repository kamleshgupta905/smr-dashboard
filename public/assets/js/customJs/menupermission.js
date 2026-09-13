$(document).ready(function () {

    var Toast = Swal.mixin({

        toast: true,

        position: 'top-end',

        showConfirmButton: false,

        timer: 4000

    });



    // $('.alert-dismissible').delay(5000).fadeOut();



    $("#myjstree").jstree({

        "themes": {

            "theme": "apple", "dots": false, "icons": false

        },

        // "checkbox":{three_state : false},

        "plugins": ["themes", "html_data", "checkbox"]

    });



    $("#myjstree").bind('loaded.jstree', function (e, data) {

        alert(1);

        displayList();

    })

    $("#myjstree").bind('change_state.jstree', function (e, data) {

        alert(1);

        displayList();

    });



    $("div.bhoechie-tab-menu>div.list-group>a").click(function (e) {

        e.preventDefault();



        $(this).siblings('a.active').removeClass("active");

        $(this).addClass("active");

        var index = $(this).index();

        $("div.bhoechie-tab>div.bhoechie-tab-content").removeClass("active");

        $("div.bhoechie-tab>div.bhoechie-tab-content").eq(index).addClass("active");

    });



    $('#myjstree').on('changed.jstree', function (e, data) {

        console.log(data.node.id);

        var checkedNodes = $("#myjstree").jstree("get_selected");

        var checked_ids = [];

        checked_ids = $("#myjstree").jstree("get_selected_All");

        // $("#myjstree").jstree("get_checked", null, true).each(function () {

        //        checked_ids.push(this.id);

        //    });

        checked_ids.splice(checked_ids.indexOf("#"), 1); // to re move the "#""

        console.log(checkedNodes);

        console.log(checked_ids);







    });







    $(document).on('click', "#btnusersave", function () {
        var base_url = $("#base_url").val() + "/admin";
        var checkedNodes = $("#myjstree").jstree("get_selected_All");

        checkedNodes.splice(checkedNodes.indexOf("#"), 1);
        var urlpath = base_url + "/menupermission/assignmenu";

        var formData = new FormData();

        formData.append('userId', $('#userId').val());

        formData.append('MenuString', checkedNodes.toString());

        $.ajax({
            type: "POST",
            url: urlpath,
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                Toast.fire({
                    type: 'success',
                    title: result.msg
                })
            },

            error: function (jqXHR, exception) {

                var msg = '';

                if (jqXHR.status === 0) {

                    msg = 'Not connect.\n Verify Network.';

                } else if (jqXHR.status == 404) {

                    msg = 'Requested page not found. [404]';

                } else if (jqXHR.status == 500) {

                    msg = 'Internal Server Error [500].';

                } else if (exception === 'parsererror') {

                    msg = 'Requested JSON parse failed.';

                } else if (exception === 'timeout') {

                    msg = 'Time out error.';

                } else if (exception === 'abort') {

                    msg = 'Ajax request aborted.';

                } else {

                    msg = 'Uncaught Error.\n' + jqXHR.responseText;

                }

                // alert(msg);  

            }

        }); /*end ajax call*/



    });









    // $(function()

    // {

    //   //  var checked_ids = [40, 3, 4, 6, 8, 9, 11, 15];

    //     //$.each(checked_ids, function (index, value) {

    //     //    alert(value);

    //     //    $('#myjstree').jstree("select_node", value, true);

    //     //}

    //     //)

    //     $.ajax({

    //         type: 'GET',

    //         url: '@Url.Action("getUserMenuByUserId", "MenuPermission")',

    //         data: { userId: $('#userId').val() || 0 },

    //         contentType: "application/json; charset=utf-8",

    //         dataType: "json",



    //         success: function (data) {

    //             if (data.success == '1') {

    //                 $.each(data.Message, function (index, value) {

    //                     //alert(value);

    //                     $('#myjstree').jstree("select_node", value, true);

    //                 })

    //               }



    //               else {

    //                  // alert('Data not properly Saved');

    //                   return false;

    //               }

    //           }

    //     });



    // });











});// end off document ready



function getUsersPermittedMenu(userId) {

    $("#myjstree").jstree().deselect_all(true);

    $('#userId').val('');

    $('#userId').val(userId);

    $.ajax({

        type: "POST",

        url: 'menupermission/getUsersPermittedMenu',

        data: { userId: userId },

        dataType: 'json',

        success: function (result) {

            console.log(result.data);

            $.each(result.data, function (index, value) {

                console.log(value);

                $('#myjstree').jstree("select_node", value, true);



            })

            $('#btnusersaveDiv').css('display', 'block');

        },

        error: function (jqXHR, exception) {

            $('#btnusersaveDiv').css('display', 'none');

            var msg = '';

            if (jqXHR.status === 0) {

                msg = 'Not connect.\n Verify Network.';

            } else if (jqXHR.status == 404) {

                msg = 'Requested page not found. [404]';

            } else if (jqXHR.status == 500) {

                msg = 'Internal Server Error [500].';

            } else if (exception === 'parsererror') {

                msg = 'Requested JSON parse failed.';

            } else if (exception === 'timeout') {

                msg = 'Time out error.';

            } else if (exception === 'abort') {

                msg = 'Ajax request aborted.';

            } else {

                msg = 'Uncaught Error.\n' + jqXHR.responseText;

            }

            // alert(msg);  

        }

    }); /*end ajax call*/
  function getPermittedMenuser(userId) {

    $("#myjstree").jstree().deselect_all(true);

    // ✅ Set hidden input with userId
    $('#id').val(userId);

    // ✅ Build URL using the hidden input value
    let id = $('#id').val();

    $.ajax({
        type: "GET",  // using GET because ID is in URL
        url: '/user/addedit/' + id,  // ID taken from hidden input
        dataType: 'json',
        success: function(result) {
            if (result.menu_permissions) {
                $.each(result.menu_permissions, function(index, value) {
                    $('#myjstree').jstree("select_node", value, true);
                });
                $('#btnusersaveDiv').css('display', 'block');
            }
        },
        error: function(jqXHR, exception) {
            $('#btnusersaveDiv').css('display', 'none');
            console.log('AJAX error:', jqXHR.responseText);
        }
    });
}

}