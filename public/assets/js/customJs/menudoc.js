$(document).ready(function(){



var basepath =$('#basepath').val();

$(document).on('change','#menu_id',function(event)
 {
    event.preventDefault();

    var selectedCode = $('#menu_id').find('option:selected');
    $("#url_link").val(selectedCode.data('linkval'));

});








//form submit



$(document).on('submit','#menudocFrom',function(event)
    {
        event.preventDefault();
          $("#errormsg").text('');
          var mode = $("#mode").val();
        if(validation())
        {   

            var formDataserialize = $("#menudocFrom").serialize();
            formDataserialize = decodeURI(formDataserialize);

            var formData = { formDatas: formDataserialize };
                    
            $("#menudocsavebtn").css('display', 'none');
            $("#loaderbtn").css('display', 'inline-block');

        $.ajax({
                type: "POST",
                url: basepath+'menudoc/menudoc_action',
                dataType: "json",
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                data: formData, 
                success: function (result) {
                        $("#menudocsavebtn").css('display', 'inline-block');
                         $("#loaderbtn").css('display', 'none');
                         window.location.href=basepath+'menudoc';
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


        }   // end master validation

    });





     $(document).on('click', '.tabledtl_btn', function(e) {
        e.preventDefault();
        var tablename = $(this).data("tablename");
       
        if (1) {

          

            $("#table_details_data").html('');
             $("#table_name").html('');
               $("#loader_tablestructure").css('display', 'inline-block');

            $.ajax({
                type: "POST",
                url: basepath + 'menudoc/tableStructureDetails',
                dataType: "html",
                data: { tablename: tablename},
                success: function(result) {
                     $("#loader_tablestructure").css('display', 'none');
                    $("#tableDetails").modal({ backdrop: false });
                    $("#table_details_data").html(result);
                    $("#table_name").html(tablename);
;


                    //   $('#app_dtl').DataTable({
                    //     "paging":   false,
                    //     "ordering": false,
                    //     "info":     false,
                       
                    // } );

                    $('#app_dtl').DataTable({
                        "paging":   false,
                        "ordering": false,
                        "info":     false,
                        "keys": true,
                        "scrollY": 400,
                        "scrollX": 1200,
                       } );

                },

                error: function(jqXHR, exception) {
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



        }

    });



       $(document).on('click', '.tableData_btn', function(e) {
        e.preventDefault();
        var tablename = $(this).data("tablename");
       
        if (1) {

          

            $("#table_data").html('');
             $("#table_name_span").html('');
              $("#loader_tabledata").css('display', 'inline-block');
            $.ajax({
                type: "POST",
                url: basepath + 'menudoc/tableDataDetails',
                dataType: "html",
                data: { tablename: tablename},
                success: function(result) {
                     $("#loader_tabledata").css('display', 'none');
                    $("#tableDataDetails").modal({ backdrop: false });
                    $("#table_data").html(result);
                    $("#table_name_span").html(tablename);
;


                      $('#app_dtl2').DataTable({
                        "paging":   false,
                        "ordering": false,
                        "info":     false,
                        "keys": true,
                        "scrollY": 400,
                        "scrollX": 1200,
                       } );


                     //  $('#app_dtl2 tfoot tr').insertAfter($('#app_dtl2 thead tr'));
                     //   $('.select2').select2();

                },

                error: function(jqXHR, exception) {
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



        }

    });

     $(document).on('click', '#searchOption', function(e) {

              e.preventDefault();
        var tablename = $('#table_name_span').text();
        var search_column = $('#search_column').val();
       
        if (1) {

          

            $("#table_data").html('');
             $("#table_name_span").html('');
              $("#loader_tabledata").css('display', 'inline-block');
            $.ajax({
                type: "POST",
                url: basepath + 'menudoc/tableDataDetailsWithSearchColunm',
                dataType: "html",
                data: { tablename: tablename},
                success: function(result) {
                     $("#loader_tabledata").css('display', 'none');
                    $("#tableDataDetails").modal({ backdrop: false });
                    $("#table_data").html(result);
                    $("#table_name_span").html(tablename);
;


                      $('#app_dtl2').DataTable({
                        "paging":   false,
                        "ordering": false,
                        "info":     false,
                         "orderCellsTop": true,
        language: {
            search: "_INPUT_",
            searchPlaceholder: "Search..."
        },
        'aoColumnDefs': [{
            'bSortable': false,
             /* 1st one, start by the right */
        }],

        initComplete: function() {
            this.api().columns([search_column]).every(function() {
                var column = this;
                var select = $('<select class="form_input_text form-control select2"><option value="">Show all</option></select>')
                    .appendTo($(column.footer()).empty())
                    .on('change', function() {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
                        column
                            .search(val ? '^' + val + '$' : '', true, false)
                            .draw();
                    });

                column.data().unique().sort().each(function(d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>')
                });

            });
        },
        
                       
                    

                       } );


                       $('#app_dtl2 tfoot tr').insertAfter($('#app_dtl2 thead tr'));
                        $('.select2').select2();

                },

                error: function(jqXHR, exception) {
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



        }
  


   }); 



   /* add schedule time*/
 $(document).on('click','.addDevelopDetails',function(e){

           e.preventDefault();


      var rowno= $("#rowno").val(); 
   

      
        if(validateDetails()) {
            var formDataserialize = $("#menudocFrom").serialize();
            formDataserialize = decodeURI(formDataserialize);
            console.log(formDataserialize);
            var formData = { formDatas: formDataserialize };

        rowno++;
        $.ajax({
            type: "POST",
            url: basepath+'menudoc/addDevelopmentDetail',
            dataType: "html",
            data: formData,
            success: function (result) {
                rowno+=1;
                $("#rowno").val(rowno);
                $("#detail_slottime table").show(); 
                $("#detail_slottime table tbody").append(result);  
               
                resetSerial();


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

        }else{
            $("#selmens_medicine").focus();
            $("#selmens_medicineerr").addClass("bordererror");

        }


    }); // End Visiting Details    


 $(document).on('click','.delDetails',function(){

        var currRowID = $(this).attr('id');
        var rowDtlNo = currRowID.split('_');
       // console.log(rowDtlNo[1]);
        console.log(currRowID);
        //$("tr#rowDocument_"+rowDtlNo[1]+"_"+rowDtlNo[2]).remove();
        $("tr#rowItemdetails_"+rowDtlNo[1]).remove();
     

        resetSerial();

    });



$(document).on('click', ".delDocDtl", function(e) {
  e.preventDefault();

  //alert($(this).data("paymentid"));exit;

  var checkstr =  confirm('are you sure you want to delete this?');
    if(checkstr == true){
     //alert($(this).data("billid"));

     var docdtlid=$(this).data("docdtlid");
           $.ajax({
           type: "POST",
           url: basepath+'menudoc/deleteMenuDocDetails',
           dataType: "json",
           contentType: "application/x-www-form-urlencoded; charset=UTF-8",
           data: {docdtlid:docdtlid},

            success: function(data) { 

             if (data.msg_status==1) {
              
                 location.reload(); 

             }else{

                  alert(data.msg_data);

             }


            },

            complete: function() {

            },

            error: function(e) {
                //called when there is an error
                console.log(e.message);
            }

        });


    }else{
    return false;
    }


}); 




}); // end of document ready

function resetSerial(){

    var n=1;



  $(".slCls").each(function(){

      var currRowID = $(this).attr('id');

      var rowDtlNo = currRowID.split('_');

        console.log("-> "+n); 

        

      $("#serial_"+rowDtlNo[1]).text(n++);

    

   });



}

function validateDetails(){

var development_dt = $("#development_dt").val();
var development_type = $("#development_type").val();
var developer_name = $("#developer_name").val();
var developer_note = $("#developer_note").val();



$("#development_dt,#development_type_err,#developer_name").removeClass('form_error');
 

if(development_dt == ''){
    $("#development_dt").addClass('form_error');
      //$("#department").focus();
     return false;    
}

  if(development_type == ''){
    $("#development_type_err").addClass('form_error');
      //$("#department").focus();
     return false;    
  }

  if(developer_name == ''){
    $("#developer_name").addClass('form_error');
      //$("#department").focus();
     return false;    
}






  return true;
}





function validation() {

    var url_link = $("#url_link").val();
    var link_type = $("#link_type").val();
    var voucher_pass = $("#voucher_pass").val();
    var select_tables = $("#select_tables").val();
    

    $("#errormsg").text("");
    $("#linktypeerr,#voucherpasserr,3selecttableerr").removeClass("form_error");

    if (url_link == '') {

        $("#url_link").addClass("form_error");
        return false;
     }

    if (link_type == '') {

        $("#linktypeerr").addClass("form_error");
        return false;
     }

    if (voucher_pass == '') {

        $("#voucherpasserr").addClass("form_error");
        return false;
     }

    if (select_tables.length == 0) {

        $("#selecttableerr").addClass("form_error");
        return false;
     }



    return true;

}