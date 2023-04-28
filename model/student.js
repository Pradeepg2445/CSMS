const { app, BrowserWindow, session } = require('electron')
const csmsFunctional = require("../csms_utilities/functional");
const sqlite3 = require("sqlite3");
//const path = require('path')
//let dbFile = path.join(app.getAppPath(), 'db', 'csms.db')
var db= require('../csms_utilities/database').db


module.exports = {



  async  deleteQuery(data) {
    return new Promise((resolve, reject) => {
      db.all("DELETE  FROM  STUDENT WHERE " + data, (err) => {
        if (err) {
          console.log("\x1b[33m%s\x1b[0m",err.message);
          return resolve(0);
        }
        return resolve(1);
      });
    });
  },


  async insert(data) {
    data.rollNumber=(data.rollNumber).toUpperCase()


    return new Promise(async (resolve, reject) => {
     let tempRow=await this.select(" ROLL_NO='"+data.rollNumber+"'")
     if(tempRow.length==0){
      db.run(
          `INSERT INTO STUDENT (ROLL_NO, NAME, COURSE, 
              BATCH, DOB, GENDER, BLOOD_GROUP, PHONE, EMAIL,
              ADDRESS, FATHER_NAME, MOTHER_NAME, ADDDATE) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [ data.rollNumber,data.name, data.course, data.batch, data.dob, data.gender,data.bloodGroup, data.phone,data.email, 
              data.address, data.fatherName, data.motherName,  csmsFunctional.getNow()],
          (err) => {
            if (err) {
              console.log("\x1b[33m%s\x1b[0m",err.message);
              resolve(0);
            } else resolve(1);
          }
        );
       } else{
        db.run(
          `UPDATE  STUDENT SET NAME='`+data.name+`', COURSE='`+data.course+`', 
              BATCH='`+data.batch+`', DOB='`+data.dob+`', GENDER='`+data.gender+`', BLOOD_GROUP='`+data.bloodGroup
              +`', PHONE='`+data.phone+`', EMAIL='`+data.email+`',
              ADDRESS='`+data.address+`', FATHER_NAME='`+data.fatherName+`', MOTHER_NAME='`+data.motherName+`', ADDDATE='`+tempRow.ADDDATE+`' WHERE ROLL_NO='`+data.rollNumber+`'`,
         
          (err,rows) => {
            console.log(rows,"rowsrows")
            if (err) {
              console.log("\x1b[33m%s\x1b[0m",err.message);
              resolve(0);
            } else resolve(1);
          }
        );

       }
    });
  },
  

  async deleteTrigger(data) {
    return new Promise(async (resolve, reject) => { 
      try{
        await db.serialize(() => {
           db.run("DELETE FROM 'TRANSACTION' WHERE ROLL_NO IN ("+data.rlno+")")
           db.run( "UPDATE CHILD_BOOK SET BK_STATUS='IN_STOCK' WHERE CHLBK_ID IN ("+data.chlid+")") 
           db.run( "DELETE FROM STUDENT WHERE ROLL_NO IN ("+data.rlno+")") 
            })  
            resolve(1) 
      }catch(err){
        console.log("\x1b[33m%s\x1b[0m",err.message);
        resolve(0); 
      } 
    });
  },
   
  async select(data) {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM  STUDENT WHERE " + data +" ORDER BY ROLL_NO", (err, rows) => {
        if (err) {
          console.log("\x1b[33m%s\x1b[0m",err.message);
          return resolve([]);
        }
        return resolve(rows);
      });
    });
  },
  
  
};
