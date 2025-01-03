const CompanyDocuments = require("../models/admin/company_documents");
const CompanyMaster = require("../models/admin/company_master");
const CompanyPvtLtd = require("../models/admin/company_pvtltd");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Sequelize = require("sequelize");
const fileHelper=require('../utils/file');

const ErrorHandler = require("../utils/ErrorHandler");
const ClientMaster = require("../models/admin/client_master");
const ClientAddress = require("../models/admin/client_addresses");
const ClientContact = require("../models/admin/client_contact");
const ClientDocuments = require("../models/admin/client_documents");
const Op = Sequelize.Op;
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path');
const HomePage = require("../models/admin/home_page");
exports.getHomePageMaster = catchAsyncErrors( async (req, res, next) => {
    //Get all companies

    const companies = await HomePage.findAll({
        order: [ [ 'id', 'DESC' ]],
    });
    res.render('admin/home_page_tab',{
        message:'',
        companies
    });
    
});
exports.postHomePageMaster = catchAsyncErrors(async (req, res, next) => {
    const{       
        date,
        heading,
        context,
        } = req.body;
    const files = req.files;    
    
    const company = await HomePage.create({
        date:date,
        heading:heading,
        context:context,
        document:files.length>0 ? files[0].path: '',
    });
  
    const companies = await HomePage.findAll({
        order: [ [ 'id', 'DESC' ]],
    });
    res.render('admin/home_page_tab',{
        message:'Successfully Added!',
        companies
    });

});
exports.getHomePageMasterEdit = catchAsyncErrors( async (req, res, next) => {
    //Get all companies

    const h = await HomePage.findByPk(req.params.id);
    res.render('admin/home_page_master_edit',{
        message:'',
        h
    });
    
});
exports.postHomePageMasterEdit = catchAsyncErrors(async (req, res, next) => {
    const{       
        date,
        heading,
        context,
        id
        } = req.body;
    const files = req.files;    
    const homePage = await HomePage.findByPk(id);

    await HomePage.update({
        date:date,
        heading:heading,
        context:context,
        document:files.length>0 ? files[0].path: homePage.document,
    },{where:{id:id}});
  
    const companies = await HomePage.findAll({
        order: [ [ 'id', 'DESC' ]],
    });
    res.render('admin/home_page_tab',{
        message:'Edited Successfully!',
        companies
    });

});
exports.getCompanyMaster = catchAsyncErrors( async (req, res, next) => {
    //Get all companies

    const companies = await CompanyMaster.findAll({include: [CompanyPvtLtd,CompanyDocuments],
        order: [ [ 'id', 'DESC' ]],
    });
    res.render('admin/company_master_tab',{
        message:'',
        companies
    });
    
});

exports.searchCompany = catchAsyncErrors( async (req, res, next) => {
    //search companies
    const {val} = req.body;
    const companies = await CompanyMaster.findAll({where:{company_name:{[Op.substring]:val}},
        include:[CompanyPvtLtd ,CompanyDocuments]});
    res.send(companies);
    // console.log(companies);
    
});
exports.postCompanyMaster = catchAsyncErrors(async (req, res, next) => {
    const{
        company_name,
        company_code,
        address,
        email,
        phone,
        type,
        tagline,
        proprietor,
        proprietor_phone,
        pan,
        tan,
        gstin,
        trade,
        pf,
        ptax,
        esic,
        lwf,
        bank_ac,
        bank_name,
        ifsc,
        director_name,
        director_pan,
        director_phone,
        din
    } = req.body;
    const files = req.files;
    let logo='';
    let signature='';
    let stamp='';
    let company_name_logo='';
    let documents=[];
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='logo'){
            logo=files[i].path;
        }
        else if(files[i].fieldname==='signature'){
            signature=files[i].path;
        }
        else if(files[i].fieldname==='stamp'){
            stamp=files[i].path;
        }
        else if(files[i].fieldname==='company_name_logo'){
            company_name_logo=files[i].path;
        }
        else if(files[i].fieldname==='documents'){
            documents.push(files[i]);
        }
        
    }
    const company = await CompanyMaster.create({
        company_name,
        company_code,
        address,
        email,
        phone,
        type,
        tagline,
        proprietor,
        proprietor_phone,
        pan,
        tan,
        gstin,
        trade_license:trade,
        pf,
        ptax,
        esic,
        lwf,
        bank_ac,
        bank_name,
        ifsc,
        logo,
        signature,
        stamp,
        company_name_logo
    });
    if(type==2){
        for(var i=0;i<director_name.length;i++){
            await CompanyPvtLtd.create({
                company_id:company.id,
                director_name:director_name[i],
                pan:director_pan[i],
                phone:director_phone[i],
                din:din[i]                
            });
        }
    }
    //upload documents
    if(documents.length>0){
        for(var i=0;i<documents.length;i++){
            await CompanyDocuments.create({
                company_id:company.id,
                document:documents[i].path
            })
        }
    }
    const companies = await CompanyMaster.findAll({include: [CompanyPvtLtd,CompanyDocuments],
        order: [ [ 'id', 'DESC' ]],
    });
    res.render('admin/company_master_tab',{
        message:'Company Successfully Added!',
        companies
    });

});

exports.getCompanyMasterEdit = catchAsyncErrors( async (req, res, next) => {

    const { id } = req.params;

    const company = await CompanyMaster.findByPk(id,{include: [CompanyPvtLtd,CompanyDocuments]});
    if(!company){
        return ErrorHandler('No company found',500);
    }
    console.log(company.company_name);
    res.render('admin/company_master_edit',{
        message:'',
        company
    });
    
});

exports.postCompanyMasterEdit = catchAsyncErrors( async(req, res, next) => {
    const{
        id,
        company_name,
        company_code,        
        address,
        email,
        phone,
        type,
        tagline,
        proprietor,
        proprietor_phone,
        pan,
        tan,
        gstin,
        trade,
        pf,
        ptax,
        esic,
        lwf,
        bank_ac,
        bank_name,
        ifsc,
        director_name,
        director_pan,
        director_phone,
        din
    } = req.body;
    const files = req.files;

    const oldCompany = await CompanyMaster.findByPk(id,{include:CompanyDocuments});
    let newLogo = oldCompany.logo;
    let newSign = oldCompany.signature;
    let newStamp = oldCompany.stamp;
    let new_company_name_logo = oldCompany.company_name_logo;
    
    let newDocuments = [];
    let hasDocu = false;
    //removing old files
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='logo'){
            // if(oldCompany.logo)
            //     fileHelper.deleteFile(oldCompany.logo);
            newLogo=files[i].path;
        }
        else if(files[i].fieldname==='signature'){
            // if(oldCompany.signature)
            //     fileHelper.deleteFile(oldCompany.signature);
            newSign=files[i].path;
        }
        else if(files[i].fieldname==='stamp'){
            // if(oldCompany.stamp)
            //     fileHelper.deleteFile(oldCompany.stamp);
            newStamp=files[i].path;
        }
        
        else if(files[i].fieldname==='company_name_logo'){
            // if(oldCompany.stamp)
            //     fileHelper.deleteFile(oldCompany.stamp);
            new_company_name_logo=files[i].path;
        }
        
        else if(files[i].fieldname==='documents'){
            //if(!hasDocu){
            // for(var j=0;j<oldCompany.company_documents.length;j++) {
            //      fileHelper.deleteFile(oldCompany.company_documents[j].document);
            //  }
       // }
          //  hasDocu=true;
            newDocuments.push(files[i]);
        }
    }

    await CompanyMaster.update({
        company_name:company_name,
        company_code:company_code,
        address:address,
        email:email,
        phone:phone,
        type:type,
        tagline:tagline,
        proprietor:proprietor,
        proprietor_phone:proprietor_phone,
        pan:pan,
        tan:tan,
        gstin:gstin,
        trade_license:trade,
        pf:pf,
        ptax:ptax,
        esic:esic,
        lwf:lwf,
        bank_ac:bank_ac,
        bank_name:bank_name,
        ifsc:ifsc,
        logo:newLogo,
        signature:newSign,
        stamp:newStamp,
        company_name_logo:new_company_name_logo
    },{where: {id:id}});

    if(type==2){
        //delete all previous
        await CompanyPvtLtd.destroy({where:{company_id:oldCompany.id}});

        //insert all new
        for(var i=0;i<director_name.length;i++){
            await CompanyPvtLtd.create({
                company_id:oldCompany.id,
                director_name:director_name[i],
                pan:director_pan[i],
                phone:director_phone[i],
                din:din[i]                
            });
        }
    }
    //upload documents
    if(newDocuments.length>0){
        // await CompanyDocuments.destroy({where:{company_id:oldCompany.id}});

        for(var i=0;i<newDocuments.length;i++){
            await CompanyDocuments.create({
                company_id:oldCompany.id,
                document:newDocuments[i].path
            })
        }
    }

    //redirect to same page
    
    const company = await CompanyMaster.findByPk(id,{include: [CompanyPvtLtd,CompanyDocuments]});
    const companies = await CompanyMaster.findAll({include: [CompanyPvtLtd,CompanyDocuments],
        order: [ [ 'id', 'DESC' ]],
    });
    if(!company){
        return ErrorHandler('No company found',500);
    }
    res.render('admin/company_master_tab',{
        message:'Company Data Edited Successfully',
        company,
        companies
    });

});

exports.removeDirector = catchAsyncErrors( async(req, res, next) => {
      const { id } = req.body;
      const pvt = await CompanyPvtLtd.findByPk(id);
      await pvt.destroy();
      res.send({
          message:'Successfully Deleted'
      })
});
exports.deleteCompanyDocument = catchAsyncErrors( async(req, res, next) => {
    const { id } = req.body;
    const pvt = await CompanyDocuments.findByPk(id);
    const company_id = pvt.company_id;
    await pvt.destroy();
    var documents = await CompanyDocuments.findAll({where:{company_id:company_id}});
    res.send(documents);
});
exports.getCompanyMasterView = catchAsyncErrors( async (req, res, next) => {

    const { id } = req.params;

    const company = await CompanyMaster.findByPk(id,{include: [CompanyPvtLtd,CompanyDocuments]});
    if(!company){
        return ErrorHandler('No company found',500);
    }
    console.log(company.company_name);
    res.render('admin/company_master_view',{
        message:'',
        company
    });
    
});
exports.getCompanyMasterViewDocuments = catchAsyncErrors(async( req,res,next) =>{
    const {
        id
    } = req.params;

    const documents = await CompanyDocuments.findAll(
        {where: {company_id:id}}
    );

    res.render('admin/view_company_documents',{
        files:documents
    })
});
exports.getClientMaster = catchAsyncErrors( async (req, res, next) => {
    //Get all companies

    const companies = await CompanyMaster.findAll({attributes: ['id', 'company_name']});
    const clients = await ClientMaster.findAll({include:[CompanyMaster,ClientDocuments],
        order: [ [ 'id', 'DESC' ]],
    });
    res.render('admin/employeer_master_tab',{
        message:'',
        companies,
        clients
        });
    
});

exports.postClientMaster = catchAsyncErrors( async (req, res, next) => {
    const{
        company,
        client_name,
        address,
        state,
        pin,
        gst,
        proprietor_name,
        email,
        mobile,
        pan,
        service,
        bank_ac,
        bank_name,
        ifsc,
        contact_name,
        contact_phone,
        contact_email        
    } = req.body;
    const files = req.files;
    let logo='';
    let documents=[];
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='logo'){
            logo=files[i].path;
        }
        else if(files[i].fieldname==='documents'){
            documents.push(files[i]);
        }
    }
    
    //create client
    const client = await ClientMaster.create({
        company_id:company,
        client_name,
        name:proprietor_name,
        email,
        phone:mobile,
        pan,
        service_charge:service,
        bank_ac,
        bank_name,
        ifsc,
        logo
    }); 
    //add client addresses
    for(var i=0;i<address.length;i++){
        await ClientAddress.create({
            client_id:client.id,
            address:address[i],
            pin:pin[i],
            state:state[i],
            gst:gst[i]                
        });
    }
    //add client contacts
    if(contact_name){
    for(var i=0;i<contact_name.length;i++){
        await ClientContact.create({
            client_id:client.id,
            name:contact_name[i],
            phone:contact_phone[i],
            email:contact_email[i]
        });
    }
}
    //add client documents
    if(documents.length>0){
        for(var i=0;i<documents.length;i++){
            await ClientDocuments.create({
                client_id:client.id,
                document:documents[i].path
            })
        }
    }
    const companies = await CompanyMaster.findAll({attributes: ['id', 'company_name']});
    const clients = await ClientMaster.findAll({include:[CompanyMaster,ClientDocuments],
        order: [ [ 'id', 'DESC' ]],
    });
    res.render('admin/employeer_master_tab',{
        message:'Client Added Successfully',
        companies,
        clients
        });
    
});


exports.getClientEdit = catchAsyncErrors( async (req, res, next) => {

    const { id } = req.params;

    const companies = await CompanyMaster.findAll({attributes: ['id', 'company_name']});
    const oldClient = await ClientMaster.findByPk(id,{include: [CompanyMaster,ClientAddress,ClientContact,ClientDocuments]});
    if(!oldClient){
        return ErrorHandler('No company found',500);
    }
    res.render('admin/employer_master_edit',{
        message:'',
        companies,
        oldClient
    });
    
});


exports.removeClientAddress = catchAsyncErrors( async(req, res, next) => {
    const { id } = req.body;
    const pvt = await ClientAddress.findByPk(id);
    await pvt.destroy();
    res.send({
        message:'Successfully Deleted'
    })
});
exports.removeClientContact = catchAsyncErrors( async(req, res, next) => {
    const { id } = req.body;
    const pvt = await ClientContact.findByPk(id);
    await pvt.destroy();
    res.send({
        message:'Successfully Deleted'
    })
});
exports.deleteClientDocument = catchAsyncErrors( async(req, res, next) => {
    const { id } = req.body;
    const pvt = await ClientDocuments.findByPk(id);
    const client_id = pvt.client_id;
    await pvt.destroy();
    var documents = await ClientDocuments.findAll({where:{client_id:client_id}});
    res.send(documents);
});
exports.postClientEdit = catchAsyncErrors( async (req, res, next) => {
    const{
        id,
        company,
        client_name,
        address,
        state,
        pin,
        gst,
        proprietor_name,
        email,
        mobile,
        pan,
        service,
        bank_ac,
        bank_name,
        ifsc,
        contact_name,
        contact_phone,
        contact_email        
    } = req.body;
    const files = req.files;
    
    const oldClient = await ClientMaster.findByPk(id,{include:ClientDocuments});
    let newLogo = oldClient.logo;
    let newDocuments = [];
    let hasDocu = false;

    //removing old files
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='logo'){
            // if(oldClient.logo)
            //     fileHelper.deleteFile(oldClient.logo);
            newLogo=files[i].path;
        }
        else if(files[i].fieldname==='documents'){        
        // if(!hasDocu){
        //     for(var j=0;j<oldClient.client_documents.length;j++) {
        //          fileHelper.deleteFile(oldClient.client_documents[j].document);
        //      }
        // }
        //     hasDocu=true;
            newDocuments.push(files[i]);
        }
    }
    await ClientMaster.update({
        company_id:company,
        client_name:client_name,
        name:proprietor_name,
        email:email,
        phone:mobile,
        pan:pan,
        service_charge:service,
        bank_ac:bank_ac,
        bank_name:bank_name,
        ifsc:ifsc,
        logo:newLogo
    },{where: {id:id}});

    //remove client addresses
    await ClientAddress.destroy({where:{client_id:oldClient.id}});

    //insert all new addresses
    for(var i=0;i<address.length;i++){
        await ClientAddress.create({
            client_id:oldClient.id,
            address:address[i],
            pin:pin[i],
            state:state[i],
            gst:gst[i]                
        });
    }
    //remove client contacts
    await ClientContact.destroy({where:{client_id:oldClient.id}});

       //add client contacts
       if(contact_name){
        for(var i=0;i<contact_name.length;i++){
            await ClientContact.create({
                client_id:oldClient.id,
                name:contact_name[i],
                phone:contact_phone[i],
                email:contact_email[i]
            });
        }
    }
//upload documents
if(newDocuments.length>0){
    // await ClientDocuments.destroy({where:{client_id:oldClient.id}});

    for(var i=0;i<newDocuments.length;i++){
        await ClientDocuments.create({
            client_id:oldClient.id,
            document:newDocuments[i].path
        })
    }
}


const companies = await CompanyMaster.findAll({attributes: ['id', 'company_name']});
const newClient = await ClientMaster.findByPk(id,{include: [CompanyMaster,ClientAddress,ClientContact,ClientDocuments]});
const clients = await ClientMaster.findAll({include:[CompanyMaster,ClientDocuments],
    order: [ [ 'id', 'DESC' ]],
});
if(!newClient){
    return ErrorHandler('No client found',500);
}
res.render('admin/employeer_master_tab',{
    message:'Client Data edited Successfully',
    companies,
    oldClient:newClient,
    clients
});
});
exports.searchClient = catchAsyncErrors( async (req, res, next) => {
    //search companies
    const {val} = req.body;
    const clients = await ClientMaster.findAll({where:{
        [Op.or]:[
        {client_name:{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientDocuments]
});    
    res.send(clients);
    // console.log(companies);
    
});

exports.getClientMasterView = catchAsyncErrors( async (req, res, next) => {

    const { id } = req.params;

    const oldClient = await ClientMaster.findByPk(id,{include: [CompanyMaster,ClientContact,ClientAddress,ClientDocuments]});
    if(!oldClient){
        return ErrorHandler('No company found',500);
    }
    res.render('admin/client_master_view',{
        message:'',
        oldClient
    });
    
});
exports.getClientMasterViewDocuments = catchAsyncErrors(async( req,res,next) =>{
    const {
        id
    } = req.params;

    const documents = await ClientDocuments.findAll(
        {where: {client_id:id}}
    );

    res.render('admin/view_client_documents',{
        files:documents
    })
});

exports.downloadCompanyDetails = catchAsyncErrors(async( req,res,next) =>{
    const pdfDoc = new PDFDocument();
    const {id} = req.params;
    const company = await CompanyMaster.findByPk(id,{include:[CompanyPvtLtd,CompanyDocuments]});
    const fileName = company.company_name + '_details.pdf';
    const invoicePath = path.join('uploads', fileName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    if(company.logo){
        if (fs.existsSync(company.logo)) {  
    const logoPath = company.logo;    
    pdfDoc.image(logoPath, 510, 60, { width: 50, height: 50, align:'right' })
    .rect(510, 60, 50, 50)
    .stroke();
    }
}
    pdfDoc.fontSize(20);
    pdfDoc.text('Company Details',10,20,{
        align:'center',
        width:610,
        height:20
    })
    pdfDoc.fontSize(10);
    pdfDoc.text('Company Name : '+company.company_name,20,70,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Code Name : '+company.company_code,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Address : '+company.address,{
        align:'left',
        width:610,
        height:20,
    })
    
    pdfDoc.moveDown();
    pdfDoc.text('Email : '+company.email,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Phone No : '+company.phone,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    var companyType = '';
    if(company.type == 1){
        companyType = 'Proprietorship';
    }else if(company.type == 2){
        companyType = 'Pvt Ltd';
    }
    pdfDoc.text('Type : '+companyType,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    if(company.type==1){
        pdfDoc.text('Proprietor : '+company.proprietor,{
            align:'left',
            width:610,
            height:20,
        })
        pdfDoc.moveDown();    
        pdfDoc.text('Proprietor Phone : '+company.proprietor_phone,{
            align:'left',
            width:610,
            height:20,
        })
        pdfDoc.moveDown();
    }
    if(company.type==2){
        for(var i=0;i<company.company_pvtltds.length;i++){
            pdfDoc.text('Director '+ (i+1) +' Name : '+company.company_pvtltds[i].director_name,{
                align:'left',
                width:610,
                height:20,
            })
            pdfDoc.moveDown();
            pdfDoc.text('Director '+ (i+1) +' Pan : '+company.company_pvtltds[i].pan,{
                align:'left',
                width:610,
                height:20,
            })
            pdfDoc.moveDown();
            pdfDoc.text('Director '+ (i+1) +' Phone No : '+company.company_pvtltds[i].phone,{
                align:'left',
                width:610,
                height:20,
            })
            pdfDoc.moveDown();
            pdfDoc.text('Director '+ (i+1) +' DIN No : '+company.company_pvtltds[i].din,{
                align:'left',
                width:610,
                height:20,
            })
            pdfDoc.moveDown();
        }
    }
    pdfDoc.text('PAN : '+company.pan,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('TAN : '+company.tan,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('GSTIN : '+company.gstin,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Trade License No : '+company.trade_license,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('PF Code : '+company.pf,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('PTAX Code : '+company.ptax,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('LWF Code : '+company.lwf,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('ESIC Code : '+company.esic,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Bank A/c No : '+company.bank_ac,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('IFSC Code : '+company.ifsc,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Bank Name : '+company.bank_name,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
     
     pdfDoc.addPage();
     if(company.stamp){
        if (fs.existsSync(company.stamp)) { 
        pdfDoc.text('Stamp',{
            align:'left',
            width:610,
            height:20,
        })
    pdfDoc.moveDown();
     pdfDoc.image(company.stamp, {
        fit: [500, 400],
        align: 'center',
        valign: 'center'
     });
     pdfDoc.addPage();
    }
}
    if(company.signature){
        if (fs.existsSync(company.signature)) {  
        pdfDoc.text('Signature',{
            align:'left',
            width:610,
            height:20,
        })
    pdfDoc.moveDown();
     pdfDoc.image(company.signature, {
        fit: [500, 400],
        align: 'center',
        valign: 'center'
     });
    }
}
     pdfDoc.end()
});

exports.downloadClientDetails = catchAsyncErrors(async( req,res,next) =>{
    const pdfDoc = new PDFDocument();
    const {id} = req.params;
    const client = await ClientMaster.findByPk(id,{include:[ClientAddress,ClientContact,CompanyMaster]});
    const fileName = client.client_name + '_details.pdf';
    const invoicePath = path.join('uploads', fileName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    if(client.logo){
        if (fs.existsSync(client.logo)) {  
    const logoPath = client.logo;
    pdfDoc.image(logoPath, 510, 60, { width: 50, height: 50, align:'right' })
    .rect(510, 60, 50, 50)
    .stroke();
    }
}
    pdfDoc.fontSize(20);
    pdfDoc.text('Client Details',10,20,{
        align:'center',
        width:610,
        height:20
    })
    pdfDoc.fontSize(10);
    pdfDoc.text('Company Name : '+client.company_master.company_name,20,70,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Client Name : '+client.client_name,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    for(var i=0; i<client.client_addresses.length;i++){
        pdfDoc.text('Address '+(i+1)+': '+client.client_addresses[i].address,{
            align:'left',
            width:610,
            height:20,
        })    
        pdfDoc.moveDown();
        pdfDoc.text('State '+(i+1)+': '+client.client_addresses[i].state,{
            align:'left',
            width:610,
            height:20,
        })    
        pdfDoc.moveDown();
        pdfDoc.text('Pin Code '+(i+1)+': '+client.client_addresses[i].pin,{
            align:'left',
            width:610,
            height:20,
        })    
        pdfDoc.moveDown();
        pdfDoc.text('GST No '+(i+1)+': '+client.client_addresses[i].gst,{
            align:'left',
            width:610,
            height:20,
        })    
        pdfDoc.moveDown();
    }
    pdfDoc.text('Proprietor / Director Name : '+client.name,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Email : '+client.email,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();    
    pdfDoc.text('Phone No : '+client.phone,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('PAN : '+client.pan,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();     
    if(client.client_contacts.length>0){
        for(var i=0;i<client.client_contacts.length;i++){
            pdfDoc.text('Contact Name '+ (i+1) +' : '+client.client_contacts[i].name,{
                align:'left',
                width:610,
                height:20,
            })
            pdfDoc.moveDown();
            pdfDoc.text('Contact Phone '+ (i+1) +' : '+client.client_contacts[i].phone,{
                align:'left',
                width:610,
                height:20,
            })
            pdfDoc.moveDown();
            pdfDoc.text('Contact Email '+ (i+1) +' : '+client.client_contacts[i].email,{
                align:'left',
                width:610,
                height:20,
            })
            pdfDoc.moveDown();
        }
    }
    pdfDoc.text('Service Charge(%) : '+client.service_charge,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Bank A/c No : '+client.bank_ac,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('IFSC Code : '+client.ifsc,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Bank Name : '+client.bank_name,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
     
     pdfDoc.end()
});
exports.downloadCompanyDocuments = catchAsyncErrors(async( req,res,next) =>{
    const pdfDoc = new PDFDocument();
    const {id} = req.params;
    const company = await CompanyMaster.findByPk(id,{include:[CompanyDocuments]});
    const fileName = company.company_name + '_documents.pdf';
    const invoicePath = path.join('uploads', fileName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);


    for(var i=0;i<company.company_documents.length;i++){
        const imgPath = company.company_documents[i].document;

        pdfDoc.image(imgPath, {
            fit: [500, 400],
            align: 'center',
            valign: 'center'
         });
         
         pdfDoc.addPage();
    }
   
        
     
     
     pdfDoc.end()
});

exports.downloadClientDocuments = catchAsyncErrors(async( req,res,next) =>{
    const pdfDoc = new PDFDocument();
    const {id} = req.params;
    const client = await ClientMaster.findByPk(id,{include:[ClientDocuments]});
    const fileName = client.client_name + '_documents.pdf';
    const invoicePath = path.join('uploads', fileName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);


    for(var i=0;i<client.client_documents.length;i++){
        const imgPath = client.client_documents[i].document;

        pdfDoc.image(imgPath, {
            fit: [500, 400],
            align: 'center',
            valign: 'center'
         });
         
         pdfDoc.addPage();
    }
   
        
     
     
     pdfDoc.end()
});