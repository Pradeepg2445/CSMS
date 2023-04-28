const { app, BrowserWindow, session } = require('electron')
const csmsFunctional = require("../csms_utilities/functional");
const sqlite3 = require("sqlite3");
const { update } = require('./user');
//const path = require('path')
//let dbFile = path.join(app.getAppPath(), 'db', 'csms.db')
var db= require('../csms_utilities/database').db


module.exports = {  
  async raw(data) {
    return new Promise((resolve, reject) => {
      db.all( data , (err, rows) => {
        if (err) {
          console.log("\x1b[33m%s\x1b[0m",err.message);
          return resolve([]);
        }
        return resolve(rows);
      });
    });
  },  

  async runQuery(data) {
    return new Promise(async (resolve, reject) => { 
      db.run(data, (err) => {
            if (err) {
              console.log("\x1b[33m%s\x1b[0m",err.message);
              resolve(0);
            } else resolve(1);
          }
        );   
    });
  },

  async resetAppication() {
    return new Promise(async (resolve, reject) => { 
      try{
        await db.serialize(() => {
          db.run("DELETE FROM 'TRANSACTION'")
          db.run( "DELETE FROM CHILD_BOOK")
          db.run( "DELETE FROM MASTER_BOOK")
          db.run( "DELETE FROM STUDENT")
          db.run("DELETE FROM sqlite_sequence")
            }) 
           
            resolve(1)

      }catch(err){
        console.log("\x1b[33m%s\x1b[0m",err.message);
        resolve(0); 
      }
          
          
    });
  },

 
};
