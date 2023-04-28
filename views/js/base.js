function isEmpty(data){
  return (data=="" || data==null || data==undefined)
  }

  async function showAlert(title, message){
    let options={           
    buttons:[],
    type:"warning",
    title:title,
    message:message,      
    defaultId: 0,
  }
await ipcRenderer.sendSync('alert', options)  
  }

async function showConfirm(title, message){  
  let options={           
    buttons:["Yes","No"],
    type:"error",
    title:title,
    message:message,      
    defaultId: 0,
  }
return await ipcRenderer.sendSync('alert', options)   
}


$("input").on('input', function () {
  $(this).val( $(this).val().replace(/'/g, '').replace(/"/g, '').replace(/&/g, '').replace(/`/g, ''));
});

$("textarea").on('input', function () {
  $(this).val( $(this).val().replace(/'/g, '').replace(/"/g, '').replace(/&/g, '').replace(/`/g, ''));
});

function isValidEmail (data) {   
  if(isEmpty($(data).val())) return;
  let a=String($(data).val()).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ );
  if(!a) {
    $(data).val("")
    $(data).focus()
showAlert('Alert!', 'Kindly enter a valid email.'); }
};
