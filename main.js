console.log("\x1b[42m%s\x1b[0m","Welcome to Combained Student Management System - CSMS");
const { app, BrowserWindow, session,dialog, electron } = require('electron')
 
const csmsFunctional = require('./csms_utilities/functional') 
const bookRoute = require('./routes/book')
const studentRoute = require('./routes/student')
const userRoute = require('./routes/user')
const transactionRoute = require('./routes/transaction')
const commonRoute = require('./routes/common')
const path = require('path') 
 
var db;

app.on('ready', async () => {
  csmsFunctional.consoleMessage("message","app ready");
  
  db= require('./csms_utilities/database').db
  

  let main = null
  let loading = new BrowserWindow({
    show: false, frame: false,
    icon:path.join(app.getAppPath(), 'image' ,'graduate.png'),
    movable: false, width: 550, height: 188,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  loading.once('show', async () => {
    main = new BrowserWindow({
      show: false, title: "Loading...",
      icon:path.join(app.getAppPath(), 'image' ,'graduate.png'),
      autoHideMenuBar: true,
      transparent: true, // For smooth window load
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    main.webContents.once('dom-ready', async () => {
      csmsFunctional.consoleMessage("message","main window ready")

      main.show()
        loading.hide()
        loading.close()
      

      //main.webContents.openDevTools()

    })

    if (initCookie()) csmsFunctional.consoleMessage("message","Cookie initialized")


    let isOldApp = await initDatabase();
    if (isOldApp.data) {
      
      main.loadFile( path.join(app.getAppPath(), 'views' ,'login.html'))
      
    } else {
      main.loadFile( path.join(app.getAppPath(), 'views' ,'signup.html'))
    }
    main.maximize();

  })


  loading.loadFile( path.join(app.getAppPath(), 'views' ,'loading_page.html')).then(() => {
    loading.show()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    try {
      db.close();
       csmsFunctional.consoleMessage("message","CSMS database connection closed")
    } catch (e) {
      csmsFunctional.consoleMessage("warning",e.message)
    }
    app.quit()    
    csmsFunctional.consoleMessage("message","app closed")
   console.log("\x1b[42m%s\x1b[0m","Thank you for using Combained Student Management System - CSMS");
  }
})


function initCookie() {
  try { 
  var cookie=[];
  cookie[0]={url: 'http://www.github.com', name: 'user_id', value: csmsFunctional.encrypt(0) }
  cookie[1]={url: 'http://www.github.com', name: 'name', value: csmsFunctional.encrypt(" ") }
  cookie[2]={url: 'http://www.github.com', name: 'phone', value: csmsFunctional.encrypt(0) }
  cookie[3]={url: 'http://www.github.com', name: 'email', value: csmsFunctional.encrypt(0) }
  cookie[4]={url: 'http://www.github.com', name: 'user_type', value: csmsFunctional.encrypt('U') }
  cookie[5]={url: 'http://www.github.com', name: 'pageTo', value: csmsFunctional.encrypt('0') }
  for(let i=0;i<cookie.length;i++){
    session.defaultSession.cookies.set(cookie[i])
  }
    return true;
  } catch (e) {    
    csmsFunctional.consoleMessage("warning",e.message)
    return false;
  }
}

async function initDatabase() { // workes only before bundling
  return new Promise(  async (resolve, reject) => {
    await db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS  "CSMS_DETAILS" ( "ID" INTEGER, "KEY"	TEXT NOT NULL, "VALUE" TEXT NOT NULL, PRIMARY KEY("ID" AUTOINCREMENT))`)
        db.run(`CREATE TABLE IF NOT EXISTS  "USER" ( "USER_ID"	INTEGER, "NAME"	TEXT NOT NULL, "PHONE"	INTEGER NOT NULL, "EMAIL"	TEXT NOT NULL UNIQUE, "PASSWORD" TEXT NOT NULL, "USER_TYPE"	TEXT NOT NULL DEFAULT 'N', "DASHBOARD_IMG" TEXT, PRIMARY KEY("USER_ID" AUTOINCREMENT) )`)
        db.run(`CREATE TABLE IF NOT EXISTS  "STUDENT" ( "ROLL_NO"	TEXT NOT NULL, "NAME"	TEXT NOT NULL, "COURSE"	TEXT NOT NULL, "BATCH"	TEXT NOT NULL, "DOB"	TEXT NOT NULL, "GENDER"	TEXT NOT NULL, "BLOOD_GROUP"	TEXT, "PHONE"	TEXT NOT NULL, "EMAIL"	TEXT, "ADDRESS"	TEXT, "FATHER_NAME"	TEXT, "MOTHER_NAME"	TEXT, "ADDDATE"	TEXT NOT NULL, PRIMARY KEY("ROLL_NO") )`)
        db.run(`CREATE TABLE IF NOT EXISTS  "MASTER_BOOK" ( "MSTBK_ID"	INTEGER, "BOOK_NAME"	TEXT NOT NULL, "AUTHOR"	TEXT NOT NULL, "PUBLICATION"	TEXT NOT NULL, "PRICE"	INTEGER NOT NULL, PRIMARY KEY("MSTBK_ID" AUTOINCREMENT) )`)
        db.run(`CREATE TABLE IF NOT EXISTS  "CHILD_BOOK" ( "MSTBK_ID"	INTEGER NOT NULL, "CHLBK_ID"	TEXT NOT NULL, "REMARKS"	TEXT, "BK_ADDDATE"	TEXT, "BK_STATUS"	TEXT NOT NULL DEFAULT 'IN_STOCK', PRIMARY KEY("CHLBK_ID"))`)
        db.run(`CREATE TABLE IF NOT EXISTS  "TRANSACTION" ( "TRANS_ID"	INTEGER, "MSTBK_ID"	INTEGER NOT NULL, "CHLBK_ID"	TEXT NOT NULL, "ROLL_NO"	TEXT NOT NULL, "FROM_DATE"	TEXT NOT NULL, "TO_DATE"	TEXT NOT NULL, "GIVEN_ON"	TEXT, "REMARKS"	TEXT , PRIMARY KEY("TRANS_ID" AUTOINCREMENT))`)
    });

    await  db.serialize(()=>{        
      db.all( `SELECT * FROM  CSMS_DETAILS`, (err, rows) => {
        if (err) {              
csmsFunctional.consoleMessage("warning",err.message) ;

        }
        if(rows.length>0){ 
          db.run(`UPDATE  CSMS_DETAILS SET "KEY"="NAME", "VALUE"="CSMS" WHERE id=1`)
          db.run(`UPDATE  CSMS_DETAILS SET "KEY"="DESCRIPTION", "VALUE"="Combined Student Management System" WHERE id=2`)
          db.run(`UPDATE  CSMS_DETAILS SET "KEY"="AUTHOR", "VALUE"="PRADEEP G" WHERE id=3`)
          db.run(`UPDATE  CSMS_DETAILS SET "KEY"="AUTHOR_PROFILE", "VALUE"="https://github.com/Pradeepg2445" WHERE id=4`)
          db.run(`UPDATE  CSMS_DETAILS SET "KEY"="LICENSE", "VALUE"="MIT" WHERE id=5`)
          db.run(`UPDATE  CSMS_DETAILS SET "KEY"="APP_VERSION", "VALUE"="1.0.0" WHERE id=6`)
          db.run(`UPDATE  CSMS_DETAILS SET "KEY"="DB_VERSION", "VALUE"="1.0.0" WHERE id=7`)
          db.run(`UPDATE  CSMS_DETAILS SET "KEY"="SECRETKEY_NO", "VALUE"="1" WHERE id=8`)
          db.run(`UPDATE  CSMS_DETAILS SET "KEY"="DATABASE", "VALUE"="sqlite3" WHERE id=9`)
              
csmsFunctional.consoleMessage("message","Updating application info")
        }else{
          db.run(`INSERT INTO CSMS_DETAILS("KEY","VALUE") VALUES("NAME","CSMS"),("DESCRIPTION","Combined Student Management System"),("AUTHOR","PRADEEP G"),
          ("AUTHOR_PROFILE","https://github.com/Pradeepg2445"),("LICENSE","MIT"),("APP_VERSION","1.0.0"),("DB_VERSION","1.0.0"),("SECRETKEY_NO","1"),("DATABASE","sqlite3")`)
          csmsFunctional.consoleMessage("message","Inserting application info")   
        }
        // rows.forEach((row) => {
        //    console.log(row.length);
        // });
      }); 
    
      let sql = `SELECT * FROM  USER WHERE USER_TYPE=?`
        db.all(sql, ['A'], (err, rows) => {
          if (err) {
            csmsFunctional.consoleMessage("warning",err.message)              
            reject(csmsFunctional.passData(false, err.message, ""))
          }
          resolve(csmsFunctional.passData(true, "", rows.length >= 1))
          // rows.forEach((row) => {
          //    console.log(row.length);
          // });
        });
    })
  }).catch ((err)=>{
    csmsFunctional.consoleMessage("warning",err.message) 
    reject(passData(false, err.message, ""))
  })
}
