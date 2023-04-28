const {  app, ipcMain, dialog, session } = require("electron"); 
const path = require("path"); 
const fs = require('fs'); 
//let dbFile = path.join(app.getAppPath(), 'resources', 'app','db', 'csms.db')
const csmsFunctional = require("../csms_utilities/functional");
const usrModel = require("../model/user");
const bokModel = require("../model/book");
const stdModel = require("../model/student");
const tranModel = require("../model/transaction");
const cmnModel = require("../model/common");  
var response;



ipcMain.on("book", async (event, arg) => {
  switch (arg.action) {
    case "addMasterBook":
      if (arg.data.type === "add")
        response = await bokModel.insertMasterBook(arg.data);
      else response = await bokModel.updateMasterBook(arg.data);
      event.returnValue = csmsFunctional.passData(
        response == 1 ? true : false,
        "",
        arg
      );
      break;
    case "masterBookView":
      response = await bokModel.selectMasterBook(arg.data);
      if (response.length > 0) {
        for (var k = 0; k < response.length; k++) {
          let response1 = await cmnModel.raw(
            `SELECT COUNT(*) as TOTAL FROM CHILD_BOOK WHERE MSTBK_ID=` +
              response[k].MSTBK_ID
          );
          response[k].TOTAL = response1.length === 0 ? 0 : response1[0].TOTAL;
          let response2 = await cmnModel.raw(
            `SELECT COUNT(*) as AVAIL FROM 'TRANSACTION' WHERE MSTBK_ID=` +
              response[k].MSTBK_ID +
              ` AND (GIVEN_ON IS NULL OR GIVEN_ON = '')`
          );
          response[k].AVAIL =
            response2.length === 0
              ? response1[0].TOTAL
              : response1[0].TOTAL - response2[0].AVAIL;
        }
      }
      event.returnValue = csmsFunctional.passData(true, "", response);
      break;
    case "deleteMasterBook":
      
    response = await cmnModel.runQuery("DELETE FROM 'TRANSACTION' WHERE MSTBK_ID  ='"+arg.mastbkId+"'")
    response = await cmnModel.runQuery( "DELETE FROM CHILD_BOOK  WHERE MSTBK_ID  ='"+arg.mastbkId+"'")  
      response = await cmnModel.runQuery(  "DELETE FROM MASTER_BOOK WHERE MSTBK_ID='" + arg.mastbkId + "'" );
      event.returnValue = csmsFunctional.passData(
        response == 1 ? true : false,
        "",
        arg
      );
      break;
    case "allMasterBook":
      query = "SELECT DISTINCT MSTBK_ID, BOOK_NAME FROM MASTER_BOOK";
      response = await cmnModel.raw(query);
      event.returnValue = csmsFunctional.passData(true, "", response);
      break;
    case "addChildBook":
      response = await bokModel.insertChildBook(arg.data);
      event.returnValue = csmsFunctional.passData(
        response == 1 ? true : false,
        "",
        arg
      );
      break;
    case "childBookView":
      response = await cmnModel.raw(
        " SELECT A. MSTBK_ID, A.CHLBK_ID,A.REMARKS, A.BK_STATUS, B.BOOK_NAME, B.AUTHOR FROM CHILD_BOOK A INNER JOIN MASTER_BOOK B ON A.MSTBK_ID=B.MSTBK_ID WHERE " +
          arg.data
      );
      event.returnValue = csmsFunctional.passData(true, "", response);
      break;
    case "deleteChildBook":  
    response = await cmnModel.runQuery( "DELETE FROM 'TRANSACTION' WHERE CHLBK_ID ='"+arg.chlbkId+"'"  ); 
    response = await cmnModel.runQuery(  "DELETE FROM CHILD_BOOK WHERE CHLBK_ID='" + arg.chlbkId + "'"   ); 
      event.returnValue = csmsFunctional.passData(  response == 1 ? true : false,  "", arg   );
      break;
    case "checkchlbkId":
      response = await bokModel.selectChildBook(
        " CHLBK_ID='" + arg.chlbkId + "'"
      );
      let isMatched = parseInt(response.length) === 0 ? false : true;
      event.returnValue = csmsFunctional.passData(true, "", isMatched);
      break;
    case "listChlbkId":
      response = await cmnModel.raw(
        "SELECT DISTINCT CHLBK_ID FROM CHILD_BOOK WHERE CHLBK_ID LIKE '%" +
          arg.chlbkId +
          "%' LIMIT 7"
      );
      event.returnValue = csmsFunctional.passData(true, "", response);
      break;
    case "loadBokForIsuBk":
      let returnJson = {};
      response = await cmnModel.raw(
        "SELECT  MSTBK_ID, REMARKS, BK_STATUS FROM CHILD_BOOK WHERE CHLBK_ID = '" +
          arg.chlbkId +
          "'"
      );
      if (response.length > 0) {
        returnJson = {
          REMARKS: response[0].REMARKS,
          STATUS: response[0].BK_STATUS,
          BOOK_NAME: "",
          AUTHOR: "",
          PRICE: "",
        };
        if (response[0].BK_STATUS === "ISSUED") {
          let response2 = await cmnModel.raw(
            "SELECT  DISTINCT ROLL_NO FROM 'TRANSACTION' WHERE CHLBK_ID='" +
              arg.chlbkId +
              "' AND (GIVEN_ON IS NULL OR GIVEN_ON = '') "
          );
          returnJson.STATUS = response2[0].ROLL_NO;
        }
        response = await bokModel.selectMasterBook(
          " MSTBK_ID=" + response[0].MSTBK_ID
        );
        if (response.length > 0) {
          returnJson.BOOK_NAME = response[0].BOOK_NAME;
          returnJson.AUTHOR = response[0].AUTHOR;
          returnJson.PRICE = response[0].PRICE;
        }
      }
      event.returnValue = csmsFunctional.passData(true, "", returnJson);
      break;
    default:
      event.returnValue = csmsFunctional.passData(
        false,
        "action not defined for book route",
        arg
      );
  }
});
