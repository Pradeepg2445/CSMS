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

 

ipcMain.on("user", async (event, arg) => {
  let isMatched = false;
  switch (arg.action) {
    case "reset":

    break;
    case "signup":
      response = await usrModel.insert(
        arg.name,
        arg.phone,
        arg.email,
        arg.password
      );
      event.returnValue = csmsFunctional.passData(
        response == 1 ? true : false,
        "",
        arg
      );
      break;
    case "login":
      response = await usrModel.select(
        " EMAIL='" +
          arg.email +
          "' and PASSWORD='" +
          csmsFunctional.encrypt(arg.password) +
          "'"
      );
      isMatched = response.length > 0 ? true : false;
      var cookie = [];
      if (isMatched) {
        cookie[0] = {
          url: "http://www.github.com",
          name: "user_id",
          value: csmsFunctional.encrypt(response[0].USER_ID),
        };
        cookie[1] = {
          url: "http://www.github.com",
          name: "name",
          value: csmsFunctional.encrypt(response[0].NAME),
        };
        cookie[2] = {
          url: "http://www.github.com",
          name: "phone",
          value: csmsFunctional.encrypt(response[0].PHONE),
        };
        cookie[3] = {
          url: "http://www.github.com",
          name: "email",
          value: csmsFunctional.encrypt(response[0].EMAIL),
        };
        cookie[4] = {
          url: "http://www.github.com",
          name: "user_type",
          value: csmsFunctional.encrypt(response[0].USER_TYPE),
        };
      } else {
        cookie[0] = {
          url: "http://www.github.com",
          name: "user_id",
          value: csmsFunctional.encrypt(0),
        };
        cookie[1] = {
          url: "http://www.github.com",
          name: "name",
          value: csmsFunctional.encrypt(" "),
        };
        cookie[2] = {
          url: "http://www.github.com",
          name: "phone",
          value: csmsFunctional.encrypt(0),
        };
        cookie[3] = {
          url: "http://www.github.com",
          name: "email",
          value: csmsFunctional.encrypt(0),
        };
        cookie[4] = {
          url: "http://www.github.com",
          name: "user_type",
          value: csmsFunctional.encrypt("U"),
        };
      }
      for (let i = 0; i < cookie.length; i++) {
        session.defaultSession.cookies.set(cookie[i]);
      }
      event.returnValue = csmsFunctional.passData(true, "", isMatched);
      break;
    case "setPageTo":
      session.defaultSession.cookies.set({
        url: "http://www.github.com",
        name: "pageTo",
        value: csmsFunctional.encrypt(arg.page),
      });
      if (arg.page === "student_profile")
        session.defaultSession.cookies.set({
          url: "http://www.github.com",
          name: "rollNumber",
          value: csmsFunctional.encrypt(arg.rollNumber),
        });
      event.returnValue = csmsFunctional.passData(true, "", true);
      break;
    case "getPageTo":
      session.defaultSession.cookies
        .get({ url: "http://www.github.com" })
        .then((cookies) => {
          let index = cookies.findIndex(function (item, i) {
            return item.name === "pageTo";
          });
          let data = { pageType: csmsFunctional.decrypt(cookies[index].value) };
          if (data.pageType === "student_profile") {
            index = cookies.findIndex(function (item, i) {
              return item.name === "rollNumber";
            });
            data.rollNumber = csmsFunctional.decrypt(cookies[index].value);
          }
          event.returnValue = csmsFunctional.passData(true, "", data);
        })
        .catch((error) => {
          console.log("\x1b[33m%s\x1b[0m", error.message);
          console.log(
            "\x1b[31m%s\x1b[0m",
            "WARNING: There was an problem in cookies. Kindly restart the application."
          );
          app.quit();
        });
      break;
    case "clearPageTo":
      session.defaultSession.cookies.set({
        url: "http://www.github.com",
        name: "pageTo",
        value: csmsFunctional.encrypt("0"),
      });
      session.defaultSession.cookies.set({
        url: "http://www.github.com",
        name: "rollNumber",
        value: csmsFunctional.encrypt("0"),
      });
      event.returnValue = csmsFunctional.passData(false, "", "");
      break;
    case "getCookie":
      session.defaultSession.cookies
        .get({ url: "http://www.github.com" })
        .then((cookies) => {
          let index = cookies.findIndex(function (item, i) {
            return item.name === arg.name;
          });
          event.returnValue = csmsFunctional.passData(
            true,
            "",
            csmsFunctional.decrypt(cookies[index].value)
          );
        });
      break;
    case "updateUsername":
      response = await cmnModel.runQuery(
        `UPDATE USER SET NAME='` + arg.usrname + `' WHERE USER_ID=` + arg.userid
      );
      if (response) {
        let cookie = {
          url: "http://www.github.com",
          name: "name",
          value: csmsFunctional.encrypt(arg.usrname),
        };
        session.defaultSession.cookies.set(cookie);
      }
      event.returnValue = csmsFunctional.passData(
        response == 1 ? true : false,
        "",
        arg
      );
      break;
      
    case "dashboardImg":
      response = await cmnModel.runQuery(
        ` SELECT DASHBOARD_IMG FROM USER WHERE USER_ID=` + arg.userid
      ); 
      event.returnValue = csmsFunctional.passData(true, "", response );
      break;
    case "updatePassword":
      if (
        arg.cPassword !== null &&
        arg.cPassword !== "" &&
        arg.cPassword !== undefined &&
        arg.nPassword !== null &&
        arg.nPassword !== "" &&
        arg.nPassword !== undefined
      ) {
        arg.cPassword = csmsFunctional.encrypt(arg.cPassword);
        arg.nPassword = csmsFunctional.encrypt(arg.nPassword);
        response = await usrModel.select(
          " USER_ID=" + arg.userid + " and PASSWORD='" + arg.cPassword + "'"
        );
        isMatched = response.length > 0 ? true : false;
        if (isMatched)
          response = await cmnModel.runQuery(
            `UPDATE USER SET PASSWORD='` +
              arg.nPassword +
              `' WHERE USER_ID=` +
              arg.userid +
              ` AND PASSWORD='` +
              arg.cPassword +
              `'`
          );
        else response = 0;
      } else response = 0;
      event.returnValue = csmsFunctional.passData(
        response == 1 ? true : false,
        "",
        arg
      );
      break;
      case "updateEmail":
        if (
          arg.password !== null &&
          arg.password !== "" &&
          arg.password !== undefined &&
          arg.email !== null &&
          arg.email !== "" &&
          arg.email !== undefined
        ) {
          arg.password = csmsFunctional.encrypt(arg.password); 
          response = await usrModel.select( " USER_ID=" + arg.userid + " and PASSWORD='" + arg.password + "'"   );
          isMatched = response.length > 0 ? true : false;
          if (isMatched)
            response = await cmnModel.runQuery(  `UPDATE USER SET EMAIL='` +  arg.email + `' WHERE USER_ID=` +  arg.userid +  ` AND PASSWORD='` + arg.password +  `'`  );
          else response = 0;
        } else response = 0;
        event.returnValue = csmsFunctional.passData( response == 1 ? true : false, "",  arg  );
        break;
     
      default:
      event.returnValue = csmsFunctional.passData(
        false,
        "action not defined for user route",
        csmsFunctional.encrypt(arg.page)
      );
  }
});
