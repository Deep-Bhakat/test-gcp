const CompanyMaster = require("../../models/admin/company_master");
const catchAsyncErrors = require("../../utils/catchAsyncErrors");
const Sequelize = require("sequelize");
const ClientMaster = require("../../models/admin/client_master");
const PaymentBanking = require("../../models/admin/payment_banking");
const PaymentBankingClients = require("../../models/admin/payment_banking_clients");
const Op = Sequelize.Op;

const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path');
const XLSX = require('xlsx');
const readXlsxFile = require('read-excel-file/node');
const PaymentExcel = require("../../models/admin/payment_excel");
const PaymentExcelMaster = require("../../models/admin/payment_excel_master");
const NewRegistration = require("../../models/admin/new_registration");
const BillMaker = require("../../models/admin/bill_maker");
exports.getPayments = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    res.render('employee/payments',{
        permissions
    });
});

exports.getUploadPayments = catchAsyncErrors(async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
    res.render('employee/upload_payments',{
        message:'',
        companies,
        clients,
        permissions
    });   
});
exports.postUploadPayments = catchAsyncErrors(async(req, res, next) => {
    const {
        company,
        client,
        date,
        clients,
        code,    
        payment_type
    }= req.body;
    const files = req.files;

    const paymentBanking = await PaymentBanking.create({
        company_id:company,
        date,
        payment_type,
        document:files[0].path,
        client_id:client || 0,
        user_id:req.session.user.id 
    });

    if(payment_type === "CASH"){
        await PaymentBankingClients.create({
            payment_banking_id:paymentBanking.id,
            client_id:client
        });
    }else{
        for(var i=0;i<clients.length;i++){
            await PaymentBankingClients.create({
                payment_banking_id:paymentBanking.id,
                client_id:clients[i],
                code:code[i]
            });
        }
    }
    const companies = await CompanyMaster.findAll();
    const allClients = await ClientMaster.findAll();
    res.render('employee/upload_payments',{
        message:'Uploaded Successfully',
        companies,
        clients:allClients
    });   
});
exports.getViewPayments = catchAsyncErrors(async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
    res.render('employee/view_payments',{
        message:'',
        companies,
        clients,
        permissions
    });   
});
exports.getPaymentBankingData = catchAsyncErrors(async(req, res, next) => {
    const {
        company,
        client,
        date1,
        date2
    } = req.body;
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    //if only company is selected
    if(!client && !date1 && !date2){
        const payment_banking = await PaymentBanking.findAll(
            {where:{
                [Op.or]:[
                    {company_id:company}
                ]
            },include:[{model:PaymentBankingClients,include:[ClientMaster]},CompanyMaster]});  
        return res.send({payment_banking,isAdmin});   
        }
    if(!client && !date1){
            const payment_banking = await PaymentBanking.findAll(
                {where:{
                    [Op.and]:[
                        {company_id:company},
                        {date:{[Op.lte]: date2}}
                    ]
                },include:[{model:PaymentBankingClients,include:[ClientMaster]},CompanyMaster]});  
    
            return res.send({payment_banking,isAdmin});   
    }
    if(!client && !date2){
        const payment_banking = await PaymentBanking.findAll(
            {where:{
                [Op.and]:[
                    {company_id:company},
                    {date:{[Op.gte]: date1}}
                ]
            },include:[{model:PaymentBankingClients,include:[ClientMaster]},CompanyMaster]});  

        return res.send({payment_banking,isAdmin});   
}
if(!client){
    const payment_banking = await PaymentBanking.findAll(
        {where:{
            [Op.and]:[
                {company_id:company},
                {date:{[Op.between]: [date1, date2]}}
            ]
        },include:[{model:PaymentBankingClients,include:[ClientMaster]},CompanyMaster]});  

    return res.send({payment_banking,isAdmin});   
}
    //if company and client is selected
    if(!date1 && !date2){
        const payment_banking = await PaymentBanking.findAll(
            {where:{
                [Op.and]:[
                    {company_id:company},
                    {'$payment_banking_clients.client_id$':client}
                ]
            },include:[{model:PaymentBankingClients,include:[ClientMaster]},CompanyMaster]});  
            return res.send({payment_banking,isAdmin});   
        }
        // if company client and date2 is selected
    if(!date1){
        const payment_banking = await PaymentBanking.findAll(
            {where:{
                [Op.and]:[
                    {company_id:company},
                    {'$payment_banking_clients.client_id$':client},
                    {date:{[Op.lte]: date2}}
                ]
            },include:[{model:PaymentBankingClients,include:[ClientMaster]},CompanyMaster]});  
            return res.send({payment_banking,isAdmin});   
    }
        // if company client and date1 is selected
    if(!date2){
        const payment_banking = await PaymentBanking.findAll(
            {where:{
                [Op.and]:[
                    {company_id:company},
                    {'$payment_banking_clients.client_id$':client},
                    {date:{[Op.gte]: date1}}
                ]
            },include:[{model:PaymentBankingClients,include:[ClientMaster]},CompanyMaster]});  
            return res.send({payment_banking,isAdmin});   
    }
    const payment_banking = await PaymentBanking.findAll(
        {where:{
            [Op.and]:[
                {company_id:company},
                {'$payment_banking_clients.client_id$':client},
                {date:{[Op.between]: [date1, date2]}}
            ]
        },include:[{model:PaymentBankingClients,include:[ClientMaster]},CompanyMaster]});  

    res.send({payment_banking,isAdmin});   
});

exports.getViewPaymentsUploads = catchAsyncErrors(async( req,res,next) =>{
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const {
        id
    } = req.params;

    const payment_banking = await PaymentBanking.findByPk(id);
    const payment_banking_clients = await PaymentBankingClients.findAll({
        where:{payment_banking_id:id},
        include:[ClientMaster]
    });

    res.render('employee/view_payments_uploads',{
        files:payment_banking,
        payment_banking_clients,
        permissions

    })
});

exports.deletePayments = catchAsyncErrors(async( req,res,next) =>{
    const {
        id
    } = req.body;
    console.log(id);
    const payment_banking = await PaymentBanking.findByPk(id);
    const payment_banking_clients = await PaymentBankingClients.destroy({
        where:{payment_banking_id:id}
    });
    // await payment_banking_clients.destroy();
     await payment_banking.destroy();
     res.send('Successful');
});

exports.downloadNeft = catchAsyncErrors(async( req,res,next) =>{
    const {
        id
    } = req.params;
    const payment_banking = await PaymentBanking.findByPk(id);
    const payment_banking_clients = await PaymentBankingClients.findAll({
        where:{payment_banking_id:id},include:[ClientMaster]
    });
    
     var doc = payment_banking.document;
    // var isPdf = doc.slice(doc.length-3,doc.length) === 'pdf' ? true : false;
    // if(isPdf){
    // }
    const pdfDoc = new PDFDocument();
    const date=new Date;

    const fileName = 'payment_Enet_document_'+ date.getTime() + '.pdf';
    const invoicePath = path.join('uploads', fileName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
  
    
    
    pdfDoc.text('Sl No',{
        align:'left',
        width:200,
        height:20,
        lineBreak:false,
        continued:true
    });
    pdfDoc.text('Client Name',{
        align:'center',
        width:200,
        height:20,
        lineBreak:false,
        continued:true
    });
    pdfDoc.text('Code',{
        align:'right',
        width:200,
        height:20,
        lineBreak:true,
    });
    pdfDoc.moveDown();
    for(var i=0;i<payment_banking_clients.length;i++){
        pdfDoc.text((i+1),{
            align:'left',
            width:200,
            height:20,
            lineBreak:false,
            continued:true
        });
        pdfDoc.text(payment_banking_clients[i].client_master.client_name,{
            align:'center',
            width:200,
            height:20,
            lineBreak:false,
            continued:true
        });
        pdfDoc.text(payment_banking_clients[i].code,{
            align:'right',
            width:200,
            height:20,
            lineBreak:false,
        });
    pdfDoc.moveDown();
}
// if(payment_banking.document){
//     if (fs.existsSync(payment_banking.document)) {

//     pdfDoc.image(payment_banking.document, {
//         fit: [500, 500],
//         align: 'center',
//         valign: 'center'
//     });
// }
// }
  pdfDoc.end();
  
  
  
  
  
});


exports.getPaymentExcelMaster = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const paymentExcel = await PaymentExcelMaster.findAll({include:[CompanyMaster]});
    const {isPreview} = req.query;
    res.render('employee/payment_excel_tab',{
            companies,
            message:'',
            paymentExcel,
            isPreview:isPreview
        });
   
});

exports.postPaymentExcelMaster = catchAsyncErrors(async(req, res, next) => {
    const {
        company,
        date,
        month_year
        } = req.body;
    
    const bill = await PaymentExcelMaster.create({
        company_id:company,
        month_year:month_year,
        date:date,
        document:req.files[0].path
    });
    const delay = (n) => new Promise( r => setTimeout(r, n*1000));
    const rows = await readXlsxFile('uploads/' + req.files[0].filename);      
    rows.shift(); 
    // if(rows[0][0]=="SL NO") rows.shift(); 
    // if(rows[0][0]=="SL NO") rows.shift(); 
    var lastSL = rows.length;
    var lastElement;
    // console.log(rows);
    rows.forEach(async element => {
        if(element[0]=="TOTAL" ){
            lastElement = element;
        }else if(element[0]!=null){
            let emp = null;
           if(element[2]!=null) emp = await NewRegistration.findOne({where:{emp_code:element[2]}});
            const client = await ClientMaster.findOne({where:{client_name:element[1]}});

            await PaymentExcel.create({
                name:element[0],
                emp_code:element[2],
                company_id:company,
                payment_excel_id:bill.id,
                client_id: client.id,
                month_year:month_year,
                date:date,
                amount:element[3],
                ac_no:element[4],
                ifsc:element[5],
                mode:element[6],
                type:element[7],
                new_registration_id:emp!=null ? emp.id : '0'
                // status:1            
            });    
            await delay(10);         
        }        
    });

    await PaymentExcel.create({
        name:lastElement[0],
        emp_code:lastElement[1],
        company_id:company,
        payment_excel_id:bill.id,
        // client_id:emp2.client_id,
        month_year:month_year,
        date:date,
        amount:lastElement[2],
        ac_no:lastElement[3],
        ifsc:lastElement[4],
        mode:lastElement[5],
        type:lastElement[6]
    }); 
    const companies = await CompanyMaster.findAll();
    // const billMaker = await PaymentExcelMaster.findOne({include:[CompanyMaster,ClientMaster], 
    //     order: [ [ 'id', 'DESC' ]],
    //     limit:1});
        const paymentExcel = await PaymentExcelMaster.findAll({include:[CompanyMaster]});

        res.render('employee/payment_excel_tab',{
            companies,
            message:'Uploaded Successfully',
            paymentExcel,
            isPreview:false

        });
   
});

exports.searchPaymentExcel = catchAsyncErrors( async (req, res, next) => {
    const {company,from_date,to_date,month_year} = req.body;
    //only company
    // if(!client_id && !from_date && !to_date && !month_year){
    // const payment_banking = await PaymentExcelMaster.findAll(
    //     {where:{
    //         [Op.and]:[
    //             {company_id:company},
    //         ]
    //     },include:[CompanyMaster]});  

    // return res.send(payment_banking);   
    // }
    // //company and client
    // // else if(!from_date && !to_date && !month_year){
    // //     const payment_banking = await PaymentExcelMaster.findAll(
    // //         {where:{
    // //             [Op.and]:[
    // //                 {company_id:company},
    // //                 {_id:company},
    // //             ]
    // //         },include:[CompanyMaster]});  
    
    // //     return res.send(payment_banking);   
    // //     }
    //  if(!to_date && !month_year){
    //     const payment_banking = await PaymentExcelMaster.findAll(
    //         {where:{
    //             [Op.and]:[
    //                 {company_id:company},
    //                 {date:{[Op.gte]: [from_date]}}
    //             ]
    //         },include:[CompanyMaster]});  
    
    //     return res.send(payment_banking);   
    //     }
    //     if(!from_date && !month_year){
    //         const payment_banking = await PaymentExcelMaster.findAll(
    //             {where:{
    //                 [Op.and]:[
    //                     {company_id:company},
    //                     {date:{[Op.lte]: [to_date]}}
    //                 ]
    //             },include:[CompanyMaster]});  
        
    //         return res.send(payment_banking);   
    //         }
    //      if(!month_year){
    //         const payment_banking = await PaymentExcelMaster.findAll(
    //             {where:{
    //                 [Op.and]:[
    //                     {company_id:company},
    //                     {date:{[Op.between]: [from_date,to_date]}}
    //                 ]
    //             },include:[CompanyMaster]});  
        
    //         return res.send(payment_banking);   
    //         }
    //  if(!client_id && !to_date && !month_year){
    //             const payment_banking = await PaymentExcelMaster.findAll(
    //                 {where:{
    //                     [Op.and]:[
    //                         {company_id:company},
    //                         {date:{[Op.gte]: [from_date]}}
    //                     ]
    //                 },include:[CompanyMaster]});  
            
    //             return res.send(payment_banking);   
    //     }
    //     if(!client_id && !month_year){
    //         const payment_banking = await PaymentExcelMaster.findAll(
    //             {where:{
    //                 [Op.and]:[
    //                     {company_id:company},
    //                     {date:{[Op.between]: [from_date,to_date]}}
    //                 ]
    //             },include:[CompanyMaster]});  
        
    //         return res.send(payment_banking);   
    // }

    // Initialize an array to hold the conditions
    let conditions = [];

    // Add conditions based on the presence of each parameter
    if (company) {
        conditions.push({ company_id: company });
    }
    // if (client_id) {
    //     conditions.push({ client_id: client_id });
    // }
    if (from_date) {
        conditions.push({ date: { [Op.gte]: new Date(from_date) } });
    }
    if (to_date) {
        conditions.push({ date: { [Op.lte]: new Date(to_date) } });
    }
    if (month_year) {
        conditions.push({ month_year: month_year });
    }

//         const payment_banking = await PaymentExcel.findAll(
//             {where:{
//                 [Op.and]:conditions,

//             }, attributes: [
//     [Sequelize.fn("DISTINCT", Sequelize.col("payment_excel_id")), "payment_excel_id"],
//     "*"],
//     group:["payment_excel_id"],
//   include:[CompanyMaster,ClientMaster]});  
        
        // if(payment_banking.length>0){
            //getting all the paymentExcelMaster ids
            // const excelIds = [];
            // payment_banking.forEach((payment)=>{
            //     excelIds.push(payment.payment_excel_id)
            // }
            // )
            const client = await PaymentExcelMaster.findAll(
            { where:{
                [Op.and]:conditions,

               
         },
            order: [ [ 'id', 'DESC' ]],
            include:[CompanyMaster]}); 
            // const client_name = payment_banking[0].client_master.client_name;
            return res.send(client);   

        //     }
        
        //     var client = payment_banking;
        //     var client_name = '';
        // return res.send({client,client_name});   
});    

exports.searchPaymentExcel2 = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    
    const client = await PaymentExcelMaster.findAll({where:{
        [Op.or]:[
        {month_year:{[Op.substring]:val}},
        // {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster]
});    
    res.send(client);
    
});


exports.deletePaymentExcel = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
     
     await PaymentExcel.destroy({where:{payment_excel_id:id}});
     await PaymentExcelMaster.destroy({where:{id:id}});
    res.send('Successful');

  
});


exports.getEmployeeReport = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    res.render('employee/employee_report',{
            companies,
            message:'',
        });
   
});
exports.getBankReport = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    res.render('employee/bank_report',{
            companies,
            message:'',
        });
   
});

exports.getExportBankReport = catchAsyncErrors(async (req, res, next) => {

    
    const { company,client,from_date,to_date,from_month,to_month } = req.query;
    let conditions = [];

    // Add conditions based on the presence of each parameter
    if (company) {
        conditions.push({ company_id: company });
    }
    if (client) {
        conditions.push({ client_id: client });
    }
    if (from_date) {
        conditions.push({ date: { [Op.gte]: new Date(from_date) } });
    }
    if (to_date) {
        conditions.push({ date: { [Op.lte]: new Date(to_date) } });
    }
    if (from_month) {
        conditions.push({ month_year: { [Op.gte]: from_month } });
    }
    if (to_month) {
        conditions.push({ month_year: { [Op.lte]: to_month } });
    }
    let newReg;
    // newReg = await PaymentExcel.findAll({where:{company_id:company},include:[CompanyMaster,ClientMaster,NewRegistrationDocuments,NewRegistrationAppointments]})
    const payment_banking = await PaymentExcel.findAll(
        {where:{
            [Op.and]:conditions
        },include:[CompanyMaster,ClientMaster,NewRegistration]});  
    let data = [];
    payment_banking.forEach(el =>{
        if(el.name!="TOTAL"){
            // console.log(el.name);
        data.push({
            'Company Name':el.company_master.company_name,
            'Client Name': el.client_master? el.client_master.client_name : 'NEW',
            'Employee Name':el.new_registration ? el.new_registration.emp_name : el.name,
            'Employee Code':el.new_registration_id == 0 ? "NEW" : el.new_registration.emp_code,
            'Aadhar No':el.new_registration ? el.new_registration.aadhar : '',
            'Pan No':el.new_registration ? el.new_registration.pan : '',
            'Bank Account No':el.new_registration ? el.new_registration.bank_ac: el.ac_no,
            'IFSC':el.new_registration ? el.new_registration.ifsc : el.ifsc,
            'Amount':el.amount,
            'Mode':el.mode,
            'Type':el.type,
            'Date':el.date,
           

         });
        }
    });       
var company_namee = '';
if(payment_banking[0]){
    // company_namee= newReg[0].company_master.company_name;
    company_namee= payment_banking[0].company_master.company_name.replace('/','');

}
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws)
XLSX.writeFile(wb, `output/${company_namee}_bank_export.xlsx`)
const filePath = path.join(`output/${company_namee}_bank_export.xlsx`);

fs.readFile(filePath, (err,data) =>{
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `inline; filename="${company_namee}_bank_export.xlsx"`)  ;  
res.send(data);
});
});


exports.getSalaryReport = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    res.render('employee/salary_report',{
            companies,
            message:'',
        });
   
});

exports.getExportSalaryReport = catchAsyncErrors(async (req, res, next) => {

    
    const { company,client,from_month,to_month } = req.query;
    let conditions = [];

    // Add conditions based on the presence of each parameter
    if (company) {
        conditions.push({ company_id: company });
    }
    if (client) {
        conditions.push({ client_id: client });
    }
    // if (from_date) {
    //     conditions.push({ date: { [Op.gte]: new Date(from_date) } });
    // }
    // if (to_date) {
    //     conditions.push({ date: { [Op.lte]: new Date(to_date) } });
    // }
    if (from_month) {
        conditions.push({ month_year: { [Op.gte]: from_month } });
    }
    if (to_month) {
        conditions.push({ month_year: { [Op.lte]: to_month } });
    }
    let newReg;
    
   
        const payment_banking = await BillMaker.findAll(
            {where:{
                [Op.and]:conditions
            },include:[CompanyMaster,ClientMaster]}); 
    let data = [];
    
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ]; 
    payment_banking.forEach(el =>{
        if(el.name!='TOTAL'){
        var aa = el.month_year.substr(5,6);
        if(aa<9){
          aa = el.month_year.substr(6,6);
        }
        var mm =  monthNames[aa-1];            
        data.push({
            'Company Name':el.company_master.company_name,
            'Client Name':el.client_master ? el.client_master.client_name : '',
            'Month':mm,
            'Name Of The Worker':el.name,
            'EMPLOYEE CODE':el.emp_code,
            'GENDER':el.gender,
            'AADHAR NO':el.aadhaar,
            'UAN NO':el.uan,
            'ESIC NO':el.esic_no,
            // 'DESIGNATION':el.designation,
            // 'BANK':el.bank,
            'A/C NO':el.ac_no,
            'IFSC':el.ifsc,
            'GROSS SALARY':el.gross_salary,
            'BASIC SALARY':el.basic_salary,
            'HRA':el.hra,
            // 'PRESENT DAYS':el.present_days,
            // 'HOLIDAYS ( WEEKLY + FESTIVE)':el.holidays,
            // 'PAID LEAVE / LEAVE ADJUSTMENT':el.odd_hours,
            'ABSENT':el.absent,
            'TOTAL DAYS':el.total_days,
            'PROP GROSS':el.prop_gross,
            'OT RATE':el.ot_rate,
            'OT HOURS':el.ot_hour,
            'OT AMOUNT':el.ot_amount,
            'MINOR REIMBURSEMENT':el.minor_r,
            'VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)':el.variable_incentive,
            'ACTUAL PAY':el.actual_pay,
            'PROP BASIC':el.prop_basic,
            'PF':el.pf,
            'ESIC':el.esic,
            'PTAX':el.ptax,
            'LWF':el.lwf,
            'ADVANCE/ DEDUCTION':el.advance,
            'NET PAY':el.net_pay,
            'MGMT PF':el.mgmt_pf,
            'MGMT ESIC':el.mgmt_esic,
            'MGMT LWF':el.mgmt_lwf,
            // 'CTC':el.ctc,
            'PRODUCTION INCENTIVE':el.production_incentive,
            'ACTUAL PAYABLE':el.gross_incentive,
            // 'INVOICE AMOUNT1':el.invoice_amount1,
            // 'INVOICE AMOUNT2':el.invoice_amount2,
            // 'SERVICE CHARGE':el.service_charge,
            // 'COST OF CONTRACT STAFFING SERVICES 1':el.cost_of_contract,
            // 'COST OF CONTRACT STAFFING SERVICES 2':el.cost_of_contract2          

         });
        }
    });       
var company_namee = '';
if(payment_banking[0]){
    // company_namee= newReg[0].company_master.company_name;
    company_namee= payment_banking[0].company_master.company_name.replace('/','');

}
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws)
XLSX.writeFile(wb, `output/${company_namee}_salary_export.xlsx`)
const filePath = path.join(`output/${company_namee}_salary_export.xlsx`);

fs.readFile(filePath, (err,data) =>{
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `inline; filename="${company_namee}_salary_export.xlsx"`)  ;  
res.send(data);
});
});

exports.getEditPaymentExcelMaster = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const invoice = await PaymentExcelMaster.findByPk(req.params.id,{include:[CompanyMaster]});
    const {isPreview} = req.query;
    res.render('employee/payment_master_edit',{
            companies,
            message:'',
            invoice,
            isPreview:isPreview
        });
   
});

exports.postEditPaymentExcelMaster = catchAsyncErrors(async(req, res, next) => {
    const {
        id,
        company,
        date,
        month_year
        } = req.body;
    
        const oldInvoice = await PaymentExcelMaster.findByPk(id);
    var document = oldInvoice.doucment;
    if(req.files.length>0){
        document = req.files[0].path
    }
    const bill = await PaymentExcelMaster.update({
        company_id:company,
        month_year:month_year,
        date:date,
        document:document
    },{where:{id:id}});
    if(req.files.length>0){
        await PaymentExcel.destroy({where:{payment_excel_id:id}});

    const delay = (n) => new Promise( r => setTimeout(r, n*1000));
    const rows = await readXlsxFile('uploads/' + req.files[0].filename);      
    rows.shift(); 
    // if(rows[0][0]=="SL NO") rows.shift(); 
    // if(rows[0][0]=="SL NO") rows.shift(); 
    var lastSL = rows.length;
    var lastElement;
    // console.log(rows);
    rows.forEach(async element => {
        if(element[0]=="TOTAL" ){
            lastElement = element;
        }else if(element[0]!=null){
            const emp = await NewRegistration.findOne({where:{emp_code:element[1]}});

            await PaymentExcel.create({
                name:element[0],
                emp_code:element[1],
                company_id:company,
                payment_excel_id:bill.id,
                client_id:emp.client_id,
                month_year:month_year,
                date:date,
                amount:element[2],
                ac_no:element[3],
                ifsc:element[4],
                mode:element[5],
                type:element[6],
                new_registration_id:emp.id
                // status:1            
            });   
            await delay(10);         
        }        
    });

    await PaymentExcel.create({
        name:lastElement[0],
        emp_code:lastElement[1],
        company_id:company,
        payment_excel_id:bill.id,
        // client_id:emp2.client_id,
        month_year:month_year,
        date:date,
        amount:lastElement[2],
        ac_no:lastElement[3],
        ifsc:lastElement[4],
        mode:lastElement[5],
        type:lastElement[6]
    }); 
}
    const companies = await CompanyMaster.findAll();
    // const billMaker = await PaymentExcelMaster.findOne({include:[CompanyMaster,ClientMaster], 
    //     order: [ [ 'id', 'DESC' ]],
    //     limit:1});
        const paymentExcel = await PaymentExcelMaster.findAll({include:[CompanyMaster]});

        res.render('employee/payment_excel_tab',{
            companies,
            message:'Edited Successfully',
            paymentExcel,
            isPreview:false

        });
   
});

exports.getEmployeeWiseReport = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    res.render('employee/employee_wise_report',{
            companies,
            message:'',
        });
   
});

exports.getExportEmployeeWiseReport = catchAsyncErrors(async (req, res, next) => {

    
    const { company,emp,from_month,to_month } = req.query;
    let conditions = [];

    // Add conditions based on the presence of each parameter
    if (company) {
        conditions.push({ company_id: company });
    }
    if (emp) {
        conditions.push({ new_registration_id: emp });
    }
    if (from_month) {
        conditions.push({ month_year: { [Op.gte]: from_month } });
    }
    if (to_month) {
        conditions.push({ month_year: { [Op.lte]: to_month } });
    }
    let newReg;
    // newReg = await PaymentExcel.findAll({where:{company_id:company},include:[CompanyMaster,ClientMaster,NewRegistrationDocuments,NewRegistrationAppointments]})
    const payment_banking = await PaymentExcel.findAll(
        {where:{
            [Op.and]:conditions
        },include:[CompanyMaster,ClientMaster,NewRegistration]});  
    let data = [];
    payment_banking.forEach(el =>{
        if(el.name!="TOTAL"){
            // console.log(el);
        data.push({
            'Company Name':el.company_master.company_name,
            'Client Name':el.client_master ? el.client_master.client_name : '',
            'Employee Name':el.new_registration ? el.new_registration.emp_name : el.name,
            'Employee Code':el.new_registration ? el.new_registration.emp_code : "NEW",
            'Aadhar No':el.new_registration ? el.new_registration.aadhar : '',
            'Pan No':el.new_registration ? el.new_registration.pan : '',
            'PF':el.new_registration ? el.new_registration.pf : '',
            'ESIC':el.new_registration ? el.new_registration.esic : '',
            'Bank':el.new_registration ? el.new_registration.bank_name : '',
            'Account No':el.new_registration ? el.new_registration.bank_ac: el.ac_no,
            'IFSC':el.new_registration ? el.new_registration.ifsc : el.ifsc,
            'Date':el.date,
            'Amount':el.amount,
            // 'Mode':el.mode,
            // 'Type':el.type,
           

         });
        }
    });       
var company_namee = '';
if(payment_banking[0]){
    // company_namee= newReg[0].company_master.company_name;
    company_namee= payment_banking[0].company_master.company_name.replace('/','');

}
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws)
XLSX.writeFile(wb, `output/${company_namee}_employee_wise_report.xlsx`)
const filePath = path.join(`output/${company_namee}_employee_wise_report.xlsx`);

fs.readFile(filePath, (err,data) =>{
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `inline; filename="${company_namee}_employee_wise_report.xlsx"`)  ;  
res.send(data);
});
});


exports.searchEmpForReport = catchAsyncErrors(async (req, res, next) => {

    
    const { val } = req.body;

    const client = await NewRegistration.findAll({where:{
        [Op.or]:[
        {emp_name:{[Op.substring]:val}},
        {emp_code:{[Op.substring]:val}},
        {aadhar:{[Op.substring]:val}},
        // {'$client_master.client_name$':{[Op.substring]:val}},
        ]
    }
});    
    res.send(client);
});