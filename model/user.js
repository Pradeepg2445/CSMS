const { app, BrowserWindow, session } = require('electron')
const csmsFunctional = require("../csms_utilities/functional");
const sqlite3 = require("sqlite3");
//const path = require('path')
//let dbFile = path.join(app.getAppPath(), 'db', 'csms.db')
var db= require('../csms_utilities/database').db


module.exports = {
  async insert(name, phone, email, password) {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM  USER WHERE USER_TYPE=?", ["A"], (err, rows) => {
        if (err) {
          console.log("\x1b[33m%s\x1b[0m",err.message);
          return resolve(0);
        }
        db.run(
          `INSERT INTO USER (NAME, PHONE, EMAIL, PASSWORD, USER_TYPE) VALUES(?,?,?,?,?)`,
          [name, phone, email,csmsFunctional.encrypt(password), rows.length >= 1 ? "S" : "A"],
          (err) => {
            if (err) {
              console.log("\x1b[33m%s\x1b[0m",err.message);
              return 0;
            } else resolve(1);
          }
        );
      });
    });
  },
  async select(data) {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM  USER WHERE " + data, (err, rows) => {
        if (err) {
          console.log("\x1b[33m%s\x1b[0m",err.message);
          return resolve([]);
        }
        return resolve(rows);
      });
    });
  },  

 
};
