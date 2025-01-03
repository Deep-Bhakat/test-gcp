const CompanyMaster = require("../../models/admin/company_master");
const catchAsyncErrors = require("../../utils/catchAsyncErrors");
const Sequelize = require("sequelize");
const ErrorHandler = require("../../utils/ErrorHandler");
const ClientMaster = require("../../models/admin/client_master");
const PF = require("../../models/admin/pf");
const ESIC = require("../../models/admin/esic");
const PTAX = require("../../models/admin/ptax");
const LWF = require("../../models/admin/lwf");
const LabourReturn = require("../../models/admin/labour_return");
const Agreement = require("../../models/admin/agreement");
const LabourLicense = require("../../models/admin/labour_license");
const Op = Sequelize.Op;
const XLSX = require('xlsx');
const path = require('path')
const fs = require('fs');

exports.getStatute = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
    const e=[];
        res.render('employee/statute', {
            companies,
            clients,
            e,
            preview:req.session ? req.session.statute : 'pf',
            permissions
        });
  
});
exports.getPf = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
        res.render('employee/pf', {
            companies,
            clients,
            permissions,
        });
  
});
exports.postPf = catchAsyncErrors( async(req, res, next) => {
    const{
        company,
        client1,
        month
    } = req.body;
    const files = req.files;
    let ecr='';
    let challan='';
    let payment='';
    let contribution='';
   
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='ecr'){
            ecr=files[i].path;
        }else if(files[i].fieldname==='challan'){
            challan=files[i].path;
        }else if(files[i].fieldname==='contribution'){
            contribution=files[i].path;
        }else if(files[i].fieldname==='payment'){
            payment=files[i].path;
        }
    }

    const pf= await PF.create({
        company_id:company,
        client_id:client1 ? client1 : null,
        month_year:month,
        ecr_challan:ecr,
        contribution,
        payment_proff:payment,
        challan_details:challan,
        user_id:req.session.user.id 
    });

    res.redirect('/employee/pf');

  
});

exports.getEsic = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
        res.render('employee/esic', {
            companies,
            clients,
            permissions
        });
  
});
exports.postEsic = catchAsyncErrors( async(req, res, next) => {
    const{
        company2,
        client2,
        month2
    } = req.body;
    const files = req.files;
    let ecr='';
    let contribution='';
    let payment='';
   
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='ecr2'){
            ecr=files[i].path;
        }else if(files[i].fieldname==='contribution2'){
            contribution=files[i].path;
        }else if(files[i].fieldname==='payment_proff2'){
            payment=files[i].path;
        }
    }

    const esic= await ESIC.create({
        company_id:company2,
        client_id:client2 ? client2 : null,
        month_year:month2,
        ecr_challan:ecr,
        contribution,
        payment_proff:payment,
        user_id:req.session.user.id 
    });
    res.redirect('/employee/esic');

  
});

exports.getPtax = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
        res.render('employee/ptax', {
            companies,
            clients,
            permissions
        });
  
});
exports.postPtax = catchAsyncErrors( async(req, res, next) => {
    const{
        company3,
        month3
    } = req.body;
    const files = req.files;
    let challan='';
    let payment='';
   
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='challan3'){
            challan=files[i].path;
        }else if(files[i].fieldname==='payment_proff3'){
            payment=files[i].path;
        }
    }

    const ptax= await PTAX.create({
        company_id:company3,
        month_year:month3,
        challan,
        payment_proff:payment,
        user_id:req.session.user.id 
    });

    res.redirect('/employee/ptax');

  
});

exports.getLwf = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
        res.render('employee/lwf', {
            companies,
            clients,
            permissions
        });
  
});
exports.postLwf = catchAsyncErrors( async(req, res, next) => {
    const{
        company4,
        year,
        period
    } = req.body;
    const files = req.files;
    let challan='';
    let payment='';
   
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='challan4'){
            challan=files[i].path;
        }else if(files[i].fieldname==='payment_proff4'){
            payment=files[i].path;
        }
    }

    const lwf= await LWF.create({
        company_id:company4,
        year,
        period,
        challan,
        payment_proff:payment,
        user_id:req.session.user.id 
    });

    res.redirect('/employee/lwf');

  
});

exports.getLabourReturn = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
        res.render('employee/labour_return', {
            companies,
            clients,
            permissions
        });
  
});
exports.postLabourReturn = catchAsyncErrors( async(req, res, next) => {
    const{
        company5,
        client5,
        year2,
        period2
    } = req.body;
    const files = req.files;
    let document='';
   
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='document2'){
            document=files[i].path;
        }
    }

    const labourReturn= await LabourReturn.create({
        company_id:company5,
        client_id:client5 ? client5 : null,
        year:year2,
        period:period2,
        document,
        user_id:req.session.user.id 
    });
    res.redirect('/employee/labour-return');

  
});
exports.getAgreement = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
        res.render('employee/agreement', {
            companies,
            clients,
            permissions
        });
  
});
exports.postAgreement = catchAsyncErrors( async(req, res, next) => {
    const{
        company6,
        client6,
        from_date,
        to_date,
        remarks
    } = req.body;
    const files = req.files;
    let document='';
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='document'){
            document=files[i].path;
        }
    }
    const agreement= await Agreement.create({
        company_id:company6,
        client_id:client6 ? client6 : null,
        from_date,
        to_date,
        document,
        remarks,
        user_id:req.session.user.id 
    });


        res.redirect('/employee/agreement');
  
});

exports.getLabourLicense = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
        res.render('employee/labour_license', {
            companies,
            clients,
            permissions
        });
  
});
exports.postLabourLicense = catchAsyncErrors( async(req, res, next) => {
    const{
        company7,
        client7,
        from_date2,
        to_date2,
        remarks2
    } = req.body;
    const files = req.files;
    let document='';
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='document3'){
            document=files[i].path;
        }
    }
    const labourLicense= await LabourLicense.create({
        company_id:company7,
        client_id:client7 ? client7 : null,
        from_date:from_date2,
        to_date:to_date2,
        document,
        remarks:remarks2,
        user_id:req.session.user.id 
    });


        res.redirect('/employee/labour-license');
  
});
exports.getStatuteData = catchAsyncErrors( async(req, res, next) => {
    const {val} = req.body;
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    if(val=='pf'){
        const data = await PF.findAll({include:[CompanyMaster,ClientMaster]});
        res.send({data,isAdmin});
    }else if(val=='esic'){        
        const data = await ESIC.findAll({include:[CompanyMaster,ClientMaster]});
        res.send({data,isAdmin});
    }else if(val=='ptax'){        
        const data = await PTAX.findAll({include:[CompanyMaster]});
        res.send({data,isAdmin});
    }else if(val=='lwf'){        
        const data = await LWF.findAll({include:[CompanyMaster]});
        res.send({data,isAdmin});
    }else if(val=='return'){        
        const data = await LabourReturn.findAll({include:[CompanyMaster,ClientMaster]});
        res.send({data,isAdmin});
    }else if(val=='agreement'){        
        const data = await Agreement.findAll({include:[CompanyMaster,ClientMaster],order:[
            [ClientMaster,'client_name','ASC'],
            [CompanyMaster,'company_name','ASC']
        ]});
        res.send({data,isAdmin});
    }else if(val=='license'){        
        const data = await LabourLicense.findAll({order:[
            [ClientMaster,'client_name','ASC'],
            [CompanyMaster,'company_name','ASC']
        ],include:[CompanyMaster,ClientMaster]});
        res.send({data,isAdmin});
    }
});
exports.searchPf = catchAsyncErrors( async (req, res, next) => {
    //search pf
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    const {val} = req.body;
    const data = await PF.findAll({where:{
        [Op.or]:[
        {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send({data,isAdmin});
    
});
exports.searchEsic = catchAsyncErrors( async (req, res, next) => {
    //search pf
    var permissions;

    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    const {val} = req.body;
    const data = await ESIC.findAll({where:{
        [Op.or]:[
        {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
res.send({data,isAdmin});
    
});
exports.searchPtax = catchAsyncErrors( async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    const {val} = req.body;
    const data = await PTAX.findAll({where:{
        [Op.or]:[
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [CompanyMaster]
});    
res.send({data,isAdmin});
    
});
exports.searchLwf = catchAsyncErrors( async (req, res, next) => {
    //search pf
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    const {val} = req.body;
    const data = await LWF.findAll({where:{
        [Op.or]:[
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster]
});    
    res.send({data,isAdmin});
    
});
exports.searchLabourReturn = catchAsyncErrors( async (req, res, next) => {
    //search pf
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    const {val} = req.body;
    const data = await LabourReturn.findAll({where:{
        [Op.or]:[
        {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
res.send({data,isAdmin});
    
});
exports.searchAgreement = catchAsyncErrors( async (req, res, next) => {
    //search pf
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    const {val} = req.body;
    const data = await Agreement.findAll({where:{
        [Op.or]:[
        {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
res.send({data,isAdmin});
    
});
exports.searchLabourLicense = catchAsyncErrors( async (req, res, next) => {
    //search pf
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
     const {val} = req.body;
    const data = await LabourLicense.findAll({where:{
        [Op.or]:[
        {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send({data,isAdmin});
    
});

exports.deleteStatute = catchAsyncErrors( async(req, res, next) => {
    const { id,val } = req.body;
    if(val=='pf'){
        const pvt = await PF.findByPk(id);
        await pvt.destroy();
        res.send({
            message:'Successfully Deleted'
        })   
    }else if(val=='esic'){
        const pvt = await ESIC.findByPk(id);
        await pvt.destroy();
        res.send({
            message:'Successfully Deleted'
        }) 
    }else if(val=='ptax'){
        const pvt = await PTAX.findByPk(id);
        await pvt.destroy();
        res.send({
            message:'Successfully Deleted'
        }) 
    }else if(val=='lwf'){
        const pvt = await LWF.findByPk(id);
        await pvt.destroy();
        res.send({
            message:'Successfully Deleted'
        }) 
    }else if(val=='return'){
        const pvt = await LabourReturn.findByPk(id);
        await pvt.destroy();
        res.send({
            message:'Successfully Deleted'
        }) 
    }else if(val=='license'){
        const pvt = await LabourLicense.findByPk(id);
        await pvt.destroy();
        res.send({
            message:'Successfully Deleted'
        }) 
    }else if(val=='agreement'){
        const pvt = await Agreement.findByPk(id);
        await pvt.destroy();
        res.send({
            message:'Successfully Deleted'
        }) 
    }
   

});

exports.postAgreementDue = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        from_date,
        to_date
    } = req.body;
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];
    // var dd=new Date(month_year);
    // var month =  monthNames[dd.getMonth()];
    // var year=month_year.substr(0,4);
    var from_date2 = new Date(from_date);
                        var from_date_mm = from_date2.getMonth()+1;
                        var to_date2 = new Date(to_date);
                        var to_date_mm = to_date2.getMonth()+1;
                        const date2 = new Date();
                        const diffTime = Math.abs(to_date2 - date2);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        const isNegDate = (to_date2-date2) <0 ? true : false;
                       
    let submittedInvoices;
    if(company){
        submittedInvoices = await Agreement.findAll({where:{company_id:company,
            from_date:{[Op.gte]: from_date},
            to_date:{[Op.lte]: to_date}           }});
        let arr=[];
        for(var i=0;i<submittedInvoices.length;i++){
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
                'Status': 'NA'
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/Agreement_due.xlsx`)
        const filePath = path.join(`output/Agreement_due.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="Agreement_due.xlsx"`)  ;  
        return res.send(data);
        });

    }else{
        submittedInvoices = await Agreement.findAll({where:{company_id:company,
            from_date:{[Op.gte]: from_date},
            to_date:{[Op.lte]: to_date}           }});
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
                'Status': 'NA'
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/Agreement_due.xlsx`)
        const filePath = path.join(`output/Agreement_due.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="Agreement_due.xlsx"`)  ;  
        return res.send(data);
        });
    }
    

    
});

exports.postLabourLicenseDue = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        from_date,
        to_date
    } = req.body;
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];
    // var dd=new Date(month_year);
    // var month =  monthNames[dd.getMonth()];
    // var year=month_year.substr(0,4);
    var from_date2 = new Date(from_date);
                        var from_date_mm = from_date2.getMonth()+1;
                        var to_date2 = new Date(to_date);
                        var to_date_mm = to_date2.getMonth()+1;
                        const date2 = new Date();
                        const diffTime = Math.abs(to_date2 - date2);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        const isNegDate = (to_date2-date2) <0 ? true : false;
                       
    let submittedInvoices;
    if(company){
        submittedInvoices = await LabourLicense.findAll({where:{company_id:company,
            from_date:{[Op.gte]: from_date},
            to_date:{[Op.lte]: to_date}           }});
        let arr=[];
        for(var i=0;i<submittedInvoices.length;i++){
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
                'Status': 'NA'
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/LabourLicense_due.xlsx`)
        const filePath = path.join(`output/LabourLicense_due.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="LabourLicense_due.xlsx"`)  ;  
        return res.send(data);
        });

    }else{
        submittedInvoices = await LabourLicense.findAll({where:{company_id:company,
            from_date:{[Op.gte]: from_date},
            to_date:{[Op.lte]: to_date}           }});
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
                'Status': 'NA'
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/LabourLicense_due.xlsx`)
        const filePath = path.join(`output/LabourLicense_due.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="LabourLicense_due.xlsx"`)  ;  
        return res.send(data);
        });
    }
    

    
});
exports.postLabourReturnDue = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        from_date,
        to_date
    } = req.body;
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];
    // var dd=new Date(month_year);
    // var month =  monthNames[dd.getMonth()];
    // var year=month_year.substr(0,4);
    var from_date2 = new Date(from_date);
                        var from_date_mm = from_date2.getMonth()+1;
                        var to_date2 = new Date(to_date);
                        var to_date_mm = to_date2.getMonth()+1;
                        const date2 = new Date();
                        const diffTime = Math.abs(to_date2 - date2);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                        const isNegDate = (to_date2-date2) <0 ? true : false;
                       
    let submittedInvoices;
    if(company){
        submittedInvoices = await LabourReturn.findAll({where:{company_id:company,
            from_date:{[Op.gte]: from_date},
            to_date:{[Op.lte]: to_date}           }});
        let arr=[];
        for(var i=0;i<submittedInvoices.length;i++){
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
                'Status': 'NA'
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/LabourReturn_due.xlsx`)
        const filePath = path.join(`output/LabourReturn_due.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="LabourReturn_due.xlsx"`)  ;  
        return res.send(data);
        });

    }else{
        submittedInvoices = await LabourReturn.findAll({where:{company_id:company,
            from_date:{[Op.gte]: from_date},
            to_date:{[Op.lte]: to_date}           }});
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
                'Status': 'NA'
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/LabourReturn_due.xlsx`)
        const filePath = path.join(`output/LabourReturn_due.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="LabourReturn_due.xlsx"`)  ;  
        return res.send(data);
        });
    }
    

    
});

exports.getAgreementReport = catchAsyncErrors( async(req,res,next) =>{
    const { company } = req.query;
    let companies, cmpname;
    if(!company){
        companies = await CompanyMaster.findAll({order: [ [ 'company_name', 'ASC' ]]})
        }else{
        companies = await CompanyMaster.findAll({where:{id:company},order: [ [ 'company_name', 'ASC' ]]})
        cmpname= companies[0].company_name;

        // companies = await Agreement.findAll({where:{id:company},include:[CompanyMaster,ClientMaster]})
     }
     let data = [];
    
for (const el of companies) {
    let clients = await ClientMaster.findAll({ where: { company_id: el.id }, order: [['client_name', 'ASC']] });

    for (const ele of clients) {
        let agreement = await Agreement.findAll({
            where: { company_id: el.id, client_id: ele.id },
            include: [CompanyMaster, ClientMaster]
        });

        if (agreement.length>0) {
            agreement.forEach(ag => {
                const to_date = new Date(ag.to_date);
                const date2 = new Date();
                const isNegDate = (to_date - date2) < 0;
                const status = isNegDate ? 'Expired' : 'Valid';

                data.push({
                    'Company Name': el.company_name,
                    'Client Name': ele.client_name,
                    'Agreement': 'Uploaded',
                    'Status': status,
                    'From Date': ag.from_date,
                    'To Date': ag.to_date
                });
            });
        } else {
            data.push({
                'Company Name': el.company_name,
                'Client Name': ele.client_name,
                'Agreement': 'Not Done',
                'Status': 'NA',
                'From Date': '',
                'To Date': ''
            });
        }
    }
}
var company_namee = '';
if(cmpname){
    // company_namee= newReg[0].company_master.company_name;
    company_namee= cmpname.replace('/','')+'_';

}
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws)
XLSX.writeFile(wb, `output/${company_namee}agreement_report.xlsx`)
const filePath = path.join(`output/${company_namee}agreement_report.xlsx`);

fs.readFile(filePath, (err,data) =>{
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `inline; filename="${company_namee}agreement_report.xlsx"`)  ;  
res.send(data);
});
});
exports.getLicenseReport = catchAsyncErrors( async(req,res,next) =>{
    console.log('asdasdadadadadadadadad-----------------------');
    const { company } = req.query;
    let companies, cmpname;
    if(!company){
        companies = await CompanyMaster.findAll({order: [ [ 'company_name', 'ASC' ]]})
        }else{
        companies = await CompanyMaster.findAll({where:{id:company},order: [ [ 'company_name', 'ASC' ]]})
        cmpname= companies[0].company_name;

        // companies = await Agreement.findAll({where:{id:company},include:[CompanyMaster,ClientMaster]})
     }
     let data = [];
    
for (const el of companies) {
    let clients = await ClientMaster.findAll({ where: { company_id: el.id }, order: [['client_name', 'ASC']] });

    for (const ele of clients) {
        let agreement = await LabourLicense.findAll({
            where: { company_id: el.id, client_id: ele.id },
            include: [CompanyMaster, ClientMaster]
        });

        if (agreement.length>0) {
            agreement.forEach(ag => {
                const to_date = new Date(ag.to_date);
                const date2 = new Date();
                const isNegDate = (to_date - date2) < 0;
                const status = isNegDate ? 'Expired' : 'Valid';

                data.push({
                    'Company Name': el.company_name,
                    'Client Name': ele.client_name,
                    'License': 'Uploaded',
                    'Status': status,
                    'From Date': ag.from_date,
                    'To Date': ag.to_date
                });
            });
        } else {
            data.push({
                'Company Name': el.company_name,
                'Client Name': ele.client_name,
                'License': 'Not Done',
                'Status': 'NA',
                'From Date': '',
                'To Date': ''
            });
        }
    }
}
var company_namee = '';
if(cmpname){
    // company_namee= newReg[0].company_master.company_name;
    company_namee= cmpname.replace('/','')+'_';

}
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws)
XLSX.writeFile(wb, `output/${company_namee}license_report.xlsx`)
const filePath = path.join(`output/${company_namee}license_report.xlsx`);

fs.readFile(filePath, (err,data) =>{
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `inline; filename="${company_namee}license_report.xlsx"`)  ;  
res.send(data);
});
});
exports.deleteSelectedLicenses = catchAsyncErrors( async(req, res, next) => {
    const { val } = req.body;
    val.forEach(async element => {
        const pvt = await LabourLicense.findByPk(element);
        await pvt.destroy();
       
    });
       
    res.send({
        message:'Successfully Deleted'
    }) 

});
