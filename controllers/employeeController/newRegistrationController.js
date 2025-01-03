const catchAsyncErrors = require("../../utils/catchAsyncErrors");
const Sequelize = require("sequelize");
const CompanyMaster = require("../../models/admin/company_master");
const ClientMaster = require("../../models/admin/client_master");
const NewRegistration = require("../../models/admin/new_registration");
const NewRegistrationDocuments = require("../../models/admin/new_registration_documents");

const NewRegistrationIncrements = require("../../models/admin/new_registration_increments");
const ClientAddress = require("../../models/admin/client_addresses");
const EPF = require("../../models/admin/epf");
const EPS = require("../../models/admin/eps");
const Form2 = require("../../models/admin/form2");
const Form11 = require("../../models/admin/form11");
const Form11KYC = require("../../models/admin/form11_kyc");
const Op = Sequelize.Op;
const fileHelper=require('../../utils/file');
const ClientContact = require("../../models/admin/client_contact");

const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path');
const NewRegistrationNominee = require("../../models/admin/new_registration_nominee");
const UserManagement = require("../../models/admin/user_management");
const Chat = require("../../models/admin/chat");
const NewRegistrationAppointments = require("../../models/admin/new_registration_appointments");
function changeDate(datee) {
    var ddd =  datee.split('-');      
    return [ddd[2],
    ddd[1],
    ddd[0]         
           ].join('-');
  

  };

exports.getNewRegistration = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    let isPreview=false;
    if(req.query){
        isPreview  = req.query.isPreview;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
    const allEmployees = await NewRegistration.findAll({include:[CompanyMaster,ClientMaster,NewRegistrationAppointments],
        order: [ [ 'id', 'DESC' ]],
        limit:30
    });  
    const users = await UserManagement.findAll({where:{
        [Op.not]:[{
            id:req.session.user.id
        }]
    }});
    res.render('employee/new_registration_tab',{
        message:'',
        isPreview:isPreview,
        companies,
        clients,
        allEmployees,
        permissions,
        users
    });
});
exports.postNewRegistration = catchAsyncErrors( async(req, res, next) => {
    const {
        company,
        client,
        date_of_joining,
        emp_code,
        client_code,
        emp_title,
        emp_name,
        father_name,
        dob,
        gender,
        address,
        state,
        pin,
        mobile,
        email,
        aadhar,
        pan,
        maritial_status,
        bank_ac,
        bank_name,
        ifsc,
        beneficiary,
        pf,
        esic,
        date_of_exit,
        remarks,
        nominee_name,
        nominee_relation,
        nominee_dob,
        nominee_share,
        // employeeId
    } = req.body;
    const files = req.files;
    let aadhar_photo='';
    let pan_photo='';
    let photo='';
    let bank_passbook_photo='';
    let sign='';
    let tic='';
    let family_photo='';
    let appointment='';
    let documents=[];
    let appointments=[];
    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='aadhar_photo'){
            aadhar_photo=files[i].path;
        }else if(files[i].fieldname==='photo'){
            photo=files[i].path;
        }else if(files[i].fieldname==='pan_photo'){
            pan_photo=files[i].path;
        }else if(files[i].fieldname==='bank_passbook'){
            bank_passbook_photo=files[i].path;
        // }else if(files[i].fieldname==='family'){
        //     appointment=files[i].path;
        }else if(files[i].fieldname==='signature'){
            sign=files[i].path;
        }else if(files[i].fieldname==='tic'){
            tic=files[i].path;
        }
        else if(files[i].fieldname==='family_doc'){
            documents.push(files[i]);
        }
        else if(files[i].fieldname==='family'){
            appointments.push(files[i]);
        }
    }

    const updatedDob = dob;
    const updatedDateOfJoining = date_of_joining;
    const updatedDateOfExit = date_of_exit;
    const datee = Date.now();

    
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();  
    const oldReg = await NewRegistration.findOne({where:{emp_code:emp_code}});    
    let empCode='';
    if(oldReg){
        const c = await CompanyMaster.findByPk(company);
        const count = await NewRegistration.count({where:{company_id:company}});      
        empCode = c.company_code; 
        empCode += (count+1);       

    }else{
        empCode=emp_code;
    }
    const newreg = await NewRegistration.create({
        company_id:company,
        client_id:client,        
        date_of_joining:updatedDateOfJoining,
        emp_code:empCode,
        client_code:client_code,
        emp_title:emp_title,
        emp_name:emp_name,
        father_name:father_name,
        dob:updatedDob,
        gender:gender,
        address:address,
        state:state,
        pin:pin,
        mobile:mobile,
        email:email,
        aadhar:aadhar,
        pan:pan,
        maritial_status:maritial_status,
        bank_ac:bank_ac,
        bank_name:bank_name,
        ifsc:ifsc,
        beneficiary:beneficiary,
        pf:pf,
        esic:esic,
        date_of_exit:updatedDateOfExit,
        remarks:remarks,
        photo:photo,
        aadhar_photo:aadhar_photo,
        pan_photo:pan_photo,
        bank_passbook_photo:bank_passbook_photo,
        //family_photo:family_photo,
        signature:sign,
        // appointment:appointment,
        tic:tic,
        nominee_name:nominee_name[0],
        nominee_relation:nominee_relation[0],
        nominee_dob:nominee_dob[0],
        nominee_share:nominee_share[0],
        username:req.session.user.name ? req.session.user.name : 'admin',
        user_id: req.session.user ? req.session.user.id : '',
        date:datee,
        time:time
    });
    
    //add documents
    if(documents.length>0){
        for(var i=0;i<documents.length;i++){
            await NewRegistrationDocuments.create({
                new_registration_id:newreg.id,
                document:documents[i].path
            })
        }
    }
    
    //add appointments
    if(appointments.length>0){
        for(var i=0;i<appointments.length;i++){
            await NewRegistrationAppointments.create({
                new_registration_id:newreg.id,
                document:appointments[i].path
            })
        }
    }
    //add nominee
    if(nominee_name.length>1){
        for(var i=1;i<nominee_name.length;i++){
            await NewRegistrationNominee.create({
                new_registration_id:newreg.id,
                nominee_name:nominee_name[i],
                nominee_relation:nominee_relation[i],
                nominee_dob:nominee_dob[i],
                nominee_share:nominee_share[i],
            })
        }
    }
    
    // var receiver_id = employeeId;
    // var sender_id = req.session.user.id;
    // var msg = `New Joining - <a href="/employee/employee-edit/${newreg.id}">${newreg.emp_code}</a>`
    // var date = new Date();
    // var newDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    // // var time = date.toLocaleTimeString();
    // var time = date.getHours() + ":" + date.getMinutes() +":" + date.getSeconds();
    // if(employeeId!=''){
    //     const emp = await UserManagement.findByPk(employeeId);
    // const emp2 = await UserManagement.findByPk(sender_id);

    // await Chat.create({
    //     to:receiver_id,
    //     from:sender_id,
    //     from_name:emp2.name,
    //     to_name:emp.name,
    //     message:msg,
    //     date:newDate,
    //     time:time
    // })
// }
    res.render('admin/appointment_letter',{
        employee:newreg
    });
});

exports.getNewAppointment = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
        res.render('employee/appointment_letter',
        {
            permissions
        });
    
});

exports.postNewAppointment = catchAsyncErrors( async(req, res, next) => {
    const{
        emp_id,
        type,
        designation,
        basic_salary,
        hra,
        gross_salary
    } = req.body;

   await NewRegistration.update({
       type,
       designation,
       basic_salary,
       hra,
       gross_salary
   },{where: {id:emp_id}});
   const emp = await NewRegistration.findByPk(emp_id,{include:[CompanyMaster,ClientMaster]});      
   const clientData = await ClientMaster.findByPk(emp.client_master.id,{include:ClientAddress});
   const companyData = await CompanyMaster.findByPk(emp.company_master.id);
   if(type=='supervisor'){
        res.render('employee/appointment_letter_supervisor',{
            employee:emp,
            clientData,
            companyData
        });
   }else if(type=='general-hindi'){
    res.render('employee/appointment_letter_general_hindi',
    {
        employee:emp,
        clientData,
        companyData
    });

   }else if(type=='joining'){
    res.render('employee/appointment_letter_joining',
    {
        employee:emp,
        clientData,
        companyData
    });

   }else if(type=='trainee'){
    res.render('employee/appointment_letter_trainee',
    {
        employee:emp,
        clientData,
        companyData
    });

   }else{
    res.render('employee/appointment_letter_general',
    {
        employee:emp,
        clientData,
        companyData
    });
   }
});


exports.getForm2 = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const {id} = req.params;

    const employee = await NewRegistration.findByPk(id,{include:[NewRegistrationNominee]});
    const empClient = await ClientMaster.findByPk(employee.client_id,{include:[ClientAddress,ClientContact]});
        res.render('employee/form2',{
            employee,
            empClient,
            permissions
        });
    
});

exports.postForm2 = catchAsyncErrors( async(req, res, next) => {
    const { 
        name,
        address,
        relationship,
        dob,
        total_amount,
        minor_name_address,
        sr_no,
        name_address,
        age,
        relationship2,
        name_address2,
        dob2,
        relationship3,
        factory_name_address,
        datee,
        place,
        id
    } = req.body;

    //add epf
    for(var i=0;i<name.length;i++){
        let is_minor;
        if(minor_name_address[i]){
            is_minor=true;
        }else{
            is_minor=false;
        }
        if(name[i]){      
        await EPF.create({
           name:name[i],               
           address:address[i],               
           relationship:relationship[i],               
           dob:dob[i],               
           total_share:total_amount[i], 
           is_minor:is_minor,              
           guardian_name_address:minor_name_address[i],  
           new_registration_id:id         
        });
    }
    }
    //add eps
    for(var i=0;i<sr_no.length;i++){  
        if(sr_no[i]){      
        await EPS.create({
            sr_no:sr_no[i],               
            name_address:name_address[i],               
           age:age[i],               
           relationship:relationship2[i],               
           new_registration_id:id         
        });
    }
    }

    //add form2
    await Form2.create({
        new_registration_id:id,
        name_address:name_address2,
        dob:dob2,
        relationship:relationship3,
        date:datee,
        factory_name_address,
        place     
    });

    //update new registration
    await NewRegistration.update({
        nominee_name:name_address2.split(" ")[0] + name_address2.split(" ")[1],
        nominee_relation: relationship3
    },{where:{id:id}});
    res.redirect('/employee/new?isPreview='+true);

});

exports.getForm11 = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const {id} = req.params;

    const employee = await NewRegistration.findByPk(id,{include:[CompanyMaster,ClientMaster]});
        res.render('employee/form11',{
            employee,
            permissions
        });
});
exports.postForm11 = catchAsyncErrors( async(req, res, next) => {
    const { 
        relation,
        whether_pf,
        whether_pension,
        uan,
        member_id,
        date_of_exit,
        scheme_number,
        ppo_number,
        is_international,
        country_origin,
        other_country,
        passport_number,
        passport_date_from,
        passport_date_to,
        education,
        is_specially_abled,
        category,
        kyc_type,
        kyc_name,
        kyc_number,
        remarks,
        place,
        datee,
        has_been,
        pf_no,
        kyc_update,
        id
    } = req.body;
    var country='';
    if(country_origin=='India'){
        country='India';
    }else{
        country=other_country;
    }
    await Form11.create({
        relationship:relation,
        is_member_of_pf:whether_pf,
        is_member_of_pension:whether_pension,
        uan,
        pf_member_id:member_id,
        date_of_exit,
        scheme_certificate_number:scheme_number,
        ppo_number,
        is_international_worker:is_international,
        country_of_origin:country,
        passport_number,
        passport_valid_from:passport_date_from,
        passport_valid_till:passport_date_to,
        educational_qualification:education,
        is_specially_abled,
        specially_abled_category:category,
        is_kyc_details_uploaded:has_been,
        is_kyc_details_approved:kyc_update,
        pf_no:pf_no,
        place,
        date:datee,
        new_registration_id:id
    });

    for(var i=0;i<kyc_name.length;i++){
        await Form11KYC.create({
            kyc_type:kyc_type[i],
            name:kyc_name[i],
            number:kyc_number[i],
            remarks:remarks[i],
            new_registration_id:id
        });
    }
    //check if employee has filled up pf, then only open form2
    const emp = await NewRegistration.findByPk(id);
    if(emp.pf){
    res.redirect('/employee/form2/'+id);
    }else{
    res.redirect('/employee/new?isPreview='+true);
    }
});

exports.getClientForCompany = catchAsyncErrors( async(req, res, next) => {
    const {val} = req.body;

    const clients = await ClientMaster.findAll({where:{
        '$company_master.id$':val 
    },
    attributes: ['id', 'client_name'],
    include: CompanyMaster
    });
        res.send(clients);
});
exports.searchEmployee = catchAsyncErrors( async (req, res, next) => {
    //search employees
    const {val} = req.body;
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
    const clients = await NewRegistration.findAll({where:{
        [Op.or]:[
        {emp_name:{[Op.substring]:val}},
        {aadhar:{[Op.substring]:val}},
        {mobile:{[Op.substring]:val}},
        {esic:{[Op.substring]:val}},
        {pf:{[Op.substring]:val}},
        {emp_code:{[Op.substring]:val}},
        {pan:{[Op.substring]:val}},
        {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    order: [ 
        [Sequelize.fn('length', Sequelize.col('emp_code')), 'ASC'],
        ['emp_code','ASC']
    ],

    include: [ CompanyMaster,ClientMaster,NewRegistrationAppointments]
});    
    res.send({clients,isAdmin});
    // console.log(companies);
    
});
exports.getForm11Print = catchAsyncErrors( async(req, res, next) => {
    const {id} = req.params;

  

        const employee = await NewRegistration.findByPk(id,{include:[CompanyMaster,ClientMaster]});
        const kycs = await Form11KYC.findAll({where:{new_registration_id:id}});
        const form11 = await Form11.findOne({where:{new_registration_id:id}});
            res.render('employee/form11_print',{
                employee,
                kycs:kycs ? kycs : [],
                form11: form11 ? form11 : []
            });
});
exports.getForm2Print = catchAsyncErrors( async(req, res, next) => {
    let form2 = await Form2.findOne({where:{new_registration_id:req.params.id}});   
    const epf = await EPF.findAll({where:{new_registration_id:req.params.id}});
    const eps = await EPS.findAll({where:{new_registration_id:req.params.id}});
    const employee = await NewRegistration.findByPk(req.params.id);
    if(!form2){
        form2 = [];
    }
    res.render('employee/form2_print',{
        form2,
        eps,
        epf,
        employee
    });
});
exports.getNewRegistrationEdit = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
    const employee = await NewRegistration.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster,NewRegistrationDocuments,NewRegistrationNominee,NewRegistrationAppointments]});
   
    res.render('employee/employee_edit',{
        message:'',
        companies,
        clients,
        employee,
        permissions
    });
});


exports.postNewRegistrationEdit = catchAsyncErrors( async(req, res, next) => {
    const {
        id,
        company,
        client,
        date_of_joining,
        emp_title,
        emp_name,
        client_code,
        father_name,
        dob,
        gender,
        address,
        state,
        pin,
        mobile,
        email,
        aadhar,
        pan,
        maritial_status,
        bank_ac,
        bank_name,
        ifsc,
        beneficiary,
        pf,
        esic,
        date_of_exit,
        remarks,
        nominee_name,
        nominee_relation,
        nominee_dob,
        nominee_share
    } = req.body;
    const files = req.files;


    const oldEmployee = await NewRegistration.findByPk(id,{include:NewRegistrationDocuments});
    let aadhar_photo=oldEmployee.aadhar_photo;
    let pan_photo=oldEmployee.pan_photo;
    let photo=oldEmployee.photo;
    let bank_passbook_photo=oldEmployee.bank_passbook_photo;
    let sign=oldEmployee.signature;
    let tic=oldEmployee.tic;
    let family_photo=oldEmployee.family_photo;
    // let appointment=oldEmployee.appointment;
    let documents=[];
    let appointments=[];
    let hasDocu = false;

    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='aadhar_photo'){
            // if(oldEmployee.aadhar_photo)
            //     fileHelper.deleteFile(oldEmployee.aadhar_photo);
            aadhar_photo=files[i].path;
        }else if(files[i].fieldname==='photo'){
            // if(oldEmployee.photo)
            //     fileHelper.deleteFile(oldEmployee.photo);
            photo=files[i].path;
        }else if(files[i].fieldname==='pan_photo'){
            // if(oldEmployee.pan_photo)
            //     fileHelper.deleteFile(oldEmployee.pan_photo);
            pan_photo=files[i].path;
        }else if(files[i].fieldname==='bank_passbook'){
            // if(oldEmployee.bank_passbook_photo)
            //     fileHelper.deleteFile(oldEmployee.bank_passbook_photo);
            bank_passbook_photo=files[i].path;
        }else if(files[i].fieldname==='family'){
            // if(oldEmployee.family_photo)
            //     fileHelper.deleteFile(oldEmployee.family_photo);
            //family_photo=files[i].path;
            // appointment=files[i].path;
            appointments.push(files[i]);

        }else if(files[i].fieldname==='signature'){
            // if(oldEmployee.signature)
            //     fileHelper.deleteFile(oldEmployee.signature);
            sign=files[i].path;
        }else if(files[i].fieldname==='tic'){
            // if(oldEmployee.tic)
            //     fileHelper.deleteFile(oldEmployee.tic);
            tic=files[i].path;
        }
        else if(files[i].fieldname==='family_doc'){
            // if(!hasDocu){
            //     for(var j=0;j<oldEmployee.new_registration_documents.length;j++) {
            //          fileHelper.deleteFile(oldEmployee.new_registration_documents[j].document);
            //      }
            // }
            //     hasDocu=true;
                documents.push(files[i]);
        }
    }

    const updatedDob = dob;
    const updatedDateOfJoining = date_of_joining;
    const updatedDateOfExit = date_of_exit;
    
    await NewRegistration.update({
        company_id:company,
        client_id:client,        
        date_of_joining:updatedDateOfJoining,
        emp_title,
        client_code:client_code,
        emp_name,
        father_name,
        dob:updatedDob,
        gender,
        address,
        state,
        pin,
        mobile,
        email,
        aadhar,
        pan,
        maritial_status,
        bank_ac,
        bank_name,
        ifsc,
        beneficiary,
        pf,
        esic,
        date_of_exit:updatedDateOfExit,
        remarks,
        photo,
        aadhar_photo,
        pan_photo,
        bank_passbook_photo,
        // appointment,
        signature:sign,
        tic,
        nominee_name:nominee_name[0],
        nominee_dob:nominee_dob[0],
        nominee_relation:nominee_relation[0],
        nominee_share:nominee_share[0],
    },{where:{id:id}});
    
    //remove documents
    if(documents.length>0){
        // await NewRegistrationDocuments.destroy({where:{new_registration_id:oldEmployee.id}});

        for(var i=0;i<documents.length;i++){
            await NewRegistrationDocuments.create({
                new_registration_id:oldEmployee.id,
                document:documents[i].path
            })
        }
    }

    if(appointments.length>0){
        // await NewRegistrationDocuments.destroy({where:{new_registration_id:oldEmployee.id}});

        for(var i=0;i<appointments.length;i++){
            await NewRegistrationAppointments.create({
                new_registration_id:oldEmployee.id,
                document:appointments[i].path
            })
        }
    }
     //remove documents
     if(nominee_name.length>1){
         await NewRegistrationNominee.destroy({where:{new_registration_id:oldEmployee.id}});

        for(var i=1;i<nominee_name.length;i++){
            await NewRegistrationNominee.create({
                new_registration_id:oldEmployee.id,                
                nominee_name:nominee_name[i],
                nominee_relation:nominee_relation[i],
                nominee_dob:nominee_dob[i],
                nominee_share:nominee_share[i],
            })
        }
    }
    
    
    res.redirect('/employee/new?isPreview='+true);
});

exports.getAppointmentEdit = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const employee = await NewRegistration.findByPk(req.params.id);
    res.render('employee/appointment_letter_edit',{
        employee,
        permissions
    });

});

exports.postAppointmentEdit = catchAsyncErrors( async(req, res, next) => {
    const{
        id,
        type,
        designation,
        basic_salary,
        hra,
        gross_salary
    } = req.body;

   await NewRegistration.update({
       type,
       designation,
       basic_salary,
       hra,
       gross_salary
   },{where: {id:id}});


    const emp = await NewRegistration.findByPk(id,{include:[CompanyMaster,ClientMaster]});      
   const clientData = await ClientMaster.findByPk(emp.client_master.id,{include:ClientAddress});
   const companyData = await CompanyMaster.findByPk(emp.company_master.id);
   if(type=='supervisor'){
        res.render('employee/appointment_letter_supervisor',{
            employee:emp,
            clientData,
            companyData
        });
   }else if(type=='general-hindi'){
    res.render('employee/appointment_letter_general_hindi',
    {
        employee:emp,
        clientData,
        companyData
    });

   }else if(type=='joining'){
    res.render('employee/appointment_letter_joining',
    {
        employee:emp,
        clientData,
        companyData
    });

   }else if(type=='trainee'){
    res.render('employee/appointment_letter_trainee',
    {
        employee:emp,
        clientData,
        companyData
    });

   }else{
    res.render('employee/appointment_letter_general',
    {
        employee:emp,
        clientData,
        companyData
    });
   }
});

exports.getForm2Edit = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    let form2 = await Form2.findOne({where:{new_registration_id:req.params.id}});   
    const epf = await EPF.findAll({where:{new_registration_id:req.params.id}});
    const eps = await EPS.findAll({where:{new_registration_id:req.params.id}});
    const employee = await NewRegistration.findByPk(req.params.id);
    if(!form2){
        form2 = [];
    }
    res.render('employee/form2_edit',{
        form2,
        eps,
        epf,
        employee,
        permissions
    });

});

exports.postForm2Edit = catchAsyncErrors( async(req, res, next) => {
    const { 
        name,
        address,
        relationship,
        dob,
        total_amount,
        minor_name_address,
        sr_no,
        name_address,
        age,
        relationship2,
        name_address2,
        dob2,
        relationship3,
        factory_name_address,
        datee,
        place,
        id
    } = req.body;
    //delete epf 
    await EPF.destroy({where:{new_registration_id:id}});
    //add epf
    for(var i=0;i<name.length;i++){
        let is_minor;
        if(minor_name_address[i]){
            is_minor=true;
        }else{
            is_minor=false;
        }
        if(name[i]){      
        await EPF.create({
           name:name[i],               
           address:address[i],               
           relationship:relationship[i],               
           dob:dob[i],               
           total_share:total_amount[i], 
           is_minor:is_minor,              
           guardian_name_address:minor_name_address[i],  
           new_registration_id:id         
        });
    }
    }    
    //delete eps
    await EPS.destroy({where:{new_registration_id:id}});
    //add eps
    for(var i=0;i<sr_no.length;i++){  
        if(sr_no[i]){      
        await EPS.create({
            sr_no:sr_no[i],               
            name_address:name_address[i],               
           age:age[i],               
           relationship:relationship2[i],               
           new_registration_id:id         
        });
    }
    }
    //check if form 2 exists
    const oldForm2 = await Form2.findOne({where:{new_registration_id:id}});
    if(oldForm2){
        //update form2
        await Form2.update({
            name_address:name_address2,
            dob:dob2,
            relationship:relationship3,
            date:datee,
            factory_name_address,
            place     
        },{where:{new_registration_id:id}});
    }else{
//add form2
        await Form2.create({
            new_registration_id:id,
            name_address:name_address2,
            dob:dob2,
            relationship:relationship3,
            date:datee,
            factory_name_address,
            place     
        });
    }

    
 //update new registration
 await NewRegistration.update({
    nominee_name:name_address2.split(" ")[0] + " "+ name_address2.split(" ")[1],
    nominee_relation: relationship3
},{where:{id:id}});
    res.redirect('/employee/new?isPreview='+true);

});

exports.getForm11Edit = catchAsyncErrors( async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const {id} = req.params;

    const employee = await NewRegistration.findByPk(id,{include:[CompanyMaster,ClientMaster]});
    const kycs = await Form11KYC.findAll({where:{new_registration_id:id}});
    const form11 = await Form11.findOne({where:{new_registration_id:id}});
        res.render('employee/form11_edit',{
            employee,
            kycs:kycs ? kycs : [],
            form11: form11 ? form11 : [],
            permissions
        });
});

exports.postForm11Edit = catchAsyncErrors( async(req, res, next) => {
    const { 
        relation,
        whether_pf,
        whether_pension,
        uan,
        member_id,
        date_of_exit,
        scheme_number,
        ppo_number,
        is_international,
        country_origin,
        other_country,
        passport_number,
        passport_date_from,
        passport_date_to,
        education,
        is_specially_abled,
        category,
        kyc_type,
        kyc_name,
        kyc_number,
        remarks,
        place,
        datee,
        has_been,
        pf_no,
        kyc_update,
        id
    } = req.body;
    var country='';
    if(country_origin=='India'){
        country='India';
    }else{
        country=other_country;
    }

    const oldForm11 = await Form11.findOne({where:{new_registration_id:id}});
    if(oldForm11){
        await Form11.update({
            relationship:relation,
            is_member_of_pf:whether_pf,
            is_member_of_pension:whether_pension,
            uan,
            pf_member_id:member_id,
            date_of_exit,
            scheme_certificate_number:scheme_number,
            ppo_number,
            is_international_worker:is_international,
            country_of_origin:country,
            passport_number,
            passport_valid_from:passport_date_from,
            passport_valid_till:passport_date_to,
            educational_qualification:education,
            is_specially_abled,
            specially_abled_category:category,
            is_kyc_details_uploaded:has_been,
            is_kyc_details_approved:kyc_update,
            pf_no:pf_no,
            place,
            date:datee,
        },{where:{new_registration_id:id}});
    
    }else{
        await Form11.create({
            relationship:relation,
            is_member_of_pf:whether_pf,
            is_member_of_pension:whether_pension,
            uan,
            pf_member_id:member_id,
            date_of_exit,
            scheme_certificate_number:scheme_number,
            ppo_number,
            is_international_worker:is_international,
            country_of_origin:country,
            passport_number,
            passport_valid_from:passport_date_from,
            passport_valid_till:passport_date_to,
            educational_qualification:education,
            is_specially_abled,
            specially_abled_category:category,
            is_kyc_details_uploaded:has_been,
            is_kyc_details_approved:kyc_update,
            pf_no:pf_no,
            place,
            date:datee,
            new_registration_id:id
        });   

    }

    //delete kyc
    await Form11KYC.destroy({where:{new_registration_id:id}});
    //add kyc
    for(var i=0;i<kyc_name.length;i++){
        await Form11KYC.create({
            kyc_type:kyc_type[i],
            name:kyc_name[i],
            number:kyc_number[i],
            remarks:remarks[i],
            new_registration_id:id
        });
    }
    res.redirect('/employee/new?isPreview='+true);
    
});

exports.removeForm11Kyc = catchAsyncErrors( async(req, res, next) => {
    const { id } = req.body;
    const kyc = await Form11KYC.findByPk(id);
    await kyc.destroy();
    res.send({
        message:'Successfully Deleted'
    })
});
exports.deleteEmployeeDocument = catchAsyncErrors( async(req, res, next) => {
    const { id } = req.body;
    const pvt = await NewRegistrationDocuments.findByPk(id);
    const new_registration_id = pvt.new_registration_id;
    await pvt.destroy();
    var documents = await NewRegistrationDocuments.findAll({where:{new_registration_id:new_registration_id}});
    res.send(documents);
});

exports.deleteEmployeeAppointment = catchAsyncErrors( async(req, res, next) => {
    const { id } = req.body;
    const pvt = await NewRegistrationAppointments.findByPk(id);
    const new_registration_id = pvt.new_registration_id;
    await pvt.destroy();
    var documents = await NewRegistrationAppointments.findAll({where:{new_registration_id:new_registration_id}});
    res.send(documents);
});
exports.getEmpCode = catchAsyncErrors( async(req, res, next) => {
    const { compId } = req.body;
    const company = await CompanyMaster.findByPk(compId);
    const count = await NewRegistration.count({where:{company_id:compId}});      
    var empCode = company.company_code;
    if(count>0){
        empCode+=count+1;
    }else{
        empCode+=1;
    }
    res.send(empCode);
});

// exports.showEmployeeDetails = catchAsyncErrors(async(req,res,next) =>{
//     const companies = await CompanyMaster.findAll();
//     const employee = await NewRegistration.findByPk(req.params.id,{include:[
//         CompanyMaster,
//         ClientMaster,
//         NewRegistrationDocuments        
//         ]});
//     const form11 = await Form11.findOne({where:{new_registration_id:req.params.id}});
//     const form11kyc = await Form11KYC.findOne({where:{new_registration_id:req.params.id}});
//     const form2 = await Form2.findOne({where:{new_registration_id:req.params.id}});
//     const eps = await EPS.findAll({where:{new_registration_id:req.params.id}});
//     const epf = await EPF.findAll({where:{new_registration_id:req.params.id}});
//     const clientData = await ClientMaster.findByPk(employee.client_id,{include:ClientAddress});

//     const pdfDoc = new PDFDocument();
//     const fileName = employee.emp_name + '_' + employee.emp_code + '.pdf';
//     const invoicePath = path.join('uploads', fileName);
//     //for creating pdf
//     res.setHeader('Content-Type','application/pdf');
//     res.setHeader('Content-Disposition','inline; filename="' + fileName + '"');

//     // pdfDoc.pipe(fs.createWriteStream(invoicePath));
//     // pdfDoc.pipe(res);
//     const logoPath = employee.photo;
//     if(logoPath){
//     pdfDoc.image(logoPath, 510, 50, { width: 50, height: 50, align:'right' })
//     .rect(510, 50, 50, 50)
//     .stroke();
//     }
//     pdfDoc.fontSize(20);
//     pdfDoc.text('Employee Registration Form',10,20,{
//         align:'center',
//         width:610,
//         height:20
//     })
//     pdfDoc.text('Employee General Information',20,70,{
//         align:'left',
//         width:610,
//         height:20,
//         underline:true
//     })
//     pdfDoc.fontSize(10);
//     pdfDoc.moveDown();
//     pdfDoc.text('Company Name : '+employee.company_master.company_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Client Name : '+employee.client_master.client_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Emp Code : '+employee.emp_code,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     var date_of_joining = dateFormat(employee.date_of_joining,'dd-MM-yyyy');

//     pdfDoc.text('Date Of Joining : '+date_of_joining,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Employee Name : '+employee.emp_title+' '+employee.emp_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Father/Husband Name : '+employee.father_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     var dob = dateFormat(employee.dob,'dd-MM-yyyy');

//     pdfDoc.text('Date Of Birth : '+dob,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Gender : '+employee.gender,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Address : '+employee.address,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('State : '+employee.state,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Pin Code : '+employee.pin,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Mobile : '+employee.mobile,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Aadhaar No : '+employee.pan,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Pan No : '+employee.state,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Maritial Status : '+employee.maritial_status,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Beneficiary Name : '+employee.beneficiary,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Bank Account No : '+employee.bank_ac,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('IFSC Code : '+employee.ifsc,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Bank Name : '+employee.bank_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('PF No : '+employee.pf,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('ESIC No : '+employee.esic,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     var date_of_exit = dateFormat(employee.date_of_exit,'dd-MM-yyyy');
//     pdfDoc.text('Date Of Exit : '+date_of_exit,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Remarks : '+employee.remarks,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
    
//     if(employee.aadhar_photo){
//         pdfDoc.addPage();
//         pdfDoc.image(employee.aadhar_photo, {
//             fit: [300, 200],
//             align: 'center',
//             valign: 'center'
//         }).rect(pdfDoc.x,pdfDoc.y-200,300, 200)
//         .stroke();
//     }
//     if(employee.pan_photo){
//         pdfDoc.moveDown();
//         pdfDoc.image(employee.pan_photo, {
//             fit: [300, 200],
//             align: 'center',
//             valign: 'center'
//         }).rect(pdfDoc.x,pdfDoc.y-200,300, 200)
//         .stroke();
//     }
//     if(employee.bank_passbook_photo){
//         pdfDoc.moveDown();
//         pdfDoc.image(employee.bank_passbook_photo, {
//             fit: [300, 200],
//             align: 'center',
//             valign: 'center'
//         }).rect(pdfDoc.x,pdfDoc.y-200,300, 200)
//         .stroke();
//     }
//     if(employee.tic){
//         pdfDoc.addPage();
//         pdfDoc.image(employee.tic, {
//             fit: [300, 200],
//             align: 'center',
//             valign: 'center'
//         }).rect(pdfDoc.x,pdfDoc.y-200,300, 200)
//         .stroke();
//     }
//     if(employee.family_photo){
//         pdfDoc.moveDown();
//         pdfDoc.image(employee.aadhar_photo, {
//             fit: [300, 200],
//             align: 'center',
//             valign: 'center'
//         }).rect(pdfDoc.x,pdfDoc.y-200,300, 200)
//         .stroke();
//     }
//     if(employee.signature){
//         pdfDoc.moveDown();
//         pdfDoc.image(employee.signature, {
//             fit: [300, 200],
//             align: 'center',
//             valign: 'center'
//         }).rect(pdfDoc.x,pdfDoc.y-200,300, 200)
//         .stroke();
//     }
//     if(employee.new_registration_documents.length>0){
//              for(var i =0;i<employee.new_registration_documents.length;i++){
//                 if(i%3==0){
//                     pdfDoc.addPage();
//                 } 
//             pdfDoc.image(employee.new_registration_documents[i].document, {
//             fit: [300, 200],
//             align: 'center',
//             valign: 'center'
//         }).rect(pdfDoc.x,pdfDoc.y-200,300, 200)
//         .stroke();
//         pdfDoc.moveDown();

        
//     }
//     }
//     //appointment letter general
//     if(employee.type=='skilled' || employee.type=='semiskilled'){
//         pdfDoc.addPage();
//         pdfDoc.fontSize(20);
//         pdfDoc.text('Appointment Letter',20,20,{
//             align:'center',
//             width:610,
//             height:20
//         })
//         if(employee.company_master.logo){
//             pdfDoc.image(employee.company_master.logo, 510, 50, { width: 80, height: 80, align:'right' })
//             .rect(510, 50, 80, 80)
//             .stroke();
//             }       
//         pdfDoc.text(employee.company_master.company_name,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.fontSize(10);    
//         pdfDoc.moveDown();
//         pdfDoc.text(employee.company_master.address,{
//             align:'left',
//             width:200,
//             height:60,
//         })
//         pdfDoc.text(employee.company_master.email,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.text(employee.company_master.phone,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.moveDown();
//         pdfDoc.text('Date of joining: '+date_of_joining,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.moveDown();
//         pdfDoc.text('Principal Employer’s Name and Address',{
//             align:'right',
//             width:550,
//             height:20,
//         })
//         pdfDoc.text(employee.client_master.client_name,385,pdfDoc.y,{
//             align:'left',
//             width:200,
//             height:20,
//         })
//         pdfDoc.text(clientData.client_addresses[0].address,385,pdfDoc.y,{
//             align:'left',
//             width:200,
//             height:60,
//         })
//         pdfDoc.moveDown();
//         pdfDoc.text('Dear '+employee.emp_title + ' ' +employee.emp_name,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
            
//         })
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text('Subject: Letter Of Appointment',{
//             align:'center',
//             width:550,
//             height:20,   
//             underline:true            
//         })
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica').text(`Following an interview, you had with our client`,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica-Bold')
//         .text(`(Your Principal Employer),`,{            
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica').text(` we have pleasure in offering you a job for the post of `,{            
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica-Bold').text(`${employee.designation} in ${employee.client_master.client_name}`,{            
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica').text(` our client’s place on the following terms and conditions:`);
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`1) COMPENSATION: - `,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//             underline:true,
//         }).font('Helvetica')
//         .text(`Your salary / wages will be Rs.`,{            
//             continued:true,
//             underline:false,
//             lineBreak:false,
//         }).font('Helvetica-Bold').text(`${employee.gross_salary}`,{            
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica').text(` per month. The allocation of Gross Salary will be decided by the Principal Employer, the reflection of which you can easily view in your Pay Slips.`);
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`2) WORKING HOURS: -`,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:true,
//         });
//         pdfDoc.font('Helvetica')
//         .text(`a) Your work timings will be as per Principal Employer’s policy but it will not exceed 9 hours a day or 48 hours weekly.`,40,pdfDoc.y,{            
//             align:'left',
//             width:500,
//             underline:false,
//             height:20,   
//         });
//         pdfDoc
//         .text(`b) If you work more than 9 hours a day, then you will be entitled for overtime which will be paid twice the normal pay as per Factories Act 1948 or Minimum Wages Act.        `,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc
//         .text(`c) Every week Monday to Saturday will be working days, whereas Sunday will be weekly off day or holiday. If due to urgency, Sunday becomes working then holiday/weekly off day will be given within next 5 (five) working days.        `,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`3) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`Your monthly salary / wages of every current month will be disbursed by 7th of the next month.`);
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`4) `,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`As per Section 79, Factories Act 1948, you will be eligible for 1 Day Earned Leave for every 20 days worked. (Subjected to a maximum of 12-14 days per year). Whether The Leave Will Be adjusted Or Encashed will be as per mutual consent of your good self and Principal Employer.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`5) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`As per the rule of the organization, you will be eligible for and enjoy all holidays as per the holiday list. (Holiday list will be announced by the Principal Employer by second week of January every year).`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`6) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`You will also get PF and ESIC facilities if your Earnings and its allocation fall under the ambit as set down by the EPF and MP Act 1952 and ESIC Act 1948.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`7) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`As per State Act, Ptax will also be deducted (if under ambit) every month and LWF will be deducted half-yearly.`);
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`8) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`You will also be entitled for Bonus, minimum 7 days before the main festival, as decided by the Principal Employer and that will be as per Bonus Act 1965. Bonus On Basic pay will be paid on your working days calculated as per Financial Year.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`9) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`On successful completion of continuous 5 years in our organization, under this Appointment and Same Principal Employer only, you will be also entitled for Gratuity as per Payment of Gratuity Act 1972.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`10) TERMINATION OF CONTRACT : `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             underline:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`Either of the party will be entitled to terminate the employment, by giving 30 days’ notice or 30 day’s Salary in lieu thereof. However, if it is on disciplinary grounds which hampers the Principal Employer’s activities, no notice will be served.`,{
//             underline:false,
//             height:60,
//             continued:true
//         }).font('Helvetica-Bold')
//         .text(`Your contract is valid for 36 months.`,{
//             underline:false,
//             height:60,
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`11) DISPUTES :  `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//             underline:true,
//         }).font('Helvetica')
//         .text(`Any dispute between yourself and the Principal Employer concerned with or relating to, or rising out of this Appointment Letter, shall be subjected to the jurisdiction of and be determined, by the court of competent jurisdiction in Kolkata only.`,{
//             height:60,
//             underline:false
//         });
//         pdfDoc.addPage();
//         pdfDoc.font('Helvetica-Bold').text(`12) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`You cannot work against the benefit of the Principal Employer’s organization. While working in the organization you cannot engage yourself elsewhere. Breaking of the rule of the organization will be considered as punishable offence.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`13) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`You shall be responsible for protecting the property of the Principal Employer, entrusted to you in the due discharge, of your duties, and shall indemnify the Principal Employer, when there is a loss of any kind to the concerned property.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`14) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`You can be shifted to different place/branch of Principal Employer and Designation with prior Notice. We will expect, you will accept the same.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`15) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`You will complete all the jobs on time dedicated to you by the Principal Employer.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`16) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`You need to submit written information to our organization if ever your address / Telephone Number/ Nominee gets changed or else it will be considered as your insincerity and you yourself will be responsible for not getting any letters or important documents by post.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`17) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`You have to maintain a friendly work environment and have to behave properly/ politely with all other fellow workers and respectful towards Seniors.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`18) Only `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`If you agree to all the above rules and regulations, then may sign this appointment letter.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`We are consciously endeavoring to build an atmosphere of mutual trust, reliability. Response and Autonomy are open to discussions and suggestions from all members of our Corporate Family.`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`As a new entrant, we hope you will contribute positively and whole heartedly to this process.        `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica').text(`Welcome to ${employee.company_master.company_name} FAMILY.`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text(`Yours Truly`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text(`For ${employee.company_master.company_name} `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//         });
//         pdfDoc.moveDown();        
//         if(employee.company_master.stamp){
//             pdfDoc.image(employee.company_master.stamp, 20,pdfDoc.y, { width: 50, height: 50, align:'left' })
//             .rect(20, pdfDoc.y-50, 50, 50)
//             .stroke();
//         }     
            
//         if(employee.company_master.signature){
//             pdfDoc.image(employee.company_master.signature, 80, pdfDoc.y-50, { width: 50, height: 50, align:'left' })
//             .rect(80, pdfDoc.y-50, 50, 50)
//             .stroke();
//         }   
//         pdfDoc.moveDown();        
//         pdfDoc.font('Helvetica-Bold').text(`Employee Declaration `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//             underline:true
//         });
//         pdfDoc.font('Helvetica').text(`I have read/been explained all the clauses and with full understanding of the same, I am accepting these terms of employment and joining the concern out of my free will and consent.`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:false
//         });
//         pdfDoc.moveDown();  
//         if(employee.signature){
//             pdfDoc.image(employee.signature, 20, pdfDoc.y, { width: 50, height: 50, align:'left' })
//             .rect(20, pdfDoc.y-50, 50, 50)
//             .stroke();
//         }      
//         pdfDoc.text(`Signature of Employee`,20,pdfDoc.y+10,{
//             align:'left',
//             width:550,
//             height:60,   
//         });
//         //bengali
//         pdfDoc.registerFont('bengali', path.join('utils','kalpurush.ttf'));

//         pdfDoc.addPage();
//         pdfDoc.fontSize(20);        
//         if(employee.company_master.logo){
//             pdfDoc.image(employee.company_master.logo, 510, 50, { width: 80, height: 80, align:'right' })
//             .rect(510, 50, 80, 80)
//             .stroke();
//             }       
//         pdfDoc.text(employee.company_master.company_name,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.fontSize(10);    
//         pdfDoc.moveDown();
//         pdfDoc.text(employee.company_master.address,{
//             align:'left',
//             width:200,
//             height:60,
//         })
//         pdfDoc.text(employee.company_master.email,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.text(employee.company_master.phone,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text('তারিখ : '+date_of_joining,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.font('bengali').text('প্রধান নিয়োগকর্তার নাম ও ঠিকানা',{
//             align:'right',
//             width:480,
//             height:20,
//         })
//         pdfDoc.text(employee.client_master.client_name,385,pdfDoc.y,{
//             align:'left',
//             width:200,
//             height:20,
//         })
//         pdfDoc.text(clientData.client_addresses[0].address,385,pdfDoc.y,{
//             align:'left',
//             width:200,
//             height:60,
//         })
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text('প্রিয় '+employee.emp_title + ' ' +employee.emp_name,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
            
//         })
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text('বিষয়: নিয়োগপত্র',{
//             align:'center',
//             width:550,
//             height:20,   
//             underline:true            
//         })
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text(` আমাদের ক্লায়েন্টের সহিত আপনার সাক্ষাৎকারের ভিত্তিতে আমরা আপনাকে`,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica-Bold')
//         .text(` ${employee.designation}`,{            
//             continued:true,
//             lineBreak:false
//         }).font('bengali').text(` পোস্টের জন্য নিম্নলিখিত শর্তাবলী সাপেক্ষে আমাদের ক্লায়েন্টের `,{            
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica-Bold').text(`${employee.client_master.client_name}`,{            
//             continued:true,
//             lineBreak:false
//         }).font('bengali').text(` স্থানে একটি প্রকল্প ভিত্তিক চাকুরীর প্রস্তাব দিয়ে আনন্দিত`);
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text(`1) বেতন : - `,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//             underline:true,
//         }).font('bengali')
//         .text(`আপনার বেতন/মজুরি হবে Rs.`,{            
//             continued:true,
//             underline:false,
//             lineBreak:false,
//         }).font('Helvetica-Bold').text(`${employee.gross_salary}`,{            
//             continued:true,
//             lineBreak:false
//         }).font('bengali').text(` প্রতি মাসে, মোট বেতনের বিভাগ প্রধান নিয়োগকর্তা দ্বারা নির্ধারিত হবে, যার প্রতিফলন আপনি সহজেই আপনার পে স্লিপে দেখতে পারবেন।`);
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text(`2) কাজের সময়সূচি : -`,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:true,
//         });
//         pdfDoc.font('bengali')
//         .text(`a) আপনার কাজের সময় প্রধান নিয়োগকর্তার নীতি অনুসারে হবে তবে এটি দিনে ৯ ঘন্টা বা সাপ্তাহিক ৪৮ ঘন্টার বেশি হবে না।        `,40,pdfDoc.y,{            
//             align:'left',
//             width:500,
//             underline:false,
//             height:20,   
//         });
//         pdfDoc
//         .text(`b) আপনি যদি দিনে ৯ ঘন্টার বেশি কাজ করেন, তাহলে আপনি ওভারটাইম পাওয়ার অধিকারী হবেন যা Factories Act 1948 বা ন্যূনতম মজুরি আইন অনুযায়ী সাধারণ বেতনের দ্বিগুণ প্রদান করা হবে। `,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc
//         .text(`c) প্রতি সপ্তাহে সোম থেকে শনিবার কাজের দিন হবে, যেখানে রবিবার সাপ্তাহিক ছুটির দিন হবে| জরুরী কারণে, রবিবার বরাদ্দ করতে হলে পরবর্তী ৫ টি কার্যদিবসের মধ্যে ছুটি/সাপ্তাহিক ছুটি দেওয়া হবে।`,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`3) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`আপনার প্রতি বর্তমান মাসের মাসিক বেতন পরের মাসের ৭ তারিখের মধ্যে বিতরণ করা হবে|`);
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`4) `,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`As per Section 79 , Factories Act 1948, আপনি প্রতি 20 দিন কাজ করার জন্য ১ দিনের অর্জিত ছুটির জন্য যোগ্য হবেন, (প্রতি বছর সর্বোচ্চ ১২-১৪ দিনের সাপেক্ষে), ছুটি সামঞ্জস্য করা হবে নাকি নগদ টাকা প্রেরণ করা হবে তা আপনার ভাল এবং প্রধান নিয়োগকর্তার পারস্পরিক সম্মতি অনুসারে ঠিক হবে|`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`5) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(` আপনি বার্ষিক ছুটি পাবেন ।(প্রতি বছর জানুয়ারির দ্বিতীয় সপ্তাহের মধ্যে প্রধান নিয়োগকর্তার দ্বারা ছুটির তালিকা ঘোষণা করা হবে)।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`6) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(` আপনি PF এবং ESIC সুবিধা পাবেন যদি আপনার উপার্জন এবং পারিশ্রমিক EPF এবং MP আইন ১৯৫২ এবং ESIC আইন ১৯৪৮ দ্বারা নির্ধারিত পরিধির আওতায় পড়ে।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`7) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`রাজ্য আইন অনুসারে, প্রতি মাসে PTax কাটা হবে (যদি পরিধির অধীনে থাকে) এবং LWF অর্ধ-বার্ষিকভাবে কাটা হবে।`);
//         pdfDoc.font('Helvetica-Bold').text(`8) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`এছাড়াও আপনি প্রধান নিয়োগকর্তার সিদ্ধান্ত অনুযায়ী প্রধান উৎসবের ন্যূনতম ৭ দিন আগে বোনাস পাওয়ার অধিকারী হবেন এবং এটি বোনাস আইন ১৯৬৫ অনুযায়ী হবে. মৌলিক বেতনের উপর I বোনাস আর্থিক বছর অনুযায়ী আপনার কর্মদিবসে গণনা করা হবে।`,{
//             height:60
//         });
//         pdfDoc.addPage();
//         pdfDoc.font('Helvetica-Bold').text(`9) `,20,40,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`আমাদের প্রতিষ্ঠানে একটানা ৫ বছর সফলভাবে সমাপ্ত করার পরে, শুধুমাত্র এই নিয়োগ এবং একই প্রধান নিয়োগকর্তার অধীনে, আপনিও গ্র্যাচুইটি প্রদানের আইন ১৯৭২ অনুযায়ী গ্র্যাচুইটির জন্য যোগ্য হবেন ।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text(`10) চুক্তির অবসান : `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             underline:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`৩০ দিনের নোটিশ দিয়ে বা তার পরিবর্তে ৩০ দিনের বেতন দেওয়ার মাধ্যমে যে কোনও পক্ষ চাকরি বন্ধ করার অধিকারী হবে। কিন্তূ, যদি এটি বিশৃঙ্খল ভিত্তিতে হয় যা প্রধান নিয়োগকর্তার ক্রিয়াকলাপকে বাধাগ্রস্ত করে, কোন নোটিশ দেওয়া হবে না।`,{
//             underline:false,
//             height:60,
//             continued:true
//         }).font('bengali')
//         .text(` আপনার চুক্তিপত্র বৈধতা ৩৬ মাস `,{
//             underline:false,
//             height:60,
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text(`11) বিরোধ :  `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//             underline:true,
//         }).font('bengali')
//         .text(`আপনার এবং প্রধান নিয়োগকর্তার মধ্যে যে কোনও বিরোধ বা এই নিয়োগ পত্রের সাথে সম্পর্কিত বা এর থেকে উদ্ভূত, শুধুমাত্র কলকাতার উচ্চ আদালতের এখতিয়ারের অধীন তা বিচার যোগ্য হিসেবে নির্ধারিত হবে৷`,{
//             height:60,
//             underline:false
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`12) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`আপনি প্রধান নিয়োগকর্তার সংস্থার কল্যাণ বিরুদ্ধে কাজ করতে পারবেন না। প্রতিষ্ঠানে কাজ করার সময় আপনি অন্য কোথাও নিজেকে নিযুক্ত করতে পারবেন না। সংগঠনের নিয়ম ভঙ্গ হলে তা শাস্তিযোগ্য অপরাধ হিসেবে গণ্য হবে ।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`13) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`আপনি প্রধান নিয়োগকর্তার সম্পত্তি রক্ষার জন্য দায়ী থাকবেন, আপনার উপর অর্পিত,দায়িত্ব যথাযথভাবে পালন করবেন এবং সংশ্লিষ্ট সম্পত্তির কোনো ধরনের ক্ষতি হলে প্রধান নিয়োগকর্তাকে ক্ষতিপূরণ দেবেন।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`14) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`পূর্ব বিজ্ঞপ্তি সহ আপনাকে প্রধান নিয়োগকর্তার বিভিন্ন শাখায় /বিভিন্ন পদে স্থানান্তরিত করা যেতে পারে।। আমরা আশা করব, আপনিও তা গ্রহণ করবেন।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`15) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`আপনি প্রধান নিয়োগকর্তা দ্বারা আপনার জন্য নিবেদিত সময়ে সমস্ত কাজ সম্পূর্ণ করবেন।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`16) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`আপনার ঠিকানা / টেলিফোন নম্বর / নমিনী ব্যক্তি পরিবর্তন হলে আপনাকে আমাদের সংস্থায় লিখিত তথ্য জমা দিতে হবে অন্যথায় এটি আপনার নিষ্ঠাহীনতা হিসাবে বিবেচিত হবে এবং ডাকযোগে কোনও চিঠি বা গুরুত্বপূর্ণ নথি না পাওয়ার জন্য আপনি নিজেই দায়ী থাকবেন।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`17) `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`আপনাকে একটি বন্ধুত্বপূর্ণ কাজের পরিবেশ বজায় রাখতে হবে এবং অন্যান্য সমস্ত সহকর্মীর সাথে সঠিকভাবে/ভদ্র আচরণ করতে হবে এবং উচ্চ পদস্ত কর্মচারীদের প্রতি শ্রদ্ধাশীল হতে হবে।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text(`18) যদি `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false,
//         }).font('bengali')
//         .text(`আপনি উপরের সমস্ত নিয়ম এবং প্রবিধানের সাথে সম্মত হন তবে এই নিয়োগ পত্রে স্বাক্ষর করতে পারেন। আমরা সচেতনভাবে পারস্পরিক বিশ্বাস, নির্ভরযোগ্যতার পরিবেশ গড়ে তোলার চেষ্টা করছি। প্রতিক্রিয়া এবং স্বায়ত্তশাসন আমাদের কর্পোরেট পরিবারের সকল সদস্যের আলোচনা এবং পরামর্শের জন্য স্বাগত।`,{
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text(`একজন নতুন প্রবেশকারী হিসেবে, আমরা আশা করি আপনি এই প্রক্রিয়ায় ইতিবাচকভাবে এবং আন্তরিকভাবে অবদান রাখবেন।`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text(`${employee.company_master.company_name} পরিবারে স্বাগতম। `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('bengali').text(`আদেশ অনুসারে`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//         });
//         pdfDoc.moveDown();    
//         if(employee.company_master.stamp){
//             pdfDoc.image(employee.company_master.stamp, 20,pdfDoc.y, { width: 50, height: 50, align:'left' })
//             .rect(20, pdfDoc.y-50, 50, 50)
//             .stroke();
//         }     
            
//         if(employee.company_master.signature){
//             pdfDoc.image(employee.company_master.signature, 80, pdfDoc.y-50, { width: 50, height: 50, align:'left' })
//             .rect(80, pdfDoc.y-50, 50, 50)
//             .stroke();
//         }  
//         pdfDoc.text(`${employee.company_master.company_name}  `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//         });
//         pdfDoc.moveDown();         
//         pdfDoc.font('bengali').text(`কর্মচারী ঘোষণা`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//             underline:true
//         });
//         pdfDoc.font('bengali').text(`আমি সমস্ত ধারা পড়েছি/পরে দেওয়া হয়েছে এবং সম্পূর্ণ বোধগম্যতার সাথে, আমি চাকরির এই শর্তাবলী গ্রহণ করছি এবং আমার স্বাধীন ইচ্ছা এবং সম্মতি থেকে আনন্দের সাথে যোগ দিচ্ছি।`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:false
//         });
//         if(employee.signature){
//             pdfDoc.image(employee.signature, 20, pdfDoc.y, { width: 50, height: 40, align:'left' })
//             .rect(20, pdfDoc.y-40, 50, 40)
//             .stroke();
//         }      
//         pdfDoc.text(`কর্মচারীর স্বাক্ষর `,20,pdfDoc.y+5,{
//             align:'left',
//             width:550,
//             height:60,   
//         });
//     }else{
//         pdfDoc.addPage();
//         pdfDoc.fontSize(20);
//         pdfDoc.text('Appointment Letter',20,20,{
//             align:'center',
//             width:610,
//             height:20
//         })
//         if(employee.company_master.logo){
//             pdfDoc.image(employee.company_master.logo, 510, 50, { width: 80, height: 80, align:'right' })
//             .rect(510, 50, 80, 80)
//             .stroke();
//             }       
//         pdfDoc.text(employee.company_master.company_name,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.fontSize(10);    
//         pdfDoc.moveDown();
//         pdfDoc.text(employee.company_master.address,{
//             align:'left',
//             width:200,
//             height:60,
//         })
//         pdfDoc.text(employee.company_master.email,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.text(employee.company_master.phone,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.moveDown();
//         pdfDoc.text('Date of joining : '+date_of_joining,{
//             align:'left',
//             width:550,
//             height:20,
//         })
//         pdfDoc.moveDown();
//         pdfDoc.text('Principal Employer’s Name and Address',{
//             align:'right',
//             width:550,
//             height:20,
//         })
//         pdfDoc.text(employee.client_master.client_name,385,pdfDoc.y,{
//             align:'left',
//             width:200,
//             height:20,
//         })
//         pdfDoc.text(clientData.client_addresses[0].address,385,pdfDoc.y,{
//             align:'left',
//             width:200,
//             height:60,
//         })
//         pdfDoc.moveDown();
//         pdfDoc.text('Dear '+employee.emp_title + ' ' +employee.emp_name,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
            
//         })
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text('Subject: Letter Of Appointment',{
//             align:'center',
//             width:550,
//             height:20,   
//             underline:true            
//         })
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica').text(`Following an interview, you had with our client`,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica-Bold')
//         .text(`(Your Principal Employer),`,{            
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica').text(` we have pleasure in offering you a job for the post of `,{            
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica-Bold').text(`${employee.designation} in ${employee.client_master.client_name}`,{            
//             continued:true,
//             lineBreak:false
//         }).font('Helvetica').text(` our client’s place on the following terms and conditions:`);
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`1) COMPENSATION: -`,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:true,
//         });
//         pdfDoc.font('Helvetica')
//         .text(`a) Your monthly salary/ wages will be Rs. ${employee.gross_salary} per month. The allocation of Gross Salary will be decided by the Principal Employer, the reflection of which you can easily view in your Pay Slips.`,40,pdfDoc.y,{            
//             align:'left',
//             width:500,
//             underline:false,
//             height:20,   
//         });
//         pdfDoc
//         .text(`b) Your monthly salary/ wages of every current month will be disbursed by 7th of the next month. `,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc
//         .text(`c) You will also be entitled for Bonus, minimum 7 days before the main festival, as decided by the Principal Employer and that will be as per Bonus Act 1965. Bonus will be paid on your working days calculated as per Financial Year.`,{            
//             align:'left',
//             width:500,
//             height:40,   
//         }); pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`2) WORKING HOURS: -`,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:true,
//         });
//         pdfDoc.font('Helvetica')
//         .text(`a) Your work timings will be as per Principal Employer’s policy but it will not exceed 9 hours a day or 48 hours weekly.`,40,pdfDoc.y,{            
//             align:'left',
//             width:500,
//             underline:false,
//             height:20,   
//         });
//         pdfDoc
//         .text(`b) If you work more than 9 hours a day, then you will be entitled for overtime which will be paid twice the normal pay as per Factories Act 1948 or Minimum Wages Act.        `,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc
//         .text(`c) Every week Monday to Saturday will be working days, whereas Sunday will be weekly off day or holiday. If due to urgency Sunday becomes working then holiday/weekly off day will be given within next 3 (three) working days.`,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`3) LEAVES AND HOLIDAYS: -`,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:true,
//         });
//         pdfDoc.font('Helvetica')
//         .text(`a) As per Section 79, Factories Act 1948, you will be eligible for 1 Day Earned Leave for every 20 days worked. (Subjected to a maximum of 12-14 days per year). Whether The Leave Will Be adjusted Or Encashed will be as per mutual consent of your good self and Principal Employer.`,40,pdfDoc.y,{            
//             align:'left',
//             width:500,
//             underline:false,
//             height:20,   
//         });
//         pdfDoc
//         .text(`b) As per the rule of the organization, you will be eligible for and enjoy all holidays as per the holiday list. (Holiday list will be announced by the Principal Employer by second week of January every year).`,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`4) PLACE OF WORK`,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             underline:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`Irrespective of your initial appointment of place of work, depending on the requirement of the Principal Employer, you can be shifted to different branch, designation, place/ branch with prior notice. We will expect, you will accept the same.`,{
//             underline:false,
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`5) STATUTORY CONTRIBUTIONS: -`,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:true,
//         });
//         pdfDoc.font('Helvetica')
//         .text(`a) You will also get PF and ESIC facilities if your earnings and its allocation fall under the ambit as set down by the EPF and MP Act 1952 and ESIC Act 1948.`,40,pdfDoc.y,{            
//             align:'left',
//             width:500,
//             underline:false,
//             height:20,   
//         });
//         pdfDoc
//         .text(`b) As per State Act, Ptax will also be deducted (if under ambit) every month and LWF will be deducted half-yearly.`,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`6) GRATUITY `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             underline:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`On successful completion of continuous 5 years in our organization, under this Appointment only, you will be also entitled for Gratuity as per Payment of Gratuity Act 1972.`,{
//             underline:false,
//             height:60
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`7) TERMINATION OF CONTRACT`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             underline:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`Either of the party will be entitled to terminate the employment, by giving 30 days’ notice or 30 day’s Salary in lieu thereof. However, if it is on disciplinary grounds which hampers the Principal Employer’s activities, no notice will be served.`,{
//             continued:true
//         }).font('Helvetica-Bold')
//         .text(`Your contract is valid for 36 months.`,{
//             underline:false,
//             height:60,
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`8) DISPUTES `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             underline:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`Any disputes between yourself and the Principal Employer concerned with or relating to, or rising out of this Appointment Letter, shall be subjected to the jurisdiction of and be determined, by the court of competent jurisdiction in Kolkata only.`,{
//             underline:false,
//             height:60
//         });
//         pdfDoc.addPage();
//         pdfDoc.font('Helvetica-Bold').text(`9) DISCIPLINARY CLAUSES`,20,40,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:true,
//             continued:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(`You cannot work against the benefit of the Principal Employer’s organization. While working in the organization you cannot engage yourself elsewhere. Breaking of the rule of the organization will be considered as a punishable offence. You shall be responsible for protecting the property of the Principal Employer, entrusted to you in the due discharge, of your duties, and shall indemnify the Principal Employer, when there is a loss of any kind to the concerned property.`,{
//             underline:false,
//             height:80
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`10) OTHER TERMS -`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:true,
//         });
//         pdfDoc.font('Helvetica')
//         .text(`a) You will complete all the jobs on time dedicated to you by the Principal Employer.`,40,pdfDoc.y,{            
//             align:'left',
//             width:500,
//             underline:false,
//             height:20,   
//         });
//         pdfDoc
//         .text(`b) You need to submit written information to our organization if ever your address / Telephone Number/ Nominee gets changed or else it will be considered as your insincerity and you yourself will be responsible for not getting any letters or important documents by post.`,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc
//         .text(`c) You have to maintain a friendly work environment and have to behave properly/ politely with all other fellow workers and respectful towards Seniors.`,{            
//             align:'left',
//             width:500,
//             height:40,   
//         });
//         pdfDoc.moveDown();
        
//         pdfDoc.font('Helvetica-Bold').text(`12) Only`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             continued:true,
//             underline:true,
//             lineBreak:false,
//         }).font('Helvetica')
//         .text(` If you agree to all the above rules and regulations, then may sign this appointment letter.`,{
//             height:60
//         });
//         pdfDoc.moveDown();
    
//         pdfDoc.font('Helvetica-Bold').text(`We are consciously endeavoring to build an atmosphere of mutual trust, reliability. Response and Autonomy are open to discussions and suggestions from all members of our Corporate Family.`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:false
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica-Bold').text(`As a new entrant, we hope you will contribute positively and whole heartedly to this process.        `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.font('Helvetica').text(`Welcome to ${employee.company_master.company_name} FAMILY.`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text(`Yours Truly`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text(`For ${employee.company_master.company_name} `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//         });
//         pdfDoc.moveDown();        
//         if(employee.company_master.stamp){
//             pdfDoc.image(employee.company_master.stamp, 20,pdfDoc.y, { width: 50, height: 50, align:'left' })
//             .rect(20, pdfDoc.y-50, 50, 50)
//             .stroke();
//         }     
            
//         if(employee.company_master.signature){
//             pdfDoc.image(employee.company_master.signature, 80, pdfDoc.y-50, { width: 50, height: 50, align:'left' })
//             .rect(80, pdfDoc.y-50, 50, 50)
//             .stroke();
//         }   
//         pdfDoc.moveDown();        
//         pdfDoc.font('Helvetica-Bold').text(`Employee Declaration `,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:20,   
//             underline:true
//         });
//         pdfDoc.font('Helvetica').text(`I have read/been explained all the clauses and with full understanding of the same, I am accepting these terms of employment and joining the concern out of my free will and consent.`,20,pdfDoc.y,{
//             align:'left',
//             width:550,
//             height:60,   
//             underline:false
//         });
//         pdfDoc.moveDown();  
//         if(employee.signature){
//             pdfDoc.image(employee.signature, 20, pdfDoc.y, { width: 50, height: 50, align:'left' })
//             .rect(20, pdfDoc.y-50, 50, 50)
//             .stroke();
//         }      
//         pdfDoc.text(`Signature of Employee`,20,pdfDoc.y+10,{
//             align:'left',
//             width:550,
//             height:60,   
//         });
//     }

//     //form 11
//     pdfDoc.addPage();
//     pdfDoc.fontSize(20);
//     pdfDoc.font('Helvetica').text('Form 11',10,20,{
//         align:'center',
//         width:610,
//         height:20
//     })
//     pdfDoc.fontSize(10);    
//     pdfDoc.text('Name : '+employee.emp_title+ ' ' +employee.emp_name,20,70,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Date Of Birth : '+dob,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Father's / Husband's Name : `+employee.father_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Relationship with respect to above : `+form11.relationship,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Gender : `+employee.gender,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Mobile : `+employee.mobile,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Email : `+employee.email,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`WHETHER EARLIER A MEMBER OF THE EMPLOYEES PROVIDENT FUND SCHEME, 1952 ? : `+form11.whether_pf,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`WHETHER EARLIER A MEMBER OF THE EMPLOYEES PENSION SCHEME, 1995? : `+form11.whether_pension,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     if(form11.uan || form11.pf_member_id){
//         pdfDoc.fontSize(20);
//         pdfDoc.text('A. PREVIOUS EMPLOYMENT DETAILS',{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.fontSize(10);   
//         if(form11.uan){     
//             pdfDoc.text('UAN : ' +form11.uan,{
//                 align:'left',
//                 width:610,
//                 height:20
//             });
//             pdfDoc.moveDown();
//         }
//         if(form11.pf_member_id){
//             pdfDoc.text('PREVIOUS PF MEMBER ID : ' +form11.pf_member_id,{
//                 align:'left',
//                 width:610,
//                 height:20
//             });
//             pdfDoc.moveDown();

//         }
//     var date_of_exit2 = dateFormat(form11.date_of_exit,'dd-MM-yyyy');

//         pdfDoc.text('DATE OF EXIT FOR PREVIOUS MEMBER ID (DD/MM/YYYY) : ' +date_of_exit2,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         if(form11.scheme_certificate_number){
//             pdfDoc.text('SCHEME CERTIFICATE NUMBER : ' +form11.scheme_certificate_number,{
//                 align:'left',
//                 width:610,
//                 height:20
//             });
//             pdfDoc.moveDown();
//         }
//         if(form11.ppo_number){
//             pdfDoc.text('PPO NUMBER : ' +form11.ppo_number,{
//                 align:'left',
//                 width:610,
//                 height:20
//             });
//             pdfDoc.moveDown();
//         }
//     }
//     pdfDoc.fontSize(20);
//     pdfDoc.text('B. OTHER DETAILS',{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);
//     pdfDoc.text('INTERNATIONAL WORKER: ' +form11.is_international_worker,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     if(form11.is_international_worker=="Yes"){
//         pdfDoc.text('COUNTRY OF ORIGIN: ' +form11.country_of_origin,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text('PASSPORT NUMBER: ' +form11.passport_number,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         var passport_valid_from = dateFormat(form11.passport_valid_from,'dd-MM-yyyy');
//         var passport_date_till = dateFormat(form11.passport_date_till,'dd-MM-yyyy');

//         pdfDoc.text('PASSPORT VALID FROM : ' +passport_valid_from + ' TO ' + passport_date_till,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//     }
//     pdfDoc.text('EDUCATIONAL QUALIFICATION : ' +form11.educational_qualification,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('SPECIALLY ABLED : ' +form11.is_specially_abled,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     if(form11.is_specially_abled=="Yes"){        
//         pdfDoc.text('SPECIALLY ABLED CATEGORY: ' +form11.specially_abled_category,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//     }
//     pdfDoc.text('KYC DETAILS: ',{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     for(var j=0;j<form11kyc.length;j++){
//         pdfDoc.text('KYC TYPE: ' +form11kyc[j].kyc_type ,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text('NAME ON KYC DOCUMENT: ' +form11kyc[j].kyc_name ,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text('KYC DOCUMENT NO: ' +form11kyc[j].kyc_number ,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text('Remarks: ' +form11kyc[j].remarks ,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//     } 
//     pdfDoc.fontSize(20);
//     pdfDoc.text('C UNDERTAKING',{
//         align:'center',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);

//     pdfDoc.text('A. I CERTIFY THAT ALL THE INFORMATION GIVEN ABOVE IS TRUE TO THE BEST OF MY KNOWLEDGE AND BELIEF' ,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('B. IN CASE, EARLIER A MEMBER OF EPF SCHEME, 1952 AND/OR EPS, 1995,' ,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
    
//     pdfDoc.text('(I) I HAVE ENSURED THE CORRECTNESS OF MY UAN/ PREVIOUS PF MEMBER ID' ,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
    
//     pdfDoc.text('(II) THIS MAY ALSO BE TREATED AS MY REQUEST FOR TRANSFER OF FUNDS AND SERVICE DETAILS IF APPLICABLE FROM THE PREVIOUS ACCOUNT AS DECLARED ABOVE TO THE PRESENT P.F. ACCOUNT. (THE TRANSFER WOULD BE POSSIBLE ONLY IF THE IDENTIFIED KYC DETAILS APPROVED BY PREVIOUS EMPLOYER HAS BEEN VERIFIED BY PRESENT EMPLOYER USING HIS DIGITAL SIGNATURE CERTIFICATE).' ,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('(III) I AM AWARE THAT I CAN SUBMIT MY NOMINATION FORM THROUGH UAN BASED MEMBER PORTAL.    ' ,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('Place : ' +form11.place ,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     var dd = dateFormat(form11.date,'dd-MM-yyyy');
//     pdfDoc.text('Date : ' +dd ,{
//         align:'left',
//         width:310,
//         height:20,
//         lineBreak:false
//     });
//     if(employee.signature){

//     pdfDoc.image(employee.signature ,510,pdfDoc.y,{        
//         fit:[25,25],
//         height:25,
//         lineBreak:false
//     }).text('Signature of Member',460,pdfDoc.y,{
//         width:100,
//         height:10
//     });   
// }
//     pdfDoc.moveDown();
//     pdfDoc.addPage();
  
//     pdfDoc.fontSize(20);
//     pdfDoc.text('DECLARATION BY PRESENT EMPLOYER',20,pdfDoc.y,{
//         align:'center',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);
//     pdfDoc.text('A. THE MEMBER '+employee.emp_title + ' ' + employee.emp_name +' HAS JOINED ON '+ date_of_joining +' AND HAS BEEN ALLOTTED PF MEMBER ID :' + form11.pf_no,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     if(form11.is_kyc_details_uploaded){
//     pdfDoc.text('B. IN CASE THE PERSON WAS EARLIER NOT A MEMBER OF EPF SCHEME, 1952 AND EPS, 1995:',{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
  
//     let is_kyc_details_uploaded = '';
//     if(form11.is_kyc_details_uploaded=='1'){
//         is_kyc_details_uploaded = 'HAVE NOT BEEN UPLOADED';
//     }else if(form11.is_kyc_details_uploaded=='2'){
//         is_kyc_details_uploaded = 'HAVE BEEN UPLOADED BUT NOT APPROVED';
//     }else if(form11.is_kyc_details_uploaded=='3'){
//         is_kyc_details_uploaded = 'HAVE BEEN UPLOADED AND APPROVED WITH DSC';
//     }
//     pdfDoc.text('THE KYC DETAILS OF THE ABOVE MEMBER IN THE UAN DATABASE : '+is_kyc_details_uploaded,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
// }
// if(form11.is_kyc_details_approved){
//     pdfDoc.text('C. IN CASE THE PERSON WAS EARLIER A MEMBER OF EPF SCHEME, 1952 AND EPS, 1995:',{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('THE ABOVE MEMBER ID OF THE MEMBER AS MENTIONED IN (A) ABOVE HAS BEEN TAGGED WITH HIS/HER UAN/PREVIOUS MEMBER ID AS DECLARED BY MEMBER.',{
//         align:'left',
//         width:550,
//         height:50,
//         lineBreak:false
//     });
//     pdfDoc.moveDown();
//     let is_kyc_details_approved = '';
//     if(form11.is_kyc_details_approved=='1'){
//         is_kyc_details_approved = 'THE KYC DETAILS OF THE ABOVE MEMBER IN THE UAN DATABASE HAVE BEEN APPROVED WITH DIGITAL SIGNATURE CERTIFICATE AND TRANSFER REQUEST HAS BEEN GENERATED ON PORTAL.';
//     }else if(form11.is_kyc_details_approved=='2'){
//         is_kyc_details_approved = 'AS THE DSC OF ESTABLISHMENT ARE NOT REGISTERED WITH EPFO, THE MEMBER HAS BEEN INFORMED TO FILE PHYSICAL CLAIM (FORM-13) FOR TRANSFER OF FUNDS FROM HIS PREVIOUS ESTABLISHMENT.';
//     }
//     pdfDoc.text('THE KYC DETAILS OF THE ABOVE MEMBER IN THE UAN DATABASE : '+is_kyc_details_approved,{
//         align:'left',
//         width:550,
//         height:60
//     });
//     pdfDoc.moveDown();
// }
// if(employee.client_master.logo){

// pdfDoc.fontSize(6).image(employee.client_master.logo ,510,pdfDoc.y,{        
//     fit:[25,25],
//     height:25,
//     lineBreak:false
// }).text('SIGNATURE OF EMPLOYER WITH SEAL OF ESTABLISHMENT',400,pdfDoc.y,{
//     width:200,
//     height:50
// });   

// pdfDoc.moveDown();
// }
// //form2
// if(employee.pf){
// pdfDoc.addPage();
// pdfDoc.fontSize(20);
//     pdfDoc.text('Form 2',10,20,{
//         align:'center',
//         width:610,
//         height:20
//     })
//     pdfDoc.text('NOMINATION AND DECLARATION FORM FOR UNEXEMPTED/EXEMPTED ESTABLISHMENTS ',20,70,{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);    
//     pdfDoc.text('Declaration and Nomination Form under the Employees Provident Funds and Employees Pension Schemes ',{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('(Paragraph 33 and 61 (1) of the Employees Provident Fund Scheme 1952 and Paragraph 18 of the Employees Pension Scheme 1995)',{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Name : '+employee.emp_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Father's / Husband's Name : `+employee.father_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Date Of Birth : '+dob,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Account No : '+employee.bank_ac,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Sex : '+employee.gender,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Maritial Status : '+employee.maritial_status,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Address : '+employee.address,{
//         align:'left',
//         width:610,
//         height:40,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(14);
//     pdfDoc.text('PART – A (EPF) ',{
//         align:'center',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('I hereby nominate the person(s)/cancel the nomination made by me previously and nominate the person(s) mentioned below to receive the amount standing to my credit in the Employees Provident Fund, in the event of my death.',{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);
//     if(epf.length>0){
//         for(var i=0;i<epf.length;i++){ 
//             if(i==2){
//                 pdfDoc.addPage();
//             }           
//             pdfDoc.text('Name Of the Nominee '+(i+1) +': ' + epf[i].name,20,pdfDoc.y,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();            
//             pdfDoc.text('Address '+(i+1) +': ' + epf[i].address,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();            
//             pdfDoc.text(`Nominee's relationship with the member ${(i+1)} : ${epf[i].relationship}`,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();          
//              var dd2 = dateFormat(epf[i].dob,'dd-MM-yyyy');
//             pdfDoc.text('Date Of Birth '+(i+1) +': ' + dd2,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();       
//             pdfDoc.text('Total amount or share of accumulations in Provident Funds to be paid to each nominee '+(i+1) +': ' + epf[i].total_share,{
//                 align:'left',
//                 width:550,
//                 height:40,
//             })
//             pdfDoc.moveDown();     
//             if(epf[i].is_minor=='1'){       
//                 pdfDoc.text('Name and address of the guardian who may receive the amount during the minority of the nominee '+(i+1) +': ' + epf[i].guardian_name_address,{
//                     align:'left',
//                     width:550,
//                     height:60,
//                 })
//                 pdfDoc.moveDown();   
//             }
//         }
//         pdfDoc.text('1. *Certified that I have no family as defined in para 2 (g) of the Employees Provident Fund Scheme 1952 and should I acquire a family hereafter the above nomination should be deemed as cancelled.',{
//             align:'left',
//             width:550,
//             height:10,
//         })
//         pdfDoc.moveDown(); 
//         pdfDoc.text('2. * Certified that my father/mother is/are dependent upon me.',{
//             align:'left',
//             width:550,
//             height:10,
//         })
//         if(employee.signature){

//         pdfDoc.fontSize(6).image(employee.signature ,510,pdfDoc.y,{        
//             fit:[25,25],
//             height:25,
//             lineBreak:false
//         }).text('Signature/or thumb impression of the subscriber',450,pdfDoc.y,{
//             width:150,
//             height:20
//         });   
//     }
//     }
//     pdfDoc.addPage();    
//     pdfDoc.fontSize(14);
//     pdfDoc.text('PART – B (EPS) ',20,pdfDoc.y,{
//         align:'center',
//         width:550,
//         height:20,
//     })
//     pdfDoc.text('I hereby furnish below particulars of the members of my family who would be eligible to receive Widow/Children Pension in the event of my premature death in service.',{
//         align:'center',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);
//     if(eps.length>0){
//         for(var i=0;i<eps.length;i++){                     
//             pdfDoc.text('Sr No '+(i+1) +': ' + eps[i].sr_no,20,pdfDoc.y,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();            
//             pdfDoc.text('Name & Address of the family member '+(i+1) +': ' + eps[i].name_address,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();            
//             pdfDoc.text(`Age ${(i+1)} : ${eps[i].age}`,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();          
//             pdfDoc.text('Relationship with the member '+(i+1) +': ' + eps[i].relationship,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();       
            
//         }
//     }
//     pdfDoc.addPage();       
    
//     pdfDoc.text('Certified that I have no family as defined in para 2 (vii) of the Employees’s Family Pension Scheme 1995 and should I acquire a family hereafter I shall furnish Particulars there on in the above form.',20,pdfDoc.y,{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('I hereby nominate the following person for receiving the monthly widow pension (admissible under para 16 2 (a) (i) & (ii) in the event of my death without leaving any eligible family member for receiving pension.',{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();       
//     pdfDoc.text('Name and Address of the nominee : ' + form2.name_address,{
//         align:'left',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();  
//     var dd3 = dateFormat(form2.dob,'dd-MM-yyyy');
//     pdfDoc.text('Date of birth : ' + dd3,{
//         align:'left',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();       
//     pdfDoc.text('Relationship with the member : ' + form2.relationship,{
//         align:'left',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();   
//     if(employee.signature){

//     pdfDoc.fontSize(6).image(employee.signature ,510,pdfDoc.y,{        
//         fit:[25,25],
//         height:25,
//         lineBreak:false
//     }).text('Signature/or thumb impression of the subscriber',450,pdfDoc.y,{
//         width:150,
//         height:20
//     });  
// }
//     pdfDoc.fontSize(14);
//     pdfDoc.text('CERTIFICATE BY EMPLOYER',20,pdfDoc.y,{
//         align:'center',
//         width:550,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Certified that the above declaration and nomination has been signed / thumb impressed before me by Shri / Smt./ Miss Test Emp employed in my establishment after he/she has read the entries / the entries have been read over to him/her by me and got confirmed by him/her. ',{
//         align:'left',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10); 
//     pdfDoc.text('Name & address of the Factory /Establishment : ' + form2.factory_name_address,{
//         align:'left',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown(); 
//     var dd4 = dateFormat(form2.date,'dd-MM-yyyy');
//     pdfDoc.text('Date : ' + dd4,{
//         align:'left',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown(); 
//     pdfDoc.text('Place : ' + form2.place,{
//         align:'left',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
// }

// pdfDoc.addPage();
//     pdfDoc.fontSize(20)
//     .text('Save', 20, 20, {
//         link: '/employee/new?isPreview='+true,
//         underline: true
//     }
//     );
//     pdfDoc.fontSize(20)
//     .text('Id Card', 100, 20, {
//         link: '/employee/idcard/'+employee.id,
//         underline: true
//     }
//     );
//     pdfDoc.fontSize(20)
//     .text('Download', 200, 20, {
//         link: '/employee/downloadEmployeeDetails/'+employee.id,
//         underline: true
//     }
//     );
//     pdfDoc.pipe( fs.createWriteStream(fileName));
//     pdfDoc.end();
//     pdfDoc.pipe(res)

// });

exports.downloadEmployeeDetails = catchAsyncErrors(async(req,res,next) =>{
    const companies = await CompanyMaster.findAll();
    const employee = await NewRegistration.findByPk(req.params.id,{include:[
        CompanyMaster,
        ClientMaster,
        NewRegistrationDocuments
        
        ]});
    const form11 = await Form11.findOne({where:{new_registration_id:req.params.id}});
    const form11kyc = await Form11KYC.findOne({where:{new_registration_id:req.params.id}});
    const form2 = await Form2.findOne({where:{new_registration_id:req.params.id}});
    const eps = await EPS.findAll({where:{new_registration_id:req.params.id}});
    const epf = await EPF.findAll({where:{new_registration_id:req.params.id}});
    const clientData = await ClientMaster.findByPk(employee.client_id,{include:ClientAddress});
    const incrementData = await NewRegistrationIncrements.findOne({where:{new_registration_id:req.params.id}});
    const pdfDoc = new PDFDocument();
    const fileName = employee.emp_name + '_' + employee.emp_code + '.pdf';
    const invoicePath = path.join('uploads', fileName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);


    const logoPath = employee.photo;
    if(logoPath){
    if (fs.existsSync(logoPath)) {
    pdfDoc.image(logoPath, 510, 50, { width: 80, height: 80, align:'right' })
    .rect(510, 50, 80, 80)
    .stroke();
        }
    }
    pdfDoc.fontSize(20);
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
    pdfDoc.fontSize(10);
    pdfDoc.moveDown();
    pdfDoc.text('Company Name : '+employee.company_master.company_name,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Client Name : '+employee.client_master.client_name,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Client Code : '+employee.client_code,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Emp Code : '+employee.emp_code,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    var date_of_joining;
    if(employee.date_of_joining!=null){
        date_of_joining = changeDate(employee.date_of_joining);
        }
        else{
            date_of_joining = 'NULL';
        }

    pdfDoc.text('Date Of Joining : '+date_of_joining,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Employee Name : '+employee.emp_title+' '+employee.emp_name,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Father/Husband Name : '+employee.father_name,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    var dob;
    if(employee.dob!=null){
        dob = changeDate(employee.dob);
        }
        else{
            dob = 'NULL';
        }

    pdfDoc.text('Date Of Birth : '+dob,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Gender : '+employee.gender,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Address : '+employee.address,{
        align:'left',
        width:550,
        height:60,
    })
    pdfDoc.moveDown();
    pdfDoc.text('State : '+employee.state,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Pin Code : '+employee.pin,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Mobile : '+employee.mobile,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Aadhaar No : '+employee.aadhar,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Pan No : '+employee.pan,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Maritial Status : '+employee.maritial_status,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Beneficiary Name : '+employee.beneficiary,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Bank Account No : '+employee.bank_ac,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('IFSC Code : '+employee.ifsc,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Bank Name : '+employee.bank_name,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('PF No : '+employee.pf,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('ESIC No : '+employee.esic,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    var date_of_exit;
    if(employee.date_of_exit!=null){
    date_of_exit = changeDate(employee.date_of_exit);
    }
    else{
        date_of_exit = 'NULL';
    }
    pdfDoc.text('Date Of Exit : '+date_of_exit,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.moveDown();
    pdfDoc.text('Remarks : '+employee.remarks,{
        align:'left',
        width:610,
        height:20,
    })
    pdfDoc.addPage();
    
    if(employee.aadhar_photo){
        if (fs.existsSync(employee.aadhar_photo)) {
        pdfDoc.image(employee.aadhar_photo, {
            fit: [500, 600],
            align: 'center',
            valign: 'center'
        });
    }
    }
    if(employee.pan_photo){
        if (fs.existsSync(employee.pan_photo)) {
        pdfDoc.addPage();
        pdfDoc.image(employee.pan_photo, {
            fit: [500, 600],
            align: 'center',
            valign: 'center'
        });
    }
    }
    if(employee.bank_passbook_photo){
        if (fs.existsSync(employee.bank_passbook_photo)) {
        pdfDoc.addPage();
        pdfDoc.image(employee.bank_passbook_photo, {
            fit: [500, 600],
            align: 'center',
            valign: 'center'
        });
    }
    }

    // if(employee.tic){
    //     if (fs.existsSync(employee.tic)) {
    // pdfDoc.addPage();
    //     pdfDoc.image(employee.tic, {
    //         fit: [300, 200],
    //         align: 'center',
    //         valign: 'center'
    //     });
    // }
    // }
    if(employee.family_photo){
        if (fs.existsSync(employee.family_photo)) {
        pdfDoc.addPage();
        pdfDoc.image(employee.family_photo, {
            fit: [500, 600],
            align: 'center',
            valign: 'center'
        });
    }
    }
    if(employee.signature){
        if (fs.existsSync(employee.signature)) {
        pdfDoc.addPage();
        pdfDoc.image(employee.signature, {
            fit: [500, 600],
            align: 'center',
            valign: 'center'
        });
    }
}
    if(employee.new_registration_documents.length>0){
             for(var i =0;i<employee.new_registration_documents.length;i++){
                    pdfDoc.addPage();
            
            pdfDoc.image(employee.new_registration_documents[i].document, {
                fit: [500, 600],
                align: 'center',
            valign: 'center'
        });

        
    }
    }
    
    pdfDoc.registerFont('bengali', path.join('utils','kalpurush.ttf'));
    pdfDoc.registerFont('hindi', path.join('utils','hindi.ttf'));
    //appointment letter general
    if(employee.type=='general'){
        pdfDoc.addPage();
        pdfDoc.fontSize(20);
        pdfDoc.text('Appointment Letter',20,20,{
            align:'center',
            width:610,
            height:20
        })
        pdfDoc.moveDown();

        if(employee.company_master.logo){
            if (fs.existsSync(employee.company_master.logo)) {
            pdfDoc.image(employee.company_master.logo, 10, 40, { width: 50, height: 50, align:'left' })
            .rect(10, 40, 50, 50)
            .stroke();
            }    
        }   
        pdfDoc.text(employee.company_master.company_name,60,50,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.fontSize(10);    
        pdfDoc.moveDown();
        pdfDoc.text(employee.company_master.address,10,pdfDoc.y+10,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.text(employee.company_master.email,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.text(employee.company_master.phone,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.moveDown();
        const h = pdfDoc.y;
        pdfDoc.text('Date of Joining: '+date_of_joining,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('Principal Employer’s Name and Address',385,50,{
            align:'left',
            width:250,
            height:20,
        })
        pdfDoc.font('Helvetica').text(employee.client_master.client_name,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:20,
        })
        pdfDoc.font('Helvetica').text(clientData.client_addresses[0].address,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('Basic - '+employee.basic_salary,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('HRA - '+employee.hra,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('Gross - '+employee.gross_salary,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.moveDown();

        pdfDoc.font('Helvetica').text('Dear '+employee.emp_title + ' ' +employee.emp_name,20,h+20,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.text('Bearing Aadhar Number - '+employee.aadhar,385,pdfDoc.y,{
            align:'left',
            width:300,
            height:20,   
            
        })
        pdfDoc.moveDown();
        pdfDoc.font('bengali').text('Subject: Letter Of Appointment / নিয়োগপত্র',10,pdfDoc.y,{
            align:'center',
            width:550,
            height:10,   
            underline:true,
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Following an interview, you had with our client`,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false
        }).font('Helvetica-Bold')
        .text(`(Your Principal Employer),`,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica').text(` we have pleasure in offering you a job for the post of `,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica-Bold').text(`${employee.designation}`,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica').text(` our client’s place on the following terms and conditions:`);
        pdfDoc.moveDown();
        pdfDoc.font('bengali').text(`আমাদের ক্লায়েন্টের সহিত, যিনি আপনার প্রধান নিযুক্তকারী আপনার সাক্ষাৎকারের ভিত্তিতে আমরা আপনাকে`,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false
        }).font('bengali').text(`${employee.designation}`,{            
            continued:true,
            lineBreak:false
        }).font('bengali').text(` পোস্টের জন্য  নিম্নলিখিত শর্তাবলী সাপেক্ষে আমাদের ক্লায়েন্টের স্থানে একটি চাকুরীর প্রস্তাব দিয়ে আনন্দিত |`);
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`1) COMPENSATION: - `,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
            underline:true,
        }).font('Helvetica')
        .text(`Your salary / wages will be Rs.`,{            
            continued:true,
            underline:false,
            lineBreak:false,
        }).font('Helvetica-Bold').text(`${employee.gross_salary}`,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica').text(` per month. The allocation of Gross Salary will be decided by the Principal Employer, the reflection of which you can easily view in your Pay Slips.`);
        pdfDoc.moveDown();
        
        pdfDoc.font('bengali').text(`(বতন: - `,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
            underline:true,
        }).font('bengali')
        .text(`আপনার বেতন/মজুরি হবে Rs.`,{            
            continued:true,
            underline:false,
            lineBreak:false,
        }).font('bengali').text(`${employee.gross_salary}`,{            
            continued:true,
            lineBreak:false
        }).font('bengali').text(` প্রতি মাসে, মোট বেতনের বিভাগ প্রধান নিয়োগকর্তা দ্বারা নির্ধারিত হবে, যার প্রতিফলন আপনি সহজেই আপনার পে স্লিপে দেখতে পারবেন।`);
        pdfDoc.moveDown();
        pdfDoc.font('bengali').text(`2) WORKING HOURS / কাজের সময়সূচি -`,{
            align:'left',
            width:550,
            height:60,   
            underline:true,
        });
        pdfDoc.font('Helvetica')
        .text(`a) Your work timings will be as per Principal Employer’s policy but it will not exceed 8 hours a day or 48 hours weekly.`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:60,   
        });        
        pdfDoc.font('bengali')
        .text(`আপনার কাজের সময় প্রধান নিয়োগকর্তার নীতি অনুসারে হবে তবে এটি দিনে ৮ ঘন্টা বা সাপ্তাহিক ৪৮ ঘন্টার বেশি হবে না|`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:60,   
        });
        pdfDoc
        .text(`b) If you work more than 8 hours a day, then you will be entitled for overtime which will be paid twice the normal pay as per Factories Act 1948 or Minimum Wages Act / or as per factory policy, whichever is higher. `,{            
            align:'left',
            width:500,
            height:60,   
        });              
        pdfDoc.font('bengali')
        .text(`আপনি যদি দিনে ৮ ঘন্টার বেশি কাজ করেন, তাহলে আপনি ওভারটাইম পাওয়ার অধিকারী হবেন যা দ্বিগুণ  হবে ফ্যাক্টরি অ্যাক্ট 1948 বা ন্যূনতম মজুরি আইন অনুযায়ী / অথবা কারখানার নীতি অনুযায়ী, যেটি বেশি হবে।`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:60,   
        });
        pdfDoc
        .text(`c) In every week, any 6 days will be working days and one day will be weekly off day. If due to any urgency the weekly off day becomes a working day, then weekly off day will be given within next 5 (five) working days. `,{            
            align:'left',
            width:500,
            height:60,   
        });        
        pdfDoc
        .font('bengali')
        .text(`প্রতি সপ্তাহে যেকোনো ৬ দিন কাজের দিন হবে এবং একদিন সাপ্তাহিক ছুটি থাকবে I জরুরি কারণে সাপ্তাহিক ছুটির দিনে কাজ করতে হলে পরবর্তী ৫ টি কার্যদিবসের মধ্যে যেকোনো একদিন ছুটি দেওয়া হবে । `,{            
            align:'left',
            width:500,
            height:60,   
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`3) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`Your monthly salary / wages of every current month will be disbursed by 7th of the next month.`)
        .font('bengali')
        .text(`আপনার প্রতি বর্তমান মাসের মাসিক বেতন পরের মাসের ৭ তারিখের মধ্যে বিতরণ করা হবে ।`);
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`4) `,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`As per Section 79, Factories Act 1948, you will be eligible for 1 Day Earned Leave for every 20 days worked. (Subjected to a maximum of 12-14 days per year). Whether The Leave Will Be adjusted Or Encashed will be as per mutual consent of your good self and Principal Employer.`,{
            height:60
        }).font('bengali')
        .text(`As per Section 79 , Factories Act 1948, আপনি প্রতি 20 দিন কাজ করার জন্য ১ দিনের অর্জিত ছুটির জন্য যোগ্য হবেন, (প্রতি বছর সর্বোচ্চ ১২-১৪  দিনের সাপেক্ষে), ছুটি সামঞ্জস্য করা হবে নাকি নগদ টাকা প্রেরণ করা হবে তা প্রধান নিয়োগকর্তার পারস্পরিক সম্মতি অনুসারে ঠিক হবে।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`5) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`As per the rule of the organization, you will be eligible for and enjoy all holidays as per the holiday list. (Holiday list will be announced by the Principal Employer by second week of January every year).`,{
            height:60
        }).font('bengali')
        .text(`আপনি বার্ষিক উৎসবের ছুটি পাবেন । (প্রতি বছর জানুয়ারির দ্বিতীয় সপ্তাহের মধ্যে প্রধান নিয়োগকর্তার দ্বারা ছুটির তালিকা ঘোষণা করা হবে)।`,{
            height:60
        });
        pdfDoc.addPage();
        pdfDoc.font('Helvetica-Bold').text(`6) `,20,20,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You will also get PF and ESIC facilities if your Earnings and its allocation fall under the ambit as set down by the EPF and MP Act 1952 and ESIC Act 1948.`,{
            height:60
        }).font('bengali')
        .text(`আপনি PF এবং ESIC সুবিধা পাবেন যদি আপনার উপার্জন এবং পারিশ্রমিক EPF এবং MP আইন ১৯৫২ এবং ESIC আইন ১৯৪৮ দ্বারা নির্ধারিত পরিধির আওতায় পড়ে।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`7) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You will also be entitled for Bonus, minimum 7 days before the main festival, as decided by the Principal Employer and that will be as per Bonus Act 1965. Bonus will be as per Your Earnings, Of Previous Financial Year.`)
        .font('bengali')
        .text(`আপনি প্রধান নিয়োগকর্তার সিদ্ধান্ত অনুযায়ী প্রধান উৎসবের ন্যূনতম ৭ দিন আগে বোনাস পাওয়ার অধিকারী হবেন এবং এটি বোনাস আইন ১৯৬৫ অনুযায়ী হবে. মৌলিক বেতনের উপর | বোনাস, পুর্ব আর্থিক বছর অনুযায়ী আপনার কর্মদিবসের ভিত্তিতে গণনা করা হবে।`);
       pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`8) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`On successful completion of continuous 5 years in our organization, under this Appointment and Same Principal Employer only, you will be also entitled for Gratuity as per Payment of Gratuity Act 1972.`,{
            height:60
        }).font('bengali')
        .text(`আমাদের প্রতিষ্ঠানে একটানা ৫ বছর সফলভাবে সমাপ্ত করার পরে, শুধুমাত্র একই প্রধান নিয়োগকর্তার অধীনে, আপনিও গ্র্যাচুইটি প্রদানের আইন ১৯৭২ অনুযায়ী গ্র্যাচুইটির জন্য যোগ্য হবেন।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`9) TERMINATION OF CONTRACT : `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            underline:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`Either of the party will be entitled to terminate the employment, by giving 30days’ notice or 30 day’s Salary in lieu thereof. However, if it is on disciplinary grounds which hampers the Principal Employer’s activities, no notice will be served.`,{
            underline:false,
            height:60,
        }).font('bengali')
        .text(`চুক্তির অবসান: `,{
            continued:true,
            underline:true,
            height:60,
        }).font('bengali')
        .text(`৩০ দিনের নোটিশ দিয়ে বা তার পরিবর্তে ৩০ দিনের বেতন দেওয়ার মাধ্যমে যে কোনও পক্ষ চাকরি থেকে অব্যাহতি করার অধিকারী হবে। কিন্তূ, যদি এটি বিশৃঙ্খল ভিত্তিতে হয় যা প্রধান নিয়োগকর্তার ক্রিয়াকলাপকে বাধাগ্রস্ত করে, কোন নোটিশ দেওয়া হবে না।`,{
            continued:false,
            underline:false,
            height:60,
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`10) DISPUTES :  `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
            underline:true,
        }).font('Helvetica')
        .text(`Any dispute between yourself and the Principal Employer concerned with or relating to, or rising out of this Appointment Letter, shall be subjected to the jurisdiction of and be determined, by the court of competent jurisdiction in Kolkata only.`,{
            height:60,
            underline:false
        }).font('bengali')
        .text(`বিরোধ: `,{
            height:60,
            continued:true,
            underline:true
        }).font('bengali')
        .text(`আপনার এবং প্রধান নিয়োগকর্তার মধ্যে যে কোনও বিরোধ বা এই নিয়োগ পত্রের সাথে সম্পর্কিত বা এর থেকে উদ্ভূত, শুধুমাত্র কলকাতার উচ্চ আদালতের এখতিয়ারের অধীন তা বিচার  যোগ্য হিসেবে নির্ধারিত হবে।`,{
            height:60,
            continued:false,
            underline:false
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`11) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You cannot work against the benefit of the Principal Employer’s organization. While working in the organization you cannot engage yourself elsewhere. Breaking of the rule of the organization will be considered as punishable offence.`,{
            height:60
        }).font('bengali')
        .text(` আপনি প্রধান নিয়োগকর্তার সংস্থার কল্যাণ বিরুদ্ধে কাজ করতে পারবেন না। প্রতিষ্ঠানে কাজ করার সময় আপনি অন্য কোথাও নিজেকে নিযুক্ত করতে পারবেন না। সংগঠনের নিয়ম ভঙ্গ হলে তা শাস্তিযোগ্য অপরাধ হিসেবে গণ্য হবে।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`12) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You shall be responsible for protecting the property of the Principal Employer, entrusted to you in the due discharge, of your duties, and shall indemnify the Principal Employer, when there is a loss of any kind to the concerned property.`,{
            height:60
        }).font('bengali')
        .text(` প্রধান নিয়োগকর্তার সম্পত্তি রক্ষার জন্য আপনি দায়ী থাকবেন, আপনার দায়িত্ব পালনে আপনার উপর অর্পিত হবেন, এবং সংশ্লিষ্ট সম্পত্তির কোনো ধরনের ক্ষতি হলে আপনি প্রধান নিয়োগকর্তাকে ক্ষতিপূরণ দেবেন।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`13) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You can be shifted to different place/branch of Principal Employer and Designation with prior Notice. We will expect, you will accept the same.`,{
            height:60
        }).font('bengali')
        .text(`পূর্ব বিজ্ঞপ্তি সহ আপনাকে প্রধান নিয়োগকর্তার বিভিন্ন শাখায় /বিভিন্ন পদে স্থানান্তরিত করা যেতে পারে।। আমরা আশা করব, আপনিও তা গ্রহণ করবেন।`,{
            height:60
        });
        
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`As a new entrant, we hope you will contribute positively and whole heartedly to this process of Mutual Trust N Autonomy.`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('bengali')
        .text(`একজন নতুন প্রবেশকারী হিসেবে, আমরা আশা করি আপনি পরশপরিক বিশ্বাস ও স্বাধিন প্রক্রিয়ায় ইতিবাচকভাবে এবং আন্তরিকভাবে অবদান রাখবেন।`,{
            height:60
        });
        
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Welcome to ${employee.company_master.company_name} FAMILY.`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        pdfDoc.text(`Yours Truly`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        if(employee.company_master.logo){
            if (fs.existsSync(employee.company_master.logo)) {
            pdfDoc.image(employee.company_master.logo, 20,pdfDoc.y, { width: 80, height: 80, align:'left' })
            .rect(20, pdfDoc.y-80, 80, 80)
            .stroke();
            }
        }     
        pdfDoc.text(`For ${employee.company_master.company_name} `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.addPage();   
        pdfDoc.font('Helvetica-Bold').text(`Employee Declaration `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            underline:true
        });
        pdfDoc.font('Helvetica').text(`I have read / been explained all the clauses and with full understanding of the same, I am accepting these terms of employment and joining the concern out of my free will and consent.`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            underline:false
        });
        pdfDoc.moveDown();  
        pdfDoc.font('bengali').text(`কর্মচারী ঘোষণা `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            underline:true
        });
        pdfDoc.font('bengali').text(`আমি সমস্ত ধারা পড়েছি/পড়ে বুঝিয়ে  দেওয়া হয়েছে এবং সম্পূর্ণ বোধগম্যতার সাথে, আমি চাকরির এই শর্তাবলী গ্রহণ করছি এবং আমার স্বাধীন ইচ্ছা এবং সম্মতি থেকে আনন্দের সাথে যোগ দিচ্ছি।`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            underline:false
        });
        if(employee.signature){
            if (fs.existsSync(employee.signature)) {
            pdfDoc.image(employee.signature, 20, pdfDoc.y, { width: 80, height: 80, align:'left' })
            .rect(20, pdfDoc.y-80, 80, 80)
            .stroke();
            }
        }      
        pdfDoc.text(`Signature of Employee`,20,pdfDoc.y+10,{
            align:'left',
            width:550,
            height:60,   
        });
        //bengali
                if(incrementData!=null){

        if(incrementData.gross_salary!=''){
            pdfDoc.addPage();
             pdfDoc.fontSize(20);
            pdfDoc.font('Helvetica-Bold').text('LETTER OF INCREMENT',20,20,{
                align:'center',
                underline:true,
                width:610,
                height:20
            });
            pdfDoc.moveDown();
                pdfDoc.fontSize(18);

            pdfDoc.font('Helvetica').text('Employee Name : '+employee.emp_name,30,80,{
                align:'left',
                width:500,
                height:60,
            })
            pdfDoc.moveDown();
            const dateOfIncrement = changeDate(incrementData.date_of_increment);
            pdfDoc.text('Date Of Increment : '+dateOfIncrement,pdfDoc.x,pdfDoc.y+20,{
                align:'left',
                width:500,
                height:60,
            })
            pdfDoc.moveDown();
            pdfDoc.moveDown();
            const xValue = pdfDoc.x;
            pdfDoc.text(`I am pleased to inform you that your salary has been increased to`,{
            align:'left',
            width:550,
            height:60,   
        }).font('Helvetica-Bold')
        .text(`Rs. ${incrementData.gross_salary}. `,{   
            continued: true,
            lineBreak:false
        }).font('Helvetica').text(` Congratulations on this well-deserved increment! `,{ 
        });
        
        pdfDoc.font('Helvetica').text(` Thank you for your valuable contributions to our organization, and we look forward to your continued success.`,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
        
            pdfDoc.moveDown();
            pdfDoc.moveDown();
        
         pdfDoc.font('bengali').text(`আমি আপনাকে জানাতে পেরে  আনন্দিত যে আপনার বেতন `,{
            align:'left',
            width:550,
            height:60,   
              continued: true,
            lineBreak:false
        }).font('Helvetica-Bold')
        .text(`Rs. ${incrementData.gross_salary}. `,{   
            continued: true,
            lineBreak:false
        }).font('bengali').text(`টাকায় `,{ 
        });
        
        pdfDoc.font('bengali').text(` বৃদ্ধি করা হয়েছে |   এই ভালো প্রাপ্ত বৃদ্ধির জন্য অভিনন্দন|`,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
            
        pdfDoc.font('bengali').text(` আমাদের  প্রতিষ্ঠানে আপনার মূল্যবান অবদানের জন্য আপনাকে ধন্যবাদ, আমরন`,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
            
        pdfDoc.font('bengali').text(`আপনার অব্যাহত সাফল্যের জন্যে উন্মুখ | `,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
        }
}
       
    }else if(employee.type=='general-hindi'){
        pdfDoc.addPage();
        pdfDoc.fontSize(20);
        pdfDoc.text('Appointment Letter',20,20,{
            align:'center',
            width:610,
            height:20
        })
        pdfDoc.moveDown();

        if(employee.company_master.logo){
            if (fs.existsSync(employee.company_master.logo)) {
            pdfDoc.image(employee.company_master.logo, 10, 40, { width: 50, height: 50, align:'left' })
            .rect(10, 40, 50, 50)
            .stroke();
            }    
        }   
        pdfDoc.text(employee.company_master.company_name,60,50,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.fontSize(10);    
        pdfDoc.moveDown();
        pdfDoc.text(employee.company_master.address,10,pdfDoc.y+10,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.text(employee.company_master.email,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.text(employee.company_master.phone,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.moveDown();
        const h = pdfDoc.y;
        pdfDoc.text('Date of Joining: '+date_of_joining,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('Principal Employer’s Name and Address',385,50,{
            align:'left',
            width:250,
            height:20,
        })
        pdfDoc.font('Helvetica').text(employee.client_master.client_name,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:20,
        })
        pdfDoc.font('Helvetica').text(clientData.client_addresses[0].address,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:60,
        })
        // pdfDoc.moveDown();

        pdfDoc.font('Helvetica-Bold').text('Basic - '+employee.basic_salary,385,pdfDoc.y+6,{
            align:'left',
            width:200,
            height:60,
        })
        // pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('HRA - '+employee.hra,385,pdfDoc.y+6,{
            align:'left',
            width:200,
            height:60,
        })
        // pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('Gross - '+employee.gross_salary,385,pdfDoc.y+6,{
            align:'left',
            width:200,
            height:60,
        })
        // pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text('Dear '+employee.emp_title + ' ' +employee.emp_name,20,h+20,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.text('Bearing Aadhar Number - '+employee.aadhar,385,pdfDoc.y+3,{
            align:'left',
            width:300,
            height:20,   
            
        })
        pdfDoc.moveDown();
        pdfDoc.font('hindi').text('Subject: Letter Of Appointment / नियुक्ति पत्र',10,pdfDoc.y,{
            align:'center',
            width:550,
            height:10,   
            underline:true,
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Following an interview, you had with our client`,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false
        }).font('Helvetica-Bold')
        .text(`(Your Principal Employer),`,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica').text(` we have pleasure in offering you a job for the post of `,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica-Bold').text(`${employee.designation}`,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica').text(` our client’s place on the following terms and conditions:`);
        pdfDoc.moveDown();
        pdfDoc.font('hindi').text(`हमारे मुवक्किल (आपका प्रधान नियोक्ता) के साथ एक साक्षात्कार के बाद, हमें आपको के पद के लिए नौकरी की पेशकश करते हुए खुशी हो रही है`,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false
        }).font('bengali').text(` ${employee.designation}`,{            
            continued:true,
            lineBreak:false
        }).font('hindi').text(` हमारे मुवक्किल के स्थान पर निम्नलिखित नियमों और शर्तों पर |`);
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`1) COMPENSATION: - `,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
            underline:true,
        }).font('Helvetica')
        .text(`Your salary / wages will be Rs.`,{            
            continued:true,
            underline:false,
            lineBreak:false,
        }).font('Helvetica-Bold').text(`${employee.gross_salary}`,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica').text(` per month. The allocation of Gross Salary will be decided by the Principal Employer, the reflection of which you can easily view in your Pay Slips.`);
        pdfDoc.moveDown();
        
        pdfDoc.font('hindi').text(`मुआवज़ा: - `,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
            underline:true,
        }).font('hindi')
        .text(`आपका वेतन/मजदूरी रु.`,{            
            continued:true,
            underline:false,
            lineBreak:false,
        }).font('bengali').text(`${employee.gross_salary}`,{            
            continued:true,
            lineBreak:false
        }).font('hindi').text(` प्रति महीने। सकल वेतन का आवंटन विभाग द्वारा तय किया जाएगा प्रधान नियोक्ता, जिसका प्रतिबिंब आप अपनी वेतन पर्ची में आसानी से देख सकते हैं।`);
        pdfDoc.moveDown();
        pdfDoc.font('hindi').text(`2) WORKING HOURS / कार्य के घंटे -`,{
            align:'left',
            width:550,
            height:60,   
            underline:true,
        });
        pdfDoc.font('Helvetica')
        .text(`a) Your work timings will be as per Principal Employer’s policy but it will not exceed 8 hours a day or 48 hours weekly.`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:60,   
        });        
        pdfDoc.font('hindi')
        .text(`आपके काम का समय प्रधान नियोक्ता की नीति के अनुसार होगा लेकिन यह एक दिन में 8 घंटे या साप्ताहिक 48 घंटे से अधिक नहीं होगा।`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:60,   
        });
        pdfDoc.font('Helvetica')
        .text(`b) If you work more than 8 hours a day, then you will be entitled for overtime which will be paid twice the normal pay as per Factories Act 1948 or Minimum Wages Act / or as per factory policy, whichever is higher.  `,{            
            align:'left',
            width:500,
            height:60,   
        });              
        pdfDoc.font('hindi')
        .text(`यदि आप दिन में 8 घंटे से अधिक काम करते हैं, तो आप ओवरटाइम के हकदार होंगे, जिसका भुगतान फैक्ट्री अधिनियम 1948 या न्यूनतम वेतन अधिनियम / या फैक्ट्री नीति के अनुसार, जो भी अधिक हो, सामान्य वेतन से दोगुना होगा।ियम।`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:60,   
        });
        pdfDoc.font('Helvetica')
        .text(`c) In every week, any 6 days will be working days and one day will be weekly off day. If due to any urgency the weekly off day becomes a working day, then weekly off day will be given within next 5 (five) working days. `,{            
            align:'left',
            width:500,
            height:60,   
        });        
        pdfDoc
        .font('hindi')
        .text(`प्रत्येक सप्ताह कोई भी 6 दिन कार्य दिवस होगा तथा एक दिन अवकाश/साप्ताहिक अवकाश होगा। यदि किसी अत्यावश्यकता के कारण साप्ताहिक अवकाश का दिन है कार्य दिवस हो जाता है, तो अगले 5 (पांच) कार्य दिवसों के भीतर अवकाश/साप्ताहिक अवकाश दिया जाएगा। `,{            
            align:'left',
            width:500,
            height:60,   
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`3) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`Your monthly salary / wages of every current month will be disbursed by 7th of the next month.`)
        .font('hindi')
        .text(`प्रत्येक चालू माह का आपका मासिक वेतन/मजदूरी अगले महीने की 7 तारीख तक वितरित कर दी जाएगी।`);
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`4) `,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`As per Section 79, Factories Act 1948, you will be eligible for 1 Day Earned Leave for every 20 days worked. (Subjected to a maximum of 12-14 days per year). Whether The Leave Will Be adjusted Or Encashed will be as per mutual consent of your good self and Principal Employer.`,{
            height:60
        }).font('hindi')
        .text(`कारखाना अधिनियम 1948 की धारा 79 के अनुसार, आप प्रत्येक 20 दिनों के काम के लिए 1 दिन की अर्जित छुट्टी के पात्र होंगे। (अधिकतम 12 के अधीन-प्रति वर्ष 14 दिन)। यह तय होगा कि छुट्टी को समायोजित किया जाएगा या नकदी में भुगतान किया जाएगा, यह आपके स्वयं और प्रधान नियोक्ता की आपसी सहमति के अनुसार होगा।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`5) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`As per the rule of the organization, you will be eligible for and enjoy all holidays as per the holiday list. (Holiday list will be announced by the Principal Employer by second week of January every year).`,{
            height:60
        }).font('hindi')
        .text(`संगठन के नियम के अनुसार, आप अवकाश सूची के अनुसार सभी छुट्टियों के लिए हकदार होंगे और उनका आनंद लेंगे। (अवकाश सूची की घोषणा की जाएगी प्रधान नियोक्ता प्रत्येक वर्ष जनवरी के दूसरे सप्ताह तक)।`,{
            height:60
        });
        pdfDoc.addPage();
        pdfDoc.font('Helvetica-Bold').text(`6) `,20,20,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You will also get PF and ESIC facilities if your Earnings and its allocation fall under the ambit as set down by the EPF and MP Act 1952 and ESIC Act 1948.`,{
            height:60
        }).font('hindi')
        .text(`आपको पीएफ और ईएसआईसी सुविधाएं भी मिलेंगी यदि आपकी कमाई और इसका आवंटन ईपीएफ और एमपी अधिनियम 1952 द्वारा निर्धारित दायरे में आता है और ईएसआईसी अधिनियम 1948।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`7) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You will also be entitled for Bonus, minimum 7 days before the main festival, as decided by the Principal Employer and that will be as per Bonus Act 1965. Bonus will be as per Your Earnings, Of Previous Financial Year.`)
        .font('hindi')
        .text(`प्रधान नियोक्ता द्वारा तय किए गए अनुसार आप मुख्य त्योहार से कम से कम 7 दिन पहले बोनस के भी हकदार होंगे और वह बोनस अधिनियम 1965। बोनस आपकी पिछले वित्तीय वर्ष की कमाई के अनुसार होगा |`);
       pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`8) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`On successful completion of continuous 5 years in our organization, under this Appointment and Same Principal Employer only, you will be also entitled for Gratuity as per Payment of Gratuity Act 1972.`,{
            height:60
        }).font('hindi')
        .text(`हमारे संगठन में लगातार 5 वर्षों के सफल समापन पर, इस नियुक्ति और केवल एक ही प्रधान नियोक्ता के तहत, आप होंगे ग्रेच्युटी अधिनियम 1972 के भुगतान के अनुसार ग्रेच्युटी के लिए भी हकदार हैं।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`9) TERMINATION OF CONTRACT : `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            underline:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`Either of the party will be entitled to terminate the employment, by giving 30days’ notice or 30 day’s Salary in lieu thereof. However, if it is on disciplinary grounds which hampers the Principal Employer’s activities, no notice will be served.`,{
            underline:false,
            height:60,
        }).font('hindi')
        .text(`अनुबंध की समाप्ति: `,{
            continued:true,
            underline:true,
            height:60,
        }).font('hindi')
        .text(`कोई भी पक्ष 30 दिन का नोटिस या 30 दिन का वेतन देकर रोजगार समाप्त करने का हकदार होगा उसके एवज में। हालांकि, अगर यह अनुशासनात्मक आधार पर है जो प्रधान नियोक्ता की गतिविधियों को बाधित करता है, तो कोई नोटिस नहीं दिया जाएगा।`,{
            continued:false,
            underline:false,
            height:60,
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`10) DISPUTES :  `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
            underline:true,
        }).font('Helvetica')
        .text(`Any dispute between yourself and the Principal Employer concerned with or relating to, or rising out of this Appointment Letter, shall be subjected to the jurisdiction of and be determined, by the court of competent jurisdiction in Kolkata only.`,{
            height:60,
            underline:false
        }).font('hindi')
        .text(`विवाद: `,{
            height:60,
            continued:true,
            underline:true
        }).font('hindi')
        .text(`आपके और प्रधान नियोक्ता के बीच इस नियुक्ति पत्र से संबंधित या इससे संबंधित या उत्पन्न होने वाला कोई भी विवाद, केवल सक्षम क्षेत्राधिकार के न्यायालय के अधिकार क्षेत्र के अधीन और निर्धारित किया जाएगा।`,{
            height:60,
            continued:false,
            underline:false
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`11) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You cannot work against the benefit of the Principal Employer’s organization. While working in the organization you cannot engage yourself elsewhere. Breaking of the rule of the organization will be considered as punishable offence.`,{
            height:60
        }).font('hindi')
        .text(` आप प्रधान नियोक्ता के संगठन के लाभ के विरुद्ध काम नहीं कर सकते। संगठन में काम करते समय आप संलग्न नहीं हो सकते अपने आप को कहीं और। संस्था के नियम को तोड़ना दंडनीय अपराध माना जाएगा।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`12) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You shall be responsible for protecting the property of the Principal Employer, entrusted to you in the due discharge, of your duties, and shall indemnify the Principal Employer, when there is a loss of any kind to the concerned property.`,{
            height:60
        }).font('hindi')
        .text(` आप अपने कर्तव्यों के उचित निर्वहन में आपको सौंपी गई प्रधान नियोक्ता की संपत्ति की रक्षा के लिए जिम्मेदार होंगे, और संबंधित संपत्ति को किसी भी प्रकार का नुकसान होने पर प्रधान नियोक्ता को क्षतिपूर्ति करेगा।`,{
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`13) `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You can be shifted to different place/branch of Principal Employer and Designation with prior Notice. We will expect, you will accept the same.`,{
            height:60
        }).font('hindi')
        .text(`आपको पूर्व सूचना के साथ प्रधान नियोक्ता और पदनाम के विभिन्न स्थान / शाखा में स्थानांतरित किया जा सकता है। हम उम्मीद करेंगे, आप स्वीकार करेंगे वही।`,{
            height:60
        });
        
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`As a new entrant, we hope you will contribute positively and whole heartedly to this process of Mutual Trust N Autonomy.`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false,
        }).font('hindi')
        .text(`एक नए प्रवेशकर्ता के रूप में, हम आशा करते हैं कि आप म्यूचुअल ट्रस्ट एन ऑटोनॉमी की इस प्रक्रिया में सकारात्मक और पूरे दिल से योगदान देंगे।`,{
            height:60
        });
        
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Welcome to ${employee.company_master.company_name} FAMILY.`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        pdfDoc.text(`Yours Truly`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        if(employee.company_master.logo){
            if (fs.existsSync(employee.company_master.logo)) {
            pdfDoc.image(employee.company_master.logo, 20,pdfDoc.y, { width: 80, height: 80, align:'left' })
            .rect(20, pdfDoc.y-80, 80, 80)
            .stroke();
            }
        }     
        pdfDoc.text(`For ${employee.company_master.company_name} `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.addPage();   
        pdfDoc.font('Helvetica-Bold').text(`Employee Declaration `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            underline:true
        });
        pdfDoc.font('Helvetica').text(`I have read / been explained all the clauses and with full understanding of the same, I am accepting these terms of employment and joining the concern out of my free will and consent.`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            underline:false
        });
        pdfDoc.moveDown();  
        pdfDoc.font('hindi').text(`कर्मचारी घोषणा `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            underline:true
        });
        pdfDoc.font('hindi').text(`मैंने सभी खंडों को पढ़ लिया है/समझा लिया है और उनकी पूरी समझ के साथ, मैं रोजगार की इन शर्तों को स्वीकार कर रहा हूं और इसमें शामिल हो रहा हूं मेरी स्वतंत्र इच्छा और सहमति से चिंता।`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            underline:false
        });
        if(employee.signature){
            if (fs.existsSync(employee.signature)) {
            pdfDoc.image(employee.signature, 20, pdfDoc.y, { width: 80, height: 80, align:'left' })
            .rect(20, pdfDoc.y-80, 80, 80)
            .stroke();
            }
        }      
        pdfDoc.text(`Signature of Employee/ कर्मचारी का हस्ताक्षर`,20,pdfDoc.y+10,{
            align:'left',
            width:550,
            height:60,   
        });
                if(incrementData!=null){

        if(incrementData.gross_salary!=''){
            pdfDoc.addPage();
             pdfDoc.fontSize(20);
            pdfDoc.font('Helvetica-Bold').text('LETTER OF INCREMENT',20,20,{
                align:'center',
                underline:true,
                width:610,
                height:20
            });
            pdfDoc.moveDown();
                pdfDoc.fontSize(18);

            pdfDoc.font('Helvetica').text('Employee Name : '+employee.emp_name,30,80,{
                align:'left',
                width:500,
                height:60,
            })
            pdfDoc.moveDown();
            const dateOfIncrement = changeDate(incrementData.date_of_increment);
            pdfDoc.text('Date Of Increment : '+dateOfIncrement,pdfDoc.x,pdfDoc.y+20,{
                align:'left',
                width:500,
                height:60,
            })
            pdfDoc.moveDown();
            pdfDoc.moveDown();
            const xValue = pdfDoc.x;
            pdfDoc.text(`I am pleased to inform you that your salary has been increased to`,{
            align:'left',
            width:550,
            height:60,   
        }).font('Helvetica-Bold')
        .text(`Rs. ${incrementData.gross_salary}. `,{   
            continued: true,
            lineBreak:false
        }).font('Helvetica').text(` Congratulations on this well-deserved increment! `,{ 
        });
        
        pdfDoc.font('Helvetica').text(` Thank you for your valuable contributions to our organization, and we look forward to your continued success.`,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
        
            pdfDoc.moveDown();
            pdfDoc.moveDown();
        
         pdfDoc.font('bengali').text(`আমি আপনাকে জানাতে পেরে  আনন্দিত যে আপনার বেতন `,{
            align:'left',
            width:550,
            height:60,   
              continued: true,
            lineBreak:false
        }).font('Helvetica-Bold')
        .text(`Rs. ${incrementData.gross_salary}. `,{   
            continued: true,
            lineBreak:false
        }).font('bengali').text(`টাকায় `,{ 
        });
        
        pdfDoc.font('bengali').text(` বৃদ্ধি করা হয়েছে |   এই ভালো প্রাপ্ত বৃদ্ধির জন্য অভিনন্দন|`,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
            
        pdfDoc.font('bengali').text(` আমাদের  প্রতিষ্ঠানে আপনার মূল্যবান অবদানের জন্য আপনাকে ধন্যবাদ, আমরন`,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
            
        pdfDoc.font('bengali').text(`আপনার অব্যাহত সাফল্যের জন্যে উন্মুখ | `,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
        }
                }
    }else if(employee.type=='joining'){
        pdfDoc.addPage();
        pdfDoc.fontSize(15);

        pdfDoc.font('Helvetica').text('To ',20,20,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.font('Helvetica').text('The Management, ',20,pdfDoc.y+20,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();

        pdfDoc.text('Date: '+date_of_joining,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();
        
        pdfDoc.text('Name: '+employee.emp_name,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();
        pdfDoc.text('SON / DAUGHTER / WIFE of '+employee.father_name,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();
        pdfDoc.text('Address: '+employee.address,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`I have joined Your company without submitting any document as they are in my Home Town. My friends and family members are not so literate to send them, via Phone Or Others.        `,{
            align:'left',
            width:550,
            height:60,   
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`I will submit them soon, else, for any consequence, I will be ready to suffer and will not blame you. You can also Terminate me, from the Job, if You face any Statutory Issue. I beg you to give me a chance to work for a Temporary Period, as Earning Is very necessary for my family.
        `,{
            align:'left',
            width:550,
            height:80,
        });
        pdfDoc.moveDown();
        
        pdfDoc.font('bengali').text(`আমি আপনার কোম্পানিতে কোনো দলিল জমা দেয়ার বিনামূল্যে যোগদান করেছি কারণ এগুলি আমার বাড়িতে রয়েছে। আমার বন্ধুবান্ধব এবং পরিবারের সদস্যরা তাদের পাঠানোর জন্য এতটাই শিখা পায় না, ফোন বা অন্যান্য মাধ্যমে। আমি তা শীঘ্রই জমা দেব, অন্যথায় যেকোনো পরিণামের জন্য আমি ত্যাগ করার জন্য প্রস্তুত হব, আপনাকে দোষ দেব না। যদি আপনি কোনো আইনতান্ত্রিক সমস্যার সামনে প্রতিষ্ঠিত হন, তবে আপনি আমাকে চাকিটি বাতিল করতে পারেন। আমি আপনার কাছে একটি অস্থায়ী সময়ের জন্য কাজ করার সুযোগ দিতে অনুরোধ করছি, কারণ আমার পরিবারের জন্য আয় প্রয়োজন।
        `,{
            align:'left',
            width:550,
            height:160,
        });
        pdfDoc.moveDown();
        pdfDoc.font('hindi').text(`मैंने आपकी कंपनी में कोई दस्तावेज जमा किए बिना ही जोइन कर लिया है क्योंकि वे मेरे होम टाउन में हैं। मेरे दोस्त और परिवार के सदस्य इतने लेखक नहीं हैं कि वे उन्हें भेज सकें, फोन या अन्य किसी तरीके से।
        मैं उन्हें जल्द ही जमा कर दूंगा, अन्यथा, किसी भी परिणाम के लिए मैं तैयार हूँ सहने के लिए और आपको दोष नहीं दूंगा। यदि आपको कोई कानूनी समस्या का सामना करना पड़े, तो आप मुझे नौकरी से निकाल सकते हैं। मैं आपसे अनुरोध करता हूँ कि आप मुझे एक अस्थायी अवधि के लिए काम करने का मौका दें, क्योंकि मेरे परिवार के लिए कमाई बहुत जरुरी है।
        `,{
            align:'left',
            width:550,
            height:160,
        });
        pdfDoc.moveDown(); 
        pdfDoc.text(`Thanking You.`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        
        pdfDoc.text(`_________________________________________________`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        // if(employee.company_master.logo){
        //     if (fs.existsSync(employee.company_master.logo)) {
        //     pdfDoc.image(employee.company_master.logo, 20,pdfDoc.y, { width: 80, height: 80, align:'left' })
        //     .rect(20, pdfDoc.y-80, 80, 80)
        //     .stroke();
        //     }
        // }     
        // pdfDoc.text(`For ${employee.company_master.company_name} `,20,pdfDoc.y,{
        //     align:'left',
        //     width:550,
        //     height:20,   
        // });
        // pdfDoc.addPage(); 
        // if(employee.signature){
        //     if (fs.existsSync(employee.signature)) {
        //     pdfDoc.image(employee.signature, 20, pdfDoc.y, { width: 80, height: 80, align:'left' })
        //     .rect(20, pdfDoc.y-80, 80, 80)
        //     .stroke();
        //     }
        // }      
        // pdfDoc.text(`Signature of Employee/ कर्मचारी का हस्ताक्षर`,20,pdfDoc.y+10,{
        //     align:'left',
        //     width:550,
        //     height:60,   
        // });
            
    }else if(employee.type=='trainee'){
        pdfDoc.addPage();
        pdfDoc.fontSize(15);

        pdfDoc.font('Helvetica').text('Date: '+date_of_joining,20,20,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();
        
        pdfDoc.text('Name: '+employee.emp_name,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();
        pdfDoc.text('Principal Employer: '+employee.client_master.client_name,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();
        pdfDoc.text('Trainee Category: '+employee.designation,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();
        pdfDoc.text('SUB: APPOINTMENT LETTER (AS A TRAINEE)',20,pdfDoc.y,{
            align:'center',
            width:550,
            height:20,   
            underline:true
            
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Dear `+employee.emp_title+' '+employee.emp_name+',',{
            align:'left',
            width:550,
            height:60,   
            underline:false
        });
        pdfDoc.moveDown();
        pdfDoc.fontSize(13);

        pdfDoc.font('Helvetica').text(`You have been appointed as a Trainee in our Clients Place who is the Principal Employer. `,{
            align:'left',
            width:550,
            height:80,
        });
        pdfDoc.moveDown();
        
        pdfDoc.font('Helvetica').text(`You will be in the Probation Period for maximum up to 3 months. In the Probation Period you will be given a stipend of Rs. `+employee.gross_salary,{
            align:'left',
            width:550,
            height:80,
        });
        pdfDoc.moveDown();
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Based on your knowledge, performance and capability, you will be appointed on a fixed term basis and your final salary will be decided then and there. The minimum salary will be allocated as per the Government minimum wages. `,{
            align:'left',
            width:550,
            height:80,
        });
        pdfDoc.moveDown();
        pdfDoc.moveDown();
        
        pdfDoc.font('Helvetica').text(`When you are appointed, you will be under monthly salary basis following all the Norms and Law of the Land. `,{
            align:'left',
            width:550,
            height:80,
        });
        pdfDoc.moveDown();
        
        pdfDoc.font('Helvetica').text(`o You will be under the statutory scheme like PF, ESIC. `,{
            align:'left',
            width:500,
            height:80,
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`o Your Basic Salary will be 50% of your Gross Salary on which 12% will be deducted as PF and 0.75% of your Gross Salary will be deducted as ESIC. `,{
            align:'left',
            width:500,
            height:80,
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`o Your Leave Salary, Bonus and Incentives will be taken care of as per the rules of the Government. `,{
            align:'left',
            width:500,
            height:80,
        });
        pdfDoc.moveDown();
        
        pdfDoc.font('Helvetica-Bold').text(`This Appointment Letter is only valid for the Probation Period and your Final Appointment Letter will be given after the appointment procedure. `,{
            align:'left',
            width:550,
            height:80,
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Best Regards`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        pdfDoc.text(`Yours Truly`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        pdfDoc.text(`Associate HR`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        pdfDoc.text(employee.client_master.client_name,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        
        // pdfDoc.text(`_________________________________________________(Signature of Employee)`,20,pdfDoc.y,{
        //     align:'left',
        //     width:550,
        //     height:20,   
        // });
        // pdfDoc.moveDown();
         if(employee.signature){
            if (fs.existsSync(employee.signature)) {
            pdfDoc.image(employee.signature, 20, pdfDoc.y, { width: 60, height: 60, align:'left' })
            .rect(20, pdfDoc.y-60, 60, 60)
            .stroke();
            }
        }     
        // if(employee.company_master.logo){
        //     if (fs.existsSync(employee.company_master.logo)) {
        //     pdfDoc.image(employee.company_master.logo, 20,pdfDoc.y, { width: 80, height: 80, align:'left' })
        //     .rect(20, pdfDoc.y-80, 80, 80)
        //     .stroke();
        //     }
        // }     
        // pdfDoc.text(`For ${employee.company_master.company_name} `,20,pdfDoc.y,{
        //     align:'left',
        //     width:550,
        //     height:20,   
        // });
        // pdfDoc.addPage(); 
        // if(employee.signature){
        //     if (fs.existsSync(employee.signature)) {
        //     pdfDoc.image(employee.signature, 20, pdfDoc.y, { width: 80, height: 80, align:'left' })
        //     .rect(20, pdfDoc.y-80, 80, 80)
        //     .stroke();
        //     }
        // }      
        // pdfDoc.text(`Signature of Employee/ कर्मचारी का हस्ताक्षर`,20,pdfDoc.y+10,{
        //     align:'left',
        //     width:550,
        //     height:60,   
        // });
            
    }else{
        pdfDoc.addPage();
        pdfDoc.fontSize(20);
        pdfDoc.text('Appointment Letter',20,20,{
            align:'center',
            width:610,
            height:20
        })
        pdfDoc.moveDown();

        if(employee.company_master.logo){
            if (fs.existsSync(employee.company_master.logo)) {
            pdfDoc.image(employee.company_master.logo, 510, 50, { width: 80, height: 80, align:'right' })
            .rect(510, 50, 80, 80)
            .stroke();
            }   
        }    
        pdfDoc.text(employee.company_master.company_name,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.fontSize(10);    
        pdfDoc.moveDown();
        pdfDoc.text(employee.company_master.address,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.text(employee.company_master.email,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.text(employee.company_master.phone,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.moveDown();
        pdfDoc.text('Date of joining: '+date_of_joining,{
            align:'left',
            width:550,
            height:20,
        })
        pdfDoc.moveDown();
        pdfDoc.text('Principal Employer’s Name and Address',{
            align:'right',
            width:550,
            height:20,
        })
        pdfDoc.text(employee.client_master.client_name,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:20,
        })
        pdfDoc.text(clientData.client_addresses[0].address,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.moveDown();
        
        pdfDoc.font('Helvetica-Bold').text('Basic - '+employee.basic_salary,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('HRA - '+employee.hra,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('Gross - '+employee.gross_salary,385,pdfDoc.y,{
            align:'left',
            width:200,
            height:60,
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text('Dear '+employee.emp_title + ' ' +employee.emp_name,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text('Subject: Letter Of Appointment',{
            align:'center',
            width:550,
            height:20,   
            underline:true            
        })
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Following an interview, you had with our client`,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            lineBreak:false
        }).font('Helvetica-Bold')
        .text(`(Your Principal Employer),`,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica').text(` we have pleasure in offering you a job for the post of `,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica-Bold').text(`${employee.designation} in ${employee.client_master.client_name}`,{            
            continued:true,
            lineBreak:false
        }).font('Helvetica').text(` our client’s place on the following terms and conditions:`);
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`1) COMPENSATION: -`,{
            align:'left',
            width:550,
            height:60,   
            underline:true,
        });
        pdfDoc.font('Helvetica')
        .text(`a) Your monthly salary/ wages will be Rs. ${employee.gross_salary} per month. The allocation of Gross Salary will be decided by the Principal Employer, the reflection of which you can easily view in your Pay Slips.`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:60,   
        });
        pdfDoc
        .text(`b) Your monthly salary/ wages of every current month will be disbursed by 7th of the next month. `,{            
            align:'left',
            width:500,
            height:60,   
        });
        pdfDoc
        .text(`c) You will also be entitled for Bonus, minimum 7 days before the main festival, as decided by the Principal Employer and that will be as per Bonus Act 1965. Bonus will be paid on your working days calculated as per Financial Year.`,{            
            align:'left',
            width:500,
            height:60,   
        }); pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`2) WORKING HOURS: -`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            underline:true,
        });
        pdfDoc.font('Helvetica')
        .text(`a) Your work timings will be as per Principal Employer’s policy but it will not exceed 8 hours a day or 48 hours weekly.`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:60,   
        });
        pdfDoc
        .text(`b) If you work more than 8 hours a day, then you will be entitled for overtime which will be paid twice the normal pay as per Factories Act 1948 or Minimum Wages Act / or as per factory policy, whichever is higher.        `,{            
            align:'left',
            width:500,
            height:60,   
        });
        pdfDoc
        .text(`c)Every week, any 6 days will be working days and one day will be holiday/weekly off day. If due to any urgency the weekly off day becomes a working day, then holiday/weekly off day will be given within next 5 (five) working days.`,{            
            align:'left',
            width:500,
            height:40,   
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`3) LEAVES AND HOLIDAYS: -`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            underline:true,
        });
        pdfDoc.font('Helvetica')
        .text(`a) As per Section 79, Factories Act 1948, you will be eligible for 1 Day Earned Leave for every 20 days worked. (Subjected to a maximum of 12-14 days per year). Whether The Leave Will Be adjusted Or Encashed will be as per mutual consent of your good self and Principal Employer.`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:20,   
        });
        pdfDoc
        .text(`b) As per the rule of the organization, you will be eligible for and enjoy all holidays as per the holiday list. (Holiday list will be announced by the Principal Employer by second week of January every year).`,{            
            align:'left',
            width:500,
            height:40,   
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`4) PLACE OF WORK: `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            underline:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`Irrespective of your initial appointment of place of work, depending on the requirement of the Principal Employer, you can be shifted to different branch, designation, place/ branch with prior notice. We will expect, you will accept the same.`,{
            underline:false,
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`5) STATUTORY CONTRIBUTIONS: -`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            underline:true,
        });
        pdfDoc.font('Helvetica')
        .text(`a) You will also get PF and ESIC facilities if your earnings and its allocation fall under the ambit as set down by the EPF and MP Act 1952 and ESIC Act 1948.`,40,pdfDoc.y,{            
            align:'left',
            width:500,
            underline:false,
            height:20,   
        });
        pdfDoc
        .text(`b) As per State Act, Ptax will also be deducted (if under ambit) every month and LWF will be deducted half-yearly.`,{            
            align:'left',
            width:500,
            height:40,   
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`6) GRATUITY: `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            underline:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`On successful completion of continuous 5 years in our organization, under this Appointment only, you will be also entitled for Gratuity as per Payment of Gratuity Act 1972.`,{
            underline:false,
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`7) TERMINATION OF CONTRACT: `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            underline:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`Either of the party will be entitled to terminate the employment, by giving 30 days’ notice or 30 day’s Salary in lieu thereof. However, if it is on disciplinary grounds which hampers the Principal Employer’s activities, no notice will be served.`,{
            underline:false,
            continued:false
        });
        pdfDoc.addPage();
        pdfDoc.font('Helvetica-Bold').text(`8) DISPUTES `,20,40,{
            align:'left',
            width:550,
            height:60,   
            continued:true,
            underline:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`Any disputes between yourself and the Principal Employer concerned with or relating to, or rising out of this Appointment Letter, shall be subjected to the jurisdiction of and be determined, by the court of competent jurisdiction in Kolkata only.`,{
            underline:false,
            height:60
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica-Bold').text(`9) DISCIPLINARY CLAUSES`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            underline:true,
            continued:true,
            lineBreak:false,
        }).font('Helvetica')
        .text(`You cannot work against the benefit of the Principal Employer’s organization. While working in the organization you cannot engage yourself elsewhere. Breaking of the rule of the organization will be considered as a punishable offence. You shall be responsible for protecting the property.`,{
            underline:false,
            height:80
        });
        pdfDoc.moveDown();
        // pdfDoc.font('Helvetica-Bold').text(`10) OTHER TERMS -`,20,pdfDoc.y,{
        //     align:'left',
        //     width:550,
        //     height:60,   
        //     underline:true,
        // });
        // pdfDoc.font('Helvetica')
        // .text(`a) You will complete all the jobs on time dedicated to you by the Principal Employer.`,40,pdfDoc.y,{            
        //     align:'left',
        //     width:500,
        //     underline:false,
        //     height:20,   
        // });
        // pdfDoc
        // .text(`b) You need to submit written information to our organization if ever your address / Telephone Number/ Nominee gets changed or else it will be considered as your insincerity and you yourself will be responsible for not getting any letters or important documents by post.`,{            
        //     align:'left',
        //     width:500,
        //     height:40,   
        // });
        // pdfDoc
        // .text(`c) You have to maintain a friendly work environment and have to behave properly/ politely with all other fellow workers and respectful towards Seniors.`,{            
        //     align:'left',
        //     width:500,
        //     height:40,   
        // });
        // pdfDoc.moveDown();
        
        // pdfDoc.font('Helvetica-Bold').text(`12) Only`,20,pdfDoc.y,{
        //     align:'left',
        //     width:550,
        //     height:60,   
        //     continued:true,
        //     underline:true,
        //     lineBreak:false,
        // }).font('Helvetica')
        // .text(` If you agree to all the above rules and regulations, then may sign this appointment letter.`,{
        //     height:60
        // });
        // pdfDoc.moveDown();
    
        // pdfDoc.font('Helvetica-Bold').text(`We are consciously endeavoring to build an atmosphere of mutual trust, reliability. Response and Autonomy are open to discussions and suggestions from all members of our Corporate Family.`,20,pdfDoc.y,{
        //     align:'left',
        //     width:550,
        //     height:60,   
        //     underline:false
        // });
        // pdfDoc.moveDown();
        // pdfDoc.font('Helvetica-Bold').text(`As a new entrant, we hope you will contribute positively and whole heartedly to this process.        `,20,pdfDoc.y,{
        //     align:'left',
        //     width:550,
        //     height:60,   
        // });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Welcome to ${employee.company_master.company_name} FAMILY.`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        pdfDoc.font('Helvetica').text(`Allotted Employee Code ${employee.emp_code}`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        pdfDoc.text(`Yours Truly`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();
        pdfDoc.text(`For ${employee.company_master.company_name} `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
        });
        pdfDoc.moveDown();        
        if(employee.company_master.stamp){
            if (fs.existsSync(employee.company_master.stamp)) {
            pdfDoc.image(employee.company_master.stamp, 20,pdfDoc.y, { width: 80, height: 80, align:'left' })
            .rect(20, pdfDoc.y-80, 80, 80)
            .stroke();
        }     
    }
            
        if(employee.company_master.signature){
            if (fs.existsSync(employee.company_master.signature)) {
            pdfDoc.image(employee.company_master.signature, 120, pdfDoc.y-80, { width: 80, height: 80, align:'left' })
            .rect(120, pdfDoc.y-80, 80, 80)
            .stroke();
        } 
    }
        pdfDoc.moveDown();        
        pdfDoc.font('Helvetica-Bold').text(`Employee Declaration `,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:20,   
            underline:true
        });
        pdfDoc.font('Helvetica').text(`I have read / been explained all the clauses and with full understanding of the same, I am accepting these terms of employment and joining the concern out of my free will and consent.`,20,pdfDoc.y,{
            align:'left',
            width:550,
            height:60,   
            underline:false
        });
        pdfDoc.moveDown();  
        if(employee.signature){
            if (fs.existsSync(employee.signature)) {
            pdfDoc.image(employee.signature, 20, pdfDoc.y, { width: 80, height: 80, align:'left' })
            .rect(20, pdfDoc.y-80, 80, 80)
            .stroke();
            }
        }      
        pdfDoc.text(`Signature of Employee`,20,pdfDoc.y+10,{
            align:'left',
            width:550,
            height:60,   
        });
        
                if(incrementData!=null){

        if(incrementData.gross_salary!=''){
            pdfDoc.addPage();
             pdfDoc.fontSize(20);
            pdfDoc.font('Helvetica-Bold').text('LETTER OF INCREMENT',20,20,{
                align:'center',
                underline:true,
                width:610,
                height:20
            });
            pdfDoc.moveDown();
                pdfDoc.fontSize(18);

            pdfDoc.font('Helvetica').text('Employee Name : '+employee.emp_name,30,80,{
                align:'left',
                width:500,
                height:60,
            })
            pdfDoc.moveDown();
            const dateOfIncrement = changeDate(incrementData.date_of_increment);
            pdfDoc.text('Date Of Increment : '+dateOfIncrement,pdfDoc.x,pdfDoc.y+20,{
                align:'left',
                width:500,
                height:60,
            })
            pdfDoc.moveDown();
            pdfDoc.moveDown();
            const xValue = pdfDoc.x;
            pdfDoc.text(`I am pleased to inform you that your salary has been increased to`,{
            align:'left',
            width:550,
            height:60,   
        }).font('Helvetica-Bold')
        .text(`Rs. ${incrementData.gross_salary}. `,{   
            continued: true,
            lineBreak:false
        }).font('Helvetica').text(` Congratulations on this well-deserved increment! `,{ 
        });
        
        pdfDoc.font('Helvetica').text(` Thank you for your valuable contributions to our organization, and we look forward to your continued success.`,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
        
            pdfDoc.moveDown();
            pdfDoc.moveDown();
        
         pdfDoc.font('bengali').text(`আমি আপনাকে জানাতে পেরে  আনন্দিত যে আপনার বেতন `,{
            align:'left',
            width:550,
            height:60,   
              continued: true,
            lineBreak:false
        }).font('Helvetica-Bold')
        .text(`Rs. ${incrementData.gross_salary}. `,{   
            continued: true,
            lineBreak:false
        }).font('bengali').text(`টাকায় `,{ 
        });
        
        pdfDoc.font('bengali').text(` বৃদ্ধি করা হয়েছে |   এই ভালো প্রাপ্ত বৃদ্ধির জন্য অভিনন্দন|`,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
            
        pdfDoc.font('bengali').text(` আমাদের  প্রতিষ্ঠানে আপনার মূল্যবান অবদানের জন্য আপনাকে ধন্যবাদ, আমরন`,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
            
        pdfDoc.font('bengali').text(`আপনার অব্যাহত সাফল্যের জন্যে উন্মুখ | `,xValue,pdfDoc.y,{  
              align:'left',
            width:550,
            height:60,  
        })
        }
                }
    }

    //form 11
//     if(form11){
//     pdfDoc.addPage();
//     pdfDoc.fontSize(20);
//     pdfDoc.font('Helvetica').text('Form No. 11 (New)',10,20,{
//         align:'right',
//         width:550,
//         height:20
//     })
//     pdfDoc.fontSize(10);    
//     pdfDoc.font('Helvetica').text('Declaration Form',{
//         align:'right',
//         width:550,
//         height:20
//     })
//     pdfDoc.image('output/pf.png', {
//         fit: [50, 50],
//         align: 'left',
//         valign: 'left',
//         lineBreak:false
//     });
//     pdfDoc.fontSize(8);    
//     pdfDoc.font('Helvetica').text('(To be retained by the Employer for future reference)',{
//         align:'right',
//         width:550,
//         height:20
//     })
//     pdfDoc.fontSize(20);
//     pdfDoc.font('Helvetica').text(`Employee' Provident Fund Organisation`,{
//         align:'center',
//         width:610,
//         height:20
//     })
//     pdfDoc.fontSize(8);    
//     pdfDoc.font('Helvetica').text('THE EMPLOYEES PROVIDENT FUNDS SCHEME, 1952 (PARAGRAPH-34 & 57) & THE EMPLOYEES PENSION SCHEME, 1995 (PARAGRAPH-24)',{
//         align:'center',
//         width:610,
//         height:60
//     })
//     pdfDoc.font('Helvetica').text('DECLARATION BY A PERSON TAKING UP EMPLOYMENT IN AN ESTABLISHMENT ON WHICH EMPLOYEES PROVIDENT FUND SCHEME, 1952 AND/OR EMPLOYEES PENSION SCHEME, 1995 IS APPLICABLE',{
//         align:'center',
//         width:610,
//         underline:true,
//         height:60
//     })
//     pdfDoc.fontSize(10);   
//     pdfDoc.moveDown();

//     pdfDoc.text('Name : '+employee.emp_title+ ' ' +employee.emp_name,20,pdfDoc.y,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Date Of Birth : '+dob,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Father's / Husband's Name : `+employee.father_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Relationship with respect to above : `+form11.relationship,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Gender : `+employee.gender,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Mobile : `+employee.mobile,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Email : `+employee.email,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`WHETHER EARLIER A MEMBER OF THE EMPLOYEES PROVIDENT FUND SCHEME, 1952 ? : `+form11.whether_pf,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`WHETHER EARLIER A MEMBER OF THE EMPLOYEES PENSION SCHEME, 1995? : `+form11.whether_pension,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     if(form11.uan || form11.pf_member_id){
//         pdfDoc.fontSize(20);
//         pdfDoc.text('A. PREVIOUS EMPLOYMENT DETAILS',{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.fontSize(10);   
//         if(form11.uan){     
//             pdfDoc.text('UAN : ' +form11.uan,{
//                 align:'left',
//                 width:610,
//                 height:20
//             });
//             pdfDoc.moveDown();
//         }
//         if(form11.pf_member_id){
//             pdfDoc.text('PREVIOUS PF MEMBER ID : ' +form11.pf_member_id,{
//                 align:'left',
//                 width:610,
//                 height:20
//             });
//             pdfDoc.moveDown();

//         }
//     var date_of_exit2 = changeDate(form11.date_of_exit);

//         pdfDoc.text('DATE OF EXIT FOR PREVIOUS MEMBER ID (DD/MM/YYYY) : ' +date_of_exit2,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         if(form11.scheme_certificate_number){
//             pdfDoc.text('SCHEME CERTIFICATE NUMBER : ' +form11.scheme_certificate_number,{
//                 align:'left',
//                 width:610,
//                 height:20
//             });
//             pdfDoc.moveDown();
//         }
//         if(form11.ppo_number){
//             pdfDoc.text('PPO NUMBER : ' +form11.ppo_number,{
//                 align:'left',
//                 width:610,
//                 height:20
//             });
//             pdfDoc.moveDown();
//         }
//     }
//     pdfDoc.fontSize(20);
//     pdfDoc.text('B. OTHER DETAILS',{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);
//     pdfDoc.text('INTERNATIONAL WORKER: ' +form11.is_international_worker,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     if(form11.is_international_worker=="Yes"){
//         pdfDoc.text('COUNTRY OF ORIGIN: ' +form11.country_of_origin,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text('PASSPORT NUMBER: ' +form11.passport_number,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         var passport_valid_from = changeDate(form11.passport_valid_from);
//         var passport_date_till = changeDate(form11.passport_date_till);

//         pdfDoc.text('PASSPORT VALID FROM : ' +passport_valid_from + ' TO ' + passport_date_till,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//     }
//     pdfDoc.text('EDUCATIONAL QUALIFICATION : ' +form11.educational_qualification,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('SPECIALLY ABLED : ' +form11.is_specially_abled,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     if(form11.is_specially_abled=="Yes"){        
//         pdfDoc.text('SPECIALLY ABLED CATEGORY: ' +form11.specially_abled_category,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//     }
//     pdfDoc.text('KYC DETAILS: ',{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     for(var j=0;j<form11kyc.length;j++){
//         pdfDoc.text('KYC TYPE: ' +form11kyc[j].kyc_type ,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text('NAME ON KYC DOCUMENT: ' +form11kyc[j].kyc_name ,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text('KYC DOCUMENT NO: ' +form11kyc[j].kyc_number ,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//         pdfDoc.text('Remarks: ' +form11kyc[j].remarks ,{
//             align:'left',
//             width:610,
//             height:20
//         });
//         pdfDoc.moveDown();
//     } 
//     pdfDoc.addPage();
//     pdfDoc.fontSize(20);
//     pdfDoc.text('C UNDERTAKING',20,40,{
//         align:'center',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);

//     pdfDoc.text('A. I CERTIFY THAT ALL THE INFORMATION GIVEN ABOVE IS TRUE TO THE BEST OF MY KNOWLEDGE AND BELIEF' ,{
//         align:'left',
//         width:550,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('B. IN CASE, EARLIER A MEMBER OF EPF SCHEME, 1952 AND/OR EPS, 1995,' ,{
//         align:'left',
//         width:550,
//         height:20
//     });
//     pdfDoc.moveDown();
    
//     pdfDoc.text('(I) I HAVE ENSURED THE CORRECTNESS OF MY UAN/ PREVIOUS PF MEMBER ID' ,{
//         align:'left',
//         width:550,
//         height:20
//     });
//     pdfDoc.moveDown();
    
//     pdfDoc.text('(II) THIS MAY ALSO BE TREATED AS MY REQUEST FOR TRANSFER OF FUNDS AND SERVICE DETAILS IF APPLICABLE FROM THE PREVIOUS ACCOUNT AS DECLARED ABOVE TO THE PRESENT P.F. ACCOUNT. (THE TRANSFER WOULD BE POSSIBLE ONLY IF THE IDENTIFIED KYC DETAILS APPROVED BY PREVIOUS EMPLOYER HAS BEEN VERIFIED BY PRESENT EMPLOYER USING HIS DIGITAL SIGNATURE CERTIFICATE).' ,{
//         align:'left',
//         width:550,
//         height:40
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('(III) I AM AWARE THAT I CAN SUBMIT MY NOMINATION FORM THROUGH UAN BASED MEMBER PORTAL.    ' ,{
//         align:'left',
//         width:550,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('Place : ' +form11.place ,{
//         align:'left',
//         width:550,
//         height:20
//     });
//     pdfDoc.moveDown();
//     var dd = changeDate(form11.date);
//     pdfDoc.text('Date : ' +dd ,{
//         align:'left',
//         width:310,
//         height:20,
//         lineBreak:false
//     });
//     if(employee.signature){
//         if (fs.existsSync(employee.signature)) {
//     pdfDoc.image(employee.signature ,450,pdfDoc.y,{        
//         fit:[80,80],
//         height:80,
//         lineBreak:false
//     }).text('Signature of Member',460,pdfDoc.y,{
//         width:100,
//         height:10
//     });
// }   
// }
//     pdfDoc.moveDown();
  
//     pdfDoc.fontSize(20);
//     pdfDoc.text('DECLARATION BY PRESENT EMPLOYER',20,pdfDoc.y,{
//         align:'center',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);
//     pdfDoc.text('A. THE MEMBER '+employee.emp_title + ' ' + employee.emp_name +' HAS JOINED ON '+ date_of_joining +' AND HAS BEEN ALLOTTED PF MEMBER ID :' + form11.pf_no,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     if(form11.is_kyc_details_uploaded){
//     pdfDoc.text('B. IN CASE THE PERSON WAS EARLIER NOT A MEMBER OF EPF SCHEME, 1952 AND EPS, 1995:',{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
  
//     let is_kyc_details_uploaded = '';
//     if(form11.is_kyc_details_uploaded=='1'){
//         is_kyc_details_uploaded = 'HAVE NOT BEEN UPLOADED';
//     }else if(form11.is_kyc_details_uploaded=='2'){
//         is_kyc_details_uploaded = 'HAVE BEEN UPLOADED BUT NOT APPROVED';
//     }else if(form11.is_kyc_details_uploaded=='3'){
//         is_kyc_details_uploaded = 'HAVE BEEN UPLOADED AND APPROVED WITH DSC';
//     }
//     pdfDoc.text('THE KYC DETAILS OF THE ABOVE MEMBER IN THE UAN DATABASE : '+is_kyc_details_uploaded,{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
// }
// if(form11.is_kyc_details_approved){
//     pdfDoc.text('C. IN CASE THE PERSON WAS EARLIER A MEMBER OF EPF SCHEME, 1952 AND EPS, 1995:',{
//         align:'left',
//         width:610,
//         height:20
//     });
//     pdfDoc.moveDown();
//     pdfDoc.text('THE ABOVE MEMBER ID OF THE MEMBER AS MENTIONED IN (A) ABOVE HAS BEEN TAGGED WITH HIS/HER UAN/PREVIOUS MEMBER ID AS DECLARED BY MEMBER.',{
//         align:'left',
//         width:550,
//         height:50,
//         lineBreak:false
//     });
//     pdfDoc.moveDown();
//     let is_kyc_details_approved = '';
//     if(form11.is_kyc_details_approved=='1'){
//         is_kyc_details_approved = 'THE KYC DETAILS OF THE ABOVE MEMBER IN THE UAN DATABASE HAVE BEEN APPROVED WITH DIGITAL SIGNATURE CERTIFICATE AND TRANSFER REQUEST HAS BEEN GENERATED ON PORTAL.';
//     }else if(form11.is_kyc_details_approved=='2'){
//         is_kyc_details_approved = 'AS THE DSC OF ESTABLISHMENT ARE NOT REGISTERED WITH EPFO, THE MEMBER HAS BEEN INFORMED TO FILE PHYSICAL CLAIM (FORM-13) FOR TRANSFER OF FUNDS FROM HIS PREVIOUS ESTABLISHMENT.';
//     }
//     pdfDoc.text('THE KYC DETAILS OF THE ABOVE MEMBER IN THE UAN DATABASE : '+is_kyc_details_approved,{
//         align:'left',
//         width:550,
//         height:60
//     });
//     pdfDoc.moveDown();
// }
// if(employee.company_master.stamp){
//     if (fs.existsSync(employee.company_master.stamp)) {
//     pdfDoc.image(employee.company_master.stamp, 400,pdfDoc.y, { width: 80, height: 80, align:'right' })
//     .rect(400, pdfDoc.y-80, 80, 80)
//     .stroke();
// }     
// }
    
// if(employee.company_master.signature){
//     if (fs.existsSync(employee.company_master.signature)) {
//     pdfDoc.image(employee.company_master.signature, 500, pdfDoc.y-80, { width: 80, height: 80, align:'right' })
//     .rect(500, pdfDoc.y-80, 80, 80)
//     .stroke();
// } 
// }
// pdfDoc.moveDown();
// pdfDoc.fontSize(7).text('SIGNATURE OF EMPLOYER WITH SEAL OF ESTABLISHMENT',{
//     height:50,
//     align:'right',
//     width:550,
// });   

// pdfDoc.moveDown();

//     }
// //form2
// if(employee.pf && form2){
// pdfDoc.addPage();
// pdfDoc.fontSize(20);
// pdfDoc.font('Helvetica').text('Form No. 2 (New)',10,20,{
//     align:'right',
//     width:550,
//     height:20
// })
// pdfDoc.fontSize(10);    
// pdfDoc.font('Helvetica').text('Declaration Form',{
//     align:'right',
//     width:550,
//     height:20
// })
// pdfDoc.image('output/pf.png', {
//     fit: [50, 50],
//     align: 'left',
//     valign: 'left',
//     lineBreak:false
// });
// pdfDoc.fontSize(8);    
// pdfDoc.font('Helvetica').text('(To be retained by the Employer for future reference)',{
//     align:'right',
//     width:550,
//     height:20
// })
// pdfDoc.fontSize(20);
// pdfDoc.font('Helvetica').text(`Employee' Provident Fund Organisation`,{
//     align:'center',
//     width:610,
//     height:20
// })
// pdfDoc.fontSize(8);    
// pdfDoc.font('Helvetica').text('THE EMPLOYEES PROVIDENT FUNDS SCHEME, 1952 (PARAGRAPH-34 & 57) & THE EMPLOYEES PENSION SCHEME, 1995 (PARAGRAPH-24)',{
//     align:'center',
//     width:610,
//     height:60
// })
// pdfDoc.font('Helvetica').text('DECLARATION BY A PERSON TAKING UP EMPLOYMENT IN AN ESTABLISHMENT ON WHICH EMPLOYEES PROVIDENT FUND SCHEME, 1952 AND/OR EMPLOYEES PENSION SCHEME, 1995 IS APPLICABLE',{
//     align:'center',
//     width:610,
//     underline:true,
//     height:60
// })
// pdfDoc.fontSize(10);   
// pdfDoc.moveDown();

//     pdfDoc.text('NOMINATION AND DECLARATION FORM FOR UNEXEMPTED/EXEMPTED ESTABLISHMENTS ',20,pdfDoc.y,{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);    
//     pdfDoc.text('Declaration and Nomination Form under the Employees Provident Funds and Employees Pension Schemes ',{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('(Paragraph 33 and 61 (1) of the Employees Provident Fund Scheme 1952 and Paragraph 18 of the Employees Pension Scheme 1995)',{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Name : '+employee.emp_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text(`Father's / Husband's Name : `+employee.father_name,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Date Of Birth : '+dob,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Account No : '+employee.bank_ac,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Sex : '+employee.gender,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Maritial Status : '+employee.maritial_status,{
//         align:'left',
//         width:610,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Address : '+employee.address,{
//         align:'left',
//         width:610,
//         height:40,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(14);
//     pdfDoc.text('PART – A (EPF) ',{
//         align:'center',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('I hereby nominate the person(s)/cancel the nomination made by me previously and nominate the person(s) mentioned below to receive the amount standing to my credit in the Employees Provident Fund, in the event of my death.',{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);
//     if(epf.length>0){
//         for(var i=0;i<epf.length;i++){ 
//             if(i==2){
//                 pdfDoc.addPage();
//             }           
//             pdfDoc.text('Name Of the Nominee '+(i+1) +': ' + epf[i].name,20,pdfDoc.y,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();            
//             pdfDoc.text('Address '+(i+1) +': ' + epf[i].address,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();            
//             pdfDoc.text(`Nominee's relationship with the member ${(i+1)} : ${epf[i].relationship}`,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();          
//              var dd2 = changeDate(epf[i].dob);
//             pdfDoc.text('Date Of Birth '+(i+1) +': ' + dd2,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();       
//             pdfDoc.text('Total amount or share of accumulations in Provident Funds to be paid to each nominee '+(i+1) +': ' + epf[i].total_share,{
//                 align:'left',
//                 width:550,
//                 height:40,
//             })
//             pdfDoc.moveDown();     
//             if(epf[i].is_minor=='1'){       
//                 pdfDoc.text('Name and address of the guardian who may receive the amount during the minority of the nominee '+(i+1) +': ' + epf[i].guardian_name_address,{
//                     align:'left',
//                     width:550,
//                     height:60,
//                 })
//                 pdfDoc.moveDown();   
//             }
//         }
//         pdfDoc.text('1. *Certified that I have no family as defined in para 2 (g) of the Employees Provident Fund Scheme 1952 and should I acquire a family hereafter the above nomination should be deemed as cancelled.',{
//             align:'left',
//             width:550,
//             height:10,
//         })
//         pdfDoc.moveDown(); 
//         pdfDoc.text('2. * Certified that my father/mother is/are dependent upon me.',{
//             align:'left',
//             width:550,
//             height:10,
//         })
//         if(employee.signature){

//         pdfDoc.fontSize(7).image(employee.signature ,450,pdfDoc.y,{        
//             fit:[80,80],
//             height:80,
//             lineBreak:false
//         }).text('Signature/or thumb impression of the subscriber',450,pdfDoc.y,{
//             width:150,
//             height:20
//         });   
//     }
//     }
//     pdfDoc.addPage();    
//     pdfDoc.fontSize(14);
//     pdfDoc.text('PART – B (EPS) ',20,pdfDoc.y,{
//         align:'center',
//         width:550,
//         height:20,
//     })
//     pdfDoc.text('I hereby furnish below particulars of the members of my family who would be eligible to receive Widow/Children Pension in the event of my premature death in service.',{
//         align:'center',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10);
//     if(eps.length>0){
//         for(var i=0;i<eps.length;i++){                     
//             pdfDoc.text('Sr No '+(i+1) +': ' + eps[i].sr_no,20,pdfDoc.y,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();            
//             pdfDoc.text('Name & Address of the family member '+(i+1) +': ' + eps[i].name_address,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();            
//             pdfDoc.text(`Age ${(i+1)} : ${eps[i].age}`,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();          
//             pdfDoc.text('Relationship with the member '+(i+1) +': ' + eps[i].relationship,{
//                 align:'left',
//                 width:610,
//                 height:40,
//             })
//             pdfDoc.moveDown();       
            
//         }
//     }
//     pdfDoc.addPage();       
    
//     pdfDoc.text('Certified that I have no family as defined in para 2 (vii) of the Employees’s Family Pension Scheme 1995 and should I acquire a family hereafter I shall furnish Particulars there on in the above form.',20,pdfDoc.y,{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('I hereby nominate the following person for receiving the monthly widow pension (admissible under para 16 2 (a) (i) & (ii) in the event of my death without leaving any eligible family member for receiving pension.',{
//         align:'center',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();       
//     pdfDoc.text('Name and Address of the nominee : ' + form2.name_address,{
//         align:'left',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();  
//     var dd3 = changeDate(form2.dob);
//     pdfDoc.text('Date of birth : ' + dd3,{
//         align:'left',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();       
//     pdfDoc.text('Relationship with the member : ' + form2.relationship,{
//         align:'left',
//         width:550,
//         height:40,
//     })
//     pdfDoc.moveDown();   
//     if(employee.signature){

//     pdfDoc.fontSize(7).image(employee.signature ,450,pdfDoc.y,{        
//         fit:[80,80],
//         height:80,
//         lineBreak:false
//     }).text('Signature/or thumb impression of the subscriber',450,pdfDoc.y,{
//         width:150,
//         height:20
//     });  
// }
//     pdfDoc.fontSize(14);
//     pdfDoc.text('CERTIFICATE BY EMPLOYER',20,pdfDoc.y,{
//         align:'center',
//         width:550,
//         height:20,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.text('Certified that the above declaration and nomination has been signed / thumb impressed before me by Shri / Smt./ Miss Test Emp employed in my establishment after he/she has read the entries / the entries have been read over to him/her by me and got confirmed by him/her. ',{
//         align:'left',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
//     pdfDoc.fontSize(10); 
//     pdfDoc.text('Name & address of the Factory /Establishment : ' + form2.factory_name_address,{
//         align:'left',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown(); 
//     var dd4 = changeDate(form2.date,'dd-MM-yyyy');
//     pdfDoc.text('Date : ' + dd4,{
//         align:'left',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown(); 
//     pdfDoc.text('Place : ' + form2.place,{
//         align:'left',
//         width:550,
//         height:60,
//     })
//     pdfDoc.moveDown();
// }
    pdfDoc.end();
});





exports.getIdCard = catchAsyncErrors( async(req, res, next) => {
    
    const employee = await NewRegistration.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster]});
    const pdfDoc = new PDFDocument({
        size: [336,192],
        margins : { 
            top: 10,
           bottom:10,
            left: 10,
          right: 10
        }
    });
    const invoiceName = employee.emp_name + '_id_card' + '.pdf';
    const invoicePath = path.join('uploads', invoiceName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    const logoPath = path.join('output', 'new.png');
    const photoPath = path.join('output', 'aa.jpg');
    const bgPath = path.join('output', 'bb.jpg');
    
    // pdfDoc.image(bgPath, 0, 0, {
    //     align: 'left',
    //     valign: 'top',
    //     height: 180,
    //     width: 150
    // });
    pdfDoc.rect(10,10,316,172).stroke();

    if(employee.photo){
        if (fs.existsSync(employee.photo)) {
    pdfDoc.image(employee.photo, 230, 75, { width: 50, height: 50 })
        .rect(230, 75, 50, 50)
        .stroke();
    }
}
//     if(employee.company_master.logo){    
//         if (fs.existsSync(employee.company_master.logo)) {    
//     pdfDoc.image(employee.company_master.logo, 20, 20, {
//         width:25,
//         height:25,
//         align: 'left',
//         valign: 'top'
//     });
// }
//     }
    pdfDoc.fontSize(15).text(employee.client_master.client_name, 10, 25, {
        align: 'center',
        width: 320
    });
    
    pdfDoc.fontSize(10).text('Client Code - '+employee.client_code, 10, 45, {
        align: 'right',
        width: 300
    });

    pdfDoc.moveDown();

    pdfDoc.fontSize(10).text('Emp Id - '+employee.emp_code, 10, 60, {
        align: 'right',
        width: 300
    });

    pdfDoc.fontSize(10).text('Employee - '+employee.emp_name, 20, 80, {
        align: 'left',
        width: 180,
    });
    // pdfDoc.moveDown();
    pdfDoc.fontSize(10).text('Aadhar     - '+employee.aadhar, pdfDoc.x, pdfDoc.y+5,{
        align: 'left',
        width: 150,
    });
    // pdfDoc.moveDown();

    pdfDoc.fontSize(10).text('Designation    - '+employee.designation,pdfDoc.x, pdfDoc.y+5, {
        align: 'left',
        width: 200,
    });
    // pdfDoc.moveDown();
    pdfDoc.fontSize(10).text('Address   - '+employee.address,pdfDoc.x, pdfDoc.y+5, {
        align: 'left',
        lineBreak: false,
        width: 260,
    });
    // pdfDoc.moveDown();
    // pdfDoc.fontSize(10).text('PF - ' +employee.pf, {
    //     width: 280,
    //     align: 'left'
    //   });
   
    // pdfDoc.moveDown();
 
    // pdfDoc.fontSize(10).text('ESIC - '+employee.esic, {
    //     align: 'left',
    //     width: 300,
    //     lineBreak: false,
    //     lineGap: 0
    // });
    // pdfDoc.moveDown();

    pdfDoc.fontSize(8).text('*This Card is non-Transferable & valid only inside work place', pdfDoc.x, pdfDoc.y+5,{
        align: 'left',
        width: 300,
    });
    

    pdfDoc.end();


});

exports.searchEmployeeByCode = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    const clients = await NewRegistration.findAll({where:{       
        emp_code:{[Op.substring]:val},
        
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send(clients);
    
});

exports.removeEmp = catchAsyncErrors( async(req, res, next) => {
    const { id } = req.body;
    const pvt = await NewRegistration.findByPk(id);
    await pvt.destroy();
    res.send({
        message:'Successfully Deleted'
    })
});

exports.changeEmpCompany = catchAsyncErrors( async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
    const employee = await NewRegistration.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster,NewRegistrationDocuments]});
   
    res.render('employee/employee_change_company_form',{
        message:'',
        companies,
        clients,
        employee
    });
});

exports.postchangeEmpCompany = catchAsyncErrors( async(req, res, next) => {
    const {
        id,
        company,
        client,
        date_of_joining,
        emp_code,
        emp_title,
        emp_name,
        father_name,
        dob,
        gender,
        address,
        state,
        pin,
        mobile,
        email,
        aadhar,
        pan,
        maritial_status,
        bank_ac,
        bank_name,
        ifsc,
        beneficiary,
        pf,
        esic,
        date_of_exit,
        remarks,
    } = req.body;
    const files = req.files;


    const oldEmployee = await NewRegistration.findByPk(id,{include:NewRegistrationDocuments});
    let aadhar_photo=oldEmployee.aadhar_photo;
    let pan_photo=oldEmployee.pan_photo;
    let photo=oldEmployee.photo;
    let bank_passbook_photo=oldEmployee.bank_passbook_photo;
    let sign=oldEmployee.signature;
    let tic=oldEmployee.tic;
    let family_photo=oldEmployee.family_photo;
    let documents=[];
    let hasDocu = false;

    for(var i=0;i<files.length;i++){
        if(files[i].fieldname==='aadhar_photo'){
            // if(oldEmployee.aadhar_photo)
            //     fileHelper.deleteFile(oldEmployee.aadhar_photo);
            aadhar_photo=files[i].path;
        }else if(files[i].fieldname==='photo'){
            // if(oldEmployee.photo)
            //     fileHelper.deleteFile(oldEmployee.photo);
            photo=files[i].path;
        }else if(files[i].fieldname==='pan_photo'){
            // if(oldEmployee.pan_photo)
            //     fileHelper.deleteFile(oldEmployee.pan_photo);
            pan_photo=files[i].path;
        }else if(files[i].fieldname==='bank_passbook'){
            // if(oldEmployee.bank_passbook_photo)
            //     fileHelper.deleteFile(oldEmployee.bank_passbook_photo);
            bank_passbook_photo=files[i].path;
        }else if(files[i].fieldname==='family'){
            // if(oldEmployee.family_photo)
            //     fileHelper.deleteFile(oldEmployee.family_photo);
            family_photo=files[i].path;
        }else if(files[i].fieldname==='signature'){
            // if(oldEmployee.signature)
            //     fileHelper.deleteFile(oldEmployee.signature);
            sign=files[i].path;
        }else if(files[i].fieldname==='tic'){
            // if(oldEmployee.tic)
            //     fileHelper.deleteFile(oldEmployee.tic);
            tic=files[i].path;
        }
        else if(files[i].fieldname==='family_doc'){
            // if(!hasDocu){
            //     for(var j=0;j<oldEmployee.new_registration_documents.length;j++) {
            //          fileHelper.deleteFile(oldEmployee.new_registration_documents[j].document);
            //      }
            // }
            //     hasDocu=true;
                documents.push(files[i]);
        }
    }

    const updatedDob = dob;
    const updatedDateOfJoining = date_of_joining;
    const updatedDateOfExit = date_of_exit;
    
   const newEMp =  await NewRegistration.create({
        company_id:company,
        client_id:client,        
        date_of_joining:updatedDateOfJoining,
        emp_title,
        emp_code:emp_code,
        emp_name,
        father_name,
        dob:updatedDob,
        gender,
        address,
        state,
        pin,
        mobile,
        email,
        aadhar,
        pan,
        maritial_status,
        bank_ac,
        bank_name,
        ifsc,
        beneficiary,
        pf,
        esic,
        date_of_exit:updatedDateOfExit,
        remarks,
        photo,
        aadhar_photo,
        pan_photo,
        bank_passbook_photo,
        family_photo,
        signature:sign,
        tic
    });
    
    //remove documents
    if(documents.length>0){
        // await NewRegistrationDocuments.destroy({where:{new_registration_id:oldEmployee.id}});

        for(var i=0;i<documents.length;i++){
            await NewRegistrationDocuments.create({
                new_registration_id:newEMp.id,
                document:documents[i].path
            })
        }
       
    }
    for(var i=0;i<oldEmployee.new_registration_documents.length;i++){
        await NewRegistrationDocuments.create({
            new_registration_id:newEMp.id,
            document:oldEmployee.new_registration_documents[i].document
        })
    }
    
    res.redirect('/employee/new?isPreview='+true);
});


// exports.getIncrement = catchAsyncErrors( async(req, res, next) => {
//     const employee = await NewRegistration.findByPk(req.params.id);
//     const incrementData = await NewRegistrationIncrements.findOne({where:{new_registration_id:req.params.id}});
//     res.render('employee/increment_letter',{
//         employee,
//         incrementData
        
//     });

// });
// exports.postIncrement = catchAsyncErrors( async(req, res, next) => {
//     const {
//         id,
//         date_of_increment,
//         basic_salary,
//         hra,
//         gross_salary,
//         increment_id
//     } = req.body;
    
//     if(increment_id==0){
//         const increment = await NewRegistrationIncrements.create({
//             new_registration_id:id,
//             date_of_increment,
//             basic_salary,
//             hra,
//             gross_salary
//         });
        
         
//         const employee = await NewRegistration.findByPk(id,{include:CompanyMaster});
//         res.render('employee/increment_letter_view',{
//             employee,
//             increment
//         });
//     }else{
//          const increment = await NewRegistrationIncrements.update({
//             date_of_increment:date_of_increment,
//             basic_salary:basic_salary,
//             hra:hra,
//             gross_salary:gross_salary
            
//          },{where:{id:increment_id}});        
         
//         const employee = await NewRegistration.findByPk(id,{include:CompanyMaster});
//         res.render('employee/increment_letter_view',{
//             employee,
//             increment
//         });
//     }
   
   

// });

// exports.editIncrement = catchAsyncErrors( async(req, res, next) => {
//     const {
//         id,
//         date_of_increment,
//         basic_salary,
//         hra,
//         gross_salary,
//         increment_id
//     } = req.body;
    
    
//          const increment = await NewRegistrationIncrements.update({
//             date_of_increment:date_of_increment,
//             basic_salary:basic_salary,
//             hra:hra,
//             gross_salary:gross_salary
            
//          },{where:{id:increment_id}});   
//          const incrementData = await NewRegistrationIncrements.findOne({where:{new_registration_id:id},
//             order: [ [ 'id', 'DESC' ]],
//         });     
//     const incrementDataList = await NewRegistrationIncrements.findAll({where:{new_registration_id:id}});
         
//         const employee = await NewRegistration.findByPk(id,{include:CompanyMaster});
//         res.render('employee/increment_letter',{
//             employee,
//             incrementData,
//             incrementDataList
//         });
    
   
   

// });

exports.getIncrement = catchAsyncErrors( async(req, res, next) => {
    const employee = await NewRegistration.findByPk(req.params.id);
    // const incrementData = await NewRegistrationIncrements.findOne({where:{new_registration_id:req.params.id},
    //     order: [ [ 'id', 'DESC' ]],
    // });
    const incrementDataList = await NewRegistrationIncrements.findAll({where:{new_registration_id:req.params.id}});
    
    res.render('employee/increment_letter',{
        employee,
        // incrementData,
        incrementDataList
        
    });

});
exports.getIncrementById = catchAsyncErrors( async(req, res, next) => {
    // const incrementData = await NewRegistrationIncrements.findOne({where:{new_registration_id:req.params.id},
    //     order: [ [ 'id', 'DESC' ]],
    // });
    const increment = await NewRegistrationIncrements.findOne({where:{id:req.params.id}    });
    const employee = await NewRegistration.findByPk(increment.new_registration_id,{include:CompanyMaster});

    res.render('employee/increment_letter_view_by_id',{
        employee,
        // incrementData,
        increment
        
    });

});

exports.downloadIncrementById = catchAsyncErrors( async(req, res, next) => {
    // const incrementData = await NewRegistrationIncrements.findOne({where:{new_registration_id:req.params.id},
    //     order: [ [ 'id', 'DESC' ]],
    // });
    const incrementData = await NewRegistrationIncrements.findOne({where:{id:req.params.id}    });
    const employee = await NewRegistration.findByPk(incrementData.new_registration_id,{include:CompanyMaster});
    const pdfDoc = new PDFDocument();
    const fileName = employee.emp_name + '_' + employee.emp_code + '.pdf';
    const invoicePath = path.join('uploads', fileName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');
    pdfDoc.registerFont('bengali', path.join('utils','kalpurush.ttf'));

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(20);
    pdfDoc.font('Helvetica-Bold').text('LETTER OF INCREMENT',20,20,{
        align:'center',
        underline:true,
        width:610,
        height:20
    });
    pdfDoc.moveDown();
        pdfDoc.fontSize(18);

    pdfDoc.font('Helvetica').text('Employee Name : '+employee.emp_name,30,80,{
        align:'left',
        width:500,
        height:60,
    })
    pdfDoc.moveDown();
    const dateOfIncrement = changeDate(incrementData.date_of_increment);
    pdfDoc.text('Date Of Increment : '+dateOfIncrement,pdfDoc.x,pdfDoc.y+20,{
        align:'left',
        width:500,
        height:60,
    })
    pdfDoc.moveDown();
    pdfDoc.moveDown();
    const xValue = pdfDoc.x;
    pdfDoc.text(`I am pleased to inform you that your salary has been increased to`,{
    align:'left',
    width:550,
    height:60,   
}).font('Helvetica-Bold')
.text(`Rs. ${incrementData.gross_salary}. `,{   
    continued: true,
    lineBreak:false
}).font('Helvetica').text(` Congratulations on this well-deserved increment! `,{ 
});

pdfDoc.font('Helvetica').text(` Thank you for your valuable contributions to our organization, and we look forward to your continued success.`,xValue,pdfDoc.y,{  
      align:'left',
    width:550,
    height:60,  
})

    pdfDoc.moveDown();
    pdfDoc.moveDown();

 pdfDoc.font('bengali').text(`আমি আপনাকে জানাতে পেরে  আনন্দিত যে আপনার বেতন `,{
    align:'left',
    width:550,
    height:60,   
      continued: true,
    lineBreak:false
}).font('Helvetica-Bold')
.text(`Rs. ${incrementData.gross_salary}. `,{   
    continued: true,
    lineBreak:false
}).font('bengali').text(`টাকায় `,{ 
});

pdfDoc.font('bengali').text(` বৃদ্ধি করা হয়েছে |   এই ভালো প্রাপ্ত বৃদ্ধির জন্য অভিনন্দন|`,xValue,pdfDoc.y,{  
      align:'left',
    width:550,
    height:60,  
})
    
pdfDoc.font('bengali').text(` আমাদের  প্রতিষ্ঠানে আপনার মূল্যবান অবদানের জন্য আপনাকে ধন্যবাদ, আমরন`,xValue,pdfDoc.y,{  
      align:'left',
    width:550,
    height:60,  
})
    
pdfDoc.font('bengali').text(`আপনার অব্যাহত সাফল্যের জন্যে উন্মুখ | `,xValue,pdfDoc.y,{  
      align:'left',
    width:550,
    height:60,  
});
if(employee.company_master.logo){
    if (fs.existsSync(employee.company_master.logo)) {
    pdfDoc.image(employee.company_master.logo, 20, pdfDoc.y, { width: 80, height: 80, align:'left' })
    .rect(20, pdfDoc.y-80, 80, 80)
    .stroke();
    }
}      
pdfDoc.text(`${employee.company_master.company_name}`,20,pdfDoc.y+10,{
    align:'left',
    width:550,
    height:60,   
});
if(employee.signature){
    if (fs.existsSync(employee.signature)) {
    pdfDoc.image(employee.signature, 500, pdfDoc.y, { width: 80, height: 80, align:'left' })
    .rect(500, pdfDoc.y-80, 80, 80)
    .stroke();
    }
}      
pdfDoc.text(`Signature of Employee`,410,pdfDoc.y+10,{
    align:'left',
    width:550,
    height:60,   
});
pdfDoc.end();

});

exports.postIncrement = catchAsyncErrors( async(req, res, next) => {
    const {
        id,
        date_of_increment,
        basic_salary,
        hra,
        gross_salary,
        increment_id
    } = req.body;
    
    // if(increment_id==0){
        const increment = await NewRegistrationIncrements.create({
            new_registration_id:id,
            date_of_increment,
            basic_salary,
            hra,
            gross_salary
        });
        
         
        const employee = await NewRegistration.findByPk(id,{include:CompanyMaster});
        res.render('employee/increment_letter_view',{
            employee,
            increment
        });
    // }else{
        //  const increment = await NewRegistrationIncrements.update({
        //     date_of_increment:date_of_increment,
        //     basic_salary:basic_salary,
        //     hra:hra,
        //     gross_salary:gross_salary
            
        //  },{where:{id:increment_id}});        
         
        // const employee = await NewRegistration.findByPk(id,{include:CompanyMaster});
        // res.render('admin/increment_letter_view',{
        //     employee,
        //     increment
        // });
    // }
   
   

});


exports.getEditIncrement = catchAsyncErrors( async(req, res, next) => {
   
    const incrementData = await NewRegistrationIncrements.findOne({where:{id:req.params.id}    });
    
    res.render('employee/increment_letter_edit',{
        incrementData
 
    });
    
});    

exports.editIncrement = catchAsyncErrors( async(req, res, next) => {
    const {
        id,
        date_of_increment,
        basic_salary,
        hra,
        gross_salary,
        increment_id
    } = req.body;
    
    
         const increment = await NewRegistrationIncrements.update({
            date_of_increment:date_of_increment,
            basic_salary:basic_salary,
            hra:hra,
            gross_salary:gross_salary
            
         },{where:{id:increment_id}});   
         const incrementData = await NewRegistrationIncrements.findOne({where:{new_registration_id:id},
            order: [ [ 'id', 'DESC' ]],
        });     
    const incrementDataList = await NewRegistrationIncrements.findAll({where:{new_registration_id:id}});
         
        const employee = await NewRegistration.findByPk(id,{include:CompanyMaster});
        res.render('employee/increment_letter',{
            employee,
            incrementData,
            incrementDataList
        });
    
   
   

});


exports.deleteIncrement = catchAsyncErrors(async( req,res,next) =>{
    const {
        id
    } = req.body;
    console.log(id);
    const increment = await NewRegistrationIncrements.findByPk(id);
    
     await increment.destroy();
     res.send('Successful');
});

