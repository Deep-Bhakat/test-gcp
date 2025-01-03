const catchAsyncErrors = require("../../utils/catchAsyncErrors");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const UserManagement = require("../../models/admin/user_management");
const ClientLogin = require("../../models/admin/client_login");
const UserManagementPermissions = require("../../models/admin/user_management_permissions");
const CompanyMaster = require("../../models/admin/company_master");
const ClientMaster = require("../../models/admin/client_master");
const Chat = require("../../models/admin/chat");

exports.getUserManagement = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const empUsers = await UserManagement.findAll();
    const empClients = await ClientLogin.findAll({include:[CompanyMaster,ClientMaster]});
    const companies = await CompanyMaster.findAll();
    const lastEmpUser = await UserManagement.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    const lastClient = await ClientLogin.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    let newEmpCode = '';
    let newClientCode = '';
    if(!lastEmpUser){
        newEmpCode = 'EMP1';
    }else{
        newEmpCode= 'EMP'+parseInt(lastEmpUser.id+1);
    }
    if(!lastClient){
        newClientCode = 'CLI1';
    }else{
        newClientCode= 'CLI'+parseInt(lastClient.id+1);
    }
    res.render('employee/user_management',{
        message:'',
        error:0,
        empUsers,
        empClients,
        companies,
        code:newEmpCode,
        code2:newClientCode,
        preview:'employee',
        permissions
    })
});

exports.postUserManagement = catchAsyncErrors(async (req, res, next) => {
    const{
        name,
        email,
        username,
        password,
        rights,
        code,
        mobile
    } = req.body;
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const newUser = await UserManagement.create({
        name,
        email,
        mobile,
        code,
        username,
        password,
        user_id:req.session.user.id 
    });

    for(var i=0;i<rights.length;i++){
        await UserManagementPermissions.create({
            permission:rights[i],
            user_management_id:newUser.id
        });
    }   
    
    
    const companies = await CompanyMaster.findAll();
    const empClients = await ClientLogin.findAll({include:[CompanyMaster,ClientMaster]});
    const empUsers = await UserManagement.findAll();
    const lastEmpUser = await UserManagement.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    const lastClient = await ClientLogin.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    let newEmpCode = '';
    let newClientCode = '';
    if(!lastEmpUser){
        newEmpCode = 'EMP1';
    }else{
        newEmpCode= 'EMP'+parseInt(lastEmpUser.id+1);
    }
    if(!lastClient){
        newClientCode = 'CLI1';
    }else{
        newClientCode= 'CLI'+parseInt(lastClient.id+1);
    }
    res.render('employee/user_management',{
        message:'Added Successfully',
        error:0,
        empUsers,
        empClients,
        companies,
        code:newEmpCode,
        code2:newClientCode,
        preview:'employee',
        permissions

    })
});

exports.postClientManagement = catchAsyncErrors(async (req, res, next) => {
    const{
        company,
        client,        
        email,        
        username,
        password,        
        code,        
    } = req.body;
    const oldClientEmp = await ClientLogin.findOne({where:{client_id:client}});
    if(!oldClientEmp){       
        await ClientLogin.create({
            company_id:company,
            client_id:client,
            email,
            code,
            username,
            password,
            user_id:req.session.user.id 
        }); 
    }
   
    
    const companies = await CompanyMaster.findAll();
    const empClients = await ClientLogin.findAll({include:[CompanyMaster,ClientMaster]});
    const empUsers = await UserManagement.findAll();
    const lastEmpUser = await UserManagement.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    const lastClient = await ClientLogin.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    let newEmpCode = '';
    let newClientCode = '';
    if(!lastEmpUser){
        newEmpCode = 'EMP1';
    }else{
        newEmpCode= 'EMP'+parseInt(lastEmpUser.id+1);
    }
    if(!lastClient){
        newClientCode = 'CLI1';
    }else{
        newClientCode= 'CLI'+parseInt(lastClient.id+1);
    }
    if(oldClientEmp){
        res.render('employee/user_management',{
            message:'Client Already Exists',
            error:1,
            empUsers,
            empClients,
            companies,
            code:newEmpCode,
            code2:newClientCode,
            preview:'client'

        })
    }else{
    res.render('employee/user_management',{
        message:'Added Successfully',
        error:0,
        empUsers,
        empClients,
        companies,
        code:newEmpCode,
        code2:newClientCode,
        preview:'client'

    });
}
});


exports.getUserManagementEdit = catchAsyncErrors(async (req, res, next) => {
    var permissionss;
    if( req.session.permissions){
        permissionss= req.session.permissions;
    }
    const empUser = await UserManagement.findByPk(req.params.id,{include: UserManagementPermissions});    
    const permissions = [];
    for(var i = 0;i<empUser.user_management_permissions.length;i++){
        permissions.push(empUser.user_management_permissions[i].permission);
    }
    // console.log(permissions);
    res.render('employee/user_management_edit1',{
        empUser,
        permissions,
        permissionss
    })
});
exports.postUserManagementEdit = catchAsyncErrors(async (req, res, next) => {
    
    const{
        id,
        name,
        email,
        password,
        rights,
        mobile
    } = req.body;
    
    await UserManagement.update({
        name,
        email,
        mobile,
        password,
        user_id:req.session.user.id 
    },{where: {id:id}});

    //delete rights
    await UserManagementPermissions.destroy({where: {user_management_id:id}});
    //add rights
    for(var i=0;i<rights.length;i++){
        await UserManagementPermissions.create({
            permission:rights[i],
            user_management_id:id
        });
    }   
    
    
    const companies = await CompanyMaster.findAll();
    const empClients = await ClientLogin.findAll({include:[CompanyMaster,ClientMaster]});
    const empUsers = await UserManagement.findAll();
    const lastEmpUser = await UserManagement.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    const lastClient = await ClientLogin.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    let newEmpCode = '';
    let newClientCode = '';
    if(!lastEmpUser){
        newEmpCode = 'EMP1';
    }else{
        newEmpCode= 'EMP'+parseInt(lastEmpUser.id+1);
    }
    if(!lastClient){
        newClientCode = 'CLI1';
    }else{
        newClientCode= 'CLI'+parseInt(lastClient.id+1);
    }
    res.render('employee/user_management',{
        message:'Edited Successfully',
        error:0,
        empUsers,
        companies,
        empClients,
        code:newEmpCode,
        code2:newClientCode,
        preview:'employee'

    })
});

exports.getClientManagementEdit = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const empClient = await ClientLogin.findByPk(req.params.id,{include: [CompanyMaster,ClientMaster]});    
    const companies = await CompanyMaster.findAll();
    
    res.render('employee/user_management_edit2',{
        empClient,
        companies,
        permissions
    })
});
exports.postClientManagementEdit = catchAsyncErrors(async (req, res, next) => {
    
    const{
        id,
        company,
        client,
        email,
        username,
        password,
    } = req.body;
    
    await ClientLogin.update({
        company_id:company,
        client_id:client,
        email,
        username,
        password,
        user_id:req.session.user.id 
    },{where: {id:id}});      
    
    
    const companies = await CompanyMaster.findAll();
    const empClients = await ClientLogin.findAll({include:[CompanyMaster,ClientMaster]});
    const empUsers = await UserManagement.findAll();
    const lastEmpUser = await UserManagement.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    const lastClient = await ClientLogin.findOne({
        order: [ [ 'createdAt', 'DESC' ]],
    });
    let newEmpCode = '';
    let newClientCode = '';
    if(!lastEmpUser){
        newEmpCode = 'EMP1';
    }else{
        newEmpCode= 'EMP'+parseInt(lastEmpUser.id+1);
    }
    if(!lastClient){
        newClientCode = 'CLI1';
    }else{
        newClientCode= 'CLI'+parseInt(lastClient.id+1);
    }
    res.render('employee/user_management',{
        message:'Edited Successfully',
        error:0,
        empUsers,
        companies,
        empClients,
        code:newEmpCode,
        code2:newClientCode,
        preview:'client'

    })
});
exports.deleteEmployeeUser = catchAsyncErrors(async (req,res,next) =>{
    
    await UserManagement.destroy({
        where:{id:req.params.id}
    });

    res.redirect('/employee/user-management');
});

exports.deleteClientUser = catchAsyncErrors(async (req,res,next) =>{
    
    await ClientLogin.destroy({
        where:{id:req.params.id}
    });

    res.redirect('/employee/user-management');
});

exports.searchUser = catchAsyncErrors( async (req, res, next) => {
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
    const clients = await UserManagement.findAll({where:{
        [Op.or]:[
        {name:{[Op.substring]:val}},
        {email:{[Op.substring]:val}},
        {mobile:{[Op.substring]:val}},
        {code:{[Op.substring]:val}},
        ]
    }});    
    res.send({clients,isAdmin});
    // console.log(companies);
    
});

exports.getChatBox = catchAsyncErrors(async (req,res,next) =>{
    const sender_id = req.session.user.id;
    const users = await UserManagement.findAll({where:{
        [Op.not]:[{
            id:sender_id
        }]
    }});
    const noOfChats = [];
    const noOfChatsAdmin = [];
    for(var i =0;i<users.length;i++){
        const aa = await Chat.count({where:{to:sender_id,from:users[i].id,read:0}});
        // console.log(aa);
        noOfChats.push(aa);
}
const aaa = await Chat.count({where:{to:sender_id,from:'admin',read:0}});
noOfChatsAdmin.push(aaa)

var userToChat = '';
var userToChatName = '';
    if(req.query.user_id){
        if(req.query.user_id=='admin'){
            userToChat= req.query.user_id;
            userToChatName = 'Admin';
        }
        else{
            userToChat= req.query.user_id;
            const userr = await UserManagement.findByPk(userToChat);
            userToChatName = userr.name;
        }
    }
    const sender_name = req.session.user.name;
    res.render('employee/chatbox_new',{
        users,
        senderId:sender_id,
        noOfChatsAdmin,
        users,
        sender_name,
        noOfChats,
        userToChat,
        userToChatName
    })

});

exports.getUserChats = catchAsyncErrors(async (req,res,next) =>{
    const {sender_id,receiver_id} = req.body;

    const msgs = await Chat.findAll({where:{
        [Op.or]:[
            {[Op.and]:[
                {to:receiver_id},
                {from:sender_id}]
            },
            {[Op.and]:[
                {to:sender_id},
                {from:receiver_id}]
            },
        ]
    },        order: [ [ 'date', 'ASC' ],[ 'time', 'ASC' ]],
});
// console.log(msgs);
await Chat.update({
    read:1
},{where:{to:sender_id,from:receiver_id}})
    res.send(msgs)

});

exports.addUserChat = catchAsyncErrors(async (req,res,next) =>{
    const {sender_id,receiver_id,from_name,to_name,msg,date,time} = req.body;

    await Chat.create({
        to:receiver_id,
        from:sender_id,
        from_name:from_name,
        to_name:to_name,
        message:msg,
        date:date,
        time:time
    })
    // res.send(msgs)

});
exports.countChats = catchAsyncErrors(async (req,res,next) =>{
    const users = await UserManagement.findAll();
    const noOfChats = [];
    // const noOfChatsUser = [];
    const sender_id = req.session.user.id;

    for(var i =0;i<users.length;i++){
        const aa = await Chat.count({where:{to:sender_id,from:users[i].id,read:0}});
        // console.log(aa);
        // noOfChats.push(aa);
        noOfChats.push({'count':aa,'name':users[i].name,'id':users[i].id});

}
const noOfChatsAdmin = [];
const aaa = await Chat.count({where:{to:sender_id,from:'admin',read:0}});
noOfChatsAdmin.push(aaa)


noOfChats.sort(function(a, b) {
    var keyA = a.count;
     var keyB =  b.count;
    // Compare the 2 dates
    if (keyA > keyB) return -1;
    if (keyA < keyB) return 1;
    return 0;
  });
   res.send({noOfChats,noOfChatsAdmin});
});
