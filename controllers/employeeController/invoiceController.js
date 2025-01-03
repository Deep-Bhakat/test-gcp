const Sequelize = require("sequelize");
const CompanyMaster = require("../../models/admin/company_master");
const ClientMaster = require("../../models/admin/client_master");
const Op = Sequelize.Op;
const catchAsyncErrors = require("../../utils/catchAsyncErrors");
const path = require('path')
const PDFDocument = require('pdfkit')
const fs = require('fs');
const Invoice = require("../../models/admin/invoice");
const XLSX = require('xlsx');

exports.getInvoiceMaster = catchAsyncErrors( async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    res.render('employee/invoice_master',{
        permissions
    });
   
});

exports.getInvoice = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const invoices = await Invoice.findAll({include:[CompanyMaster,ClientMaster],order:[['id','DESC']],
    limit:30
});
    let isPreview=false;
    if(req.query){
        isPreview  = req.query.isPreview;
    }
    res.render('employee/invoice',{
        companies,
        invoices,
        isPreview,
        permissions
    });
  
});

exports.postInvoice = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        client,
        month_year,
        invoice_no,
        date,
        remarks,
    } = req.body;
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];
    var dd=new Date(month_year);
    var month =  monthNames[dd.getMonth()];
    var year=month_year.substr(0,4);

    await Invoice.create({
        company_id:company,
        client_id:client=="" ? null : client ,
        month_year:month_year,
        year:year,
        month:month,
        date:date,
        invoice_no:invoice_no,
        remarks:remarks,
        document:req.files.length > 0 ? req.files[0].path : '',
        user_id:req.session.user.id 
    });

    res.redirect('/employee/invoice?isPreview=true');
    
});

exports.postInvoiceDue = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        month_year,
    } = req.body;
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];
    var dd=new Date(month_year);
    var month =  monthNames[dd.getMonth()];
    var year=month_year.substr(0,4);
    let submittedInvoices;
    if(company){
        submittedInvoices = await Invoice.findAll({where:{month_year:month_year,company_id:company}});
        let arr=[];
        for(var i=0;i<submittedInvoices.length;i++){
            if(submittedInvoices[i].client_id!=null)
                arr.push(submittedInvoices[i].client_id);        
        }
        const clientsLeft = await ClientMaster.findAll({where:{
            id: {[Op.notIn]:arr},
            company_id:company
        },include:CompanyMaster});
        let data=[];   
        clientsLeft.forEach(el=>{
            data.push({
                'Company':el.company_master.company_name,
                'Client':el.client_name,
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/Invoice_due_${month_year}.xlsx`)
        const filePath = path.join(`output/Invoice_due_${month_year}.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="Invoice_due_${month_year}.xlsx"`)  ;  
        return res.send(data);
        });

    }else{
        submittedInvoices = await Invoice.findAll({where:{month_year:month_year}});
        let arr=[];
        for(var i=0;i<submittedInvoices.length;i++){
            arr.push(submittedInvoices[i].company_id);        
        }
        const companiesLeft = await CompanyMaster.findAll({where:{
            id: {[Op.notIn]:arr}
        }});
        let data=[];    

        companiesLeft.forEach(el=>{
            data.push({
                'Company':el.company_name,
                'Client':'',
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/Invoice_due_${month_year}.xlsx`)
        const filePath = path.join(`output/Invoice_due_${month_year}.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="Invoice_due_${month_year}.xlsx"`)  ;  
        return res.send(data);
        });
    }
    

    
});
exports.getInvoiceEdit = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const invoice = await Invoice.findOne({include:[CompanyMaster,ClientMaster],where:{id:req.params.id}});
   
    res.render('employee/invoice_edit',{
        companies,
        invoice,
        permissions
    });
  
});


exports.postInvoiceEdit = catchAsyncErrors(async (req, res, next) => {
    const {
        id,
        company,
        client,
        month_year,
        invoice_no,
        date,
        remarks
    } = req.body;
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];
    var dd=new Date(month_year);
    var month =  monthNames[dd.getMonth()];
    var year=month_year.substr(0,4);
    const oldInvoice = await Invoice.findOne({where:{id:id}});

    await Invoice.update({
        company_id:company,
        client_id:client=="" ? null : client ,
        month_year:month_year,
        year:year,
        month:month,
        date:date,
        invoice_no:invoice_no,
        remarks:remarks,
        document:req.files.length > 0 ? req.files[0].path : oldInvoice.document,
        user_id:req.session.user.id 
    },{where:{id:id}});

    res.redirect('/employee/invoice?isPreview=true');
    
});

exports.deleteInvoice = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await Invoice.destroy({where:{id:id}});
    res.send('Successful');

  
});

exports.searchInvoice = catchAsyncErrors( async (req, res, next) => {
    const {company,month_year} = req.body;
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    // var dd = '';
    // if(val.includes('-') || val.includes('/')){
    //     dd = val.substr(6,4) + '-' + val.substr(3,2) + '-' + val.substr(0,2);
    //     console.log(dd);
    // }
    if(company && month_year){
        const invoice = await Invoice.findAll({where:{
            [Op.and]:[
                {month_year:month_year},
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }else if(company && !month_year){
        const invoice = await Invoice.findAll({where:{
            [Op.or]:[
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }else if(!company && month_year){
        const invoice = await Invoice.findAll({where:{
            [Op.or]:[
                {month_year:month_year},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }
  
 
    
});

exports.searchInvoice2 = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    var dd = '';
   
    if(val.includes('-') || val.includes('/')){
        dd = val.substr(6,4) + '-' + val.substr(3,2) + '-' + val.substr(0,2);
        console.log(dd);
    }
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    
    if(permissions.includes('0')){
        isAdmin = true;
    }
    const invoice = await Invoice.findAll({where:{
        [Op.or]:[
            {invoice_no:val},
            {month:val},
            {date:dd},
            {'$client_master.client_name$':{[Op.substring]:val}},
            {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send({invoice,isAdmin});
    
    
});