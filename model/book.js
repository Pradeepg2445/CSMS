const { app, BrowserWindow, session } = require('electron')
const csmsFunctional = require("../csms_utilities/functional");
const sqlite3 = require("sqlite3");
//const path = require('path')
//let dbFile = path.join(app.getAppPath(), 'db', 'csms.db')
var db= require('../csms_utilities/database').db


module.exports = { 


  async insertMasterBook(data) {
    return new Promise(async (resolve, reject) => {
    
      db.run(
          `INSERT INTO MASTER_BOOK ( BOOK_NAME, AUTHOR, 
              PUBLICATION, PRICE) VALUES(?,?,?,?)`,
          [data.bookName, data.author, data.publication, data.price],
          (err) => {
            if (err) {
              console.log("\x1b[33m%s\x1b[0m",err.message);
              resolve(0);
            } else resolve(1);
          }
        );   
    });
  },
async updateMasterBook(data){ 
    return new Promise (async (resolve, reject )=>{
        db.run(
            `UPDATE  MASTER_BOOK SET BOOK_NAME='`+data.bookName+`', AUTHOR='`+data.author+`', 
            PUBLICATION='`+data.publication+`', PRICE=`+data.price+` WHERE MSTBK_ID=`+data.mastbkId,         
            (err,rows) => {
              if (err) {
                console.log("\x1b[33m%s\x1b[0m",err.message);
                resolve(0);
              } else resolve(1);
            }
          );
    })
},

  async insertChildBook(data) {
    return new Promise(async (resolve, reject) => {
     let tempRow=await this.selectChildBook(" CHLBK_ID='"+data.chlbkId+"'")
     if(tempRow.length==0){
      db.run(
          `INSERT INTO CHILD_BOOK (MSTBK_ID,CHLBK_ID, REMARKS, BK_ADDDATE) VALUES(?,?,?,?)`,
          [ data.mastbkId,data.chlbkId, data.remarks, csmsFunctional.getNow()],
          (err) => {
            if (err) {
              console.log("\x1b[33m%s\x1b[0m",err.message);
              resolve(0);
            } else resolve(1);
          }
        );
       } else{
        let a = await this.updateChildBook({setValue:`MSTBK_ID='`+data.mastbkId+`',  
        REMARKS='`+data.remarks+`', BK_ADDDATE='`+tempRow[0].BK_ADDDATE+`', BK_STATUS='`+tempRow[0].BK_STATUS+`'`, chlbkId:data.chlbkId })
        resolve(a)
       }
    });
  },


  
async updateChildBook(data){ 
  return new Promise (async (resolve, reject )=>{
      db.run(
          `UPDATE  CHILD_BOOK SET `+data.setValue+` WHERE CHLBK_ID='`+data.chlbkId+`'`,         
          (err,rows) => {
            if (err) {
              console.log("\x1b[33m%s\x1b[0m",err.message);
              resolve(0);
            } else resolve(1);
          }
        );
  })
},

  async selectMasterBook(data) {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM  MASTER_BOOK WHERE " + data , (err, rows) => {
        if (err) {
          console.log("\x1b[33m%s\x1b[0m",err.message);
          return resolve([]);
        }
        return resolve(rows);
      });
    });
  },

  async selectChildBook(data) {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM  CHILD_BOOK WHERE " + data , (err, rows) => {
        if (err) {
          console.log("\x1b[33m%s\x1b[0m",err.message);
          return resolve([]);
        }
        return resolve(rows);
      });
    });
  },
   
 

  
};
