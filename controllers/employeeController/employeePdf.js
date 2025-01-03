const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Sequelize = require("sequelize");
const CompanyMaster = require("../models/admin/company_master");
const ClientMaster = require("../models/admin/client_master");
const NewRegistration = require("../models/admin/new_registration");
const NewRegistrationDocuments = require("../models/admin/new_registration_documents");
const ClientAddress = require("../models/admin/client_addresses");
const EPF = require("../models/admin/epf");
const EPS = require("../models/admin/eps");
const Form2 = require("../models/admin/form2");
const Form11 = require("../models/admin/form11");
const Form11KYC = require("../models/admin/form11_kyc");
const Op = Sequelize.Op;
const fileHelper=require('../utils/file');
const ClientContact = require("../models/admin/client_contact");
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path');
var pdf        = require('html-pdf');
var options    = {format:'A4'};
exports.employeePdf = catchAsyncErrors(async(req,res,next) =>{
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
    const employee = await NewRegistration.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster,NewRegistrationDocuments]});
   
    const pdfDoc = new PDFDocument();
    const invoiceName = 'id-' + '.pdf';
    const invoicePath = path.join('uploads', invoiceName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    const logoPath = employee.photo;
    // const photoPath = path.join('output', 'aa.jpg');
    // const bgPath = path.join('output', 'bb.jpg');
    pdfDoc.image(logoPath, 510, 60, { width: 50, height: 50, align:'right' })
    .rect(510, 60, 50, 50)
    .stroke();

    pdfDoc.text('Employee Registration Form',10,20,{
        align:'center',
        width:610,
        height:20
    })
    pdfDoc.text('Employee General Information',20,70,{
        align:'left',
        width:610,
        height:20,
        underline:true
    })
    pdfDoc.end();
});

exports.employeePdfWithout = catchAsyncErrors(async(req,res,next) =>{
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
    const employee = await NewRegistration.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster,NewRegistrationDocuments]});
   
    res.render('admin/test_employee_view',{
        message:'',      
        employee
    },function(err,html){
        pdf.create(html, options).toFile('./demopdf.pdf', function(err, result) {
            if (err){
                return console.log(err);
            }
             else{
            // console.log(res);
            var datafile = fs.readFileSync('./demopdf.pdf');
            res.header('content-type','application/pdf');
            res.send(datafile);
             }
          });
    });
});