const { app, BrowserWindow, session } = require("electron");
const AesEncryption = require("aes-encryption");
const aes = new AesEncryption();

var db= require('../csms_utilities/database').db
db.all(`SELECT * FROM  CSMS_DETAILS WHERE KEY=?`,["SECRETKEY_NO"],(err, rows) => {
    if (err){ console.log("\x1b[33m%s\x1b[0m",err.message); 
    console.log("\x1b[31m%s\x1b[0m","WARNING: Kindly launch the CSMS application again, then only it will work properly!"); }
    else {
      if (rows[0].VALUE == 1 || rows[0].VALUE == "1") {
        aes.setSecretKey(
          "96a5ad4121f459ce13f99af327bff9e07b4d5e224d74ea0633a0cf5b0cd5ca12"
        );
      } else {
        console.log("\x1b[31m%s\x1b[0m","WARNING: This CSMS software not supported for current  database structure");
        app.quit();
      }
    }
  }
);

module.exports = {
  passData(success, message, data) {
    let temp = {
      success: success,
      message: message,
      data: data,
    };
    return temp;
  },
  consoleMessage(type,message){
if(type=="message"){
    console.log("\x1b[32m%s\x1b[0m",message)
}else if(type=="warning"){
    console.log("\x1b[33m%s\x1b[0m",message);
}else if(type=="error"){
    console.log("\x1b[31m%s\x1b[0m",message);
}else{
console.log(message)
}
  },

  encrypt(rawData) {
    return aes.encrypt(rawData.toString()).toString();
  },

  decrypt(encryptData) {
    return aes.decrypt(encryptData);
  },

  getNow() {
    let data = new Date();
    let date = data
      .getDate()
      .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
    let month = data
      .getMonth()
      .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
    let year = data.getFullYear();
    let hours = data
      .getHours()
      .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
    let min = data
      .getMinutes()
      .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
    let sec = data
      .getSeconds()
      .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
    let type = hours >= 12 ? "AM" : "PM";
    return (
      date +
      "/" +
      month +
      "/" +
      year +
      " " +
      hours +
      ":" +
      min +
      ":" +
      sec +
      " " +
      type
    ).toString();
  },

};

console.log("\x1b[32m%s\x1b[0m","CSMS Loading...");
