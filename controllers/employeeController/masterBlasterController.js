const CompanyMaster = require("../../models/admin/company_master");
const catchAsyncErrors = require("../../utils/catchAsyncErrors");
const Sequelize = require("sequelize");

const ClientMaster = require("../../models/admin/client_master");
const SalaryMaster = require("../../models/admin/salary_master");
const SalaryMasterNew = require("../../models/admin/salary_master_new");
const Op = Sequelize.Op;
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path');
const XLSX = require('xlsx');
const NewRegistrationDocuments = require("../../models/admin/new_registration_documents");
const NewRegistration = require("../../models/admin/new_registration");
const readXlsxFile = require('read-excel-file/node');
const NewRegistrationAppointments = require("../../models/admin/new_registration_appointments");


exports.getMasterBlaster = catchAsyncErrors(async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
        res.render('employee/master_blaster',{
            permissions
        });
   
});

exports.getMbEmployeeMaster = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
          res.render('employee/mb_employee_master',{
              companies,
              clients,
              message:'',
              permissions
          });
   
});
exports.getMbEmployeeMasterUpload = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
          res.render('employee/mb_employee_master_upload',{
              companies,
              clients,
              message:'',
              permissions
});
});

exports.getMbEmployeeMasterDownload = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
          res.render('employee/mb_employee_master_download',{
              companies,
              clients,
              message:'',
              permissions
});
});
exports.getMasterBlasterData = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    res.render('employee/master_blaster_data',{
        permissions
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
  exports.postMbEmployeeMaster = catchAsyncErrors(async (req, res, next) => {
    const rows = await readXlsxFile('uploads/' + req.files[0].filename);      
         rows.shift(); 
       
           
         rows.forEach(async element => {
             //update if already exists
             const oldEmp = await NewRegistration.findAll({where:{emp_code:element[6]}});
             element[7]=changeDate(element[7]);
             element[5]=changeDate(element[5]);
             if(oldEmp.length>0){
                 await NewRegistration.update({
                     emp_name:element[4],
                     dob:element[5],
                     date_of_joining:element[7],
                     gender:element[8],
                     aadhar:element[9],
                     address:element[10],
                     mobile:element[11],
                     pan:element[12],
                     maritial_status:element[13],
                     pf:element[14],
                     esic:element[15],
                     bank_ac:element[16],
                     ifsc:element[17],
                     bank_name:element[18],
                     beneficiary:element[19],
                     nominee_name:element[20],
                     nominee_relation:element[21],
                     nominee_share:element[22],
                     designation:element[23],
                     basic_salary:element[24],
                     hra:element[25],
                     gross_salary:element[26],
                     type:element[27],
                     date_of_exit:element[28],
                     remarks:element[29],
                 },
                     {where:{emp_code:element[6]}
                 });
             }else{
                 //insert if a new record
                 await NewRegistration.create({
                     company_id:element[1],
                     client_id:element[3],
                     emp_name:element[4],
                     dob:element[5],
                     emp_code:element[6],
                     date_of_joining:element[7],
                     gender:element[8],
                     aadhar:element[9],
                     address:element[10],
                     mobile:element[11],
                     pan:element[12],
                     maritial_status:element[13],
                     pf:element[14],
                     esic:element[15],
                     bank_ac:element[16],
                     ifsc:element[17],
                     bank_name:element[18],
                     beneficiary:element[19],
                     nominee_name:element[20],
                     nominee_relation:element[21],
                     nominee_share:element[22],
                     designation:element[23],
                     basic_salary:element[24],
                     hra:element[25],
                     gross_salary:element[26],
                     type:element[27],
                     date_of_exit:element[28],
                     remarks:element[29],
                     username:element[38],
                     user_id:element[39],
                     date:element[40],
                     time:element[41],
                 }
                 );
             }
         });
         const companies = await CompanyMaster.findAll();
         const clients = await ClientMaster.findAll();
               res.render('admin/mb_employee_master',{
                   companies,
                   clients,
                   message:'Data Imported Successfully'
               });
 
 });
 exports.getExportMbEmployeeMaster = catchAsyncErrors(async (req, res, next) => {
 
     
     const { company,client } = req.query;
     let newReg;
     if(!client){
          newReg = await NewRegistration.findAll({where:{company_id:company},include:[CompanyMaster,ClientMaster,NewRegistrationDocuments,NewRegistrationAppointments]})
         }else{
          newReg = await NewRegistration.findAll({where:{company_id:company,client_id:client},include:[CompanyMaster,ClientMaster,NewRegistrationDocuments,NewRegistrationAppointments]})
     }
     
     let data = [];
     newReg.forEach(el =>{
         data.push({
             'Company Name':el.company_master.company_name,
             'Company Id':el.company_master.id,
             'Client Name':el.client_master.client_name,
             'Client Id':el.client_master.id,
             'Employee Name':el.emp_name,
             'Date of Birth':el.dob,
             'Employee Code':el.emp_code,
             'Date Of joining':el.date_of_joining,
             'Gender':el.gender,
             'Aadhar No':el.aadhar,
             'Address':el.address,
             'State':el.state,
             'Pin Code':el.pin,
             'Mobile No':el.mobile,
             'Pan No':el.pan,
             'Maritial Status':el.maritial_status,
             'PF No':el.pf,
             'ESIC No':el.esic,
             'Bank Account No':el.bank_ac,
             'IFSC':el.ifsc,
             'Bank Name':el.bank_name,
             'Beneficiary Name':el.beneficiary,
             'Nominee Name':el.nominee_name,
             'Nominee Relation':el.nominee_relation,
             'Father/Husband Name':el.father_name,
             'Designation':el.designation,
             'Basic Salary':el.basic_salary,
             'HRA':el.hra,
             'Gross Salary':el.gross_salary,
             'Type Of Employee':el.type,
             'Date Of Exit':el.date_of_exit,
             'Remarks':el.remarks,
             'Aadhar Upload':el.aadhar_photo ? 'YES' : 'NO',
             'Pan Upload':el.pan_photo ? 'YES' : 'NO',
             'Bank Pass Book':el.bank_passbook_photo ? 'YES' : 'NO',
             'TIC':el.tic ? 'YES' : 'NO',
             'Appointment Letter':el.new_registration_appointments.length>0 ? 'YES' : 'NO',
             'Others':el.new_registration_documents.length>0 ? 'YES' : 'NO',
             'Signature':el.signature ? 'YES' : 'NO',
             'Employee Photo':el.photo ? 'YES' : 'NO',
             'User Name':el.username,
             'User Id':el.user_id,
             'Upload Date':el.date,
             'Upload Time':el.time,
 
          });
     });       
 var company_namee = '';
 if(newReg[0]){
    //  company_namee= newReg[0].company_master.company_name;
        company_namee= newReg[0].company_master.company_name.replace('/','');

 }
 const ws = XLSX.utils.json_to_sheet(data)
 const wb = XLSX.utils.book_new()
 XLSX.utils.book_append_sheet(wb, ws)
 XLSX.writeFile(wb, `output/${company_namee}_employee_export.xlsx`)
 const filePath = path.join(`output/${company_namee}_employee_export.xlsx`);
 
 fs.readFile(filePath, (err,data) =>{
     res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 res.setHeader('Content-Disposition', `inline; filename="${company_namee}_employee_export.xlsx"`)  ;  
 res.send(data);
 });
 });
//salary master

exports.getMbSalaryMaster = (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    try {
        res.render('employee/mb_salary_master',{
            permissions
        });
    } catch (err) {
        console.log(err)
    }
};

exports.getMbSalaryMasterUpload = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
          res.render('employee/mb_salary_master_upload',{
              companies,
              clients,
              message:'',
              permissions
          });
   
});

exports.postMbSalaryMasterUpload = catchAsyncErrors(async (req,res,next) =>{
    const rows = await readXlsxFile('uploads/' + req.files[0].filename);      
    rows.shift(); 
    
    rows.forEach(async element => {
        const empp = await NewRegistration.findOne({where:{emp_code:element[5]}});
        //update if already exists
         if(element[6]){
             element[28] = element[28] > 9 ? element[28]: '0'+element[28];

            await SalaryMaster.update({
                company_id:element[1],
                client_id:element[3],
                new_registration_id:empp.id,
                attendance:element[16],
                pro_basic:element[17],
                pro_gross:element[18],
                employee_pf:element[19],
                employee_esic:element[20],
                ptax:element[21],
                lwf:element[22],
                advance:element[23],
                others:element[24],
                net_pay:element[25],
                management_pf:element[26],
                management_esic:element[27],
                month_year:element[29]+'-'+element[28],
                month:element[28],
                year:element[29],
        },{where:{id:element[6]}});

         }else{
             if(element[16]){
                element[28] = element[28] > 9 ? element[28]: '0'+element[28];

            //insert if a new record
            await SalaryMaster.create({
                company_id:element[1],
                client_id:element[3],
                new_registration_id:empp.id,
                attendance:element[16],
                pro_basic:element[17],
                pro_gross:element[18],
                employee_pf:element[19],
                employee_esic:element[20],
                ptax:element[21],
                lwf:element[22],
                advance:element[23],
                others:element[24],
                net_pay:element[25],
                management_pf:element[26],
                management_esic:element[27],             
                month_year:element[29]+'-'+element[28],
                month:element[28],
                year:element[29],
        });
    }
         }
    });
    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
          res.render('admin/mb_salary_master_upload',{
              companies,
              clients,
              message:'Data Imported Successfully'
          });

});
exports.getMbSalaryMasterDownload = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    
    if(permissions.includes('0')){
        isAdmin = true;
    }
    const salaryMasters = await SalaryMasterNew.findAll({include:CompanyMaster});

    const companies = await CompanyMaster.findAll();
    const clients = await ClientMaster.findAll();
          res.render('employee/mb_salary_master_download',{
              companies,
              clients,
              message:'',
              permissions,
              isAdmin,
              salaryMasters
          });
   
});
exports.deleteSalaryMaster = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await SalaryMasterNew.destroy({where:{id:id}});
    res.send('Successful');

  
});
exports.searchSalarymaster = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    var isAdmin = false;
    
    if(permissions.includes('0')){
        isAdmin = true;
    }
  
    
    const invoice = await SalaryMasterNew.findAll({where:{
        [Op.or]:[
            {month:{[Op.substring]:val}},
            {year:val},
            {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster]
});    
    res.send({invoice,isAdmin});
    
    
});
exports.postMbSalaryMasterDownload = catchAsyncErrors(async (req, res, next) => {
    const { type,company,client,month,employeeId,from_date,to_date } = req.body;

    let newReg;
    let salary;
    let company_name,client_name;
    if(type==='monthly'){
        if(!client){
            salary = await SalaryMaster.findAll({where:{company_id:company,month:month.substr(5,6),year:month.substr(0,4)},include:[CompanyMaster,ClientMaster,NewRegistration]});
            }else{
            salary = await SalaryMaster.findAll({where:{company_id:company,client_id:client,month:month.substr(5,6),year:month.substr(0,4)},include:[CompanyMaster,ClientMaster,NewRegistration]});
        }
    }else if(type==='historic'){
        var from_date_month = from_date.substr(5,6);
        var from_date_year = from_date.substr(0,4);
        var to_date_month = to_date.substr(5,6);
        var to_date_year = to_date.substr(0,4);
        if(!client){
            salary = await SalaryMaster.findAll({where:{company_id:company,month:{[Op.gte]: from_date_month,[Op.lte]: to_date_month},year:{[Op.gte]: from_date_year,[Op.lte]: to_date_year}},include:[CompanyMaster,ClientMaster,NewRegistration]});
            }else{
            salary = await SalaryMaster.findAll({where:{company_id:company,client_id:client,month:{[Op.gte]: from_date_month,[Op.lte]: to_date_month},year:{[Op.gte]: from_date_year,[Op.lte]: to_date_year}},include:[CompanyMaster,ClientMaster,NewRegistration]});
        }      
    }else if(type==='individual'){
        if(!client){
            salary = await SalaryMaster.findAll({where:{company_id:company,month:month.substr(5,6),year:month.substr(0,4),new_registration_id:employeeId},include:[CompanyMaster,ClientMaster,NewRegistration]});
            }else{
            salary = await SalaryMaster.findAll({where:{company_id:company,client_id:client,month:month.substr(5,6),year:month.substr(0,4),new_registration_id:employeeId},include:[CompanyMaster,ClientMaster,NewRegistration]});
        }   
        let data = [];
   
        if(salary.length==0){
            if(!client){
                newReg = await NewRegistration.findAll({where:{company_id:company,id:employeeId},include:[CompanyMaster,ClientMaster]})
            }else{
                newReg = await NewRegistration.findAll({where:{company_id:company,client_id:client,id:employeeId},include:[CompanyMaster,ClientMaster]})
            }   
            company_name=newReg[0].company_master.company_name;
        client_name=newReg[0].client_master.client_name;
        newReg.forEach(el =>{
            data.push({
                'Company Name':el.company_master.company_name,
                'Company Id':el.company_master.id,
                'Client Name':el.client_master.client_name,
                'Client Id':el.client_master.id,
                'Employee Name':el.emp_name,
                // 'Employee Id':el.id,
                'Employee Code':el.emp_code,
                'Salary Master Id':'',
                'Aadhar No':el.aadhar,
                'PF No':el.pf,
                'ESIC No':el.esic,
                'Date Of joining':el.date_of_joining,
                'Designation':el.designation,
                'Basic Salary':el.basic_salary,
                'HRA':el.hra,
                'Gross Salary':el.gross_salary,
                '':'',
                'Attendance':'',
                'Proportionate Basic':'',
                'Proportionate Gross':'',
                'Employee PF':'',
                'Employee ESIC':'',
                'PTAX':'',
                'LWF':'',
                'Advance':'',
                'Others':'',
                'Net Pay':'',
                'Management PF':'',
                'Management ESIC':'',
                'Month':'',
                'Year':'',
    
             });
        });
        }else{

            company_name=salary[0].company_master.company_name;
            client_name=salary[0].client_master.client_name;
            salary.forEach(el =>{
                data.push({
                    'Company Name':el.company_master.company_name,
                    'Company Id':el.company_master.id,
                    'Client Name':el.client_master.client_name,
                    'Client Id':el.client_master.id,
                    'Employee Name':el.new_registration.emp_name,
                    // 'Employee Id':el.new_registration.id,
                    'Employee Code':el.new_registration.emp_code,
                    'Salary Master Id':el.id,
                    'Aadhar No':el.new_registration.aadhar,
                    'PF No':el.new_registration.pf,
                    'ESIC No':el.new_registration.esic,
                    'Date Of joining':el.new_registration.date_of_joining,
                    'Designation':el.new_registration.designation,
                    'Basic Salary':el.new_registration.basic_salary,
                    'HRA':el.new_registration.hra,
                    'Gross Salary':el.new_registration.gross_salary,
                    '':'',
                    'Attendance':el.attendance,
                    'Proportionate Basic':el.pro_basic,
                    'Proportionate Gross':el.pro_gross,
                    'Employee PF':el.employee_pf,
                    'Employee ESIC':el.employee_esic,
                    'PTAX':el.ptax,
                    'LWF':el.lwf,
                    'Advance':el.advance,
                    'Others':el.others,
                    'Net Pay':el.net_pay,
                    'Management PF':el.management_pf,
                    'Management ESIC':el.management_esic,
                    'Month':el.month,
                    'Year':el.year,
                 });
            });   
            
        }
  
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/salary_master_${company_name}_${client_name}_${month.substr(5,6)}_${month.substr(0,4)}.xlsx`)
        const filePath = path.join(`output/salary_master_${company_name}_${client_name}_${month.substr(5,6)}_${month.substr(0,4)}.xlsx`);
        
        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `inline; filename="salary_master_${company_name}_${client_name}_${month.substr(5,6)}_${month.substr(0,4)}.xlsx"`)  ;  
            res.send(data);
        });

    }
    if(type!=='individual'){
    let data = [];

    if(salary.length==0 && type!=='individual'){
        if(!client){
            newReg = await NewRegistration.findAll({where:{company_id:company},include:[CompanyMaster,ClientMaster]})
        }else{
            newReg = await NewRegistration.findAll({where:{company_id:company,client_id:client},include:[CompanyMaster,ClientMaster]})
        }  
        company_name=newReg[0].company_master.company_name;
        client_name=newReg[0].client_master.client_name;
        newReg.forEach(el =>{
            data.push({
                'Company Name':el.company_master.company_name,
                'Company Id':el.company_master.id,
                'Client Name':el.client_master.client_name,
                'Client Id':el.client_master.id,
                'Employee Name':el.emp_name,
                // 'Employee Id':el.id,
                'Employee Code':el.emp_code,
                'Salary Master Id':'',
                'Aadhar No':el.aadhar,
                'PF No':el.pf,
                'ESIC No':el.esic,
                'Date Of joining':el.date_of_joining,
                'Designation':el.designation,
                'Basic Salary':el.basic_salary,
                'HRA':el.hra,
                'Gross Salary':el.gross_salary,
                '':'',
                'Attendance':'',
                'Proportionate Basic':'',
                'Proportionate Gross':'',
                'Employee PF':'',
                'Employee ESIC':'',
                'PTAX':'',
                'LWF':'',
                'Advance':'',
                'Others':'',
                'Net Pay':'',
                'Management PF':'',
                'Management ESIC':'',
                'Month':'',
                'Year':'',
    
             });
        });    
    }else{
        let otherEmp=[];
        
        company_name=salary[0].company_master.company_name;
        client_name=salary[0].client_master.client_name;
        salary.forEach(el =>{
            otherEmp.push(el.new_registration_id);
            data.push({
                'Company Name':el.company_master.company_name,
                'Company Id':el.company_master.id,
                'Client Name':el.client_master.client_name,
                'Client Id':el.client_master.id,
                'Employee Name':el.new_registration.emp_name,
                // 'Employee Id':el.new_registration.id,
                'Employee Code':el.new_registration.emp_code,
                'Salary Master Id':el.id,
                'Aadhar No':el.new_registration.aadhar,
                'PF No':el.new_registration.pf,
                'ESIC No':el.new_registration.esic,
                'Date Of joining':el.new_registration.date_of_joining,
                'Designation':el.new_registration.designation,
                'Basic Salary':el.new_registration.basic_salary,
                'HRA':el.new_registration.hra,
                'Gross Salary':el.new_registration.gross_salary,
                '':'',
                'Attendance':el.attendance,
                'Proportionate Basic':el.pro_basic,
                'Proportionate Gross':el.pro_gross,
                'Employee PF':el.employee_pf,
                'Employee ESIC':el.employee_esic,
                'PTAX':el.ptax,
                'LWF':el.lwf,
                'Advance':el.advance,
                'Others':el.others,
                'Net Pay':el.net_pay,
                'Management PF':el.management_pf,
                'Management ESIC':el.management_esic,
                'Month':el.month,
                'Year':el.year,
             });
        });   
        let otherEmployees;
        if(!client){
            otherEmployees = await NewRegistration.findAll({where:{id:{[Op.notIn]:otherEmp},company_id:company},include:[CompanyMaster,ClientMaster]});  
        }else{
            otherEmployees = await NewRegistration.findAll({where:{id:{[Op.notIn]:otherEmp},company_id:company,client_id:client},include:[CompanyMaster,ClientMaster]});  
        }  
        otherEmployees.forEach(el =>{
            data.push({
                'Company Name':el.company_master.company_name,
                'Company Id':el.company_master.id,
                'Client Name':el.client_master.client_name,
                'Client Id':el.client_master.id,
                'Employee Name':el.emp_name,
                // 'Employee Id':el.id,
                'Employee Code':el.emp_code,
                'Salary Master Id':'',
                'Aadhar No':el.aadhar,
                'PF No':el.pf,
                'ESIC No':el.esic,
                'Date Of joining':el.date_of_joining,
                'Designation':el.designation,
                'Basic Salary':el.basic_salary,
                'HRA':el.hra,
                'Gross Salary':el.gross_salary,
                '':'',
                'Attendance':'',
                'Proportionate Basic':'',
                'Proportionate Gross':'',
                'Employee PF':'',
                'Employee ESIC':'',
                'PTAX':'',
                'LWF':'',
                'Advance':'',
                'Others':'',
                'Net Pay':'',
                'Management PF':'',
                'Management ESIC':'',
                'Month':'',
                'Year':'',
    
             });
        }); 
    
    }
       
 
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws)
XLSX.writeFile(wb, `output/salary_master_${company_name}_${client_name}_${month.substr(5,6)}_${month.substr(0,4)}.xlsx`)
const filePath = path.join(`output/salary_master_${company_name}_${client_name}_${month.substr(5,6)}_${month.substr(0,4)}.xlsx`);

fs.readFile(filePath, (err,data) =>{
res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `inline; filename="salary_master_${company_name}_${client_name}_${month.substr(5,6)}_${month.substr(0,4)}.xlsx"`)  ;  
res.send(data);
}); 
}
   
});

exports.getMbExitReport = catchAsyncErrors(async(req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
          res.render('employee/mb_exit_report',{
              companies,
              message:'',
              permissions
          });
  
    
});
exports.getMbExitReportExport = catchAsyncErrors(async (req, res, next) => {

    
    const { company } = req.query;
    let allEmployees;
    let salary=[];
    const date = new Date();
    date.setMonth(date.getMonth()-2);
    const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
    const requiredDate = date.getFullYear() + '-' + (date.getMonth()+1);
    allEmployees = await NewRegistration.findAll({where:{company_id:company}});
    let a=0;
    // var bar = new Promise((resolve, reject) => {
        // allEmployees.forEach(async (value, index, array) =>{
        //     let isSalary = await SalaryMaster.findAll({limit:1,where:{company_id:company,new_registration_id:value.id}});
        //     if(isSalary.length>0){            
        //     let oneSalary = await SalaryMaster.findAll({limit:1,where:{company_id:company,new_registration_id:value.id},order: [ [ 'month_year', 'DESC' ]],
        //     include:[CompanyMaster,ClientMaster,NewRegistration]});              
        //     salary.push(oneSalary[0]);
        //     }
        // console.log(salary.length)
            
        // });
        for(var i=0;i<allEmployees.length;i++){
            let isSalary = await SalaryMaster.findAll({limit:1,where:{company_id:company,new_registration_id:allEmployees[i].id}});
            if(isSalary.length>0){            
            let oneSalary = await SalaryMaster.findAll({limit:1,where:{company_id:company,new_registration_id:allEmployees[i].id},order: [ [ 'month_year', 'DESC' ]],
            include:[CompanyMaster,ClientMaster,NewRegistration]});              
            salary.push(oneSalary[0]);
            }
        }
      

    // });
//    bar.then(()=>{
    let data = [];
    
    salary.forEach(el =>{
        if(el.month_year<=requiredDate && (el.new_registration.date_of_exit=='' || el.new_registration.date_of_exit=='NaN-NaN-NaN')){
            const monthDate = new Date(el.month_year.substr(5,6));

            data.push({
                'Company Name':el.company_master.company_name,
                'Company Id':el.company_master.id,
                'Client Name':el.client_master.client_name,
                'Client Id':el.client_master.id,
                'Employee Name':el.new_registration.emp_name,
                'Employee Code':el.new_registration.emp_code,
                // 'Date Of joining':el.new_registration.date_of_joining,
                // 'Aadhar No':el.new_registration.aadhar,
                // 'PF No':el.new_registration.pf,
                // 'ESIC No':el.new_registration.esic,
                // 'Last Work Month': monthNames[monthDate.getMonth()],
                // 'Last Work Year':el.month_year.substr(0,4),
                'Date Of Exit':'',
    
             });
        }
    });
    if(data.length==0){
        data.push({
            'Company Name':'',
            'Company Id':'',
            'Client Name':'',
            'Client Id':'',
            'Employee Name':'',
            'Employee Code':'',
            'Date Of Exit':'',
    
         });
        }
      
const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws)
XLSX.writeFile(wb, 'output/employee_exit_report_export.xlsx')
const filePath = path.join('output/employee_exit_report_export.xlsx');

fs.readFile(filePath, (err,data) =>{
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', 'inline; filename="employee_exit_report_export.xlsx"')  ;  
res.send(data);
});
//    })

        

});


 
exports.postMbExitReport = catchAsyncErrors(async (req, res, next) => {
    const rows = await readXlsxFile('uploads/' + req.files[0].filename);      
         rows.shift(); 
         rows.forEach(async element => {  
            var oldDate = element[6];
            var newDate = oldDate.getFullYear() + '-' + (oldDate.getMonth()+1) + '-' + oldDate.getDate();
            //update if already exists
                 await NewRegistration.update({                  
                     date_of_exit:newDate,
                 },
                     {where:{emp_code:element[5]}
                 });
           
         });
         const companies = await CompanyMaster.findAll();
               res.render('employee/mb_exit_report',{
                   companies,
                   message:'Data Imported Successfully'
               });
 
 });

 
exports.getMbExitReportUpload = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
          res.render('employee/mb_exit_report_upload',{
              companies,
              message:'',
              permissions
});
});

exports.getMbExitReportDownload = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
          res.render('employee/mb_exit_report_download',{
              companies,
              message:'',
              permissions
});
});