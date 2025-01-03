const express = require('express')
const dotenv = require('dotenv')
const errorHandlerMiddleware = require('./middleware/errorHandler')
const adminRoutes = require('./routes/adminRoutes')
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const app = express()
const sequelize = require('./utils/database')
const session = require('express-session')
const SessionStore = require('express-session-sequelize')(session.Store);
dotenv.config({path:'config/config.env'})
//set up ejs
app.set('view engine','ejs');
app.set('views','views');

const CompanyMaster = require('./models/admin/company_master')
const CompanyPvtLtd = require('./models/admin/company_pvtltd')
const CompanyDocuments = require('./models/admin/company_documents')
const ClientMaster = require('./models/admin/client_master')
const ClientDocuments = require('./models/admin/client_documents')
const ClientContact = require('./models/admin/client_contact')
const ClientAddress = require('./models/admin/client_addresses')


CompanyMaster.hasMany(CompanyPvtLtd,{foreignKey:'company_id'}); 
CompanyPvtLtd.belongsTo(CompanyMaster,{foreignKey:'company_id'});
//company master and company documents
CompanyMaster.hasMany(CompanyDocuments,{foreignKey:'company_id'}); 
CompanyDocuments.belongsTo(CompanyMaster,{foreignKey:'company_id'}); 
//client master and company master
CompanyMaster.hasMany(ClientMaster,{foreignKey:'company_id'}); 
ClientMaster.belongsTo(CompanyMaster,{foreignKey:'company_id'});
//client master and client documents
ClientMaster.hasMany(ClientDocuments,{foreignKey:'client_id'}); 
ClientDocuments.belongsTo(ClientMaster,{foreignKey:'client_id'});
//client master and client addresses
ClientMaster.hasMany(ClientAddress,{foreignKey:'client_id'}); 
ClientAddress.belongsTo(ClientMaster,{foreignKey:'client_id'});
//client master and client contacts
ClientMaster.hasMany(ClientContact,{foreignKey:'client_id'}); 
ClientContact.belongsTo(ClientMaster,{foreignKey:'client_id'});


app.use(express.urlencoded({parameterLimit: 1000000}));
//set up multer

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads');

    },
    filename: (req, file, cb) => {
        const date=new Date;
      cb(null, date.getTime() + '-' + file.originalname);
    }
  });
  
  // const fileFilter = (req, file, cb) => {
  //   if (
  //     file.mimetype === 'image/png' ||
  //     file.mimetype === 'image/jpg' ||
  //     file.mimetype === 'image/jpeg' ||
  //     file.mimetype === 'application/pdf' || 
  //     file.mimetype === 'application/vnd.ms-excel' ||
  //     file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  //   ) {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //   }
  // };
  // app.use(express.static(__dirname,'uploads'));

// const accessLogStream= fs.createWriteStream(
//     path.join(__dirname, 'access.log'),
//     {flags: 'a'}
//     );
app.use(
  // multer({storage:fileStorage, fileFilter:fileFilter})
  multer({storage:fileStorage})
       .any()
);

//set public as static
app.use(express.static(path.join(__dirname,'public')));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

//routes
//routes
app.get('/', (req,res) =>{
    res.render('index');
});

app.use('/admin',adminRoutes);

//error handling
app.use(errorHandlerMiddleware);
let server;
sequelize.sync().then(result =>{
 server = app.listen(process.env.PORT || 3000,()=>{
    console.log(`Server started at PORT ${process.env.PORT}`);
  //   setInterval(function () {
  //     sequelize.query('SELECT * FROM company_masters').then((com)=>{

  //     });
  // }, 90000);
});
});

// process.on('unhandledRejection',(err)=>{
//     console.log(`Error : ${err.message}`);
//     console.log('Shutting down the server due to unhandled promise rejection');
//     server.close(()=>{
//         process.exit(1);
//     });
// });
