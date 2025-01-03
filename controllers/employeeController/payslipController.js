const Sequelize = require("sequelize");
const CompanyMaster = require("../../models/admin/company_master");
const ClientMaster = require("../../models/admin/client_master");
const Op = Sequelize.Op;
const catchAsyncErrors = require("../../utils/catchAsyncErrors");
const path = require('path')
const PDFDocument = require('pdfkit')
const fs = require('fs');
const WageRegister = require("../../models/admin/wage_register");
const Payslip = require("../../models/admin/payslip");
const NewRegistration = require("../../models/admin/new_registration");
const SalaryMaster = require("../../models/admin/salary_master");
const AttendanceRegister = require("../../models/admin/attendance_register");
const XLSX = require('xlsx');
const LeaveRegister = require("../../models/admin/leave_register");

exports.getWageRegister = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const wages = await WageRegister.findAll({include:[CompanyMaster,ClientMaster],order:[['id','DESC']]});
    let isPreview=false;
    if(req.query){
        isPreview  = req.query.isPreview;
    }
    res.render('employee/wage_register',{
        companies,
        wages,
        isPreview:isPreview,
        permissions
    });
    
});

exports.postWageRegister = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        client,
        month_year,
        remarks,
    } = req.body;
    
    await WageRegister.create({
        company_id:company,
        client_id:client=="" ? null : client ,
        month_year:month_year,
        comment:remarks,
        document:req.files.length > 0 ? req.files[0].path : '',
        user_id:req.session.user.id 
    });

    res.redirect('/employee/wage-register?isPreview=true');
    
});


exports.getWageRegisterEdit = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const wage = await WageRegister.findOne({include:[CompanyMaster,ClientMaster],where:{id:req.params.id}});
  
    res.render('employee/wage_register_edit',{
        companies,
        wage,
        permissions
    });
 
});

exports.postWageRegisterEdit = catchAsyncErrors(async (req, res, next) => {
    const {
        id,
        company,
        client,
        remarks,
        month_year
    } = req.body;
    const oldWage = await WageRegister.findOne({where:{id:id}});
    await WageRegister.update({
        company_id:company,
        client_id:client=="" ? null : client ,
        comment:remarks,
        month_year:month_year,
        document:req.files.length > 0 ? req.files[0].path : oldWage.document,
        user_id:req.session.user.id 
    },{where:{id:id}});

    res.redirect('/employee/wage-register?isPreview=true');
    
});

exports.postWageRegisterDue = catchAsyncErrors(async (req, res, next) => {
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
        submittedInvoices = await WageRegister.findAll({where:{month_year:month_year,company_id:company}});
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
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/WageRegister_due_${month_year}.xlsx`)
        const filePath = path.join(`output/WageRegister_due_${month_year}.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="WageRegister_due_${month_year}.xlsx"`)  ;  
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
exports.searchWage = catchAsyncErrors( async (req, res, next) => {
    const {company,month_year} = req.body;
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    if(company && month_year){
        const invoice = await WageRegister.findAll({where:{
            [Op.and]:[
                {month_year:month_year},
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }else if(company && !month_year){
        const invoice = await WageRegister.findAll({where:{
            [Op.or]:[
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }else if(!company && month_year){
        const invoice = await WageRegister.findAll({where:{
            [Op.or]:[
                {month_year:month_year},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }
  
 
    
});

exports.searchWage2 = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    var dd = '';
   
    if(val.includes('-') || val.includes('/')){
        dd = val.substr(6,4) + '-' + val.substr(3,2);
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
    const invoice = await WageRegister.findAll({where:{
        [Op.or]:[
            {month_year:dd},
            {'$client_master.client_name$':{[Op.substring]:val}},
            {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send({invoice,isAdmin});
    
    
});
exports.deleteWageRegister = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await WageRegister.destroy({where:{id:id}});
    res.send('Successful');

  
});

//payslip

exports.getPayslip = catchAsyncErrors( async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;    }
    
    res.render('employee/payslip_module',{
        permissions
    });
    
});

exports.getPayslipBulk = catchAsyncErrors( async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const payslips = await Payslip.findAll({include:[CompanyMaster,ClientMaster],order:[['id','DESC']]});
    let isPreview=false;
    if(req.query){
        isPreview  = req.query.isPreview;
    }
    res.render('employee/payslip',{
        companies,
        isPreview,
        payslips,
        permissions
    });
    
});

exports.postPayslipBulk = catchAsyncErrors( async (req, res, next) => {
    const {
        company,
        client,
        month_year,
        remarks
    } = req.body;
    
    await Payslip.create({
        company_id:company,
        client_id:client=="" ? null : client ,
        comment:remarks,
        month_year:month_year,
        document:req.files.length > 0 ? req.files[0].path : '',
        user_id:req.session.user.id 
    });

    res.redirect('/employee/payslip-bulk?isPreview=true');
    
    
});
exports.searchPayslip = catchAsyncErrors( async (req, res, next) => {
    const {company,month_year} = req.body;
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    if(company && month_year){
        const invoice = await Payslip.findAll({where:{
            [Op.and]:[
                {month_year:month_year},
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }else if(company && !month_year){
        const invoice = await Payslip.findAll({where:{
            [Op.or]:[
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }else if(!company && month_year){
        const invoice = await Payslip.findAll({where:{
            [Op.or]:[
                {month_year:month_year},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }
  
 
    
});

exports.searchPayslip2 = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    var dd = '';
   
    if(val.includes('-') || val.includes('/')){
        dd = val.substr(6,4) + '-' + val.substr(3,2);
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
    const invoice = await Payslip.findAll({where:{
        [Op.or]:[
            {month_year:dd},
            {'$client_master.client_name$':{[Op.substring]:val}},
            {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send({invoice,isAdmin});
    
    
});

exports.postPayslipDue = catchAsyncErrors(async (req, res, next) => {
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
        submittedInvoices = await Payslip.findAll({where:{month_year:month_year,company_id:company}});
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
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/Payslip_due_${month_year}.xlsx`)
        const filePath = path.join(`output/Payslip_due_${month_year}.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="Payslip_due_${month_year}.xlsx"`)  ;  
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
exports.getPayslipEdit = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const payslip = await Payslip.findOne({include:[CompanyMaster,ClientMaster],where:{id:req.params.id}});
      
    res.render('employee/payslip_edit',{
        companies,
        payslip,
        permissions
    });
   
});

exports.postPayslipBulkEdit = catchAsyncErrors( async (req, res, next) => {
    const {
        id,
        company,
        client,
        remarks,
        month_year
    } = req.body;
    const oldPayslip = await Payslip.findOne({where:{id:id}});
 
    await Payslip.update({
        company_id:company,
        client_id:client=="" ? null : client ,
        comment:remarks,
        month_year:month_year,
        document:req.files.length > 0 ? req.files[0].path : oldPayslip.document,
        user_id:req.session.user.id 
    },{where:{id:id}});

    res.redirect('/employee/payslip-bulk?isPreview=true');
    
    
});

exports.deletePayslipBulk = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await Payslip.destroy({where:{id:id}});
    res.send('Successful');

  
});

exports.getPayslipIndividual = catchAsyncErrors( async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    res.render('employee/payslip_individual',{
        permissions
    });
    
});

exports.postPayslipIndividual = catchAsyncErrors( async (req, res, next) => {
    const {
        employeeId,
        month_year
    } = req.body;

    const employee = await NewRegistration.findByPk(employeeId,{include:[CompanyMaster,ClientMaster]});
    const salary = await SalaryMaster.findOne({where:{new_registration_id:employeeId,month_year:month_year}});
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];
    var dd=new Date(month_year);
    var mm =  monthNames[dd.getMonth()];
    const invoiceName = employee.emp_name + '_payslip_'+mm+'_'+dd.getFullYear()+'.pdf';
    const invoicePath = path.join('uploads', invoiceName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    const pdfDoc = new PDFDocument();

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
   
    pdfDoc.fontSize(15).font('Helvetica-Bold').text(mm +' '+dd.getFullYear(), 20, 40, {
        align: 'left',
        underline:true,
        width: 550
    });   
    if(employee.company_master.logo){ 
    if (fs.existsSync(employee.company_master.logo)) {
            pdfDoc.image(employee.company_master.logo, 500, 20, {
                fit: [90, 90],
                align: 'right',
                valign: 'top'
            });
        }
    }
 
    pdfDoc.moveDown();
    pdfDoc.fontSize(12);
    pdfDoc.font('Helvetica').text('Employee Name : '+employee.emp_name,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Employee Id : '+employee.emp_code,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Client : '+employee.client_master.client_name,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('________________________________________________________________________________',{
        align: 'left',
        width: 560,
        underline:false
    });   
    pdfDoc.moveDown();
    if(salary!=null){
    pdfDoc.font('Helvetica').text('Attendance : '+ salary ? salary.attendance : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Proportionate Gross : '+ salary ? salary.pro_gross : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Proportionate Basic : '+ salary ? salary.pro_basic : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Employee PF : '+ salary ? salary.employee_pf : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Employee ESIC : '+ salary ? salary.employee_esic : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('PTAX : '+ salary ? salary.ptax : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('LWF : '+ salary ? salary.lwf : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Advance : '+ salary ? salary.advance : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Others : '+ salary ? salary.others : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Management PF : '+ salary ? salary.management_pf : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Management ESIC : '+ salary ? salary.management_esic : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown(); 
    pdfDoc.fontSize(15).font('Helvetica-Bold').text('Net Pay : '+ salary ? salary.net_pay : 0,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
}else{
    pdfDoc.fontSize(15).font('Helvetica-Bold').text('Not Uploaded Yet',{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
}
    
   
    pdfDoc.end();        
});


exports.getAttendanceRegister = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const attendance = await AttendanceRegister.findAll({include:[CompanyMaster,ClientMaster],order:[['id','DESC']]});
    let isPreview=false;
    if(req.query){
        isPreview  = req.query.isPreview;
    }
    res.render('employee/attendance_register',{
        companies,
        attendance,
        isPreview:isPreview
    });
    
});

exports.postAttendanceRegister = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        client,
        month_year,
        remarks
    } = req.body;
    
    await AttendanceRegister.create({
        company_id:company,
        client_id:client=="" ? null : client ,
        comment:remarks,
        month_year:month_year,
        document:req.files.length > 0 ? req.files[0].path : '',
        user_id:req.session.user.id 
    });

    res.redirect('/employee/attendance-register?isPreview=true');
    
});

exports.postAttendanceRegisterDue = catchAsyncErrors(async (req, res, next) => {
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
        submittedInvoices = await AttendanceRegister.findAll({where:{month_year:month_year,company_id:company}});
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
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/AttendanceRegister_due_${month_year}.xlsx`)
        const filePath = path.join(`output/AttendanceRegister_due_${month_year}.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="AttendanceRegister_due_${month_year}.xlsx"`)  ;  
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
exports.getAttendanceRegisterEdit = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const attendance = await AttendanceRegister.findOne({include:[CompanyMaster,ClientMaster],where:{id:req.params.id}});
  
    res.render('employee/attendance_register_edit',{
        companies,
        attendance
    });
 
});


exports.postAttendanceRegisterEdit = catchAsyncErrors(async (req, res, next) => {
    const {
        id,
        company,
        client,
        month_year,
        remarks
    } = req.body;
    const oldAttendance = await AttendanceRegister.findOne({where:{id:id}});
    await AttendanceRegister.update({
        company_id:company,
        client_id:client=="" ? null : client ,
        comment:remarks,
        month_year:month_year,
        document:req.files.length > 0 ? req.files[0].path : oldAttendance.document,        
        user_id:req.session.user.id 
    },{where:{id:id}});

    res.redirect('/employee/attendance-register?isPreview=true');
    
});

exports.deleteAttendanceRegister = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await AttendanceRegister.destroy({where:{id:id}});
    res.send('Successful');

  
});

exports.searchAttendance = catchAsyncErrors( async (req, res, next) => {
    const {company,month_year} = req.body;
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    if(company && month_year){
        const invoice = await AttendanceRegister.findAll({where:{
            [Op.and]:[
                {month_year:month_year},
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }else if(company && !month_year){
        const invoice = await AttendanceRegister.findAll({where:{
            [Op.or]:[
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }else if(!company && month_year){
        const invoice = await AttendanceRegister.findAll({where:{
            [Op.or]:[
                {month_year:month_year},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send({invoice,isAdmin});

    }
  
 
    
});

exports.searchAttendance2 = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    var dd = '';
   
    if(val.includes('-') || val.includes('/')){
        dd = val.substr(6,4) + '-' + val.substr(3,2);
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
    const invoice = await AttendanceRegister.findAll({where:{
        [Op.or]:[
            {month_year:dd},
            {'$client_master.client_name$':{[Op.substring]:val}},
            {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send({invoice,isAdmin});
    
    
});

exports.getLeaveRegister = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const attendance = await LeaveRegister.findAll({include:[CompanyMaster,ClientMaster],order:[['id','DESC']]});
    let isPreview=false;
    if(req.query){
        isPreview  = req.query.isPreview;
    }
    res.render('admin/leave_register',{
        companies,
        attendance,
        isPreview:isPreview
    });
    
});

exports.postLeaveRegister = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        client,
        month_year,
        remarks
    } = req.body;
    
    await LeaveRegister.create({
        company_id:company,
        client_id:client=="" ? null : client ,
        comment:remarks,
        month_year:month_year,
        document:req.files.length > 0 ? req.files[0].path : ''
    });

    res.redirect('/admin/leave-register?isPreview=true');
    
});

exports.postLeaveRegisterDue = catchAsyncErrors(async (req, res, next) => {
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
        submittedInvoices = await LeaveRegister.findAll({where:{month_year:month_year,company_id:company}});
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
            });
        });
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/LeaveRegister_due_${month_year}.xlsx`)
        const filePath = path.join(`output/LeaveRegister_due_${month_year}.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="LeaveRegister_due_${month_year}.xlsx"`)  ;  
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
exports.getLeaveRegisterEdit = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const attendance = await LeaveRegister.findOne({include:[CompanyMaster,ClientMaster],where:{id:req.params.id}});
  
    res.render('admin/leave_register_edit',{
        companies,
        attendance
    });
 
});


exports.postLeaveRegisterEdit = catchAsyncErrors(async (req, res, next) => {
    const {
        id,
        company,
        client,
        month_year,
        remarks
    } = req.body;
    const oldLeave = await LeaveRegister.findOne({where:{id:id}});
    await LeaveRegister.update({
        company_id:company,
        client_id:client=="" ? null : client ,
        comment:remarks,
        month_year:month_year,
        document:req.files.length > 0 ? req.files[0].path : oldLeave.document
    },{where:{id:id}});

    res.redirect('/admin/leave-register?isPreview=true');
    
});

exports.deleteLeaveRegister = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await LeaveRegister.destroy({where:{id:id}});
    res.send('Successful');

  
});

exports.searchLeave = catchAsyncErrors( async (req, res, next) => {
    const {company,month_year} = req.body;   
    if(company && month_year){
        const invoice = await LeaveRegister.findAll({where:{
            [Op.and]:[
                {month_year:month_year},
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send(invoice);

    }else if(company && !month_year){
        const invoice = await LeaveRegister.findAll({where:{
            [Op.or]:[
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send(invoice);

    }else if(!company && month_year){
        const invoice = await LeaveRegister.findAll({where:{
            [Op.or]:[
                {month_year:month_year},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send(invoice);

    }
  
 
    
});

exports.searchLeave2 = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    var dd = '';
   
    if(val.includes('-') || val.includes('/')){
        dd = val.substr(6,4) + '-' + val.substr(3,2);
        console.log(dd);
    }
    
    const invoice = await LeaveRegister.findAll({where:{
        [Op.or]:[
            {month_year:dd},
            {'$client_master.client_name$':{[Op.substring]:val}},
            {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send(invoice);
    
    
});