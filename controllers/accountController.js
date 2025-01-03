const fs = require('fs')
const path = require('path');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const CompanyMaster = require('../models/admin/company_master');
const ClientMaster = require('../models/admin/client_master');
const TDSExemption = require('../models/admin/tds_exemption');
const TDSReturn = require('../models/admin/tds_return');
const GST = require('../models/admin/gst');
const LedgerDetails = require('../models/admin/ledger_details');
const Collection = require('../models/admin/collection');
const BillSummary = require('../models/admin/bill_summary');
const PDFDocument = require('pdfkit');
const readXlsxFile = require('read-excel-file/node');
const XLSX = require('xlsx');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
exports.getAccountsLedger = (req, res, next) => {
    try {
        res.render('admin/accounts-ledger');
    } catch (err) {
        console.log(err);
    }
};
exports.getTDSModule = (req, res, next) => {
    try {
        res.render('admin/tds_module');
    } catch (err) {
        console.log(err);
    }
};
exports.getReportModule = (req, res, next) => {
    try {
        res.render('admin/report_module');
    } catch (err) {
        console.log(err);
    }
};
exports.getReportsModule = (req, res, next) => {
    try {
        res.render('admin/reports_module');
    } catch (err) {
        console.log(err);
    }
};

exports.getTdsExemption = catchAsyncErrors( async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const tds = await TDSExemption.findAll({include:[CompanyMaster],order: [ [ 'id', 'DESC' ]]});
    res.render('admin/tds',{
        companies,
        tds
    });
   
});

exports.postTdsExemption = catchAsyncErrors( async (req, res, next) => {
    const {
        company,
        year
    } = req.body;

    await TDSExemption.create({
        company_id:company,
        year:year,
        document: req.files.length > 0 ? req.files[0].path : '' 
    });

    res.redirect('/admin/tds-exemption');
   
});

exports.getTdsExemptionEdit = catchAsyncErrors( async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const tds = await TDSExemption.findOne({where:{id:req.params.id},include:[CompanyMaster]});
    res.render('admin/tds-edit',{
        companies,
        tds
    });
   
});

exports.postTdsExemptionEdit = catchAsyncErrors( async (req, res, next) => {
    const {
        id,
        company,
        year
    } =req.body;
    const oldTds = await TDSExemption.findOne({where:{id:id},include:[CompanyMaster]});
   
    await TDSExemption.update({
        company_id:company,
        year:year,
        document: req.files.length > 0 ? req.files[0].path : oldTds.document 
    },{where:{id:id}});
   
    res.redirect('/admin/tds-exemption');

   
});
exports.deleteTdsExemption = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await TDSExemption.destroy({where:{id:id}});
    res.send('Successful');

  
});
//tds return 

exports.getTdsReturn = catchAsyncErrors( async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const tds = await TDSReturn.findAll({include:[CompanyMaster,ClientMaster],order: [ [ 'id', 'DESC' ]]});
    
        res.render('admin/tds-return',{
            companies,
            tds
        });
    
});

exports.postTdsReturn = catchAsyncErrors( async (req, res, next) => {
    const {
        company,
        client,
        year,
        quarter,
        reason,
        amount
    }= req.body;
    
    await TDSReturn.create({
        company_id:company,
        client_id:client=="" ? null : client ,
        year:year,
        quarter:quarter,
        reason:reason,
        amount:amount,
        document: req.files.length > 0 ? req.files[0].path : '' 
    });

    res.redirect('/admin/tds-return');
});

exports.getTdsReturnEdit = catchAsyncErrors( async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const tds = await TDSReturn.findOne({where:{id:req.params.id},include:[CompanyMaster,ClientMaster]});
    res.render('admin/tds-return-edit',{
        companies,
        tds
    });
    
});

exports.postTdsReturnEdit = catchAsyncErrors( async (req, res, next) => {
    const {
        id,
        company,
        client,
        amount,
        quarter,
        reason,
        year
    } =req.body;
    const oldTds = await TDSReturn.findOne({where:{id:id},include:[CompanyMaster,ClientMaster]});
   
    await TDSReturn.update({
        company_id:company,
        client_id:client=="" ? null : client ,
        year:year,
        quarter:quarter,
        reason:reason,
        amount:amount,
        document: req.files.length > 0 ? req.files[0].path : oldTds.document 
    },{where:{id:id}});
   
    res.redirect('/admin/tds-return');
    
});
exports.deleteTdsReturn = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await TDSReturn.destroy({where:{id:id}});
    res.send('Successful');

  
});
//gst
exports.getGst = catchAsyncErrors( async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const gsts = await GST.findAll({include:[CompanyMaster],order:[['id','DESC']]});
    res.render('admin/gst',{
        companies,
        gsts
    });   
    
});

exports.postGst = catchAsyncErrors( async (req, res, next) => {
    const {
        company,
        month_year
    }= req.body;
    
    const files = req.files;
    let form1='';
    let form1_details='';
    let form3b='';
    let payment_proof='';
   
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='form1'){
            form1=files[i].path;
        }else if(files[i].fieldname==='form1_details'){
            form1_details=files[i].path;
        }else if(files[i].fieldname==='form3b'){
            form3b=files[i].path;
        }else if(files[i].fieldname==='payment'){
            payment_proof=files[i].path;
        }
    }
    await GST.create({
        company_id:company,
        month_year:month_year,
        form1:form1,
        form1_details:form1_details,
        form3b:form3b,
        payment_proff:payment_proof,
    });

    res.redirect('/admin/gst');
});

exports.getGstEdit = catchAsyncErrors( async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const gsts = await GST.findOne({where:{id:req.params.id},include:[CompanyMaster]});

    res.render('admin/gst-edit',{
        companies,
        gsts
    });   
    
});


exports.postGstEdit = catchAsyncErrors( async (req, res, next) => {
    const {
        id,
        company,
        month_year
    }= req.body;
    const oldGst = await GST.findOne({where:{id:id},include:[CompanyMaster]});
    
    const files = req.files;
    let form1=oldGst.form1;
    let form1_details=oldGst.form1_details;
    let form3b=oldGst.form3b;
    let payment_proof=oldGst.payment_proff;
   
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='form1'){
            form1=files[i].path;
        }else if(files[i].fieldname==='form1_details'){
            form1_details=files[i].path;
        }else if(files[i].fieldname==='form3b'){
            form3b=files[i].path;
        }else if(files[i].fieldname==='payment'){
            payment_proof=files[i].path;
        }
    }
    await GST.update({
        company_id:company,
        month_year:month_year,
        form1:form1,
        form1_details:form1_details,
        form3b:form3b,
        payment_proff:payment_proof,
    },{where:{id:id}});

    res.redirect('/admin/gst');
});

exports.deleteGst = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await GST.destroy({where:{id:id}});
    res.send('Successful');

  
});
//ledger details

exports.getLedgerDetails = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const ledgers = await LedgerDetails.findAll({include:[CompanyMaster,ClientMaster],order:[['id','DESC']]});
    res.render('admin/ledger-details',{
        companies,
        ledgers
    });
    
});

exports.postLedgerDetails = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        client,
        balance,
        type,
        from_date,
        to_date
    }= req.body;
    
    await LedgerDetails.create({
        company_id:company,
        client_id:client=="" ? null : client ,
        from_date:from_date,
        to_date:to_date,
        type:type,
        balance:balance,
        document: req.files.length > 0 ? req.files[0].path : '' 
    });

    res.redirect('/admin/ledger-details');
    
});

exports.getLedgerDetailsEdit = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const ledger = await LedgerDetails.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster]});
    res.render('admin/ledger-details-edit',{
        companies,
        ledger
    });
    
});

exports.postLedgerDetailsEdit = catchAsyncErrors(async (req, res, next) => {
    const {
        id,
        company,
        client,
        balance,
        type,
        from_date,
        to_date
    }= req.body;
    const oldLedger = await LedgerDetails.findOne({where:{id:id},include:[CompanyMaster,ClientMaster]});
    
    await LedgerDetails.update({
        company_id:company,
        client_id:client=="" ? null : client ,
        from_date:from_date,
        to_date:to_date,
        type:type,
        balance:balance,
        document: req.files.length > 0 ? req.files[0].path : oldLedger.document 
    },{where:{id:id}});

    res.redirect('/admin/ledger-details');
    
});
exports.deleteLedger = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await LedgerDetails.destroy({where:{id:id}});
    res.send('Successful');

  
});

//reports

exports.getAccountsInsertReport = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const collections = await Collection.findAll({include:[CompanyMaster,ClientMaster],order:[['id','DESC']]});
    res.render('admin/accounts-insert-report',{
        companies,
        collections
    });
   
});

exports.postAccountsInsertReport = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        client,
        month_year,
        pf,
        esic,
        ptax,
        labour,
        service,
        others,
        total,
        gst,
    }= req.body;
    await Collection.create({
        company_id:company,
        client_id:client=="" ? null : client ,
        month_year:month_year,
        labour:labour,
        pf:pf,
        ptax:ptax,
        esic:esic,
        service:service,
        others:others,
        total:total,
        esic:esic,
        gst:gst
    });

    res.redirect('/admin/accounts-insert-report');
   
});


exports.getCollectionEdit = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const collection = await Collection.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster]});
    res.render('admin/collection_edit',{
        companies,
        collection
    });
    
});

exports.postCollectionEdit = catchAsyncErrors(async (req, res, next) => {
    const {
        id,
        company,
        client,
        month_year,
        pf,
        esic,
        ptax,
        labour,
        service,
        others,
        total,
        gst,
    }= req.body;
    await Collection.update({
        company_id:company,
        client_id:client=="" ? null : client ,
        month_year:month_year,
        labour:labour,
        pf:pf,
        ptax:ptax,
        esic:esic,
        service:service,
        others:others,
        total:total,
        esic:esic,
        gst:gst
    },{where:{id:id}});

    res.redirect('/admin/accounts-insert-report');
   
});
exports.downloadCollection = catchAsyncErrors(async (req, res, next) => {
    const collection = await Collection.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster]});
  
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];
    var dd=new Date(collection.month_year);
    var mm =  monthNames[dd.getMonth()];
    const invoiceName = 'collection_'+mm+'_'+dd.getFullYear()+'.pdf';
    const invoicePath = path.join('uploads', invoiceName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    const pdfDoc = new PDFDocument();

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
   
    pdfDoc.fontSize(15).font('Helvetica-Bold').text('Collection Report for the month of '+mm +' '+dd.getFullYear(), 20, 40, {
        align: 'center',
        underline:true,
        width: 550
    });   
    pdfDoc.moveDown();
    pdfDoc.fontSize(12);
    pdfDoc.font('Helvetica').text('Company : '+collection.company_master.company_name,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();

    pdfDoc.font('Helvetica').text('Client : '+collection.client_master.client_name,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Labour Payment : '+collection.labour,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('PF : '+collection.pf,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('ESIC : '+collection.esic,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('PTAX : '+collection.ptax,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Service Charge : '+collection.service,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('GST : '+collection.gst,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Others : '+collection.others,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica-Bold').text('Total Amount : '+collection.total,{
        align: 'left',
        width: 550,
        underline:false
    });       
    pdfDoc.moveDown();
    pdfDoc.fontSize(10);
    
   
    pdfDoc.end();    

  
});
exports.deleteCollection = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await Collection.destroy({where:{id:id}});
    res.send('Successful');

  
});

exports.getBillSummary = catchAsyncErrors( async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const bills = await BillSummary.findAll({include:[CompanyMaster,ClientMaster],
        order: [ [ 'id', 'DESC' ]],
        limit:30
    });     
    res.render('admin/bill_summary_module',{
        companies,
        message:'',
        bills
    });   
    
});

exports.postBillSummary = catchAsyncErrors( async (req, res, next) => {
    const {
        company,
        client,
        month,
        year,
        // bill_date,
        bill_no,
        total_bill,
        tds,
        // tds_out,        
        gst,
        // gst_out,
        pf,
        // pf_out,
        esic,
        // esic_out,
        ptax,
        // ptax_out,
        lwf,
        // lwf_out,
        service,
        // service_out,        
        net_profit,
        // net_profit_out,
    }= req.body;

    await BillSummary.create({
        company_id:company,
        client_id:client,
        // month_year,
        month,
        year,
        // bill_date:bill_date,
        bill_no:bill_no,
        total_bill,
        tds,
        // tds_out,
        gst,
        // gst_out,
        pf,
        // pf_out,
        esic,
        // esic_out,
        ptax,
        // ptax_out,
        lwf,
        // lwf_out,
        service,
        // service_out,
        net_profit,
        // net_profit_out
    });
    const companies = await CompanyMaster.findAll();
    const bills = await BillSummary.findAll({include:[CompanyMaster,ClientMaster],
        order: [ [ 'id', 'DESC' ]],
        limit:30
    });     
    res.render('admin/bill_summary_module',{
        companies,
        message:'Submitted Successfully',
        bills
    });   
  

});
exports.getBillSummaryEdit = catchAsyncErrors( async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const bill = await BillSummary.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster]});     
    res.render('admin/bill_summary_edit',{
        companies,
        message:'',
        bill
    });   
    
});

exports.postBillSummaryEdit = catchAsyncErrors( async (req, res, next) => {
    const {
        id,
        company,
        client,
        // month_year,
        month,
        year,
        // bill_date,
        bill_no,
        total_bill,
        tds,
        // tds_out,        
        gst,
        // gst_out,
        pf,
        // pf_out,
        esic,
        // esic_out,
        ptax,
        // ptax_out,
        lwf,
        // lwf_out,
        service,
        // service_out,        
        net_profit,
        // net_profit_out,
    }= req.body;

    await BillSummary.update({
        company_id:company,
        client_id:client,
        // month_year,
        month:month,
        year:year,
        // bill_date:bill_date,
        bill_no:bill_no,
        total_bill:total_bill,
        tds:tds,
        // tds_out:tds_out,
        gst:gst,
        // gst_out:gst_out,
        pf:pf,
        // pf_out:pf_out,
        esic:esic,
        // esic_out:esic_out,
        ptax:ptax,
        // ptax_out:ptax_out,
        lwf:lwf,
        // lwf_out:lwf_out,
        service:service,
        // service_out:service_out,
        net_profit:net_profit,
        // net_profit_out:net_profit_out
    },{where:{id:id}});
    const companies = await CompanyMaster.findAll();   
    const bills = await BillSummary.findAll({include:[CompanyMaster,ClientMaster],
        order: [ [ 'id', 'DESC' ]],
        limit:30
    });     
    res.render('admin/bill_summary_module',{
        companies,
        message:'Edited Successfully',
        bills
    });   
  

});
exports.searchBill = catchAsyncErrors( async (req, res, next) => {
    //search bill
    const {company,month,year} = req.body;
    const bills = await BillSummary.findAll({where:{
        [Op.or]:[
            {company_id:company},
            {month:month},
            {year:year},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send(bills);
    
});
exports.searchBill2 = catchAsyncErrors( async (req, res, next) => {
    //search bill
    const {val} = req.body;
    const bills = await BillSummary.findAll({where:{
        [Op.or]:[
            {bill_no:val},
            {'$client_master.client_name$':{[Op.substring]:val}},
            {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send(bills);
    
});
exports.deleteBillSummary = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await BillSummary.destroy({where:{id:id}});
    res.send('Successful');

  
});

exports.downloadBillSummary = catchAsyncErrors(async (req, res, next) => {
    
    const bill = await BillSummary.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster]});
    const invoiceName = 'bill_summary_'+ bill.month+'-'+bill.year+'.pdf';
    const invoicePath = path.join('uploads', invoiceName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    const pdfDoc = new PDFDocument();

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];
    // var dd=new Date(bill.month);
    var mm =  bill.month;
    pdfDoc.fontSize(15).font('Helvetica-Bold').text('BIll Summary for the month of '+monthNames[mm]+' '+bill.year, 20, 40, {
        align: 'center',
        underline:true,
        width: 550
    });   
    pdfDoc.moveDown();
    pdfDoc.fontSize(15);
    pdfDoc.font('Helvetica').text('Company : '+bill.company_master.company_name,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Client : '+bill.client_master.client_name,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.fontSize(10);
    pdfDoc.text('Bill No : '+bill.bill_no,{
        align: 'left',
        width: 550,
    });   
    pdfDoc.moveDown();
    // pdfDoc.text('Bill Date : '+changeDate(bill.bill_date),{
    //     align: 'left',
    //     width: 550,
    // });   
    // pdfDoc.moveDown();
    
    pdfDoc.text('Total Bill : '+bill.total_bill,{
        align: 'left',
        width: 550,
    });   
    pdfDoc.moveDown();    
    // pdfDoc.text('TDS Out : ' + bill.tds_out,{
    //     align: 'left',
    //     width: 550,
    // });   
    // pdfDoc.moveDown();
    pdfDoc.text('GST In : '+bill.gst,{
        align: 'left',
        width: 550,
    });   
    pdfDoc.moveDown();
    // pdfDoc.text('GST Out : ' + bill.gst_out,{
    //     align: 'left',
    //     width: 550,
    // });   
    // pdfDoc.moveDown();
    pdfDoc.text('PF In : '+bill.pf,{
        align: 'left',
        width: 550,
    });   
    pdfDoc.moveDown();
    // pdfDoc.text('PF Out : ' + bill.pf_out,{
    //     align: 'left',
    //     width: 550,
    // });   
    // pdfDoc.moveDown();
    pdfDoc.text('ESIC In : '+bill.esic,{
        align: 'left',
        width: 550,
    });   
    pdfDoc.moveDown();
    // pdfDoc.text('ESIC Out : ' + bill.esic_out,{
    //     align: 'left',
    //     width: 550,
    // });   
    // pdfDoc.moveDown();
    pdfDoc.text('PTAX In : '+bill.ptax,{
        align: 'left',
        width: 550,
    });   
    pdfDoc.moveDown();
    // pdfDoc.text('PTAX Out : ' + bill.ptax_out,{
    //     align: 'left',
    //     width: 550,
    // });   
    // pdfDoc.moveDown();
    pdfDoc.text('LWF In : '+bill.lwf,{
        align: 'left',
        width: 550,
    });   
    pdfDoc.moveDown();
    // pdfDoc.text('LWF Out : ' + bill.lwf_out,{
    //     align: 'left',
    //     width: 550,
    // });   
    // pdfDoc.moveDown();
    pdfDoc.text('Service Charge In : '+bill.service,{
        align: 'left',
        width: 550,
    });   
    pdfDoc.moveDown();
    // pdfDoc.text('Service Charge Out : ' + bill.service_out,{
    //     align: 'left',
    //     width: 550,
    // });   
    // pdfDoc.moveDown();
    pdfDoc.text('Net Profit In : '+bill.net_profit,{
        align: 'left',
        width: 550,
    });   
    pdfDoc.moveDown();
    // pdfDoc.text('Net Profit Out : ' + bill.net_profit_out,{
    //     align: 'left',
    //     width: 550,
    // });   
    // pdfDoc.moveDown();
    pdfDoc.end();
    
  
});
exports.getReportsDownload = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
          res.render('admin/reports_download',{
              companies,
              message:''
          });   
});

exports.postReportsDownload = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        client,
        month,
        year
    } = req.body;
    let bill;
    if(!client && !month && !year){
        bill = await BillSummary.findAll({where:{company_id:company},include:[CompanyMaster,ClientMaster]})
        }else if(!client && !month){
        bill = await BillSummary.findAll({where:{company_id:company,year:year},include:[CompanyMaster,ClientMaster]})
    }else if(!client && !year){
        bill = await BillSummary.findAll({where:{company_id:company,month:month},include:[CompanyMaster,ClientMaster]})
    }else if(!month && !year){
        bill = await BillSummary.findAll({where:{company_id:company,client_id:client},include:[CompanyMaster,ClientMaster]})
    }else if(!year){
        bill = await BillSummary.findAll({where:{company_id:company,client_id:client,month:month},include:[CompanyMaster,ClientMaster]})
    }else if(!month){
        bill = await BillSummary.findAll({where:{company_id:company,client_id:client,year:year},include:[CompanyMaster,ClientMaster]})
    }else if(!client){
        bill = await BillSummary.findAll({where:{company_id:company,month:month,year:year},include:[CompanyMaster,ClientMaster]})
    }else{
        bill = await BillSummary.findAll({where:{company_id:company,client_id:client,month:month,year:year},include:[CompanyMaster,ClientMaster]})
    }
  
    let data = [];
    bill.forEach(el =>{
        // var dd=new Date(el.month_year);
        //  var mm =  dd.getMonth() + 1;
        var monthNames = [ "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December" ];
        data.push({
            'Bill Summary Id':el.id,
            'Company Name':el.company_master.company_name,
            'Company Id':el.company_master.id,            
            'Client Name':el.client_master.client_name,
            'Client Id':el.client_master.id,         
            'Month':monthNames[el.month],         
            'Year':el.year,         
            // 'Bill Date':el.bill_date,
            'Bill No':el.bill_no,
            'Total Bill':parseInt(el.total_bill) ? parseInt(el.total_bill)  : 0,            
            'TDS':parseInt(el.tds) ? parseInt(el.tds)  : 0,            
            'GST In':parseInt(el.gst) ? parseInt(el.gst)  : 0,
            // 'GST Out':parseInt(el.gst_out) ? parseInt(el.gst_out)  : 0,            
            'PF In':parseInt(el.pf) ? parseInt(el.pf)  : 0,
            // 'PF Out':parseInt(el.pf_out) ? parseInt(el.pf_out)  : 0,            
            'ESIC In':parseInt(el.esic) ? parseInt(el.esic)  : 0,
            // 'ESIC Out':parseInt(el.esic_out) ? parseInt(el.esic_out)  : 0,            
            'PTAX In':parseInt(el.ptax) ? parseInt(el.ptax)  : 0,
            // 'PTAX Out':parseInt(el.ptax_out) ? parseInt(el.ptax_out)  : 0,            
            'LWF In':parseInt(el.lwf) ? parseInt(el.lwf)  : 0,
            // 'LWF Out':parseInt(el.lwf_out) ? parseInt(el.lwf_out)  : 0,            
            'Service Charge In':parseInt(el.service) ? parseInt(el.service)  : 0,
            // 'Service Charge Out':parseInt(el.service_out) ? parseInt(el.service_out)  : 0,
            'Net Profit In':parseInt(el.net_profit) ? parseInt(el.net_profit)  : 0,
            // 'Net Profit Out':parseInt(el.net_profit_out) ? parseInt(el.net_profit_out)  : 0
         });
    });       
var company_namee = '';
if(bill[0]){
    company_namee= bill[0].company_master.company_name;
}
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws)
XLSX.writeFile(wb, `output/${company_namee}_reports_export.xlsx`)
const filePath = path.join(`output/${company_namee}_reports_export.xlsx`);

fs.readFile(filePath, (err,data) =>{
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `inline; filename="${company_namee}_reports_export.xlsx"`)  ;  
res.send(data);
});
 
 });

 
exports.getReportsUpload = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
          res.render('admin/reports_upload',{
              companies,
              message:''
          });   
});
function changeDate(datee) {
    var date = new Date(datee);
   var ddd =  new Date( date.getTime() + Math.abs(date.getTimezoneOffset()*60000) ) 
   var mm = ddd.getMonth() + 1; // getMonth() is zero-based
   var dd = ddd.getDate();   
  
   return [ddd.getFullYear(),
           (mm>9 ? '' : '0') + mm,
           (dd>9 ? '' : '0') + dd
          ].join('-');
 

 };
exports.postReportsUpload = catchAsyncErrors(async (req, res, next) => {
    
    const rows = await readXlsxFile('uploads/' + req.files[0].filename);      
    rows.shift(); 
  
      
    rows.forEach(async element => {
        //update if already exists
        // const oldEmp = await NewRegistration.findAll({where:{emp_code:element[6]}});
        // element[7]=changeDate(element[7]);
         element[5]=changeDate(element[5]);
        // if(oldEmp.length>0){
            await BillSummary.update({
               bill_date:element[7],
               bill_no:element[8],
               total_bill_out:element[9],
               tds:element[10],
               gst:element[11],
               gst_out:element[12],
               pf:element[13],
               pf_out:element[14],
               esic:element[15],
               esic_out:element[16],
               ptax:element[17],
               ptax_out:element[18],
               lwf:element[19],
               lwf_out:element[20],
               service:element[21],
               service_out:element[22],
               net_profit:element[23],
               net_profit_out:element[24],                
            },
                {where:{id:element[0]}
            });
        // }else{
        //     //insert if a new record
        //     await NewRegistration.create({
        //         company_id:element[1],
        //         client_id:element[3],
        //         emp_name:element[4],
        //         dob:element[5],
        //         emp_code:element[6],
        //         date_of_joining:element[7],
        //         gender:element[8],
        //         aadhar:element[9],
        //         address:element[10],
        //         mobile:element[11],
        //         pan:element[12],
        //         maritial_status:element[13],
        //         pf:element[14],
        //         esic:element[15],
        //         bank_ac:element[16],
        //         ifsc:element[17],
        //         bank_name:element[18],
        //         beneficiary:element[19],
        //         nominee_name:element[20],
        //         nominee_relation:element[21],
        //         nominee_aadhar:element[22],
        //         designation:element[23],
        //         basic_salary:element[24],
        //         hra:element[25],
        //         gross_salary:element[26],
        //         type:element[27],
        //         date_of_exit:element[28],
        //         remarks:element[29],
        //         username:element[38],
        //         user_id:element[39],
        //         date:element[40],
        //         time:element[41],
        //     }
        //     );
        // }
    });
    const companies = await CompanyMaster.findAll();
          res.render('admin/reports_upload',{
              companies,
              message:'Data Imported Successfully'
            });   
});