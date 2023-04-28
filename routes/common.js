const {  app, ipcMain, dialog, session } = require("electron"); 
const path = require("path"); 
const fs = require('fs'); 
let dbFile = path.join(app.getAppPath(), 'resources', 'app','db', 'csms.db')
const csmsFunctional = require("../csms_utilities/functional");
const usrModel = require("../model/user");
const bokModel = require("../model/book");
const stdModel = require("../model/student");
const tranModel = require("../model/transaction");
const cmnModel = require("../model/common");  
var response;

  


ipcMain.on("resetAppication", async (event, arg) => { 
  if (arg.password !== null &&  arg.password !== "" && arg.password !== undefined ) {
    arg.password = csmsFunctional.encrypt(arg.password); 
    response = await usrModel.select( " USER_ID=" + arg.userid + " and PASSWORD='" + arg.password + "'"   );
    isMatched = response.length > 0 ? true : false;
    if (isMatched) response=await cmnModel.resetAppication();
     else response = 0;
  } else response = 0;
  event.returnValue = csmsFunctional.passData( response == 1 ? true : false, "",  arg  ); 
});

ipcMain.on("dashboardImg", async (event,arg) => {  
  response=await cmnModel.raw("SELECT DASHBOARD_IMG FROM USER WHERE USER_ID="+arg.userId); 
  event.returnValue = csmsFunctional.passData(  true  , "", (response.length>0)? response[0]?.DASHBOARD_IMG : ""  ); 
});


ipcMain.on("loadRecords", async (event,arg) => {  
  let responseJson={
    totalBooks:0,
    availableBooks:0,
    totalStudents:0,
dbSize:"0 MB"
  }
  response=await cmnModel.raw("SELECT COUNT(CHLBK_ID) AS CNT FROM CHILD_BOOK WHERE BK_STATUS IN ('IN_STOCK','ISSUED')   "); 
  if(response.length>0)responseJson.totalBooks=response[0]?.CNT 
  response=await cmnModel.raw("SELECT COUNT(ROLL_NO) AS CNT FROM STUDENT "); 
  if(response.length>0)responseJson.totalStudents=response[0]?.CNT 
  response=await cmnModel.raw("SELECT COUNT(CHLBK_ID) AS CNT FROM CHILD_BOOK WHERE BK_STATUS='IN_STOCK'"); 
  if(response.length>0)responseJson.availableBooks=response[0]?.CNT 

let stats = fs.statSync(dbFile),  fileSizeInBytes = stats.size;
 responseJson.dbSize = ((fileSizeInBytes / (1024*1024)).toFixed(1))+" MB";

  event.returnValue = csmsFunctional.passData(  true  , "", responseJson ); 
});




ipcMain.on("alert", async (event, arg) => {
  const options = {
    type: arg.type,
    buttons: arg.buttons,
    defaultId: arg.defaultId,
    title: "CSMS",
    message: arg.title,
    detail: arg.message,
    noLink: true,
    icon: path.join(app.getAppPath(), "image", "graduate.png"),
  };
  dialog.showMessageBox(null, options).then((data) => {
    event.returnValue = csmsFunctional.passData(true, "", data.response);
  });
});


ipcMain.on("exportDatabase", async (event, arg) => {  
  dialog .showSaveDialog({
      title: "Select the file path to download", 
      buttonLabel: "Download",
      defaultPath:"csms.db",
      filters: [   {  name: "SQLite",    extensions: ["db"], },  ],
      properties: [],
    })
 .then((file) => { 
    if (!file.canceled) {  
    fs.copyFile(dbFile,   file.filePath.toString(), (err) => {
    if (err) {
    console.log("\x1b[33m%s\x1b[0m",err.message);
    event.returnValue = csmsFunctional.passData(true, "",0);
    }
    else{
    console.log("\x1b[32m%s\x1b[0m","CSMS database downloaded successfully") 
    event.returnValue = csmsFunctional.passData(true, "",1);
    }
    });}else{
      event.returnValue = csmsFunctional.passData(true, "",3);
    }  
  })
  .catch((err) => {
    console.log("\x1b[33m%s\x1b[0m",err.message);
    event.returnValue = csmsFunctional.passData(true, "",0);
    });
}); 
 

ipcMain.on("importDatabase", async (event, arg) => {  
  dialog.showOpenDialog({
    title: "Select the db file to upload", 
    buttonLabel: "Upload",
    filters: [   {  name: "SQLite",    extensions: ["db"], },  ],
    properties: ['openFile'] }).then(function (response) {
    if (!response.canceled) {        
      let options={           
        buttons:["Yes","No"],
        type:"warning",
        title:"Alert!",
        message:"Do you realy want to replace the current database? \nNote: The old data can't be recovered.\nClick Yes to continue.",      
        defaultId: 0,
        noLink: true,
        title: "CSMS"
      }
      
  dialog.showMessageBox(null, options).then((data) => { 
    if(data.response===0 || data.response==='0'){
      fs.copyFile(response.filePaths[0] , dbFile, (err) => {
        if (err) {
        console.log("\x1b[33m%s\x1b[0m",err.message);
        event.returnValue = csmsFunctional.passData(true, "",0);
        }
        else{
          console.log("\x1b[32m%s\x1b[0m","CSMS database uploaded successfully")
          console.log("\x1b[33m%s\x1b[0m","WARNING: Kindly restart the application."); 
        event.returnValue = csmsFunctional.passData(true, "",1);
        }
        }); 
    }else{
      event.returnValue = csmsFunctional.passData(true, "",3);

    }

  })


      
    } else {
      event.returnValue = csmsFunctional.passData(true, "",3);
    }
}); 
     
   
  }); 



  

ipcMain.on("changeWallpaper", async (event, arg) => {  
  dialog.showOpenDialog({
    title: "Select the image file to upload", 
    buttonLabel: "Set as wallpaper",
    filters: [   {  name: "Image",    extensions: ["png","jpg","jpeg"], },  ],
    properties: ['openFile'] }).then(function (response) {
    if (!response.canceled) {        
      let options={           
        buttons:["Yes","No"],
        type:"warning",
        title:"Alert!",
        message:"Do you realy want to replace the current wallpaper? \nNote: The old wallpaper can't be recovered.\nClick Yes to continue.",      
        defaultId: 0,
        noLink: true,
        title: "CSMS"
      }
      
  dialog.showMessageBox(null, options).then(async (data) => { 
    if(data.response===0 || data.response==='0'){
  

      try{
  let bitmap = fs.readFileSync(response.filePaths[0]), base64=Buffer.from(bitmap).toString('base64');
  if(base64.length>5){
  response = await cmnModel.runQuery(`UPDATE USER SET DASHBOARD_IMG='`+base64+`' 
  WHERE USER_ID  =`+arg.userId)             

          console.log("\x1b[32m%s\x1b[0m","CSMS wallpaper updated successfully") 
        event.returnValue = csmsFunctional.passData(true, "",1);
  }else{
    console.log("\x1b[33m%s\x1b[0m","Not valid image. Base64 length must be  greater than five."); 
    event.returnValue = csmsFunctional.passData(true, "",0);
  }
  
    }
  catch(err){

    console.log("\x1b[33m%s\x1b[0m",err.message);
    event.returnValue = csmsFunctional.passData(true, "",0);
  }

    

 

    }else{
      event.returnValue = csmsFunctional.passData(true, "",3);

    }

  })


      
    } else {
      event.returnValue = csmsFunctional.passData(true, "",3);
    }
}); 
     
   
  }); 