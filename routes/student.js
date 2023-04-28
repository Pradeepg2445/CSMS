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


ipcMain.on("student", async (event, arg) => {
    switch (arg.action) {
      case "deleteBatch": 
        if (arg.password !== null &&  arg.password !== "" && arg.password !== undefined ) {
          arg.password = csmsFunctional.encrypt(arg.password); 
          response = await usrModel.select( " USER_ID=" + arg.userid + " and PASSWORD='" + arg.password + "'"   );
         let isMatched = response.length > 0 ? true : false;
          if (isMatched){
            let rollNumber=[],rlno="",  chlbkId=[],chlid=""
            response=await stdModel.select("  COURSE='"+arg.course+"' AND BATCH='" + arg.batch + "'");  
            if(response.length===0){
                response=3 
            }else{ 
          response.map((val,inx)=>{ rollNumber.push("'"+val.ROLL_NO+"'")   })
          rlno=rollNumber.join(", ")
          response=await cmnModel.raw(" SELECT DISTINCT CHLBK_ID FROM 'TRANSACTION' WHERE ROLL_NO IN("+rlno+")"); 
          if(response.length>0){  
            response.map((val,inx)=>{ chlbkId.push("'"+val.CHLBK_ID+"'")   })
            chlid=chlbkId.join(", ") 
            response=await stdModel.deleteTrigger({chlid,rlno});
          } 
            }
          } 
           else response = 0;
        } else response = 0;
        event.returnValue = csmsFunctional.passData(true, "",   response  ); 
        break;
        case "addStudent":
          response = await stdModel.insert(arg.data);
          event.returnValue = csmsFunctional.passData(
            response == 1 ? true : false,
            "",
            arg
          );
          break;
      case "checkRollNumber":
        response = await stdModel.select(" ROLL_NO='" + arg.rollNumber + "'");
        let isMatched = parseInt(response.length) === 0 ? false : true;
        event.returnValue = csmsFunctional.passData(true, "", isMatched);
        break;
      case "studentView":
        query = arg.filter;
        response = await stdModel.select(query);
        event.returnValue = csmsFunctional.passData(true, "", response);
        break;
      case "allBatch":
        query =
          "SELECT DISTINCT BATCH FROM STUDENT WHERE COURSE='" + arg.course + "'";
        response = await cmnModel.raw(query);
        event.returnValue = csmsFunctional.passData(true, "", response);
        break;
      case "listRollNumber":
        response = await cmnModel.raw(
          "SELECT DISTINCT ROLL_NO FROM STUDENT WHERE ROLL_NO LIKE '%" +
            arg.rollNumber +
            "%'  LIMIT 7"
        );
        event.returnValue = csmsFunctional.passData(true, "", response);
        break;
      case "deleteStudent":
        let chlbkId=[], chlid;
        response=await cmnModel.raw(" SELECT DISTINCT CHLBK_ID FROM 'TRANSACTION' WHERE ROLL_NO IN('"+arg.rollNumber+"')"); 
        if(response.length>0){  
          response.map((val,inx)=>{ chlbkId.push("'"+val.CHLBK_ID+"'")   })
          chlid=chlbkId.join(", ") 
          response=await stdModel.deleteTrigger({chlid,rlno:"'"+arg.rollNumber+"'"});
        } 
          response = await stdModel.deleteQuery( " ROLL_NO='" + arg.rollNumber + "'" );   
        event.returnValue = csmsFunctional.passData(  response == 1 ? true : false,  "",  arg  );
        break;
      case "loadStudForIsuBk":
        let returnJson = {};
        response = await stdModel.select(" ROLL_NO='" + arg.rollNumber + "'");
        if (response.length > 0) {
          returnJson = {
            NAME: response[0].NAME,
            COURSE: response[0].COURSE,
            BATCH: response[0].BATCH,
            PHONE: response[0].PHONE,
            STATUS: "",
            DEFAULTER: "",
          };
          response = await cmnModel.raw(
            "SELECT  CHLBK_ID, TO_DATE  FROM 'TRANSACTION' WHERE ROLL_NO='" +
              arg.rollNumber +
              "' AND (GIVEN_ON IS NULL OR GIVEN_ON = '') "
          );
          let STATUS = [],
            DEFAULTER = false;
          let q = new Date(),
            m = q.getMonth(),
            d = q.getDate(),
            y = q.getFullYear(),
            now = new Date(y, m, d);
          if (response.length > 0) {
            response.map((obj) => {
              STATUS.push(obj.CHLBK_ID);
              if (
                obj.TO_DATE == "" ||
                obj.TO_DATE == null ||
                obj.TO_DATE == undefined
              ) {
                // skip
              } else if (now > new Date(obj.TO_DATE)) DEFAULTER = true;
            });
            let temp = STATUS.join(", ");
            returnJson.STATUS =
              `<b style="color:red; font-size:11px;">` + temp + ` - taken</b>`;
          }
          returnJson.DEFAULTER = DEFAULTER;
        }
        event.returnValue = csmsFunctional.passData(true, "", returnJson);
        break;
      default:
        event.returnValue = csmsFunctional.passData(
          false,
          "action not defined for student route",
          arg
        );
    }
  });
  