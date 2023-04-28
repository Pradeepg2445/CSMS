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

ipcMain.on("transaction", async (event, arg) => {
    switch (arg.action) {
      case "issueBook":
        let saveJson = arg.data;
        response = await bokModel.selectChildBook(
          " CHLBK_ID='" + saveJson.CHLBK_ID + "'"
        );
        if (response.length > 0) saveJson.MSTBK_ID = response[0].MSTBK_ID;
        response = await tranModel.insert(saveJson);
        if (response == 1)
          response = await bokModel.updateChildBook({
            setValue: " BK_STATUS='ISSUED'",
            chlbkId: saveJson.CHLBK_ID,
          });
        event.returnValue = csmsFunctional.passData(
          response == 1 ? true : false,
          "",
          arg
        );
        break;
      case "reciveLog":
        if (arg.data.recType === "R")
          response = await cmnModel.raw(
            `SELECT A.TRANS_ID, A.MSTBK_ID, A.CHLBK_ID, A.ROLL_NO, B.BOOK_NAME as NAME, C.NAME as TOPNAME, C.BATCH, C.COURSE,  A.FROM_DATE, A.TO_DATE, A.REMARKS, A.GIVEN_ON FROM 'TRANSACTION' A LEFT JOIN 'MASTER_BOOK' B ON A.MSTBK_ID=B.MSTBK_ID LEFT JOIN 'STUDENT' C ON A.ROLL_NO=C.ROLL_NO WHERE A.ROLL_NO='` +
              arg.data.idValue +
              `'  ORDER BY A.TRANS_ID DESC LIMIT 100`
          );
        else if (arg.data.recType === "C")
          response = await cmnModel.raw(
            `SELECT A.TRANS_ID, A.MSTBK_ID, A.CHLBK_ID, A.ROLL_NO, B.NAME,C.BOOK_NAME as TOPNAME, C.AUTHOR, A.FROM_DATE, A.TO_DATE, A.REMARKS, A.GIVEN_ON FROM 'TRANSACTION' A LEFT JOIN 'STUDENT' B ON  A.ROLL_NO=B.ROLL_NO LEFT JOIN 'MASTER_BOOK' C ON A.MSTBK_ID=C.MSTBK_ID WHERE A.CHLBK_ID='` +
              arg.data.idValue +
              `' ORDER BY A.TRANS_ID DESC LIMIT 100 `
          );
        event.returnValue = csmsFunctional.passData(true, "", response);
        break;
      case "receiveBook":
        response = await bokModel.updateChildBook({
          setValue: `BK_STATUS='IN_STOCK'`,
          chlbkId: arg.data.chlbkId,
        });
        if (response)
          response = await cmnModel.runQuery(
            `UPDATE  'TRANSACTION' SET GIVEN_ON='` +
              csmsFunctional.getNow() +
              `' WHERE TRANS_ID=` +
              arg.data.transId +
              ` AND CHLBK_ID='` +
              arg.data.chlbkId +
              `' AND ROLL_NO='` +
              arg.data.rollNumber +
              `'`
          );
        event.returnValue = csmsFunctional.passData(true, "", response);
        break;
      default:
        event.returnValue = csmsFunctional.passData(
          false,
          "action not defined for transaction route",
          arg
        );
    }
  });
  