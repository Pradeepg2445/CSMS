const sqlite3 = require("sqlite3");
//const path = require('path')
// let dbFile = path.join(app.getAppPath(), 'db', 'csms.db')

  let db = new sqlite3.Database(
    "./resources/app/db/csms.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("\x1b[33m%s\x1b[0m",err.message);
      } else{
        console.log("\x1b[32m%s\x1b[0m","CSMS database connected")
      }
    }
  );
  

  
  module.exports = {db}
