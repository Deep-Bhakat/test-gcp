const Sequelize = require("sequelize");
const CompanyMaster = require("../../models/admin/company_master");
const ClientMaster = require("../../models/admin/client_master");
const Op = Sequelize.Op;
const Notification = require("../../models/admin/notification");
const catchAsyncErrors = require("../../utils/catchAsyncErrors");
const ExecutiveVisitReport = require("../../models/admin/executive_visit_report");
const SuccessStories = require("../../models/admin/success_stories");
const ManagerVisitReport = require("../../models/admin/manager_visit_report");
const PendingIssues = require("../../models/admin/pending_issues");
const HRReport = require("../../models/admin/hr_report");
const path = require('path')
const PDFDocument = require('pdfkit')
const fs = require('fs')

exports.getNewsHrReports = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
          res.render('employee/news-hr-reports',{
              permissions
          });
      
  });
exports.getNotificationDetails = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
  const noti = await Notification.findAll();
        res.render('employee/notification-details',{
            noti,
            permissions,
            isAdmin
        });
    
});
exports.postNotificationDetails = catchAsyncErrors(async (req, res, next) => {
    const {client,heading,month_year,from_date,to_date,comment} = req.body;   
    const noti = await Notification.create({
        client_id:client!=='' ? client : null,
        heading:heading,
        date:month_year,
        from_date:from_date,
        to_date:to_date,
        comment:comment,
        upload:req.files.length > 0 ? req.files[0].path : '',
        user_id:req.session.user.id 
    });

    res.redirect('/employee/notification-details');

});

exports.deleteNotification = catchAsyncErrors( async(req, res, next) => {
    const { id } = req.body;
    const pvt = await Notification.findByPk(id);
    await pvt.destroy();
    res.send({
        message:'Successfully Deleted'
    })
});

exports.getNotificationDetailsEdit = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const noti = await Notification.findByPk(req.params.id,{include:[ClientMaster]});
  res.render('employee/notification_details_edit',{
              noti,
              permissions
          });
      
  });

  exports.postNotificationDetailsEdit = catchAsyncErrors(async (req, res, next) => {
    const {id,client,heading,month_year,from_date,to_date,comment} = req.body;  
    let document = '';

    const noti = await Notification.findByPk(id);
    document=noti.upload;    

    if(req.files.length > 0 && req.files[0].fieldname==='file'){
        document=req.files[0].path;
    }
    await Notification.update({
        client_id:client!=='' ? client : null,
        heading:heading,
        date:month_year,
        from_date:from_date,
        to_date:to_date,
        comment:comment,
        upload:document,
        user_id:req.session.user.id 
    },{where:{id:id}});

    res.redirect('/employee/notification-details');

});
exports.getHRReportModule = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    
          res.render('employee/hr_report_module',{
              permissions
          });
      
  });
exports.getHRReport = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
          res.render('employee/hr_report',{
            message:'',
            permissions
          });
      
  });
exports.postHRReport = catchAsyncErrors(async (req, res, next) => {
    const{
        client,
        month_year,
        executive,
        unit,
        executiveComment,
        manager,
        unit2,
        managerComment,
        report,
        nameCount,
        report2,
        nameCount2,
        comment,
        comment2
    } = req.body;

    //hr report add
    const hr = await HRReport.create({
        client_id:client,
        month:month_year.substr(5,6),
        year:month_year.substr(0,4),
        comment:comment,
        comment2:comment2,
       marathon:req.files.length > 0 ? req.files[0].path : '',
       user_id:req.session.user.id 
    });
    
    //executive visit add
    if(executive[0]!='' || executive.length>1){
        for(var i=0;i<executive.length;i++){
        await ExecutiveVisitReport.create({
            hr_id:hr.id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            name:executive[i],
            unit:unit[i],
            comment:executiveComment[i],
        });
    }
}

    //manager visit add
    if(manager[0]!='' || manager.length>1){
        for(var i=0;i<manager.length;i++){
        await ManagerVisitReport.create({
            hr_id:hr.id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            name:manager[i],
            unit:unit2[i],
            comment:managerComment[i],
        });
    }
}
    //success stories add
    if(report[0]!='' || report.length>1){
        for(var i=0;i<report.length;i++){
        await SuccessStories.create({
            hr_id:hr.id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            report:report[i],
            name:nameCount[i],
        });
    }
    }
    //pending issues add
    if(report2[0]!='' || report2.length>1){
        for(var i=0;i<report2.length;i++){
        await PendingIssues.create({
            hr_id:hr.id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            report:report2[i],
            name:nameCount2[i],
        });
    }
    }
    

          res.render('employee/hr_report',{
              message:'Added Successfully'
          });
      
});

exports.getHRReportView = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const clients = await ClientMaster.findAll();
          res.render('employee/hr_report_view',{
            clients,
            permissions
          });
      
  });

  exports.getHRReportModule = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();      
    const {isPreview} = req.query;
    const hr_new = await HRReportNew.findAll({include:[CompanyMaster,ClientMaster]});
    const isFilled = [];
    hr_new.forEach((hr,i) =>{
        isFilled[i]={
            'hr':0,
            'biller':0,
            'supervisor':0,
            'executive':0,
            'backoffice':0,
            'accounts':0,
            'management':0,
        };
        if(hr.agreement || hr.license || hr.special_hr_comments){
            isFilled[i]['hr'] = 1;
        
        }
        if(hr.agreement && hr.license && hr.special_hr_comments){
            isFilled[i]['hr'] = 2;
        }
        if(hr.biller_name || hr.total_number_employee || hr.increase_prev_month || hr.pf_esic_coverage
            || hr.only_esic_coverage || hr.non_covered_employees || hr.basic_salary
            || hr.sub_contractor_system || hr.one_contractor || hr.minimum_wages
            || hr.esic_very_less || hr.actual_payment || hr.billing || hr.employee_codes
            || hr.wage_register || hr.payslip){
            isFilled[i]['biller'] = 1;
        
        }
        if(hr.biller_name && hr.total_number_employee && hr.increase_prev_month && hr.pf_esic_coverage
            && hr.only_esic_coverage && hr.non_covered_employees && hr.basic_salary
            && hr.sub_contractor_system && hr.one_contractor && hr.minimum_wages
            && hr.esic_very_less && hr.actual_payment && hr.billing && hr.employee_codes
            && hr.wage_register && hr.payslip){
            isFilled[i]['biller'] = 2;
        }
        
        if(hr.supervisor_name || hr.supervisor_visit || hr.supervisor_comments){
            isFilled[i]['supervisor'] = 1;
        
        }
        if(hr.supervisor_name && hr.supervisor_visit && hr.supervisor_comments){
            isFilled[i]['supervisor'] = 2;
        }
        
        if(hr.executive_name || hr.documentation_status || hr.visit_done || hr.e_nomination_done
            || hr.e_nomination_pending || hr.aadhar_not_seeded || hr.employee_field
            || hr.serious_problems){
            isFilled[i]['executive'] = 1;
        
        }
        if(hr.executive_name && hr.documentation_status && hr.visit_done && hr.e_nomination_done
            && hr.e_nomination_pending && hr.aadhar_not_seeded && hr.employee_field
            && hr.serious_problems){
            isFilled[i]['executive'] = 2;
        }
        if(hr.back_office_name || hr.form_xvi || hr.software_updated || hr.software_pending
            || hr.pf_claim || hr.pf_jobs || hr.date_of_exit
            || hr.tic_renewal || hr.new_joinee || hr.master_stroke
            || hr.pf_esic_linked || hr.back_office_comments){
            isFilled[i]['backoffice'] = 1;
        
        }
        if(hr.back_office_name && hr.form_xvi && hr.software_updated && hr.software_pending
            && hr.pf_claim && hr.pf_jobs && hr.date_of_exit
            && hr.tic_renewal && hr.new_joinee && hr.master_stroke
            && hr.pf_esic_linked && hr.back_office_comments){
            isFilled[i]['backoffice'] = 2;
        }
        if( hr.less_more || hr.reason_behind_change || hr.statutory_money_came
            || hr.service_charge_came || hr.gst_came || hr.billing2){
            isFilled[i]['accounts'] = 1;
        
        }
        if( hr.less_more && hr.reason_behind_change && hr.statutory_money_came
            && hr.service_charge_came && hr.gst_came && hr.billing2){
            isFilled[i]['accounts'] = 2;
        }
        
        if(hr.special_task || hr.our_observation){
            isFilled[i]['management'] = 1;
        
        }
        if(hr.special_task && hr.our_observation){
            isFilled[i]['management'] = 2;
        }
    })
  
    // console.log(isFilled);
    res.render('employee/hr_report_new',{
            companies,
            isPreview:isPreview,
            hr_new,
            isFilled
          });
      
  });
exports.getHRReport = catchAsyncErrors(async (req, res, next) => {
          res.render('employee/hr_report',{
            message:''
          });
      
  });
exports.postHRReport = catchAsyncErrors(async (req, res, next) => {
    const{
        client,
        month_year,
        executive,
        unit,
        executiveComment,
        manager,
        unit2,
        managerComment,
        report,
        nameCount,
        report2,
        nameCount2,
        comment,
        comment2
    } = req.body;

    //hr report add
    const hr = await HRReport.create({
        client_id:client,
        month:month_year.substr(5,6),
        year:month_year.substr(0,4),
        comment:comment,
        comment2:comment2,
       marathon:req.files.length > 0 ? req.files[0].path : ''
    });
    
    //executive visit add
    if(executive[0]!='' || executive.length>1){
        for(var i=0;i<executive.length;i++){
        await ExecutiveVisitReport.create({
            hr_id:hr.id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            name:executive[i],
            unit:unit[i],
            comment:executiveComment[i],
        });
    }
}

    //manager visit add
    if(manager[0]!='' || manager.length>1){
    for(var i=0;i<manager.length;i++){
        await ManagerVisitReport.create({
            hr_id:hr.id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            name:manager[i],
            unit:unit2[i],
            comment:managerComment[i],
        });
    }
}
    //success stories add
    if(report[0]!='' || report.length>1){
    for(var i=0;i<report.length;i++){
        await SuccessStories.create({
            hr_id:hr.id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            report:report[i],
            name:nameCount[i],
        });
    }
}
    //pending issues add
    if(report2[0]!='' || report2.length>1){
    for(var i=0;i<report2.length;i++){
        await PendingIssues.create({
            hr_id:hr.id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            report:report2[i],
            name:nameCount2[i],
        });
    }
}

    

          res.render('employee/hr_report',{
              message:'Added Successfully'
          });
      
});
exports.searchHRReport = catchAsyncErrors( async (req, res, next) => {
    const {company,client,month_year} = req.body;

    if(company && month_year && client){
        const invoice = await HRReportNew.findAll({where:{
            [Op.and]:[
                {month_year:month_year},
                {company_id:company},
                {client_id:client},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send(invoice);

    }else if(company && !month_year && !client){
        const invoice = await HRReportNew.findAll({where:{
            [Op.or]:[
                {company_id:company},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send(invoice);

    }else if(company && !month_year && client){
        const invoice = await HRReportNew.findAll({where:{
            [Op.and]:[
                {company_id:company},
                {client_id:client}
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send(invoice);

    }
    else if(!company && month_year && !client){
        const invoice = await HRReportNew.findAll({where:{
            [Op.or]:[
                {month_year:month_year},
            ]
        },
        include: [ CompanyMaster,ClientMaster]        
    });    
    res.send(invoice);

    }
  
 
    
});


exports.searchHRReport2 = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    var dd = '';
   
    if(val.includes('-') || val.includes('/')){
        dd = val.substr(6,4) + '-' + val.substr(3,2) + '-' + val.substr(0,2);
    }  
    
    
    const invoice = await HRReportNew.findAll({where:{
        [Op.or]:[
            {month:val},
            {year:val},
            {'$client_master.client_name$':{[Op.substring]:val}},
            {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send(invoice);
    
    
});
exports.postHRReportNew = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        client,
        month_year,
        agreement,
        license,
        special_hr_comments,
        biller_name,
        total_number_employee,
        increase_prev_month,
        pf_esic_coverage,
        only_esic_coverage,
        non_covered_employees,
        basic_salary,
        sub_contractor_system,
        one_contractor,
        minimum_wages,
        esic_very_less,
        actual_payment,
        billing,
        employee_codes,
        wage_register,
        payslip,
        back_office_name,
        form_xvi,
        software_updated,
        software_pending,
        pf_claim,
        pf_jobs,
        date_of_exit,
        tic_renewal,
        new_joinee,
        master_stroke,
        pf_esic_linked,
        back_office_comments,
        executive_name,
        documentation_status,
        visit_done,
        e_nomination_done,
        e_nomination_pending,
        aadhar_not_seeded,
        employee_field,
        serious_problems,
        supervisor_name,
        supervisor_visit,
        supervisor_comments,
        less_more,
        reason_behind_change,
        statutory_money_came,
        service_charge_came,
        gst_came,
        billing2,
        special_task,
        our_observation
    } = req.body;
    const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
    var month = month_year.substr(5,6);
    if(month<=9){
        month = month.substr(1,1);
    }
    const hr_report = await HRReportNew.create({
        company_id:company,
        client_id:client,
        month:monthNames[month-1],
        year:month_year.substr(0,4),
        month_year:month_year,
        agreement,
        license,
        special_hr_comments,
        biller_name,
        total_number_employee,
        increase_prev_month,
        pf_esic_coverage,
        only_esic_coverage,
        non_covered_employees,
        basic_salary,
        sub_contractor_system,
        one_contractor,
        minimum_wages,
        esic_very_less,
        actual_payment,
        billing,
        employee_codes,
        wage_register,
        payslip,
        back_office_name,
        form_xvi,
        software_updated,
        software_pending,
        pf_claim,
        pf_jobs,
        date_of_exit,
        tic_renewal,
        new_joinee,
        master_stroke,
        pf_esic_linked,
        back_office_comments,
        executive_name,
        documentation_status,
        visit_done,
        e_nomination_done,
        e_nomination_pending,
        aadhar_not_seeded,
        employee_field,
        serious_problems,
        supervisor_name,
        supervisor_visit,
        supervisor_comments,
        less_more,
        reason_behind_change,
        statutory_money_came,
        service_charge_came,
        gst_came,
        billing2,
        special_task,
        our_observation
    });

    res.redirect('/employee/hr-report-module?isPreview=true');
});
exports.getHREditNew = catchAsyncErrors(async (req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const hr = await HRReportNew.findByPk(req.query.id,{include:[CompanyMaster,ClientMaster]});
          res.render('employee/hr_report_edit_new',{
            companies,
            hr,
            go:req.query.go
          });
      
  });
  exports.postHREditNew = catchAsyncErrors(async (req, res, next) => {
    const {
        company,
        client,
        month_year,
        agreement,
        license,
        special_hr_comments,
        biller_name,
        total_number_employee,
        increase_prev_month,
        pf_esic_coverage,
        only_esic_coverage,
        non_covered_employees,
        basic_salary,
        sub_contractor_system,
        one_contractor,
        minimum_wages,
        esic_very_less,
        actual_payment,
        billing,
        employee_codes,
        wage_register,
        payslip,
        back_office_name,
        form_xvi,
        software_updated,
        software_pending,
        pf_claim,
        pf_jobs,
        date_of_exit,
        tic_renewal,
        new_joinee,
        master_stroke,
        pf_esic_linked,
        back_office_comments,
        executive_name,
        documentation_status,
        visit_done,
        e_nomination_done,
        e_nomination_pending,
        aadhar_not_seeded,
        employee_field,
        serious_problems,
        supervisor_name,
        supervisor_visit,
        supervisor_comments,
        less_more,
        reason_behind_change,
        statutory_money_came,
        service_charge_came,
        gst_came,
        billing2,
        special_task,
        our_observation,
        id
    } = req.body;
    const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
    var month = month_year.substr(5,6);
    if(month<=9){
        month = month.substr(1,1);
    }
    await HRReportNew.update({
        company_id:company,
        client_id:client,
        month:monthNames[month-1],
        year:month_year.substr(0,4),
        month_year:month_year,
        agreement,
        license,
        special_hr_comments,
        biller_name,
        total_number_employee,
        increase_prev_month,
        pf_esic_coverage,
        only_esic_coverage,
        non_covered_employees,
        basic_salary,
        sub_contractor_system,
        one_contractor,
        minimum_wages,
        esic_very_less,
        actual_payment,
        billing,
        employee_codes,
        wage_register,
        payslip,
        back_office_name,
        form_xvi,
        software_updated,
        software_pending,
        pf_claim,
        pf_jobs,
        date_of_exit,
        tic_renewal,
        new_joinee,
        master_stroke,
        pf_esic_linked,
        back_office_comments,
        executive_name,
        documentation_status,
        visit_done,
        e_nomination_done,
        e_nomination_pending,
        aadhar_not_seeded,
        employee_field,
        serious_problems,
        supervisor_name,
        supervisor_visit,
        supervisor_comments,
        less_more,
        reason_behind_change,
        statutory_money_came,
        service_charge_came,
        gst_came,
        billing2,
        special_task,
        our_observation,
        
    },{where:{id:id}});

    res.redirect('/employee/hr-report-module?isPreview=true');

  });
exports.getHRReportView = catchAsyncErrors(async (req, res, next) => {
    const clients = await ClientMaster.findAll();
          res.render('employee/hr_report_view',{
            clients
          });
      
  });

  exports.hrDownload = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    const hr = await HRReportNew.findByPk(id,{include:[CompanyMaster,ClientMaster]});

    const data = [];
    data.push({
        "" : "HR",
        "." : "AGGREEMENT",
        "..." : "*",
        ".." : hr.agreement,
       
    });
    data.push({
        "" : "HR",
        "." : "LABOUR LICENSE",
        "..." : "*",
        ".." : hr.license,       
    });

    data.push({
        "" : "HR",
        "." : "SPECIAL HR COMMENTS",
        "..." : "",
        ".." : hr.special_hr_comments,       
    });
    //biller 
    // const data2 = [];
    data.push({
        "" : "BILLER",
        "." : "BILLER NAME",
        "..." : "*",
        ".." : hr.biller_name       
    });
    data.push({
        "" : "BILLER",
        "." : "TOTAL NUMBER OF EMPLOYEES IN OUR PAYROLL",
        "..." : "*",
        ".." : hr.total_number_employee       
    });
    data.push({
        "" : "BILLER",
        "." : "INCREASE OR DECREASE FROM PREVIOUS MONTH",
        "..." : "",
        ".." : hr.increase_prev_month       
    });
    data.push({
        "" : "BILLER",
        "." : "EMPLOYEES WITH PF ESIC COVERAGE",
        "..." : "*",
        ".." : hr.pf_esic_coverage       
    });
    data.push({
        "" : "BILLER",
        "." : "EMPLOYEES WITH ONLY ESIC COVERAGE",
        ".." : hr.only_esic_coverage       
    });
    data.push({
        "" : "BILLER",
        "." : "NON-COVERED EMPLOYEES",
        ".." : hr.non_covered_employees       
    });
    data.push({
        "" : "BILLER",
        "." : "BASIC SALARY AS FIXED",
        "..." : "*",
        ".." : hr.basic_salary       
    });
    data.push({
        "" : "BILLER",
        "." : "SUB CONTRACTOR SYSTEM",
        "..." : "*",
        ".." : hr.sub_contractor_system       
    });
    
    data.push({
        "" : "BILLER",
        "." : "ONE CONTRACTOR / TAKING MONEY ON BEHALF OF MANY",
        "..." : "*",
        ".." : hr.one_contractor       
    });
    data.push({
        "" : "BILLER",
        "." : "MINIMUM WAGES ADJUSTMENT",
        "..." : "*",
        ".." : hr.minimum_wages       
    });
    data.push({
        "" : "BILLER",
        "." : "ESIC VERY LESS DAYS ( MAY BE NON JUSTIFIABLE IN TIME OF AUDIT )",
        "..." : "*",
        ".." : hr.esic_very_less       
    });
    data.push({
        "" : "BILLER",
        "." : "ACTUAL PAYMENT MUCH MORE THAN SALARY FIXED AND SO TALLYING WITH VARIABLE INCENTIVES WITHOUR DOX SUPPORT",
        "..." : "*",
        ".." : hr.actual_payment       
    });
    data.push({
        "" : "BILLER",
        "." : "BILLING",
        "..." : "*",
        ".." : hr.billing       
    });
    data.push({
        "" : "BILLER",
        "." : "EMPLOYEE CODES / ADHAR / PF / ESI NUMBER MISSING",
        "..." : "",
        ".." : hr.employee_codes       
    });
    data.push({
        "" : "BILLER",
        "." : "WAGE REGISTER",
        "..." : "",
        ".." : hr.wage_register       
    });
    data.push({
        "" : "BILLER",
        "." : "PAYSLIP",
        "..." : "*",
        ".." : hr.payslip       
    });

    // const data3 = [];
    
    data.push({
        "" : "BACK OFFICE",
        "." : "BACK OFFICE NAME",
        "..." : "*",
        ".." : hr.back_office_name       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "FORM XVI",
        "..." : "*",
        ".." : hr.form_xvi       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "SOFTWARE UPDATED",
        "..." : "",
        ".." : hr.software_updated       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "SOFTWARE PENDING",
        "..." : "",
        ".." : hr.software_pending       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "PF CLAIM RELEASED FROM OUR END",
        "..." : "*",
        ".." : hr.pf_claim       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "PF JOBS DONE THIS MONTH",
        "..." : "*",
        ".." : hr.pf_jobs       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "DATE OF EXIT MARK THIS MONTH",
        "..." : "*",
        ".." : hr.date_of_exit       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "TIC RENEWAL",
        "..." : "*",
        ".." : hr.tic_renewal       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "NEW JOINEE ADMITTED",
        "..." : "",
        ".." : hr.new_joinee       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "PF ESIC LINKED",
        "..." : "",
        ".." : hr.pf_esic_linked       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "MASTER STROKE AND FILE",
        "..." : "",
        ".." : hr.master_stroke       
    });
    data.push({
        "" : "BACK OFFICE",
        "." : "BACK OFFICE COMMENTS",
        "..." : "",
        ".." : hr.back_office_comments       
    });

    // const data = [];
    data.push({
        "" : "EXECUTIVE",
        "." : "EXECUTIVE NAME",
        "..." : "*",
        ".." : hr.executive_name       
    });
    data.push({
        "" : "EXECUTIVE",
        "." : "DOCUMENTATION STATUS",
        "..." : "*",
        ".." : hr.documentation_status       
    });
    data.push({
        "" : "EXECUTIVE",
        "." : "VISITS DONE BY OUR EXECUTIVE DATES IN DETAILS",
        "..." : "*",
        ".." : hr.visit_done       
    });
    data.push({
        "" : "EXECUTIVE",
        "." : "E-NOMINATION DONE",
        "..." : "",
        ".." : hr.e_nomination_done       
    });
    data.push({
        "" : "EXECUTIVE",
        "." : "E-NOMINATION PENDING",
        "..." : "",
        ".." : hr.e_nomination_pending       
    });
    data.push({
        "" : "EXECUTIVE",
        "." : "AADHAR NOT SEEDED",
        "..." : "*",
        ".." : hr.aadhar_not_seeded       
    });
    data.push({
        "" : "EXECUTIVE",
        "." : "EMPLOYEE FIELD / ON SITE PROBLEMS AS ON DATE",
        "..." : "*",
        ".." : hr.employee_field       
    });
    data.push({
        "" : "EXECUTIVE",
        "." : "SERIOUS PROBLEMS AS ON DATE",
        "..." : "*",
        ".." : hr.serious_problems       
    });

    // const data =[];
    data.push({
        "" : "SUPERVISOR",
        "." : "SUPERVISOR NAME",
        "..." : "*",
        ".." : hr.supervisor_name       
    });
    data.push({
        "" : "SUPERVISOR",
        "." : "SUPERVISOR VISIT (IF ANY)",
        "..." : "",
        ".." : hr.supervisor_visit       
    });
    data.push({
        "" : "SUPERVISOR",
        "." : "SUPERVISOR COMMENTS",
        "..." : "",
        ".." : hr.supervisor_comments       
    });
    // const data = [];
    // data.push({
    //     "" : "ACCOUNTS",
    //     "." : "NAME",
    //     ".." : hr.name       
    // });
    data.push({
        "" : "ACCOUNTS",
        "." : "LESS / MORE THIS MONTH",
        "..." : "",
        ".." : hr.less_more       
    });
    data.push({
        "" : "ACCOUNTS",
        "." : "REASON BEHIND CHANGE",
        "..." : "",
        ".." : hr.reason_behind_change       
    });
    data.push({
        "" : "ACCOUNTS",
        "." : "STATUTORY MONEY CAME",
        "..." : "",
        ".." : hr.statutory_money_came       
    });
    data.push({
        "" : "ACCOUNTS",
        "." : "SERVICE CHARGE CAME",
        "..." : "",
        ".." : hr.service_charge_came       
    });
    data.push({
        "" : "ACCOUNTS",
        "." : "GST CAME",
        "..." : "",
        ".." : hr.gst_came       
    });
    data.push({
        "" : "ACCOUNTS",
        "." : "BILLING",
        "..." : "",
        ".." : hr.billing2       
    });
    // const data = [];
    data.push({
        "" : "MANAGEMENT",
        "." : "SPECIAL TASK",
        "..." : "*",
        ".." : hr.special_task       
    });
    data.push({
        "" : "MANAGEMENT",
        "." : "OUR OBSERVATION",
        "..." : "",
        ".." : hr.our_observation       
    });
    const company_name = hr.company_master.company_name;
    const client_name = hr.client_master.client_name;

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "HR", true)
    XLSX.writeFile(wb, `output/Company_Report_${company_name}_${client_name}_${hr.month}_${hr.year}.xlsx`)
    const filePath = path.join(`output/Company_Report_${company_name}_${client_name}_${hr.month}_${hr.year}.xlsx`);
    
    fs.readFile(filePath, (err,data) =>{
        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="Company_Report_${company_name}_${client_name}_${hr.month}_${hr.year}.xlsx"`)  ;  
        res.send(data);
    });

});


  
exports.uploadCompanyReportDocument = catchAsyncErrors(async(req, res, next) => {
    const {companyReportId} = req.body;
    const invoiceFile = req.files[0].path;

    await HRReportNew.update({
        document:invoiceFile
    },{where:{id:companyReportId}});

    res.redirect('/employee/hr-report-module?isPreview=true');

});
  exports.getHRReportsData = catchAsyncErrors(async (req, res, next) => {
        const {
            client,
            month_year
        }= req.body;
        // var month = month_year.substr(5,6) >9 ? month_year.substr(5,6) :  month_year.substr(6,6);
        var permissions;
        if( req.session.permissions){
            permissions= req.session.permissions;
        }
    var isAdmin = false;
    if(permissions.includes('0')){
        isAdmin = true;
    }
        const data = await HRReport.findAll({where:{client_id:client,month:month_year.substr(5,6),year:month_year.substr(0,4)},include:[ClientMaster]});
        res.send({data,isAdmin});
  
      
  });
  exports.hrDownloadPdf = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    const hr = await HRReportNew.findByPk(id,{include:[CompanyMaster,ClientMaster]});
    const invoiceName = 'hr_report_'+ hr.month+'_'+hr.year +'.pdf';
    const invoicePath = path.join('uploads', invoiceName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    const pdfDoc = new PDFDocument();

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];

    pdfDoc.fontSize(12).font('Helvetica-Bold').text('HR Report for the month of '+hr.month+' '+hr.year, 20, 40, {
        align: 'center',
        underline:true,
        width: 550
    });   
    pdfDoc.moveDown();
    pdfDoc.fontSize(10);
    pdfDoc.font('Helvetica-Bold').text('Company : '+hr.company_master.company_name,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica-Bold').text('Client : '+hr.client_master.client_name,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('Agreement : '+hr.agreement,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('License : '+hr.license,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('BILLER NAME : '+hr.biller_name,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('TOTAL NUMBER OF EMPLOYEES IN OUR PAYROLL : '+hr.total_number_employee,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('EMPLOYEES WITH PF ESIC COVERAGE : '+hr.pf_esic_coverage,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('EMPLOYEES WITH ONLY ESIC COVERAGE : '+hr.only_esic_coverage,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('NON-COVERED EMPLOYEES : '+hr.non_covered_employees,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('BASIC SALARY AS FIXED : '+hr.basic_salary,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('SUB CONTRACTOR SYSTEM  : '+hr.sub_contractor_system,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('ONE CONTRACTOR / TAKING MONEY ON BEHALF OF MANY : '+hr.one_contractor,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('MINIMUM WAGES ADJUSTMENT : '+hr.minimum_wages,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('ESIC VERY LESS DAYS ( MAY BE NON JUSTIFIABLE IN TIME OF AUDIT ) : '+hr.esic_very_less,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('ACTUAL PAYMENT MUCH MORE THAN SALARY FIXED AND SO TALLYING WITH VARIABLE INCENTIVES WITHOUR DOX SUPPORT : '+hr.actual_payment,{
        align: 'left',
        width: 550,
        height:60,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('BILLING : '+hr.billing,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('WAGE REGISTER : '+hr.wage_register,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('PAYSLIP : '+hr.payslip,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('BACK OFFICE NAME : '+hr.back_office_name,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('FORM XVI : '+hr.form_xvi,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('PF CLAIM RELEASED FROM OUR END : '+hr.pf_claim,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('PF JOBS DONE THIS MONTH : '+hr.pf_jobs,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('DATE OF EXIT MARK THIS MONTH : '+hr.date_of_exit,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('TIC RENEWAL : '+hr.tic_renewal,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('EXECUTIVE NAME : '+hr.executive_name,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('DOCUMENTATION STATUS : '+hr.documentation_status,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('VISITS DONE BY OUR EXECUTIVE DATES IN DETAILS : '+hr.visit_done,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('AADHAR NOT SEEDED : '+hr.aadhar_not_seeded,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('EMPLOYEE FIELD / ON SITE PROBLEMS AS ON DATE : '+hr.employee_field,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('SERIOUS PROBLEMS AS ON DATE : '+hr.serious_problems,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('SUPERVISOR NAME : '+hr.supervisor_name,{
        align: 'left',
        width: 550,
        underline:false
    });
    pdfDoc.addPage();
    if(hr.document){
        if (fs.existsSync(hr.document)) {
        pdfDoc.image(hr.document, 10, 40, { width: 100, height: 100, align:'left' })
        .rect(10, 40, 100, 100)
        .stroke();
        }    
    }   
    pdfDoc.end();

});
  
  exports.getHRReportEdit = catchAsyncErrors(async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();
    
    const hrReport = await HRReport.findOne({where:{id:req.params.id},include:[ClientMaster]});
    const executive = await ExecutiveVisitReport.findAll({where:{hr_id:req.params.id}});
    const manager = await ManagerVisitReport.findAll({where:{hr_id:req.params.id}});
    const success = await SuccessStories.findAll({where:{hr_id:req.params.id}});
    const pending = await PendingIssues.findAll({where:{hr_id:req.params.id}});
    res.render('employee/hr_report_edit',{
        companies,
        hr:hrReport,
        month_year:hrReport.month > 9 ? hrReport.year+'-'+hrReport.month : hrReport.year+'-0'+hrReport.month ,
        executive,
        manager,
        success,
        pending,
        permissions
    });

  
});


exports.postHRReportEdit = catchAsyncErrors(async (req, res, next) => {
    const{
        id,
        client,
        month_year,
        executive,
        unit,
        executiveComment,
        manager,
        unit2,
        managerComment,
        report,
        nameCount,
        report2,
        nameCount2,
        comment,
        comment2
    } = req.body;

        const oldHr = await HRReport.findOne({
            where:{
                id:id
            }
        });
    //hr report add
    const hr = await HRReport.update({
        client_id:client,
        month:month_year.substr(5,6),
        year:month_year.substr(0,4),
        comment:comment,
        comment2:comment2,
        marathon:req.files.length > 0 ? req.files[0].path : oldHr.marathon,
        user_id:req.session.user.id 
    },{where:{id:id}});
    
    //executive visit add
    await ExecutiveVisitReport.destroy({
       where:{
           hr_id:id
       }
    });
    for(var i=0;i<executive.length;i++){
        await ExecutiveVisitReport.create({
            hr_id:id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            name:executive[i],
            unit:unit[i],
            comment:executiveComment[i],
        });
    }
    await ManagerVisitReport.destroy({
        where:{
            hr_id:id
        }
     });
    //manager visit add
    for(var i=0;i<manager.length;i++){
        await ManagerVisitReport.create({
            hr_id:id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            name:manager[i],
            unit:unit2[i],
            comment:managerComment[i],
        });
    }
    await SuccessStories.destroy({
        where:{
            hr_id:id
        }
     });
    //success stories add
    for(var i=0;i<report.length;i++){
        await SuccessStories.create({
            hr_id:id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            report:report[i],
            name:nameCount[i],
        });
    }
    await PendingIssues.destroy({
        where:{
            hr_id:id
        }
     });
    //pending issues add
    for(var i=0;i<report2.length;i++){
        await PendingIssues.create({
            hr_id:id, 
            client_id:client,
            month:month_year.substr(5,6),
            year:month_year.substr(0,4),
            report:report2[i],
            name:nameCount2[i],
        });
    }

    

    res.render('employee/hr_report',{
        message:'Edited Successfully'
    });
      
});

exports.deleteHR = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await HRReport.destroy({where:{id:id}});
     await ExecutiveVisitReport.destroy({where:{hr_id:id}});
     await ManagerVisitReport.destroy({where:{hr_id:id}});
     await SuccessStories.destroy({where:{hr_id:id}});
     await PendingIssues.destroy({where:{hr_id:id}});
    res.send('Successful');

  
});

exports.downloadHRReport = catchAsyncErrors(async (req, res, next) => {
    
    const hr = await HRReport.findByPk(req.params.id,{include:[ClientMaster]});
    const executive = await ExecutiveVisitReport.findAll({where:{hr_id:req.params.id}});
    const manager = await ManagerVisitReport.findAll({where:{hr_id:req.params.id}});
    const success = await SuccessStories.findAll({where:{hr_id:req.params.id}});
    const pending = await PendingIssues.findAll({where:{hr_id:req.params.id}});
    const client = await ClientMaster.findByPk(hr.client_id,{include:[CompanyMaster]});
    const invoiceName = 'hr_report_'+ hr.month+'_'+hr.year +'.pdf';
    const invoicePath = path.join('uploads', invoiceName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    const pdfDoc = new PDFDocument();

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December" ];

    pdfDoc.fontSize(12).font('Helvetica-Bold').text('HR Report for the month of '+monthNames[hr.month-1]+' '+hr.year, 20, 40, {
        align: 'center',
        underline:true,
        width: 550
    });   
    pdfDoc.moveDown();
    pdfDoc.fontSize(15);
    pdfDoc.font('Helvetica').text('Client : '+client.client_name,{
        align: 'left',
        width: 550,
        underline:false
    });   
    pdfDoc.moveDown();
    pdfDoc.fontSize(10);
if(executive.length>0){
    pdfDoc.font('Helvetica-Bold').text('Executive Visit Report',{
        align: 'left',
        underline:true,
        width: 550
    }); 
    pdfDoc.moveDown();
}
    for(var i =0;i<executive.length;i++){
        if(executive[i].name){
            pdfDoc.font('Helvetica').text('Executive Name : '+executive[i].name,{
                align: 'left',
                underline:false,
                width: 550
            }); 
            pdfDoc.moveDown();
         }
        if(executive[i].unit){
        pdfDoc.font('Helvetica').text('Executive Unit : '+executive[i].unit,{
            align: 'left',
            underline:false,
            width: 550
        }); 
        pdfDoc.moveDown();
    }
    if(executive[i].comment){
        pdfDoc.font('Helvetica').text('Dates : '+executive[i].comment,{
            align: 'left',
            underline:false,
            width: 550
        }); 
        pdfDoc.moveDown();
    }
    }
    if(hr.comment){
    pdfDoc.text('Comment : '+hr.comment,{
        align: 'left',
        underline:false,
        width: 550,
        height:70
    }); 
    pdfDoc.moveDown();
}
if(manager.length>0){
    pdfDoc.font('Helvetica-Bold').text('Manager Visit Report',{
        align: 'left',
        underline:true,
        width: 550
    }); 
    pdfDoc.moveDown();
}
    for(var i =0;i<manager.length;i++){
    if(manager[i].name){
        pdfDoc.font('Helvetica').text('Manager Name : '+manager[i].name,{
            align: 'left',
            underline:false,
            width: 550
        }); 
        pdfDoc.moveDown();
    }
    if(manager[i].unit){
        pdfDoc.font('Helvetica').text('Manager Unit : '+manager[i].unit,{
            align: 'left',
            underline:false,
            width: 550
        }); 
        pdfDoc.moveDown();
    }
    if(manager[i].comment){
        pdfDoc.font('Helvetica').text('Dates : ' +manager[i].comment,{
            align: 'left',
            underline:false,
            width: 550
        }); 
        pdfDoc.moveDown();
    }
    }
    if(success.length>0){
    pdfDoc.font('Helvetica-Bold').text('Success Stories ',{
        align: 'left',
        underline:true,
        width: 550
    }); 
    pdfDoc.moveDown();
}
    for(var i =0;i<success.length;i++){
    if(success[i].report){
        pdfDoc.font('Helvetica').text('Report Details : '+success[i].report,{
            align: 'left',
            underline:false,
            width: 550
        }); 
        pdfDoc.moveDown();   
    }
    if(success[i].name){
        pdfDoc.font('Helvetica').text('Name/Count : '+success[i].name,{
            align: 'left',
            underline:false,
            width: 550
        }); 
        pdfDoc.moveDown();        
    }      
    }
    if(pending.length>0){
    pdfDoc.font('Helvetica-Bold').text('Pending Issues ',{
        align: 'left',
        underline:true,
        width: 550
    }); 
    pdfDoc.moveDown();
}
    for(var i =0;i<pending.length;i++){
    if(pending[i].report){
        pdfDoc.font('Helvetica').text('Report Details : '+pending[i].report,{
            align: 'left',
            underline:false,
            width: 550
        }); 
        pdfDoc.moveDown();     
    }
    if(pending[i].name){
        pdfDoc.font('Helvetica').text('Name/Count : '+pending[i].name,{
            align: 'left',
            underline:false,
            width: 550
        }); 
        pdfDoc.moveDown();  
    }    
    }
    if(hr.comment2){
    pdfDoc.text('Comment : '+hr.comment2,{
        align: 'left',
        underline:false,
        width: 550,
        height:70
    }); 
    pdfDoc.moveDown();
}
    pdfDoc.end();
    
  
});
exports.downloadHRReportFile = catchAsyncErrors(async (req,res,next) =>{
    const hr = await HRReport.findByPk(req.params.id,{include:[ClientMaster]});
   
    fs.readFile(hr.marathon, (err,data) =>{
        res.setHeader('Content-Type','application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${hr.marathon.substr(8)}"`)  ;  
    res.send(data);
    });
});