const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path');
const Login = require('../../models/admin/login');
const ClientLogin = require('../../models/admin/client_login');
const ClientMaster = require('../../models/admin/client_master');
const UserManagement = require('../../models/admin/user_management');
const UserManagementPermissions = require('../../models/admin/user_management_permissions');
const catchAsyncErrors = require('../../utils/catchAsyncErrors');
var SibApiV3Sdk = require('sib-api-v3-sdk');
const ClientAddress = require('../../models/admin/client_addresses');

exports.index = (req, res, next) => {
    res.render('admin/index');
};
exports.getLogin = (req, res, next) => {
    res.render('admin/inhouse_login',{
        message:''
    });
};
exports.postLogin = async (req, res, next) => {
    const {
        username,
        password
    } = req.body;
    if(username=='admin'){
    const login = await Login.findOne({where:{username:username,password:password}});
            if(login){
                req.session.user = login;
                req.session.save(err =>{
                    console.log(err);
                    return res.redirect('/admin/dashboard');    
                });
            }else{
            res.render('admin/inhouse_login',{
                message:'Invalid Username Or Password'
            });
        
    }
    }else{
    const login = await UserManagement.findOne({where:{username:username,password:password}});
            if(login){                
                req.session.user = login;
                req.session.save(err =>{
                    console.log(err);
                    return res.redirect('/admin/dashboard');    
                });          
            }else{
                res.render('admin/inhouse_login',{
                    message:'Invalid Username Or Password'
                });                
            }
    }
   
};
exports.getLogout = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/admin') 
      })
};
exports.getChangePassword = (req, res, next) => {
    res.render('employee/change_password',{
        message:'',
        isError:false,
        old:''
    });
};
exports.postChangePassword = catchAsyncErrors(async (req, res, next) => {
    const {old_password,new_password,confirm_password} = req.body;

    if(req.session.user.password!=old_password){
        res.render('employee/change_password',{
            message:'Password entered is incorrect!',
            old:'',
            isError:true    
        });
    }else if(new_password!=confirm_password){
            res.render('employee/change_password',{
                message:'Passwords do not match!',
                old:old_password,
                isError:true    
            });
    }else{
        await UserManagement.update({
            password:new_password
        },{where:{id:req.session.user.id}});
        req.session.user.password=new_password;
        res.render('employee/change_password',{
            message:'Password changed successfully!',
            old:'',
            isError:false    
        });
    }
    
    
    
});
exports.getForgotPassword = (req, res, next) => {
    res.render('admin/forgot_password',{
        message:''
    });
};
exports.postForgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    
    const oldClient = await UserManagement.findOne({where:{email:email}});
    if(!oldClient){
        res.render('admin/forgot_password',{
            message:'Email doesnt exist. Please enter valid email!',
            error:true
        });
    }

    new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(
        {
          'subject':'Forgot Password',
          'sender' : {'email':'kanishk@genesiskolkata.in', 'name':'Genesis'},
          'replyTo' : {'email':'kanishk@genesiskolkata.in', 'name':'Genesis'},
          'to' : [{'name': oldClient.name, 'email': oldClient.email}],
          'htmlContent' : `<html><body><p>Your Password is ${oldClient.password}</p>               
          </body></html>`,          
        }
      ).then(function(data) {
          console.log(data);
        res.render('admin/forgot_password',{
            message:'Password send to your email. Please check your email and login.',
            error:false
        });
      }, function(error) {
        console.log(error);
      });


  
});
exports.getClientLogin = (req, res, next) => {
    res.render('admin/client_login',{
        message:''
    });
};

exports.postClientLogin = async (req, res, next) => {
    const {
        username,
        password
    } = req.body;
    
    const login = await ClientLogin.findOne({where:{username:username,password:password},include:[ClientMaster]});
    if(!login){
        res.render('admin/inhouse_login',{
            message:'Invalid Username Or Password'
        });
    }else{
        res.redirect('/client/dashboard');       
    }
};
exports.getDashboard = async (req, res, next) => {
    const user = req.session.user;
    if(!user){
        res.redirect('/');
    }
    if(user.username=='admin'){
        return res.render('admin/admin_dashboard');
    }
    
    const userPermissions = await UserManagementPermissions.findAll({where:{user_management_id:user.id}});
    let permissions=[];
    for(let p of userPermissions){
        permissions.push(p.permission);
    }
    req.session.permissions=permissions;
    console.log(req.session.permissions);
    res.render('employee/dashboard',{
        user,
        permissions
    });
    
};

exports.getMaster = (req, res, next) => {
    try {
        res.render('employee/master');
    } catch (err) {
        console.log(err)
    }
};
exports.getEmployeeEdit = (req, res, next) => {
    try {
        res.render('employee/employee_edit');
    } catch (err) {
        console.log(err)
    }
};


exports.getInvoicePrint = (req, res, next) => {
    try {
        res.render('employee/invoice_print');
    } catch (err) {
        console.log(err)
    }
};
exports.getServiceMaster = (req, res, next) => {
    try {
        res.render('employee/service_master');
    } catch (err) {
        console.log(err)
    }
};
exports.getServiceMasterEdit = (req, res, next) => {
    try {
        res.render('employee/service_master_edit');
    } catch (err) {
        console.log(err)
    }
};

exports.getStatute = (req, res, next) => {
    try {

        const e = [{
                id: '1',
                files: ["/img/5.jpeg", "/img/new.png"]

            },
            {
                id: '2',
                files: ["/img/6.jpeg", "/img/10.jpeg"]
            }

        ];
        res.render('employee/statute', {
            e
        });
    } catch (err) {
        console.log(err)
    }
};
exports.getIdCardModule = (req, res, next) => {
    try {
        res.render('employee/id_card_module');
    } catch (err) {
        console.log(err);
    }
};

exports.getRegistrationPayslip = (req, res, next) => {
    try {
        res.render('employee/registration_payslip');
    } catch (err) {
        console.log(err);
    }
};
exports.getAppointmentLetterGeneral = (req, res, next) => {
    try {
        res.render('employee/appointment_letter_general');
    } catch (err) {
        console.log(err);
    }
};
exports.getAppointmentLetterSuper = (req, res, next) => {
    try {
        res.render('employee/appointment_letter_supervisor');
    } catch (err) {
        console.log(err);
    }
};

exports.getUploadExcel = (req, res, next) => {
    try {
        res.render('employee/upload_excel_file');
    } catch (err) {
        console.log(err);
    }
};
exports.getDownloadExcel = (req, res, next) => {
    try {
        res.render('employee/download-excel-file');
    } catch (err) {
        console.log(err);
    }
};



exports.getNoteMaster = (req, res, next) => {
    try {
        res.render('employee/note-master');
    } catch (err) {
        console.log(err);
    }
};
exports.getAddressForClient = catchAsyncErrors( async(req, res, next) => {
    const {client_id} = req.body;

    const address = await ClientAddress.findAll({where:{
        '$client_master.id$':client_id 
    },
    include: ClientMaster
    });
        res.send(address);
});
