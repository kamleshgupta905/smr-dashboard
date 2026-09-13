$(document).ready(function(){

 


})

function inputdatecheck(datedata,basepath){

   var basepath = $("#basepath").val();
   var txt = '';
  
   if(datedata != ''){
  
    $.ajax({
                type: "POST",
                url: basepath+'dashboard/checkdateRange',
                dataType: "json",
                data: {datedata:datedata},
                async:false,
                success: function (result) {

                     txt =  result.msg_status;                     
                                       
                },
               
                
            }); /*end ajax call*/ 
          
      }
    return txt;
}


function isDate(txtDate)
{  console.log("isdatecheck");
    var currVal = txtDate;
    if(currVal == '')
    return false;
    //Declare Regex 
    var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
    var dtArray = currVal.match(rxDatePattern); // is format OK?
    if (dtArray == null)
    return false;

      //Checks for dd/mm/yyyy format.
      dtDay = dtArray[1];
      dtMonth= dtArray[3];
      dtYear = dtArray[5];   

    if (dtMonth < 1 || dtMonth > 12)
    return false;
    else if (dtDay < 1 || dtDay> 31)
    return false;
    else if ((dtMonth==4 || dtMonth==6 || dtMonth==9 || dtMonth==11) && dtDay ==31)
    return false;
    else if (dtMonth == 2)
    {
    var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
    if (dtDay> 29 || (dtDay ==29 && !isleap))
    return false;
    }
    return true;

}




/* ajax error message method */
function ajaxErrorMessage(jqXHR, exception) {
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
    return msg;
}