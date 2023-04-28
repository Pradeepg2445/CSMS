const { app, BrowserWindow, session } = require('electron')
const csmsFunctional = require("../csms_utilities/functional");
const sqlite3 = require("sqlite3");
const { update } = require('./user');
//const path = require('path')
//let dbFile = path.join(app.getAppPath(), 'db', 'csms.db')
var db= require('../csms_utilities/database').db


module.exports = { 

  

  async insert(data) {
    return new Promise(async (resolve, reject) => {
    
      db.run(
          `INSERT INTO 'TRANSACTION' ( MSTBK_ID, CHLBK_ID, 
              ROLL_NO, FROM_DATE, TO_DATE, REMARKS) VALUES(?,?,?,?,?,?)`,
          [data.MSTBK_ID, data.CHLBK_ID, data.ROLL_NO, data.FROM_DATE, data.TO_DATE, data.REMARKS],
          (err) => {
            if (err) {
              console.log("\x1b[33m%s\x1b[0m",err.message);
              resolve(0);
            } else resolve(1);
          }
        );   
    });
  },
 
 
};
