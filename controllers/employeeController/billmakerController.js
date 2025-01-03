const catchAsyncErrors = require("../../utils/catchAsyncErrors");
const Sequelize = require("sequelize");

const Op = Sequelize.Op;
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path');
const XLSX = require('xlsx');
const readXlsxFile = require('read-excel-file/node');
const CompanyMaster = require("../../models/admin/company_master");
const BillMaker = require("../../models/admin/bill_maker");
const ClientMaster = require("../../models/admin/client_master");

const PDFDocument2 = require("pdfkit-table");
const BillMakerMaster = require("../../models/admin/bill_maker_master");
const ClientAddress = require("../../models/admin/client_addresses");
const InvoiceGenerator = require("../../models/admin/invoice_generator");
const DigitalInvoice = require("../../models/admin/digital_invoice");

exports.getBillMakerModule = catchAsyncErrors(async(req, res, next) => {
   
    res.render('employee/bill_maker_module');
   
});
exports.getBillMaker = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const billMakers = await BillMakerMaster.findAll({include:[CompanyMaster,ClientMaster]});
    const {isPreview} = req.query;
    res.render('employee/bill_maker_tab',{
            companies,
            message:'',
            billMakers,
            show:false,
            isPreview:isPreview
        });
   
});

exports.postBillMaker = catchAsyncErrors(async(req, res, next) => {
    const {
        company,
        client,
        address,
        month_year
        } = req.body;
    
    const bill = await BillMakerMaster.create({
        company_id:company,
        client_id:client,
        client_address_id:address,
        month_year:month_year,
        document:req.files[0].path
    });
    const delay = (n) => new Promise( r => setTimeout(r, n*1000));
    const rows = await readXlsxFile('uploads/' + req.files[0].filename);      
    rows.shift(); 
    if(rows[0][0]=="SL NO") rows.shift(); 
    if(rows[0][0]=="SL NO") rows.shift(); 
    var lastSL = rows.length;
    var lastElement;
    rows.forEach(async element => {
        if(element[1]=="TOTAL" ){
            lastElement = element;
        }else if(element[1]){
            await BillMaker.create({
                sl_no:parseInt(element[0]),
                name:element[1],
                company_id:company,
                bill_maker_id:bill.id,
                client_id:client,
                month_year:month_year,
                aadhaar:element[2],
                uan:element[3],
                esic_no:element[4],
                gender:element[5],
                emp_code:element[6],
                designation:element[7],
                bank:element[8],
                ac_no:element[9],
                ifsc:element[10],
                gross_salary:element[11],
                basic_salary:element[12],
                hra:element[13],
                present_days:element[14],
                holidays:element[15],
                odd_hours:element[16],
                absent:element[17],
                total_days:element[18],
                prop_gross:element[19],
                ot_rate:element[20],
                ot_hour:element[21],
                ot_amount:element[22],
                minor_r:element[23],
                variable_incentive:element[24],
                actual_pay:element[25],
                prop_basic:element[26],
                pf:element[27],
                esic:element[28],
                ptax:element[29],
                lwf:element[30],
                advance:element[31],
                net_pay:element[32],
                mgmt_pf:element[33],
                mgmt_esic:element[34],
                mgmt_lwf:element[35],
                ctc:element[36],
                production_incentive:element[37],
                gross_incentive:element[38],
                invoice_amount1:element[39],
                invoice_amount2:element[40],
                service_charge:element[41],
                cost_of_contract:element[42],
                cost_of_contract2:element[43],
                status:1            
            });   
            await delay(10);         
        }        
    });
    await BillMaker.create({
        sl_no:parseInt(lastSL),
        name:lastElement[1],
        company_id:company,
        bill_maker_id:bill.id,
        client_id:client,
        month_year:month_year,
        aadhaar:lastElement[2],
        uan:lastElement[3],
        esic_no:lastElement[4],
        gender:lastElement[5],
        emp_code:lastElement[6],
        designation:lastElement[7],
        bank:lastElement[8],
        ac_no:lastElement[9],
        ifsc:lastElement[10],
        gross_salary:lastElement[11],
        basic_salary:lastElement[12],
        hra:lastElement[13],
        present_days:lastElement[14],
        holidays:lastElement[15],
        odd_hours:lastElement[16],
        absent:lastElement[17],
        total_days:lastElement[18],
        prop_gross:lastElement[19],
        ot_rate:lastElement[20],
        ot_hour:lastElement[21],
        ot_amount:lastElement[22],
        minor_r:lastElement[23],
        variable_incentive:lastElement[24],
        actual_pay:lastElement[25],
        prop_basic:lastElement[26],
        pf:lastElement[27],
        esic:lastElement[28],
        ptax:lastElement[29],
        lwf:lastElement[30],
        advance:lastElement[31],
        net_pay:lastElement[32],
        mgmt_pf:lastElement[33],
        mgmt_esic:lastElement[34],
        mgmt_lwf:lastElement[35],
        ctc:lastElement[36],
        production_incentive:lastElement[37],
        gross_incentive:lastElement[38],
        invoice_amount1:lastElement[39],
        invoice_amount2:lastElement[40],
        service_charge:lastElement[41],
        cost_of_contract:lastElement[42],
        cost_of_contract2:lastElement[43],
        status:1            
    }); 
    const companies = await CompanyMaster.findAll();
    const billMaker = await BillMakerMaster.findOne({include:[CompanyMaster,ClientMaster], 
        order: [ [ 'id', 'DESC' ]],
        limit:1});
        const billMakers = await BillMakerMaster.findAll({include:[CompanyMaster,ClientMaster]});

        res.render('employee/bill_maker_tab',{
            companies,
            message:'Uploaded Successfully',
            show:true,
            billMakers,
            billMaker,
            isPreview:false,
            isBulk:false

        });
   
});
exports.getBillMakerWork = catchAsyncErrors(async (req,res,next)=>{
    const {id} = req.params;
    const companies = await CompanyMaster.findAll();
    const billMaker = await BillMakerMaster.findOne({where:{id:id},include:[CompanyMaster,ClientMaster]});
    const billMakers = await BillMakerMaster.findAll({include:[CompanyMaster,ClientMaster]});

        res.render('employee/bill_maker_tab',{
            companies,
            message:'Work Loaded Successfully',
            show:true,
            billMakers,
            billMaker,
            isPreview:false,
            isBulk:false

        });
});
exports.postGeneration = catchAsyncErrors(async(req, res, next) => {
    const {
        type,
        fields,
        type2,
        bill_maker_id,
    } = req.body; 
    const fieldss = fields.join(",");
        //pdf
    await BillMaker.update({
        selected_fields:fieldss
        },{
        where:{
        bill_maker_id:bill_maker_id
        },logging:console.log});
    const billMaker = await BillMaker.findAll({where:{
        bill_maker_id:bill_maker_id,
         status:1
        },
        order: [ [ 'sl_no', 'ASC' ]],
        include:[CompanyMaster,ClientMaster]});
        
    const billMakerMaster = await BillMakerMaster.findAll({where:{
        id:bill_maker_id        },
        // order: [ [ 'sl_no', 'ASC' ]],
        include:[CompanyMaster,ClientMaster]});
        console.log(billMakerMaster[0].client_address_id,'---------------');
        let client;
        if(billMakerMaster[0].client_address_id!=0 && billMakerMaster[0].client_address_id!=undefined){
            client = await ClientAddress.findAll({where:{id:billMakerMaster[0].client_address_id}});
        }else{
            client = await ClientAddress.findAll({where:{client_id:billMaker[0].client_id}});
        }
        var monthNames = [ "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December" ]; 
        var aa = billMaker[0].month_year.substr(5,6);
        if(aa<9){
          aa = billMaker[0].month_year.substr(6,6);
        }
        var mm =  monthNames[aa-1];
        // console.log(billMaker);
    if(type2==1){
        var invoiceName='';
       
        if(type==1){
            invoiceName = 'wage_register_'+ mm+'_'+ billMaker[0].month_year.substr(0,4) +'.pdf';
        }
        else{
            invoiceName = 'payslip_'+ mm+'_'+ billMaker[0].month_year.substr(0,4) +'.pdf';
        }

        const invoicePath = path.join('uploads', invoiceName);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
        let pdfDoc='';
        var sizee2 = fields.length * 72;

        if(type==1){
         pdfDoc = new PDFDocument2({
            size: [sizee2,1250],
            margins : { 
                top: 10,
               bottom:0,
                left: 10,
              right: 10
            }
        }); 
    }else{
        // pdfDoc = new PDFDocument2({
        //     size: [sizee2,400],
        //     margins : { 
        //         top: 10,
        //        bottom:10,
        //         left: 10,
        //       right: 10
        //     }
        // }); 
        pdfDoc = new PDFDocument2({size:'A4'});
    }
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        var rows2=[];
        var size=[];
        var total=[];
        for(let i=0;i<billMaker.length;i++){
        var rows=[];
        var h = [];
        var h2 = [];
        var r=[];
        if(fields.includes('name')){
            h.push('Name \n Of \n The \n Worker');
            h2.push('Name Of The Worker');
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].name ? billMaker[i].name : '');
            else
                total.push(billMaker[i].name);
            size.push(120);
        }
    
        if(fields.includes('emp_code')){
            h.push('EMPLOYEE \n CODE');
            h2.push('EMPLOYEE CODE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].emp_code ? billMaker[i].emp_code : ''); 
            else
                total.push(billMaker[i].emp_code ? billMaker[i].emp_code : '');
        }
    
        if(fields.includes('gender')){
            h.push('GENDER');
            h2.push('GENDER');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].gender ? billMaker[i].gender : ''); 
            else
                total.push(billMaker[i].gender ? billMaker[i].gender : '');
        }
            
        if(fields.includes('aadhaar')){    
        h.push('AADHAR NO');
        h2.push('AADHAR NO');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].aadhaar ? billMaker[i].aadhaar : ''); 
            else
                total.push(billMaker[i].aadhaar ? billMaker[i].aadhaar : '');
        }  
        
        if(fields.includes('uan')){        
            h.push('UAN NO');
            h2.push('UAN NO');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].uan ? billMaker[i].uan : ''); 
            else
            total.push(billMaker[i].uan ? billMaker[i].uan : ''); 
        }
            
        if(fields.includes('esic_no')){
            h.push('ESIC NO');
            h2.push('ESIC NO');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].esic_no ? billMaker[i].esic_no : ''); 
            else
            total.push(billMaker[i].esic_no ? billMaker[i].esic_no : ''); 
        }
        
        if(fields.includes('designation')){
            h.push('DESIGNATION');
            h2.push('DESIGNATION');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].designation ? billMaker[i].designation : ''); 
            else
            total.push(billMaker[i].designation ? billMaker[i].designation : ''); 
        }
            
        if(fields.includes('bank')){
            h.push('BANK');
            h2.push('BANK');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].bank ? billMaker[i].bank : ''); 
            else
            total.push(billMaker[i].bank ? billMaker[i].bank : ''); 
        }
        
        if(fields.includes('ac_no')){
            h.push('A/C NO');
            h2.push('A/C NO');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].ac_no ? billMaker[i].ac_no : ''); 
            else
            total.push(billMaker[i].ac_no ? billMaker[i].ac_no : ''); 
        }
            
        if(fields.includes('ifsc')){
            h.push('IFSC');
            h2.push('IFSC');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].ifsc ? billMaker[i].ifsc : ''); 
            else
            total.push(billMaker[i].ifsc ? billMaker[i].ifsc : ''); 
        }      
        
        if(fields.includes('gross_salary')){
            h.push('GROSS \n SALARY');
            h2.push('GROSS SALARY');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].gross_salary ? billMaker[i].gross_salary : ''); 
            else
            total.push(billMaker[i].gross_salary ? billMaker[i].gross_salary : ''); 
        } 
            
        if(fields.includes('basic_salary')){
            h.push('BASIC \n SALARY');
            h2.push('BASIC SALARY');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].basic_salary ? billMaker[i].basic_salary : ''); 
            else
            total.push(billMaker[i].basic_salary ? billMaker[i].basic_salary : ''); 
        }      
        if(fields.includes('hra')){
            h.push('HRA');
            h2.push('HRA');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].hra ? billMaker[i].hra : ''); 
            else
            total.push(billMaker[i].hra ? billMaker[i].hra : ''); 
        }      
        if(fields.includes('present_days')){
            h.push('PRESENT \n DAYS');
            h2.push('PRESENT DAYS');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].present_days ? billMaker[i].present_days : ''); 
            else
            total.push(billMaker[i].present_days ? billMaker[i].present_days : ''); 
        }      
        if(fields.includes('holidays')){
            h.push('HOLIDAYS \n ( WEEKLY \n + FESTIVE )');
            h2.push('HOLIDAYS ( WEEKLY + FESTIVE )');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].holidays ? billMaker[i].holidays : ''); 
            else
            total.push(billMaker[i].holidays ? billMaker[i].holidays : ''); 
        }                  
        if(fields.includes('odd_hours')){
            h.push('PAID \n LEAVE / \n LEAVE \n ADJUSTMENT');
            h2.push('PAID LEAVE / LEAVE ADJUSTMENT');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].odd_hours ? billMaker[i].odd_hours : ''); 
            else
            total.push(billMaker[i].odd_hours ? billMaker[i].odd_hours : ''); 
        } 
        if(fields.includes('absent')){
            h.push('ABSENT');
            h2.push('ABSENT');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].absent ? billMaker[i].absent : ''); 
            else
            total.push(billMaker[i].absent ? billMaker[i].absent : ''); 
        }      
        if(fields.includes('total_days')){
            h.push('TOTAL DAYS');
            h2.push('TOTAL DAYS');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].total_days ? billMaker[i].total_days : ''); 
            else
            total.push(billMaker[i].total_days ? billMaker[i].total_days : ''); 
        }      
        if(fields.includes('prop_gross')){
            h.push('PROP GROSS');
            h2.push('PROP GROSS');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].prop_gross ? billMaker[i].prop_gross : '');  
            else
            total.push(billMaker[i].prop_gross ? billMaker[i].prop_gross : '');  
        }      
        if(fields.includes('ot_rate')){
            h.push('OT RATE');
            h2.push('OT RATE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].ot_rate ? billMaker[i].ot_rate : ''); 
            else
            total.push(billMaker[i].ot_rate ? billMaker[i].ot_rate : ''); 
        }      
        if(fields.includes('ot_hour')){
            h.push('OT HOURS');
            h2.push('OT HOURS');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].ot_hour ? billMaker[i].ot_hour : ''); 
            else
            total.push(billMaker[i].ot_hour ? billMaker[i].ot_hour : ''); 
        }      
        if(fields.includes('ot_amount')){
            h.push('OT AMOUNT');
            h2.push('OT AMOUNT');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].ot_amount ? billMaker[i].ot_amount : ''); 
            else
            total.push(billMaker[i].ot_amount ? billMaker[i].ot_amount : ''); 
        }      
        if(fields.includes('minor_r')){
            h.push('MINOR \n REIMBURSEMENT');
            h2.push('MINOR REIMBURSEMENT');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].minor_r ? billMaker[i].minor_r : ''); 
            else
            total.push(billMaker[i].minor_r ? billMaker[i].minor_r : ''); 
        }      
        if(fields.includes('variable_incentive')){
            h.push('SPECIAL \n INCENTIVE \n(AS PER \n PRINCIPAL \n EMPLOYER \n DISCRETION)');
            h2.push('SPECIAL INCENTIVE(AS PER PRINCIPAL EMPLOYER DISCRETION)');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''); 
            else
            total.push(billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''); 
        }      
        if(fields.includes('actual_pay')){
            h.push('ACTUAL \n PAY');
            h2.push('ACTUAL PAY');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].actual_pay ? billMaker[i].actual_pay : ''); 
            else
            total.push(billMaker[i].actual_pay ? billMaker[i].actual_pay : ''); 
        }      
        if(fields.includes('prop_basic')){
            h.push('PROP \n BASIC');
            h2.push('PROP BASIC');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].prop_basic ? billMaker[i].prop_basic : ''); 
            else
            total.push(billMaker[i].prop_basic ? billMaker[i].prop_basic : ''); 
        }      
        if(fields.includes('pf')){
            h.push('PF');
            h2.push('PF');
            size.push(65);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].pf ? billMaker[i].pf : ''); 
            else
            total.push(billMaker[i].pf ? billMaker[i].pf : ''); 
        }      
        if(fields.includes('esic')){
            h.push('ESIC');
            h2.push('ESIC');
            size.push(65);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].esic ? billMaker[i].esic : ''); 
            else
            total.push(billMaker[i].esic ? billMaker[i].esic : ''); 
        }      
        if(fields.includes('ptax')){
            h.push('PTAX');
            h2.push('PTAX');
            size.push(65);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].ptax ? billMaker[i].ptax : ''); 
            else
            total.push(billMaker[i].ptax ? billMaker[i].ptax : ''); 
        }      
        if(fields.includes('lwf')){
            h.push('LWF');
            h2.push('LWF');
            size.push(65);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].lwf ? billMaker[i].lwf : ''); 
            else
            total.push(billMaker[i].lwf ? billMaker[i].lwf : ''); 
        }      
        if(fields.includes('advance')){
            h.push('ADVANCE/ DEDUCTION');
            h2.push('ADVANCE/ DEDUCTION');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].advance ? billMaker[i].advance : ''); 
            else
            total.push(billMaker[i].advance ? billMaker[i].advance : ''); 
        }          
        if(fields.includes('net_pay')){
            h.push('NET \n PAY');
            h2.push('NET PAY');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].net_pay ? billMaker[i].net_pay : ''); 
            else
            total.push(billMaker[i].net_pay ? billMaker[i].net_pay : ''); 
        }      
        if(fields.includes('mgmt_pf')){
            h.push('MGMT \n PF');
            h2.push('MGMT PF');
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ''); 
            else
            total.push(billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ''); 
        }      
        if(fields.includes('mgmt_esic')){
            h.push('MGMT \n ESIC');
            h2.push('MGMT ESIC');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ''); 
            else
            total.push(billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ''); 
        }      
        if(fields.includes('mgmt_lwf')){
            h.push('MGMT \n LWF');
            h2.push('MGMT LWF');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ''); 
            else
            total.push(billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ''); 
        }      
        if(fields.includes('ctc')){
            h.push('CTC');
            h2.push('CTC');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].ctc ? billMaker[i].ctc : ''); 
            else
            total.push(billMaker[i].ctc ? billMaker[i].ctc : ''); 
        }      
        if(fields.includes('production_incentive')){
            h.push('PRODUCTION \n OR \n VARIABLE \n INCENTIVE');
            h2.push('PRODUCTION OR VARIABLE INCENTIVE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].production_incentive ? billMaker[i].production_incentive : ''); 
            else
            total.push(billMaker[i].production_incentive ? billMaker[i].production_incentive : ''); 
        }      
        if(fields.includes('gross_incentive')){
            h.push('ACTUAL \n PAYABLE');
            h2.push('ACTUAL PAYABLE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')
            r.push(billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ''); 
            else
            total.push(billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ''); 
        }      
        // if(fields.includes('invoice_amount1')){
        //     h.push('INVOICE AMOUNT1');
        //     h2.push('INVOICE AMOUNT1');
        //     size.push(70);
        //     r.push(billMaker[i].invoice_amount1 ? billMaker[i].invoice_amount1 : ''); 
        // }      
        // if(fields.includes('invoice_amount2')){
        //     h.push('INVOICE \n AMOUNT2');
        //     h2.push('INVOICE AMOUNT2');
        //     size.push(70);
        //     r.push(billMaker[i].invoice_amount2 ? billMaker[i].invoice_amount2 : ''); 
        // }      
        // if(fields.includes('service_charge')){
        //     h.push('SERVICE \n CHARGE');
        //     h2.push('SERVICE CHARGE');
        //     size.push(70);
        //     r.push(billMaker[i].service_charge ? billMaker[i].service_charge : ''); 
        // }      
        // if(fields.includes('cost_of_contract')){
        //     h.push('COST OF \n CONTRACT \n STAFFING \n SERVICES \n 1');
        //     h2.push('COST OF CONTRACT STAFFING SERVICES 1');
        //     size.push(80);
        //     r.push(billMaker[i].cost_of_contract ? billMaker[i].cost_of_contract : ''); 
        // }      
        // if(fields.includes('cost_of_contract2')){
        //     h.push('COST OF \n CONTRACT \n STAFFING \n SERVICES \n 2');
        //     h2.push('COST OF CONTRACT STAFFING SERVICES 2');
        //     size.push(80);
        //     r.push(billMaker[i].cost_of_contract2 ? billMaker[i].cost_of_contract2 : ''); 
        // }  
       rows.push(r);
       rows2.push(r);
       let table='';
       if(type==2){        
        // table = {
        //     title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
        //      "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
        //     'WAGE SLIP : '+ ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
        //     // subtitle: "Subtitle",
        //     headers: h,
        //     rows: rows,
        //     divider: {
        //         header: { disabled: false, width: 2, opacity: 1 },
        //         horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
        //       },
        //   };
    
      // A4 595.28 x 841.89 (portrait) (about width sizes)
      // width
    pdfDoc.fontSize(12);
      
    
    //   await pdfDoc.table(table, { 
    //     // width: 2100,
    // columnsSize: [
    //     120, 70, 70, 70, 70, 70, 70, 70, 70,
    //      70, 70, 70, 70, 70, 70, 70, 70, 70,
    //      70, 70, 65, 65, 65, 65, 70, 70, 70,
    //      70, 70, 70, 70, 70, 70, 70, 80, 80,
    //      70, 70, 70, 70, 70, 70, 70, 80, 80,
    //   ],
    // columnSpacing: 16, 
    // height:200,
    // rowSpacing: 15, 
    // prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
    //     prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),

    //   });
    
    pdfDoc.registerFont('bengali', path.join('utils','kalpurush.ttf'));
    pdfDoc.registerFont('hindi', path.join('utils','hindi.ttf'));
       pdfDoc.font('Helvetica-Bold').text('PAYSLIP / ',150,25,{
        align:'left',
        width: 600,
        height:60,
        continued:true,
        lineBreak:false
       }).font('bengali').text('পেস্লিপ / ',{

        continued:true,
        lineBreak:false

       }).font('hindi').text('वेतन पर्ची',{

        continued:true,
        lineBreak:false

       }).font('bengali').text(' for the month of ' + mm.toUpperCase() + ' ' +billMaker[0].month_year.substr(0,4),{
        continued:false,
      
       }); 

       if(billMaker[0].company_master.logo){
        if (fs.existsSync(billMaker[0].company_master.logo)) {
        pdfDoc.image(billMaker[0].company_master.logo, 8, 40, { width: 20, height: 20, align:'left' })
        .rect(8, 40, 20, 20)
        .stroke();
        }
    }   
       pdfDoc.text('CONTRACTOR / ঠিকাদার /',40,45,{
        align:'left',
        width: 250,
        height:60,
        underline:true,
        continued:true,
        lineBreak:false
       }).font('hindi').text(' ठेकेदार',{
        
        // continued:true,
        lineBreak:false

       }); 
       pdfDoc.font('Helvetica').text(billMaker[0].company_master.company_name,10,70,{
        align:'left',
        width: 250,
        height:60,

        underline:false
       }); 
       pdfDoc.fontSize(10);

       pdfDoc.text(billMaker[0].company_master.address,pdfDoc.x,pdfDoc.y+10,{
        align:'left',
        width: 250,
        height:60,

       }); 
        pdfDoc.fontSize(12);
        
       pdfDoc.font('bengali').text('PRINCIPAL EMPLOYER / প্রধান নিয়োগকর্তা /',pdfDoc.x+270,45,{
        align:'left',
        width: 290,
        height:10,
        underline:true,
        continued:true,
        lineBreak:false
       }).font('hindi').text(' प्रधान नियोक्ता',{
        
        // continued:true,
        lineBreak:false

       }); 
       pdfDoc.font('Helvetica').text(billMaker[0].client_master.client_name,pdfDoc.x,70,{
        align:'left',
        width: 300,
        height:10,
        underline:false
       }); 

       pdfDoc.fontSize(10);

       pdfDoc.text(client[0].address,pdfDoc.x,pdfDoc.y+10,{
        align:'left',
        width: 250,
        height:60,
       }); 
       pdfDoc.moveDown();
       pdfDoc.moveDown();

       pdfDoc.text('_________________________________________________________________________________________________________',10,pdfDoc.y,{
        align:'left',
        width: 600,
        height:60,
       }); 
       pdfDoc.moveDown();
       pdfDoc.fontSize(10);
       var heighh = pdfDoc.y;
       
       pdfDoc.font('bengali').text('General Information / ',{
        align:'left',
        width: 250,
        height:60,
        underline:true,
        continued:true,
        lineBreak:false
       }).font('bengali').text('সাধারণ জ্ঞাতব্য / ',{
        continued:true,
        lineBreak:false
       }).font('hindi').text('सामान्य जानकारी',{
       }); 
       pdfDoc.moveDown();
       var totalGap=pdfDoc.y;
       pdfDoc.fontSize(9);

       if(fields.includes('name')){
        pdfDoc.font('bengali').text('Name / নাম / ' ,{
            align:'left',
            width: 250,
            height:60,
            underline:false,
        continued:true,
        lineBreak:false
       }).font('hindi').text('नाम : ',{
        continued:true,
        lineBreak:false
       }).font('Helvetica-Bold').text( (billMaker[i].name ? billMaker[i].name : ''),{
        continued:false,
   
    }); 
       pdfDoc.moveDown();
       totalGap++;
       if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
    }
       if(fields.includes('aadhaar')){
        pdfDoc.font('bengali').text('Aadhar No / আধার /  ' ,{
            align:'left',
            width: 300,
            height:60,
            continued:true,
        lineBreak:false
       }).font('hindi').text('आधार : ',{
        continued:true,
        lineBreak:false
       }).font('Helvetica-Bold').text(billMaker[i].aadhaar ? billMaker[i].aadhaar : ' ',{
        continued:false,
  
    }); 

       pdfDoc.moveDown();
    //    totalGap++;
       if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;

    }
    if(fields.includes('gender')){
        pdfDoc.font('bengali').text('GENDER / লিঙ্গ /  ' ,{
            align:'left',
            width: 300,
            height:60,
            continued:true,
        lineBreak:false
       }).font('hindi').text('लिंग : ',{
        continued:true,
        lineBreak:false
       }).font('Helvetica-Bold').text(billMaker[i].gender ? billMaker[i].gender : ' ',{
        continued:false,
  
    }); 

       pdfDoc.moveDown();
    //    totalGap++;
       if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;

    }
    if(fields.includes('uan')){
            pdfDoc.font('bengali').text('UAN NO / ইউএএন / ' ,{
                align:'left',
                width: 300,
                height:60,
                continued:true,
            lineBreak:false
           }).font('hindi').text('यूएएन न : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].uan ? billMaker[i].uan : ' '),{
        
            continued:false,
        }); 
           pdfDoc.moveDown();
        //    totalGap++;
           if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;

        }
        if(fields.includes('esic_no')){
            pdfDoc.font('bengali').text('ESIC NO / ইএসআইসি নং / ',{
                align:'left',
                width: 300,
                height:60,
                continued:true,
                lineBreak:false
               }).font('hindi').text('ईएसआईसी सं : ',{
                continued:true,
                lineBreak:false
               }).font('Helvetica-Bold').text( (billMaker[i].esic_no ? billMaker[i].esic_no : ' '),{
                continued:false,
    
               }); 
        //    totalGap++;
           pdfDoc.font('Helvetica');
    
           pdfDoc.moveDown();
       if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;

        }
    //    if(fields.includes('uan')){
    //     pdfDoc.text('UAN NO / ইউএএন / ' ,{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         continued:true,
    //     lineBreak:false
    //    }).font('hindi').text('यूएएन : ',{
    //     continued:true,
    //     lineBreak:false
    //    }).font('bengali').text( (billMaker[i].uan ? billMaker[i].uan : ''),{
    //    }); 
    //    totalGap++;
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('esic_no')){
    //     pdfDoc.text('ESIC NO : ' ,{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         continued:true,
    //     lineBreak:false
    //    }).font('hindi').text('आधार : ',{
    //     continued:true,
    //     lineBreak:false
    //    }).font('bengali').text( (billMaker[i].esic_no ? billMaker[i].esic_no : ''),{
    //    }); 
    //    totalGap++;
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('gender')){
    //     pdfDoc.text('Gender : ' + (billMaker[i].gender ? billMaker[i].gender : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         continued:true,
    //     lineBreak:false
    //    }).font('hindi').text('आधार : ',{
    //     continued:true,
    //     lineBreak:false
    //    }).font('bengali').text( (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
    //    }); 
    //    totalGap++;
    //    pdfDoc.moveDown();

    //    }
       if(fields.includes('emp_code')){
        pdfDoc.font('bengali').text('Emp Code / Emp কোড / ' ,pdfDoc.x+280,heighh+20,{
            align:'left',
            width: 300,
            height:60,
            continued:true,
        lineBreak:false
       }).font('hindi').text('ईएमपी कोड : ',{
        continued:true,
        lineBreak:false
       }).font('Helvetica-Bold').text( (billMaker[i].emp_code ? billMaker[i].emp_code : ' '),{
        continued:false,

       }); 
     

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
    //    totalGap--;
    }

       if(fields.includes('designation')){
        pdfDoc.font('bengali').text('Designation / উপাধি / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('पद : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].designation ? billMaker[i].designation : ' '),{
            continued:false,

           }); 
    //    totalGap--;

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
    }
   
    if(fields.includes('bank')){
        pdfDoc.font('bengali').text('BANK NAME / ব্যাংকের নাম / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('बैंक का नाम : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].bank ? billMaker[i].bank : ' '),{
            continued:false,

           }); 
    //    totalGap--;

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
    }
    
    if(fields.includes('ac_no')){
        pdfDoc.font('bengali').text('BANK ACCOUNT / ব্যাংক হিসাব / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('बैंक खाता : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].ac_no ? billMaker[i].ac_no : ' '),{
            continued:false,

           }); 
    //    totalGap--;

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
    }
    
    if(fields.includes('ifsc')){
        pdfDoc.font('bengali').text('IFSC / IFSC কোড / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('आईएफएससी कोड : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].ifsc ? billMaker[i].ifsc : ' '),{
            continued:false,

           }); 
    //    totalGap--;

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
    }
    //    if(fields.includes('bank')){
    //     pdfDoc.text('Bank : ' + (billMaker[i].bank ? billMaker[i].bank : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         continued:true,
    //     lineBreak:false
    //    }).font('hindi').text('आधार : ',{
    //     continued:true,
    //     lineBreak:false
    //    }).font('bengali').text( (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
    //    }); 
    //    totalGap--;
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('ac_no')){
    //     pdfDoc.text('A/C No : ' + (billMaker[i].ac_no ? billMaker[i].ac_no : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         continued:true,
    //         lineBreak:false
    //        }).font('hindi').text('आधार : ',{
    //         continued:true,
    //         lineBreak:false
    //        }).font('bengali').text( (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
    //        }); 
    //    totalGap--;
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('ifsc')){
    //     pdfDoc.text('IFSC : ' + (billMaker[i].ifsc ? billMaker[i].ifsc : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         continued:true,
    //     lineBreak:false
    //    }).font('hindi').text('आधार : ',{
    //     continued:true,
    //     lineBreak:false
    //    }).font('bengali').text( (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
    //    }); 
    //    pdfDoc.moveDown();
    //    totalGap--;

    //    }
    pdfDoc.font('Helvetica');
    // // console.log(totalGap);
    //    for(var k=0;k<=totalGap+1;k++)
    //     pdfDoc.moveDown();

       pdfDoc.text('__________________________________________________________________________________________________________________',10,totalGap+5,{
        align:'left',
        width: 600,
        height:60,
       }); 
       pdfDoc.moveDown();
       pdfDoc.fontSize(10);
       var totalGap2= pdfDoc.y;
       pdfDoc.font('bengali').text('Salary Details / বেতন বিবরণ / ',{
        align:'left',
        width: 500,
        height:60,
        underline:true,
        continued:true,
        lineBreak:false
       }).font('hindi').text('वेतन विवरण ',{
        continued:true,
        lineBreak:false
       }).font('Helvetica').text('(All details are provided by Principal Employer)',pdfDoc.x,pdfDoc.y+3,{
        continued:false,
        underline:false
       }); 
       pdfDoc.moveDown();
       heighh = pdfDoc.y;
       pdfDoc.fontSize(9);

       if(fields.includes('gross_salary')){
        pdfDoc.font('bengali').text('GROSS SALARY / মোট বেতন / ',{
            align:'left',
            width: 350,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('सकल वेतन : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].gross_salary ? billMaker[i].gross_salary : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;

    }
    //    if(fields.includes('gross_salary')){
    //     pdfDoc.font('Helvetica').text('GROSS SALARY : ' + (billMaker[i].gross_salary ? billMaker[i].gross_salary : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
    if(fields.includes('basic_salary')){
        pdfDoc.font('bengali').text('BASIC SALARY / মূল বেতন / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('मूल वेतन : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].basic_salary ? billMaker[i].basic_salary : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
    }
    // if(fields.includes('basic_salary')){
    //     pdfDoc.text('BASIC SALARY : ' + (billMaker[i].basic_salary ? billMaker[i].basic_salary : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
    if(fields.includes('hra')){
        pdfDoc.font('bengali').text('HOUSE RENT ALLOWANCE / বাড়ি ভাড়া ভাতা / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('मकान किराया भत्ता : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].hra ? billMaker[i].hra : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
    }
    // if(fields.includes('hra')){
    //     pdfDoc.text('HRA : ' + (billMaker[i].hra ? billMaker[i].hra : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
    if(fields.includes('present_days')){
        pdfDoc.font('bengali').text('PRESENT DAYS / বর্তমান দিন / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('वर्तमान दिन : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].present_days ? billMaker[i].present_days : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
    }
    // if(fields.includes('present_days')){
    //     pdfDoc.text('Present Days : ' + (billMaker[i].present_days ? billMaker[i].present_days : ''),pdfDoc.x+160,heighh,{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();
    // }
    if(fields.includes('ot_hour')){
        pdfDoc.font('bengali').text('OVERTIME / ওভারটাইম / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('अधिक समय तक : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].ot_hour ? billMaker[i].ot_hour : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
    }
    
    if(fields.includes('odd_hours')){
        pdfDoc.font('bengali').text('PAID LEAVE / বেতনভোগী ছুটি / ',pdfDoc.x+300,heighh,{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('भुगतान की छुट्टी : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].odd_hours ? billMaker[i].odd_hours : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
    }
    if(fields.includes('absent')){
        pdfDoc.font('bengali').text('ABSENT / অনুপস্থিত / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('अनुपस्थित : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].absent ? billMaker[i].absent : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
    }
    if(fields.includes('holidays')){
        pdfDoc.font('bengali').text('HOLIDAYS / ছুটির দিন / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('छुट्टियां : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].holidays ? billMaker[i].holidays : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
    }
    if(fields.includes('total_days')){
        pdfDoc.font('bengali').text('TOTAL DAYS / মোট দিন / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('कुल दिन : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].total_days ? billMaker[i].total_days : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
    }
    if(fields.includes('ot_rate')){
        pdfDoc.font('bengali').text('OT RATE / OT রেট / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('ओटी दर : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].ot_rate ? billMaker[i].ot_rate : ' '),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
    }
    // if(fields.includes('absent')){
    //     pdfDoc.text('Absent Days : ' + (billMaker[i].absent ? billMaker[i].absent : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
    // if(fields.includes('odd_hours')){
    //     pdfDoc.text('PAID LEAVE / LEAVE ADJUSTMENT : ' + (billMaker[i].odd_hours ? billMaker[i].odd_hours : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
    // if(fields.includes('ot_rate')){
    //     pdfDoc.text('OT Rate : ' + (billMaker[i].ot_rate ? billMaker[i].ot_rate : ''),pdfDoc.x+120,heighh,{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();
    // }
    // if(fields.includes('ot_hour')){
    //     pdfDoc.text('OT Hours : ' + (billMaker[i].ot_hour ? billMaker[i].ot_hour : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
    // if(fields.includes('holidays')){
    //     pdfDoc.text('HOLIDAYS ( WEEKLY + FESTIVE ) : ' + (billMaker[i].holidays ? billMaker[i].holidays : ''),pdfDoc.x+80,heighh,{
    //         align:'left',
    //         width: 200,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();
    // }
    // if(fields.includes('total_days')){
    //     pdfDoc.text('Total Days : ' + (billMaker[i].total_days ? billMaker[i].total_days : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();

    // }
    // pdfDoc.moveDown();
    // pdfDoc.moveDown();
    pdfDoc.fontSize(10);
    pdfDoc.font('Helvetica');
    pdfDoc.text('_________________________________________________________________________________________________________',10,totalGap2,{
        align:'left',
        width: 600,
        height:60,
       }); 
    pdfDoc.moveDown();
       
    var heighh = pdfDoc.y;
    pdfDoc.fontSize(10);
       
    pdfDoc.font('bengali').text('Earnings / আয় / ',{
        align:'left',
        width: 250,
        height:60,
        underline:true,
        continued:true,
        lineBreak:false
       }).font('hindi').text('आय',{
        continued:false
       }); 
    //    pdfDoc.font('bengali').text('Earnings / ',{
    //     align:'left',
    //     width: 250,
    //     height:60,
    //     underline:true
    //    }); 
       pdfDoc.moveDown();
       pdfDoc.fontSize(9);
    var totalGap3 = pdfDoc.y;
       
    if(fields.includes('prop_gross')){
        pdfDoc.font('bengali').text('PROPORTIONATE GROSS / আনুপাতিক গ্রস / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('आनुपातिक सकल : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].prop_gross ? billMaker[i].prop_gross : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    //    if(fields.includes('prop_gross')){
    //     pdfDoc.font('Helvetica').text('PROP GROSS : ' + (billMaker[i].prop_gross ? billMaker[i].prop_gross : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
    if(fields.includes('prop_basic')){
        pdfDoc.font('bengali').text('PROPORTIONATE BASIC / আনুপাতিক মৌলিক / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('आनुपातिक बुनियादी : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].prop_basic ? billMaker[i].prop_basic : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    
    if(fields.includes('ot_amount')){
        pdfDoc.font('bengali').text('OT AMOUNT / OT পরিমাণ / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('ओटी राशि : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].ot_amount ? billMaker[i].ot_amount : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    
    if(fields.includes('minor_r')){
        pdfDoc.font('bengali').text('MINOR REIMBURSEMENT / সামান্য প্রতিদান / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('मामूली प्रतिपूर्ति : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].minor_r ? billMaker[i].minor_r : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    
    if(fields.includes('variable_incentive')){
        pdfDoc.font('bengali').text('SPECIAL INCENTIVE / বিশেষ প্রণোদনা / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('विशेष प्रोत्साहन : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    
    if(fields.includes('actual_pay')){
        pdfDoc.font('bengali').text('ACTUAL PAYMENT / প্রকৃত অর্থপ্রদান / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('वास्तविक भुगतान : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].actual_pay ? billMaker[i].actual_pay : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    //    if(fields.includes('prop_basic')){
    //     pdfDoc.text('PROP BASIC : ' + (billMaker[i].prop_basic ? billMaker[i].prop_basic : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('odd_hours')){
    //     pdfDoc.text('ODD HOURS DUTY INCENTIVE : ' + (billMaker[i].odd_hours ? billMaker[i].odd_hours : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('variable_incentive')){
    //     pdfDoc.text('SPECIAL INCENTIVE (AS PER PRINCIPAL EMPLOYER DISCRETION) : ' + (billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('ot_amount')){
    //     pdfDoc.text('OT AMOUNT : ' + (billMaker[i].ot_amount ? billMaker[i].ot_amount : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();

    //    }
    //    if(fields.includes('minor_r')){
    //     pdfDoc.text('MINOR REIMBURSEMENT : ' + (billMaker[i].minor_r ? billMaker[i].minor_r : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();

    //    }
       
    //    if(fields.includes('production_incentive')){
    //     pdfDoc.text('PRODUCTION OR VARIABLE INCENTIVE : ' + (billMaker[i].production_incentive ? billMaker[i].production_incentive : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();

    //    }
    //    if(fields.includes('actual_pay')){
    //     pdfDoc.text('ACTUAL PAY : ' + (billMaker[i].actual_pay ? billMaker[i].actual_pay : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();

    //    }
       pdfDoc.fontSize(10);
    pdfDoc.font('bengali').text('Deductions / কর্তন / ',pdfDoc.x+300,heighh,{
        align:'left',
        width: 250,
        height:60,
        underline:true,
        continued:true,
        lineBreak:false
       }).font('hindi').text('कटौती',{
        continued:false
       }); 
       pdfDoc.fontSize(9);
       pdfDoc.moveDown();
       if(fields.includes('pf')){
        pdfDoc.font('bengali').text('EMPLOYEE PF / কর্মচারী পিএফ / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('कर्मचारी पी.एफ : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].pf ? billMaker[i].pf : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
    }
    if(fields.includes('esic')){
        pdfDoc.font('bengali').text('EMPLOYEE ESIC / কর্মচারী ESIC / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('कर्मचारी ईएसआईसी : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].esic ? billMaker[i].esic : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    if(fields.includes('ptax')){
        pdfDoc.font('bengali').text('P-TAX / পি-ট্যাক্স / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('पी-टैक्स : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].ptax ? billMaker[i].ptax : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    if(fields.includes('lwf')){
        pdfDoc.font('bengali').text('LABOUR WELFARE FUND / শ্রম কল্যাণ তহবিল / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('श्रम कल्याण कोष : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].lwf ? billMaker[i].lwf : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    if(fields.includes('advance')){
        pdfDoc.font('bengali').text('ADVANCE/DEDUCTION / অগ্রিম/কর্তন / ',{
            align:'left',
            width: 300,
            height:60,
            continued:true,
            lineBreak:false
           }).font('hindi').text('अग्रिम/कटौती : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text( (billMaker[i].advance ? billMaker[i].advance : ''),{
            continued:false,

           }); 

       pdfDoc.moveDown();
       if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
    }
    //    pdfDoc.font('Helvetica-Bold').text('Deductions',pdfDoc.x+300,heighh,{
    //     align:'left',
    //     width: 250,
    //     height:60,
    //     underline:true
    //    }); 
    //    pdfDoc.moveDown();
    //    if(fields.includes('pf')){
    //     pdfDoc.font('Helvetica').text('EMP PF : ' + (billMaker[i].pf ? billMaker[i].pf : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();
    // }

    //    if(fields.includes('esic')){
    //     pdfDoc.text('EMP ESIC : ' + (billMaker[i].esic ? billMaker[i].esic : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('ptax')){
    //     pdfDoc.text('EMP PTAX : ' + (billMaker[i].ptax ? billMaker[i].ptax : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('advance')){
    //     pdfDoc.text('Advance : ' + (billMaker[i].advance ? billMaker[i].advance : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    pdfDoc.moveDown();
    // }
    //    if(fields.includes('lwf')){
    //     pdfDoc.text('LWF : ' + (billMaker[i].lwf ? billMaker[i].lwf : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         });
    //    }
    //    pdfDoc.moveDown();
    //    pdfDoc.moveDown();
    //    pdfDoc.moveDown();
    //    pdfDoc.moveDown();

       if(fields.includes('net_pay')){
        var heighhh = totalGap3+20;

        pdfDoc.font('Helvetica-Bold').text('NET PAYMENT / ',10,totalGap3+20,{
            align:'left',
            width: 600,
            height:60,
            continued:true,
            lineBreak:false
           }).font('bengali').text('সর্বমোট প্রদান / ',{
            align:'left',
            continued:true,
            lineBreak:false
           }).font('hindi').text('कुल भुगतान : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text(billMaker[i].net_pay ? billMaker[i].net_pay : ' ',{
            continued:false,
           });
            pdfDoc.moveDown();
        }
        if(fields.includes('production_incentive')){
         pdfDoc.font('Helvetica-Bold').text('PRODUCTION INCENTIVE / ',{
             align:'left',
             width: 600,
             height:60,
             continued:true,
             lineBreak:false
            }).font('bengali').text('উৎপাদন প্রণোদনা / ',{
             continued:true,
             lineBreak:false
            }).font('hindi').text('उत्पादन प्रोत्साहन : ',{
             continued:true,
             lineBreak:false
            }).font('Helvetica-Bold').text(billMaker[i].production_incentive ? billMaker[i].production_incentive : ' ',{
             continued:false,
            });
             pdfDoc.moveDown();
         }
       if(fields.includes('gross_incentive')){
        pdfDoc.font('Helvetica-Bold').text('TOTAL FINAL PAYMENT / ',{
            align:'left',
            width: 600,
            height:60,
            continued:true,
            lineBreak:false
           }).font('bengali').text('মোট চূড়ান্ত অর্থপ্রদান / ',{
            continued:true,
            lineBreak:false
           }).font('hindi').text('कुल अंतिम भुगतान : ',{
            continued:true,
            lineBreak:false
           }).font('Helvetica-Bold').text(billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ' ',{
            continued:false,
           });
            pdfDoc.moveDown();
        }
        if(fields.includes('mgmt_pf')){
            pdfDoc.font('Helvetica').text('MANAGEMENT PF / ' ,308,heighhh,{
                align:'left',
                width: 300,
                height:60,
                continued:true,
                lineBreak:false
               }).font('bengali').text('ব্যবস্থাপনা / ',{
                continued:true,
                lineBreak:false
               }).font('hindi').text('का प्रबंधन : ',{
                continued:true,
                lineBreak:false
               }).font('Helvetica-Bold').text(billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ' ',{
                continued:false,
               });
           pdfDoc.moveDown();
        }
        if(fields.includes('mgmt_esic')){
            pdfDoc.font('Helvetica').text('MANAGEMENT ESIC / ',{
                align:'left',
                width: 300,
                height:60,
                continued:true,
                lineBreak:false
               }).font('bengali').text('ব্যবস্থাপনা ইএসআইসি / ',{
                continued:true,
                lineBreak:false
               }).font('hindi').text('प्रबंधन ईएसआईसी : ',{
                continued:true,
                lineBreak:false
               }).font('Helvetica-Bold').text(billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ' ',{
                continued:false,
               });
           pdfDoc.moveDown();
        }
        if(fields.includes('mgmt_lwf')){
            pdfDoc.font('Helvetica').text('MANAGEMENT LWF / ' ,{
                align:'left',
                width: 300,
                height:60,
                continued:true,
                lineBreak:false
               }).font('bengali').text('ব্যবস্থাপনা LWF / ',{
                continued:true,
                lineBreak:false
               }).font('hindi').text('प्रबंधन एलडब्ल्यूएफ : ',{
                continued:true,
                lineBreak:false
               }).font('Helvetica-Bold').text(billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ' ',{
                continued:false,
               });
        }
    //    for(var ii=0;ii<(h2.length/2);ii++){
    //     pdfDoc.text(h2[ii] + ' : ' + rows[0][ii],{
    //     align:'left',
    //     width: 300,
    //     height:60,
    //     underline:false
    //     });
    //     pdfDoc.moveDown();
    //    }
    //    pdfDoc.text('',pdfDoc.x+300,heighh,{
    //     align:'left',
    //     width: 0,
    //     height:6,
    //     });
    //    for(ii=Math.floor(h2.length/2);ii<h2.length;ii++){
    //     pdfDoc.text(h2[ii] + ' : ' + rows[0][ii],{
    //     align:'left',
    //     width: 300,
    //     height:60,
    //     });
    //     pdfDoc.moveDown();
    //    }
    pdfDoc.font('Helvetica').text('__________________________________________________________________________________________________________________',10,pdfDoc.y+10,{
        align:'left',
        width: 600,
        height:40,
       }); 
       pdfDoc.fontSize(9).text('* This is a computer generated payslip, hence no Signature or Stamp is required.',10,pdfDoc.y+10,{
        align:'left',
        width: 500,
        height:60,
        });

        pdfDoc.fontSize(9).text('* Principal Employer determines Salary & Designation & provide attendance & reimburse the wages promptly & punctually before disbursement.',10,pdfDoc.y+10,{
            align:'left',
            width: 550,
            height:60,
            });
    
    //   if(billMaker[0].company_master.stamp){
        
    //     if (fs.existsSync(billMaker[0].company_master.stamp)) {
    //     pdfDoc.image(billMaker[0].company_master.stamp, pdfDoc.x+450, pdfDoc.y - 20, { width: 40, height: 40, align:'right' })
    //     .rect(pdfDoc.x+450, pdfDoc.y-20, 40, 40)
    //     .stroke();
    //     }
    // }   


    if(i!=billMaker.length - 1)
        pdfDoc.addPage();


       }
        }
      if(type==1){
        pdfDoc.fontSize(18).font('Helvetica-Bold').text('FORM XVII',0,40,{
            align:'center',
            width:sizee2,
            height:20,
        });
pdfDoc.font('Helvetica').text('[See Rule 78(1)(a)(i)]',pdfDoc.x,pdfDoc.y+5,{
        align:'center',
        width:sizee2,
        height:20,
});
pdfDoc.font('Helvetica-Bold').text('Register of Wages',pdfDoc.x,pdfDoc.y+5,{
        align:'center',
        width:sizee2,
        height:20,
});
pdfDoc.text('NAME AND ADDRESS OF CONTRACTOR',pdfDoc.x+10,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text(billMaker[0].company_master.company_name,pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text(billMaker[0].company_master.address,pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text('CLIENT NAME AND ADDRESS',pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text(billMaker[0].client_master.client_name,pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text(client[0].address,pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:sizee2 - 100,
    height:20,
    continued:true,
    lineBreak:false
});
pdfDoc.text('WAGE PERIOD : '+mm + ' ' +billMaker[0].month_year.substr(0,4),pdfDoc.x,pdfDoc.y+5,{
    align:'right',
    width:sizee2 - 100,
    height:20,
});
pdfDoc.moveDown();
rows2.push(total);
var rownUntill9 = [];
var ll = 8;
if(rows2.length<8){
    ll = rows2.length;
}
for(var a=0;a<ll;a++)
    rownUntill9.push(rows2[a]);

table = {
        // title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
        //  "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
        // 'WAGE SLIP : ' + ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
        // subtitle: "Subtitle",
        headers: h,
        rows: rownUntill9,
        divider: {
            header: { disabled: false, width: 2, opacity: 1 },
            horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
          },
    };
rows2.splice(0,8);
await pdfDoc.table(table, { 
    // width: 2100,
    columnsSize: size,
    height:200,
    columnSpacing: 15, 
    rowSpacing: 10, 
    prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
   // prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),
  prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        pdfDoc.font("Helvetica").fontSize(17);
        // console.log(row);
        // console.log('----');
        // console.log(indexColumn);
        // console.log(indexRow);
        // console.log(rectRow);
        // console.log(rectCell);
      },
  });
 
//dividing into groups of 13
var ll = (rows2.length/10);
for(var aa = 0;aa<ll;aa++){
    var eachRow = [];
    var newRow = rows2.splice(0,10);
    const newTable = {
        // title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
        //  "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
        // 'WAGE SLIP : ' + ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
        // subtitle: "Subtitle",
        headers: h,
        rows: newRow,
        divider: {
            header: { disabled: false, width: 2, opacity: 1 },
            horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
          },
    };
    pdfDoc.addPage();

    await pdfDoc.table(newTable, { 
        // width: 2100,
        columnsSize: size,
        height:200,
        columnSpacing: 15, 
        rowSpacing: 10, 
        prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
       // prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            pdfDoc.font("Helvetica").fontSize(17);
            // console.log(row);
            // console.log('----');
            // console.log(indexColumn);
            // console.log(indexRow);
            // console.log(rectRow);
            // console.log(rectCell);
          },
      });
      if(aa==ll && newRow.length>9)
        pdfDoc.addPage();
     
}




pdfDoc.text('1. The Gross Salary and all its components and bifurcations are determined by the Principal Employer only. ',10,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});

pdfDoc.text('2. Attendance, Any reimbursement, Incentive, or any other benefits given to the employee are only after the sanction of the Principal Employer and/or mutual understanding of the Principal and Employee.',{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text('3. All payments are made through NEFT or Bank transfer, and thus requires no signature of Employees. In any other mode of payment, signature to follow. ',{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text('4. This is an auto generated computerised document, prepared on the basis of data provided by the employee and Principal. ',{
    align:'left',
    width:1800,
    height:20,
});
  if(billMaker[0].company_master.stamp){
    var sizee = fields.length * 65;

    if (fs.existsSync(billMaker[0].company_master.stamp)) {
    pdfDoc.image(billMaker[0].company_master.stamp, pdfDoc.x + sizee, pdfDoc.y, { width: 80, height: 80, align:'right' })
    .rect(pdfDoc.x + sizee, pdfDoc.y-80, 80, 80)
    .stroke();
    }
}     
      }
     
        pdfDoc.end();

    }else{
    //excel
    let data = [];
    let data2 =[]; 
    if(type==2){
    data2 = [{
        'PRINCIPAL EMPLOYER':  billMaker[0].client_master.client_name,
        'CONTRACTOR':billMaker[0].company_master.company_name,
        'WAGE SLIP FOR THE MONTH OF ':mm + ' ' +billMaker[0].month_year.substr(0,4)
    }];
}else{
    data2 = [{
        'NAME & ADDRESS OF CONTRACTOR':  billMaker[0].company_master.company_name,
        'NAME & ADDRESS OF CLIENT':billMaker[0].client_master.client_name,
        'WAGE PERIOD':mm + ' ' +billMaker[0].month_year.substr(0,4)
    },{       
        'NAME & ADDRESS OF CONTRACTOR':  billMaker[0].company_master.address,
        'NAME & ADDRESS OF CLIENT':client[0].address 
    }];
}
for(let i=0;i<billMaker.length;i++){

    data[0]={};
    data[1]={};
    data[i+2]={};
    data[0]['Sl No']='Sl No';
    data[1]['Sl No']='Sl No';
    data[i+2]['Sl No']=i+1;
    if(fields.includes('name')){
        data[0]['Name Of The Worker']='नाम';
        data[1]['Name Of The Worker']='নাম';
        data[i+2]['Name Of The Worker']=billMaker[i].name;
    }
    if(fields.includes('emp_code')){
        data[0]['EMPLOYEE CODE']='कर्मचारी कोड';   
        data[1]['EMPLOYEE CODE']='কর্মী কোড';   
        data[i+2]['EMPLOYEE CODE']=billMaker[i].emp_code;   
    }
    if(fields.includes('gender')){
        data[0]['GENDER']='लिंग';  
        data[1]['GENDER']='লিঙ্গ';  
        data[i+2]['GENDER']=billMaker[i].gender;  
    }
    if(fields.includes('aadhaar')){
    data[0]['AADHAR NO']='आधार नंबर'; 
    data[1]['AADHAR NO']='আধার নং'; 
    data[i+2]['AADHAR NO']=billMaker[i].aadhaar;  
    }
    if(fields.includes('uan')){
        data[0]['UAN NO']='UAN नंबर';  
         data[1]['UAN NO']='UAN নম্বর';  
          data[i+2]['UAN NO']=billMaker[i].uan;  
        }
        
    if(fields.includes('esic_no')){
    data[0]['ESIC NO']='ESIC नंबर';
    data[1]['ESIC NO']='ESIC নম্বর';
    data[i+2]['ESIC NO']=billMaker[i].esic_no;
    }  
    
    if(fields.includes('designation')){
        data[0]['DESIGNATION']='पद';
        data[1]['DESIGNATION']='নিয়োগ';
        data[i+2]['DESIGNATION']=billMaker[i].designation;    
        }
        
    if(fields.includes('bank')){
    data[0]['BANK']='बैंक का नाम';
    data[1]['BANK']='ব্যাংকের নাম';
    data[i+2]['BANK']=billMaker[i].bank;
    }  
    
    if(fields.includes('ac_no')){
        data[0]['A/C NO']='अकाउंट नंबर';  
        data[1]['A/C NO']='অ্যাকাউন্ট নম্বর';  
        data[i+2]['A/C NO']=billMaker[i].ac_no;  
        }
    if(fields.includes('ifsc')){
    data[0]['IFSC']='आई०ऍफ़०एस० कोड';        
    data[1]['IFSC']='আইএফএস কোড';        
    data[i+2]['IFSC']=billMaker[i].ifsc;        
}
    
    if(fields.includes('gross_salary')){
        data[0]['GROSS SALARY']='सकल वेतन';  
        data[1]['GROSS SALARY']='মোট বেতন';  
        data[i+2]['GROSS SALARY']=billMaker[i].gross_salary;  
        }
    if(fields.includes('basic_salary')){
    data[0]['BASIC SALARY']='मूल वेतन';      
    data[1]['BASIC SALARY']='মূল বেতন';  
    data[i+2]['BASIC SALARY']=billMaker[i].basic_salary;  

    }
    if(fields.includes('hra')){
        data[0]['HRA']='गृह वाता';  
        data[1]['HRA']='বাড়ি ভাড়া ভাতা';  
        data[i+2]['HRA']=billMaker[i].hra;  

    }
    if(fields.includes('present_days')){
        data[0]['PRESENT DAYS']='काम के दिन';  
        data[1]['PRESENT DAYS']='কাজের দিন';  
        data[i+2]['PRESENT DAYS']=billMaker[i].present_days;  

        }
    if(fields.includes('holidays')){
    data[0]['HOLIDAYS ( WEEKLY + FESTIVE)']='छुट्टी का दिन';  
    data[1]['HOLIDAYS ( WEEKLY + FESTIVE)']='ছুটির দিন';  
    data[i+2]['HOLIDAYS ( WEEKLY + FESTIVE)']=billMaker[i].holidays;  
    }
    if(fields.includes('odd_hours')){
    data[0]['PAID LEAVE / LEAVE ADJUSTMENT']='भुगतान छुट्टी समायोजन'; 
    data[1]['PAID LEAVE / LEAVE ADJUSTMENT']='বেতনের ছুটি সমন্বয়';  
    data[i+2]['PAID LEAVE / LEAVE ADJUSTMENT']=billMaker[i].odd_hours;  

    }
    if(fields.includes('absent')){
        data[0]['ABSENT']='अनुपस्थित दिन';  
        data[1]['ABSENT']='অনুপস্থিত দিন';  
        data[i+2]['ABSENT']=billMaker[i].absent;  
        }
    if(fields.includes('total_days')){
    data[0]['TOTAL DAYS']='कुल दिन';  
    data[1]['TOTAL DAYS']='মোট দিন';  
    data[i+2]['TOTAL DAYS']=billMaker[i].total_days;  
    }
    if(fields.includes('prop_gross')){
        data[0]['PROP GROSS']='आनुपातिक सकल वेतन';
        data[1]['PROP GROSS']='আনুপাতিক মোট বেতন';
        data[i+2]['PROP GROSS']=billMaker[i].prop_gross;  
     }   
    if(fields.includes('ot_rate')){
    data[0]['OT RATE']='ओवरटाइम दर';
    data[1]['OT RATE']='ওভারটাইম হার';
    data[i+2]['OT RATE']=billMaker[i].ot_rate;  
    }
    
    if(fields.includes('ot_hour')){
        data[0]['OT HOURS']='अतिरिक्त समय अवधि';
        data[1]['OT HOURS']='অতিরিক্ত ঘন্টা'; 
        data[i+2]['OT HOURS']=billMaker[i].ot_hour;  
        } 
        
    if(fields.includes('ot_amount')){
    data[0]['OT AMOUNT']='ओवरटाइम राशि';
    data[1]['OT AMOUNT']='অতিরিক্ত কাজের বেতন';
    data[i+2]['OT AMOUNT']=billMaker[i].ot_amount;  
    }
    
    if(fields.includes('minor_r')){
        data[0]['MINOR REIMBURSEMENT']='मामूली प्रतिपूर्ति';
        data[1]['MINOR REIMBURSEMENT']='সামান্য প্রতিদান';
        data[i+2]['MINOR REIMBURSEMENT']=billMaker[i].minor_r; 
        } 

        
    if(fields.includes('variable_incentive')){
    data[0]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']='विशेष प्रोत्साहन';
    data[1]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']='বিশেষ প্রণোদনা';
    data[i+2]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']=billMaker[i].variable_incentive; 
    } 
    
    if(fields.includes('actual_pay')){
        data[0]['ACTUAL PAY']='वास्तविक भुगतान';
        data[1]['ACTUAL PAY']='প্রকৃত বেতন';
        data[i+2]['ACTUAL PAY']=billMaker[i].actual_pay; 
        } 
        
    if(fields.includes('prop_basic')){
    data[0]['PROP BASIC']='आनुपातिक वेतन';
    data[1]['PROP BASIC']='আনুপাতিক মৌলিক';
    data[i+2]['PROP BASIC']=billMaker[i].prop_basic;
    }  
    
    if(fields.includes('pf')){
        data[0]['PF']='कर्मचारी PF';
        data[1]['PF']='কর্মচারী PF';
        data[i+2]['PF']=billMaker[i].pf;  
        }
    if(fields.includes('esic')){
    data[0]['ESIC']='कर्मचारी ESIC';
    data[1]['ESIC']='কর্মচারী ESIC';
    data[i+2]['ESIC']=billMaker[i].esic; 
    } 
    
    if(fields.includes('ptax')){
        data[0]['PTAX']='कर्मचारी P TAX';
        data[1]['PTAX']='কর্মচারী P TAX';
        data[i+2]['PTAX']=billMaker[i].ptax;  
        }
        
    if(fields.includes('lwf')){
    data[0]['LWF']='कर्मचारी LWF';
    data[1]['LWF']='কর্মচারী LWF';
    data[i+2]['LWF']=billMaker[i].lwf;  
    }
    
    if(fields.includes('advance')){
        data[0]['ADVANCE / DEDUCTION']='एडवांस / कटौती';
        data[1]['ADVANCE/ DEDUCTION']='অগ্রিম / কর্তন';
        data[i+2]['ADVANCE / DEDUCTION']=billMaker[i].advance;  
        }
        
    if(fields.includes('net_pay')){
    data[0]['NET PAY']='कुल भुगतान';
    data[1]['NET PAY']='নেট বেতন';
    data[i+2]['NET PAY']=billMaker[i].net_pay; 
    } 
    
    if(fields.includes('mgmt_pf')){
        data[0]['MGMT PF']='प्रबंधन  PF';
        data[1]['MGMT PF']='ব্যবস্থাপনা PF';
        data[i+2]['MGMT PF']=billMaker[i].mgmt_pf;  
        }
        
    if(fields.includes('mgmt_esic')){
    data[0]['MGMT ESIC']='प्रबंधन  ESIC';
    data[1]['MGMT ESIC']='ব্যবস্থাপনা ESIC';
    data[i+2]['MGMT ESIC']=billMaker[i].mgmt_esic;
    }  
    
    if(fields.includes('mgmt_lwf')){
        data[0]['MGMT LWF']='प्रबंधन  LWF';
        data[1]['MGMT LWF']='ব্যবস্থাপনা LWF';
        data[i+2]['MGMT LWF']=billMaker[i].mgmt_lwf; 
        } 
        
    if(fields.includes('ctc')){
    data[0]['CTC']='कंपनी के लिए लागत';
    data[1]['CTC']='কোম্পানির খরচ';
    data[i+2]['CTC']=billMaker[i].ctc;  
    }
    
    if(fields.includes('production_incentive')){
        data[0]['PRODUCTION INCENTIVE']='उत्पादन या परिवर्तनीय प्रोत्साहन';
        data[1]['PRODUCTION INCENTIVE']='পরিবর্তনশীল ইনসেনটিভ';
        data[i+2]['PRODUCTION INCENTIVE']=billMaker[i].production_incentive;  
        }
        
    if(fields.includes('gross_incentive')){
    data[0]['ACTUAL PAYABLE']='वास्तविक देय';
    data[1]['ACTUAL PAYABLE']='প্রদেয়';
    data[i+2]['ACTUAL PAYABLE']=billMaker[i].gross_incentive;  
    }
    
    // if(fields.includes('invoice_amount1')){
        data[0]['INVOICE AMOUNT1']='चालान राशि 1';
        data[1]['INVOICE AMOUNT1']='চালানের পরিমাণ 1';
        data[i+2]['INVOICE AMOUNT1']=billMaker[i].invoice_amount1;  
        // }
        
    // if(fields.includes('invoice_amount2')){
    data[0]['INVOICE AMOUNT2']='चालान राशि 2';
    data[1]['INVOICE AMOUNT2']='চালানের পরিমাণ 2';
    data[i+2]['INVOICE AMOUNT2']=billMaker[i].invoice_amount2;  
    // }
    
    // if(fields.includes('service_charge')){
        data[0]['SERVICE CHARGE']='सेवा शुल्क';
        data[1]['SERVICE CHARGE']='সেবা খরচ';
        data[i+2]['SERVICE CHARGE']=billMaker[i].service_charge; 
        // } 
        
    // if(fields.includes('cost_of_contract')){
    data[0]['COST OF CONTRACT STAFFING SERVICES 1']='अनुबंध स्टाफिंग सेवाओं की लागत - 1';
    data[1]['COST OF CONTRACT STAFFING SERVICES 1']='কন্ট্রাক্ট স্টাফিং সার্ভিসের খরচ - 1';
    data[i+2]['COST OF CONTRACT STAFFING SERVICES 1']=billMaker[i].cost_of_contract;  
    // }
    // if(fields.includes('cost_of_contract2')){
    data[0]['COST OF CONTRACT STAFFING SERVICES 2']='अनुबंध स्टाफिंग सेवाओं की लागत - 1';
    data[1]['COST OF CONTRACT STAFFING SERVICES 2']='কন্ট্রাক্ট স্টাফিং সার্ভিসের খরচ - 2';
    data[i+2]['COST OF CONTRACT STAFFING SERVICES 2']=billMaker[i].cost_of_contract2; 
    // }
    }

    var nameee='';
        if(type==1)
            nameee='wage_register';
        else
            nameee='payslip';
        const ws = XLSX.utils.json_to_sheet(data)
        const ws2 = XLSX.utils.json_to_sheet(data2)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws2)
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx`)
        const filePath = path.join(`output/${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx"`);  
        res.send(data);
        });
    }
});
// exports.postGeneration = catchAsyncErrors(async(req, res, next) => {
//     const {
//         type,
//         fields,
//         type2,
//         bill_maker_id,
//     } = req.body; 
//     // console.log(fields);
//     //pdf
//     const billMaker = await BillMaker.findAll({where:{
//         bill_maker_id:bill_maker_id,
//          status:1
//         },
//         order: [ [ 'sl_no', 'ASC' ]],
//         include:[CompanyMaster,ClientMaster]});
//     const client = await ClientAddress.findAll({where:{client_id:billMaker[0].client_id}});
//         var monthNames = [ "January", "February", "March", "April", "May", "June", 
//         "July", "August", "September", "October", "November", "December" ]; 
//         var aa = billMaker[0].month_year.substr(5,6);
//         if(aa<9){
//           aa = billMaker[0].month_year.substr(6,6);
//         }
//         var mm =  monthNames[aa-1];
//         // console.log(billMaker);
//     if(type2==1){
//         var invoiceName='';
       
//         if(type==1){
//             invoiceName = 'wage_register_'+ mm+'_'+ billMaker[0].month_year.substr(0,4) +'.pdf';
//         }
//         else{
//             invoiceName = 'payslip_'+ mm+'_'+ billMaker[0].month_year.substr(0,4) +'.pdf';
//         }

//         const invoicePath = path.join('uploads', invoiceName);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
//         let pdfDoc='';
//         var sizee2 = fields.length * 72;

//         if(type==1){
//          pdfDoc = new PDFDocument2({
//             size: [sizee2,1250],
//             margins : { 
//                 top: 10,
//                bottom:0,
//                 left: 10,
//               right: 10
//             }
//         }); 
//     }else{
//         // pdfDoc = new PDFDocument2({
//         //     size: [sizee2,400],
//         //     margins : { 
//         //         top: 10,
//         //        bottom:10,
//         //         left: 10,
//         //       right: 10
//         //     }
//         // }); 
//         pdfDoc = new PDFDocument2({size:'A4'});
//     }
//         pdfDoc.pipe(fs.createWriteStream(invoicePath));
//         pdfDoc.pipe(res);
//         var rows2=[];
//         var size=[];
//         var total=[];
//         for(let i=0;i<billMaker.length;i++){
//         var rows=[];
//         var h = [];
//         var h2 = [];
//         var r=[];
//         if(fields.includes('name')){
//             h.push('Name \n Of \n The \n Worker');
//             h2.push('Name Of The Worker');
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].name ? billMaker[i].name : '');
//             else
//                 total.push(billMaker[i].name);
//             size.push(120);
//         }
    
//         if(fields.includes('emp_code')){
//             h.push('EMPLOYEE \n CODE');
//             h2.push('EMPLOYEE CODE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].emp_code ? billMaker[i].emp_code : ''); 
//             else
//                 total.push(billMaker[i].emp_code ? billMaker[i].emp_code : '');
//         }
    
//         if(fields.includes('gender')){
//             h.push('GENDER');
//             h2.push('GENDER');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].gender ? billMaker[i].gender : ''); 
//             else
//                 total.push(billMaker[i].gender ? billMaker[i].gender : '');
//         }
            
//         if(fields.includes('aadhaar')){    
//         h.push('AADHAR NO');
//         h2.push('AADHAR NO');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].aadhaar ? billMaker[i].aadhaar : ''); 
//             else
//                 total.push(billMaker[i].aadhaar ? billMaker[i].aadhaar : '');
//         }  
        
//         if(fields.includes('uan')){        
//             h.push('UAN NO');
//             h2.push('UAN NO');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].uan ? billMaker[i].uan : ''); 
//             else
//             total.push(billMaker[i].uan ? billMaker[i].uan : ''); 
//         }
            
//         if(fields.includes('esic_no')){
//             h.push('ESIC NO');
//             h2.push('ESIC NO');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].esic_no ? billMaker[i].esic_no : ''); 
//             else
//             total.push(billMaker[i].esic_no ? billMaker[i].esic_no : ''); 
//         }
        
//         if(fields.includes('designation')){
//             h.push('DESIGNATION');
//             h2.push('DESIGNATION');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].designation ? billMaker[i].designation : ''); 
//             else
//             total.push(billMaker[i].designation ? billMaker[i].designation : ''); 
//         }
            
//         if(fields.includes('bank')){
//             h.push('BANK');
//             h2.push('BANK');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].bank ? billMaker[i].bank : ''); 
//             else
//             total.push(billMaker[i].bank ? billMaker[i].bank : ''); 
//         }
        
//         if(fields.includes('ac_no')){
//             h.push('A/C NO');
//             h2.push('A/C NO');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ac_no ? billMaker[i].ac_no : ''); 
//             else
//             total.push(billMaker[i].ac_no ? billMaker[i].ac_no : ''); 
//         }
            
//         if(fields.includes('ifsc')){
//             h.push('IFSC');
//             h2.push('IFSC');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ifsc ? billMaker[i].ifsc : ''); 
//             else
//             total.push(billMaker[i].ifsc ? billMaker[i].ifsc : ''); 
//         }      
        
//         if(fields.includes('gross_salary')){
//             h.push('GROSS \n SALARY');
//             h2.push('GROSS SALARY');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].gross_salary ? billMaker[i].gross_salary : ''); 
//             else
//             total.push(billMaker[i].gross_salary ? billMaker[i].gross_salary : ''); 
//         } 
            
//         if(fields.includes('basic_salary')){
//             h.push('BASIC \n SALARY');
//             h2.push('BASIC SALARY');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].basic_salary ? billMaker[i].basic_salary : ''); 
//             else
//             total.push(billMaker[i].basic_salary ? billMaker[i].basic_salary : ''); 
//         }      
//         if(fields.includes('hra')){
//             h.push('HRA');
//             h2.push('HRA');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].hra ? billMaker[i].hra : ''); 
//             else
//             total.push(billMaker[i].hra ? billMaker[i].hra : ''); 
//         }      
//         if(fields.includes('present_days')){
//             h.push('PRESENT \n DAYS');
//             h2.push('PRESENT DAYS');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].present_days ? billMaker[i].present_days : ''); 
//             else
//             total.push(billMaker[i].present_days ? billMaker[i].present_days : ''); 
//         }      
//         if(fields.includes('holidays')){
//             h.push('HOLIDAYS \n ( WEEKLY \n + FESTIVE )');
//             h2.push('HOLIDAYS ( WEEKLY + FESTIVE )');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].holidays ? billMaker[i].holidays : ''); 
//             else
//             total.push(billMaker[i].holidays ? billMaker[i].holidays : ''); 
//         }                  
//         if(fields.includes('odd_hours')){
//             h.push('PAID \n LEAVE / \n LEAVE \n ADJUSTMENT');
//             h2.push('PAID LEAVE / LEAVE ADJUSTMENT');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].odd_hours ? billMaker[i].odd_hours : ''); 
//             else
//             total.push(billMaker[i].odd_hours ? billMaker[i].odd_hours : ''); 
//         } 
//         if(fields.includes('absent')){
//             h.push('ABSENT');
//             h2.push('ABSENT');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].absent ? billMaker[i].absent : ''); 
//             else
//             total.push(billMaker[i].absent ? billMaker[i].absent : ''); 
//         }      
//         if(fields.includes('total_days')){
//             h.push('TOTAL DAYS');
//             h2.push('TOTAL DAYS');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].total_days ? billMaker[i].total_days : ''); 
//             else
//             total.push(billMaker[i].total_days ? billMaker[i].total_days : ''); 
//         }      
//         if(fields.includes('prop_gross')){
//             h.push('PROP GROSS');
//             h2.push('PROP GROSS');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].prop_gross ? billMaker[i].prop_gross : '');  
//             else
//             total.push(billMaker[i].prop_gross ? billMaker[i].prop_gross : '');  
//         }      
//         if(fields.includes('ot_rate')){
//             h.push('OT RATE');
//             h2.push('OT RATE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ot_rate ? billMaker[i].ot_rate : ''); 
//             else
//             total.push(billMaker[i].ot_rate ? billMaker[i].ot_rate : ''); 
//         }      
//         if(fields.includes('ot_hour')){
//             h.push('OT HOURS');
//             h2.push('OT HOURS');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ot_hour ? billMaker[i].ot_hour : ''); 
//             else
//             total.push(billMaker[i].ot_hour ? billMaker[i].ot_hour : ''); 
//         }      
//         if(fields.includes('ot_amount')){
//             h.push('OT AMOUNT');
//             h2.push('OT AMOUNT');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ot_amount ? billMaker[i].ot_amount : ''); 
//             else
//             total.push(billMaker[i].ot_amount ? billMaker[i].ot_amount : ''); 
//         }      
//         if(fields.includes('minor_r')){
//             h.push('MINOR \n REIMBURSEMENT');
//             h2.push('MINOR REIMBURSEMENT');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].minor_r ? billMaker[i].minor_r : ''); 
//             else
//             total.push(billMaker[i].minor_r ? billMaker[i].minor_r : ''); 
//         }      
//         if(fields.includes('variable_incentive')){
//             h.push('SPECIAL \n INCENTIVE \n(AS PER \n PRINCIPAL \n EMPLOYER \n DISCRETION)');
//             h2.push('SPECIAL INCENTIVE(AS PER PRINCIPAL EMPLOYER DISCRETION)');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''); 
//             else
//             total.push(billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''); 
//         }      
//         if(fields.includes('actual_pay')){
//             h.push('ACTUAL \n PAY');
//             h2.push('ACTUAL PAY');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].actual_pay ? billMaker[i].actual_pay : ''); 
//             else
//             total.push(billMaker[i].actual_pay ? billMaker[i].actual_pay : ''); 
//         }      
//         if(fields.includes('prop_basic')){
//             h.push('PROP \n BASIC');
//             h2.push('PROP BASIC');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].prop_basic ? billMaker[i].prop_basic : ''); 
//             else
//             total.push(billMaker[i].prop_basic ? billMaker[i].prop_basic : ''); 
//         }      
//         if(fields.includes('pf')){
//             h.push('PF');
//             h2.push('PF');
//             size.push(65);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].pf ? billMaker[i].pf : ''); 
//             else
//             total.push(billMaker[i].pf ? billMaker[i].pf : ''); 
//         }      
//         if(fields.includes('esic')){
//             h.push('ESIC');
//             h2.push('ESIC');
//             size.push(65);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].esic ? billMaker[i].esic : ''); 
//             else
//             total.push(billMaker[i].esic ? billMaker[i].esic : ''); 
//         }      
//         if(fields.includes('ptax')){
//             h.push('PTAX');
//             h2.push('PTAX');
//             size.push(65);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ptax ? billMaker[i].ptax : ''); 
//             else
//             total.push(billMaker[i].ptax ? billMaker[i].ptax : ''); 
//         }      
//         if(fields.includes('lwf')){
//             h.push('LWF');
//             h2.push('LWF');
//             size.push(65);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].lwf ? billMaker[i].lwf : ''); 
//             else
//             total.push(billMaker[i].lwf ? billMaker[i].lwf : ''); 
//         }      
//         if(fields.includes('advance')){
//             h.push('ADVANCE');
//             h2.push('ADVANCE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].advance ? billMaker[i].advance : ''); 
//             else
//             total.push(billMaker[i].advance ? billMaker[i].advance : ''); 
//         }          
//         if(fields.includes('net_pay')){
//             h.push('NET \n PAY');
//             h2.push('NET PAY');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].net_pay ? billMaker[i].net_pay : ''); 
//             else
//             total.push(billMaker[i].net_pay ? billMaker[i].net_pay : ''); 
//         }      
//         if(fields.includes('mgmt_pf')){
//             h.push('MGMT \n PF');
//             h2.push('MGMT PF');
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ''); 
//             else
//             total.push(billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ''); 
//         }      
//         if(fields.includes('mgmt_esic')){
//             h.push('MGMT \n ESIC');
//             h2.push('MGMT ESIC');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ''); 
//             else
//             total.push(billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ''); 
//         }      
//         if(fields.includes('mgmt_lwf')){
//             h.push('MGMT \n LWF');
//             h2.push('MGMT LWF');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ''); 
//             else
//             total.push(billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ''); 
//         }      
//         if(fields.includes('ctc')){
//             h.push('CTC');
//             h2.push('CTC');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ctc ? billMaker[i].ctc : ''); 
//             else
//             total.push(billMaker[i].ctc ? billMaker[i].ctc : ''); 
//         }      
//         if(fields.includes('production_incentive')){
//             h.push('PRODUCTION \n OR \n VARIABLE \n INCENTIVE');
//             h2.push('PRODUCTION OR VARIABLE INCENTIVE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].production_incentive ? billMaker[i].production_incentive : ''); 
//             else
//             total.push(billMaker[i].production_incentive ? billMaker[i].production_incentive : ''); 
//         }      
//         if(fields.includes('gross_incentive')){
//             h.push('ACTUAL \n PAYABLE');
//             h2.push('ACTUAL PAYABLE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ''); 
//             else
//             total.push(billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ''); 
//         }      
//         // if(fields.includes('invoice_amount1')){
//         //     h.push('INVOICE AMOUNT1');
//         //     h2.push('INVOICE AMOUNT1');
//         //     size.push(70);
//         //     r.push(billMaker[i].invoice_amount1 ? billMaker[i].invoice_amount1 : ''); 
//         // }      
//         // if(fields.includes('invoice_amount2')){
//         //     h.push('INVOICE \n AMOUNT2');
//         //     h2.push('INVOICE AMOUNT2');
//         //     size.push(70);
//         //     r.push(billMaker[i].invoice_amount2 ? billMaker[i].invoice_amount2 : ''); 
//         // }      
//         // if(fields.includes('service_charge')){
//         //     h.push('SERVICE \n CHARGE');
//         //     h2.push('SERVICE CHARGE');
//         //     size.push(70);
//         //     r.push(billMaker[i].service_charge ? billMaker[i].service_charge : ''); 
//         // }      
//         // if(fields.includes('cost_of_contract')){
//         //     h.push('COST OF \n CONTRACT \n STAFFING \n SERVICES \n 1');
//         //     h2.push('COST OF CONTRACT STAFFING SERVICES 1');
//         //     size.push(80);
//         //     r.push(billMaker[i].cost_of_contract ? billMaker[i].cost_of_contract : ''); 
//         // }      
//         // if(fields.includes('cost_of_contract2')){
//         //     h.push('COST OF \n CONTRACT \n STAFFING \n SERVICES \n 2');
//         //     h2.push('COST OF CONTRACT STAFFING SERVICES 2');
//         //     size.push(80);
//         //     r.push(billMaker[i].cost_of_contract2 ? billMaker[i].cost_of_contract2 : ''); 
//         // }  
//        rows.push(r);
//        rows2.push(r);
//        let table='';
//        if(type==2){        
//         // table = {
//         //     title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
//         //      "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
//         //     'WAGE SLIP : '+ ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
//         //     // subtitle: "Subtitle",
//         //     headers: h,
//         //     rows: rows,
//         //     divider: {
//         //         header: { disabled: false, width: 2, opacity: 1 },
//         //         horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
//         //       },
//         //   };
    
//       // A4 595.28 x 841.89 (portrait) (about width sizes)
//       // width
//     pdfDoc.fontSize(12);
      
    
//     //   await pdfDoc.table(table, { 
//     //     // width: 2100,
//     // columnsSize: [
//     //     120, 70, 70, 70, 70, 70, 70, 70, 70,
//     //      70, 70, 70, 70, 70, 70, 70, 70, 70,
//     //      70, 70, 65, 65, 65, 65, 70, 70, 70,
//     //      70, 70, 70, 70, 70, 70, 70, 80, 80,
//     //      70, 70, 70, 70, 70, 70, 70, 80, 80,
//     //   ],
//     // columnSpacing: 16, 
//     // height:200,
//     // rowSpacing: 15, 
//     // prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
//     //     prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),

//     //   });
    
//     pdfDoc.registerFont('bengali', path.join('utils','kalpurush.ttf'));
//     pdfDoc.registerFont('hindi', path.join('utils','hindi.ttf'));
//        pdfDoc.font('Helvetica-Bold').text('PAYSLIP / ',150,25,{
//         align:'left',
//         width: 600,
//         height:60,
//         continued:true,
//         lineBreak:false
//        }).font('bengali').text('পেস্লিপ / ',{

//         continued:true,
//         lineBreak:false

//        }).font('hindi').text('वेतन पर्ची',{

//         continued:true,
//         lineBreak:false

//        }).font('bengali').text(' for the month of ' + mm.toUpperCase() + ' ' +billMaker[0].month_year.substr(0,4),{
//         continued:false,
      
//        }); 

//        if(billMaker[0].company_master.logo){
//         if (fs.existsSync(billMaker[0].company_master.logo)) {
//         pdfDoc.image(billMaker[0].company_master.logo, 8, 40, { width: 20, height: 20, align:'left' })
//         .rect(8, 40, 20, 20)
//         .stroke();
//         }
//     }   
//        pdfDoc.text('CONTRACTOR / ঠিকাদার /',40,45,{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:true,
//         continued:true,
//         lineBreak:false
//        }).font('hindi').text(' ठेकेदार',{
        
//         // continued:true,
//         lineBreak:false

//        }); 
//        pdfDoc.font('Helvetica').text(billMaker[0].company_master.company_name,10,70,{
//         align:'left',
//         width: 250,
//         height:60,

//         underline:false
//        }); 
//        pdfDoc.fontSize(10);

//        pdfDoc.text(billMaker[0].company_master.address,pdfDoc.x,pdfDoc.y+10,{
//         align:'left',
//         width: 250,
//         height:60,

//        }); 
//         pdfDoc.fontSize(12);
        
//        pdfDoc.font('bengali').text('PRINCIPAL EMPLOYER / প্রধান নিয়োগকর্তা /',pdfDoc.x+270,45,{
//         align:'left',
//         width: 290,
//         height:10,
//         underline:true,
//         continued:true,
//         lineBreak:false
//        }).font('hindi').text(' प्रधान नियोक्ता',{
        
//         // continued:true,
//         lineBreak:false

//        }); 
//        pdfDoc.font('Helvetica').text(billMaker[0].client_master.client_name,pdfDoc.x,70,{
//         align:'left',
//         width: 300,
//         height:10,
//         underline:false
//        }); 

//        pdfDoc.fontSize(10);

//        pdfDoc.text(client[0].address,pdfDoc.x,pdfDoc.y+10,{
//         align:'left',
//         width: 250,
//         height:60,
//        }); 
//        pdfDoc.moveDown();
//        pdfDoc.moveDown();

//        pdfDoc.text('_________________________________________________________________________________________________________',10,pdfDoc.y,{
//         align:'left',
//         width: 600,
//         height:60,
//        }); 
//        pdfDoc.moveDown();
//        pdfDoc.fontSize(10);
//        var heighh = pdfDoc.y;
       
//        pdfDoc.font('bengali').text('General Information / ',{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:true,
//         continued:true,
//         lineBreak:false
//        }).font('bengali').text('সাধারণ জ্ঞাতব্য / ',{
//         continued:true,
//         lineBreak:false
//        }).font('hindi').text('सामान्य जानकारी',{
//        }); 
//        pdfDoc.moveDown();
//        var totalGap=pdfDoc.y;
//        pdfDoc.fontSize(9);

//        if(fields.includes('name')){
//         pdfDoc.font('bengali').text('Name / নাম / ' ,{
//             align:'left',
//             width: 250,
//             height:60,
//             underline:false,
//         continued:true,
//         lineBreak:false
//        }).font('hindi').text('नाम : ',{
//         continued:true,
//         lineBreak:false
//        }).font('Helvetica-Bold').text( (billMaker[i].name ? billMaker[i].name : ''),{
//         continued:false,
   
//     }); 
//        pdfDoc.moveDown();
//        totalGap++;
//        if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
//     }
//        if(fields.includes('aadhaar')){
//         pdfDoc.font('bengali').text('Aadhar No / আধার /  ' ,{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//         lineBreak:false
//        }).font('hindi').text('आधार : ',{
//         continued:true,
//         lineBreak:false
//        }).font('Helvetica-Bold').text(billMaker[i].aadhaar ? billMaker[i].aadhaar : ' ',{
//         continued:false,
  
//     }); 

//        pdfDoc.moveDown();
//     //    totalGap++;
//        if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;

//     }
//     if(fields.includes('gender')){
//         pdfDoc.font('bengali').text('GENDER / লিঙ্গ /  ' ,{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//         lineBreak:false
//        }).font('hindi').text('लिंग : ',{
//         continued:true,
//         lineBreak:false
//        }).font('Helvetica-Bold').text(billMaker[i].gender ? billMaker[i].gender : ' ',{
//         continued:false,
  
//     }); 

//        pdfDoc.moveDown();
//     //    totalGap++;
//        if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;

//     }
//     if(fields.includes('uan')){
//             pdfDoc.font('bengali').text('UAN NO / ইউএএন / ' ,{
//                 align:'left',
//                 width: 300,
//                 height:60,
//                 continued:true,
//             lineBreak:false
//            }).font('hindi').text('यूएएन न : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].uan ? billMaker[i].uan : ' '),{
        
//             continued:false,
//         }); 
//            pdfDoc.moveDown();
//         //    totalGap++;
//            if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;

//         }
//         if(fields.includes('esic_no')){
//             pdfDoc.font('bengali').text('ESIC NO / ইএসআইসি নং / ',{
//                 align:'left',
//                 width: 300,
//                 height:60,
//                 continued:true,
//                 lineBreak:false
//                }).font('hindi').text('ईएसआईसी सं : ',{
//                 continued:true,
//                 lineBreak:false
//                }).font('Helvetica-Bold').text( (billMaker[i].esic_no ? billMaker[i].esic_no : ' '),{
//                 continued:false,
    
//                }); 
//         //    totalGap++;
//            pdfDoc.font('Helvetica');
    
//            pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;

//         }
//     //    if(fields.includes('uan')){
//     //     pdfDoc.text('UAN NO / ইউএএন / ' ,{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         continued:true,
//     //     lineBreak:false
//     //    }).font('hindi').text('यूएएन : ',{
//     //     continued:true,
//     //     lineBreak:false
//     //    }).font('bengali').text( (billMaker[i].uan ? billMaker[i].uan : ''),{
//     //    }); 
//     //    totalGap++;
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('esic_no')){
//     //     pdfDoc.text('ESIC NO : ' ,{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         continued:true,
//     //     lineBreak:false
//     //    }).font('hindi').text('आधार : ',{
//     //     continued:true,
//     //     lineBreak:false
//     //    }).font('bengali').text( (billMaker[i].esic_no ? billMaker[i].esic_no : ''),{
//     //    }); 
//     //    totalGap++;
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('gender')){
//     //     pdfDoc.text('Gender : ' + (billMaker[i].gender ? billMaker[i].gender : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         continued:true,
//     //     lineBreak:false
//     //    }).font('hindi').text('आधार : ',{
//     //     continued:true,
//     //     lineBreak:false
//     //    }).font('bengali').text( (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
//     //    }); 
//     //    totalGap++;
//     //    pdfDoc.moveDown();

//     //    }
//        if(fields.includes('emp_code')){
//         pdfDoc.font('bengali').text('Emp Code / Emp কোড / ' ,pdfDoc.x+280,heighh+20,{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//         lineBreak:false
//        }).font('hindi').text('ईएमपी कोड : ',{
//         continued:true,
//         lineBreak:false
//        }).font('Helvetica-Bold').text( (billMaker[i].emp_code ? billMaker[i].emp_code : ' '),{
//         continued:false,

//        }); 
     

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
//     //    totalGap--;
//     }

//        if(fields.includes('designation')){
//         pdfDoc.font('bengali').text('Designation / উপাধি / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('पद : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].designation ? billMaker[i].designation : ' '),{
//             continued:false,

//            }); 
//     //    totalGap--;

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
//     }
   
//     if(fields.includes('bank')){
//         pdfDoc.font('bengali').text('BANK NAME / ব্যাংকের নাম / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('बैंक का नाम : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].bank ? billMaker[i].bank : ' '),{
//             continued:false,

//            }); 
//     //    totalGap--;

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
//     }
    
//     if(fields.includes('ac_no')){
//         pdfDoc.font('bengali').text('BANK ACCOUNT / ব্যাংক হিসাব / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('बैंक खाता : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].ac_no ? billMaker[i].ac_no : ' '),{
//             continued:false,

//            }); 
//     //    totalGap--;

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
//     }
    
//     if(fields.includes('ifsc')){
//         pdfDoc.font('bengali').text('IFSC / IFSC কোড / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('आईएफएससी कोड : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].ifsc ? billMaker[i].ifsc : ' '),{
//             continued:false,

//            }); 
//     //    totalGap--;

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap) totalGap = pdfDoc.y;
//     }
//     //    if(fields.includes('bank')){
//     //     pdfDoc.text('Bank : ' + (billMaker[i].bank ? billMaker[i].bank : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         continued:true,
//     //     lineBreak:false
//     //    }).font('hindi').text('आधार : ',{
//     //     continued:true,
//     //     lineBreak:false
//     //    }).font('bengali').text( (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
//     //    }); 
//     //    totalGap--;
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('ac_no')){
//     //     pdfDoc.text('A/C No : ' + (billMaker[i].ac_no ? billMaker[i].ac_no : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         continued:true,
//     //         lineBreak:false
//     //        }).font('hindi').text('आधार : ',{
//     //         continued:true,
//     //         lineBreak:false
//     //        }).font('bengali').text( (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
//     //        }); 
//     //    totalGap--;
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('ifsc')){
//     //     pdfDoc.text('IFSC : ' + (billMaker[i].ifsc ? billMaker[i].ifsc : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         continued:true,
//     //     lineBreak:false
//     //    }).font('hindi').text('आधार : ',{
//     //     continued:true,
//     //     lineBreak:false
//     //    }).font('bengali').text( (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
//     //    }); 
//     //    pdfDoc.moveDown();
//     //    totalGap--;

//     //    }
//     pdfDoc.font('Helvetica');
//     // // console.log(totalGap);
//     //    for(var k=0;k<=totalGap+1;k++)
//     //     pdfDoc.moveDown();

//        pdfDoc.text('__________________________________________________________________________________________________________________',10,totalGap+5,{
//         align:'left',
//         width: 600,
//         height:60,
//        }); 
//        pdfDoc.moveDown();
//        pdfDoc.fontSize(10);
//        var totalGap2= pdfDoc.y;
//        pdfDoc.font('bengali').text('Salary Details / বেতন বিবরণ / ',{
//         align:'left',
//         width: 500,
//         height:60,
//         underline:true,
//         continued:true,
//         lineBreak:false
//        }).font('hindi').text('वेतन विवरण ',{
//         continued:true,
//         lineBreak:false
//        }).font('Helvetica').text('(All details are provided by Principal Employer)',pdfDoc.x,pdfDoc.y+3,{
//         continued:false,
//         underline:false
//        }); 
//        pdfDoc.moveDown();
//        heighh = pdfDoc.y;
//        pdfDoc.fontSize(9);

//        if(fields.includes('gross_salary')){
//         pdfDoc.font('bengali').text('GROSS SALARY / মোট বেতন / ',{
//             align:'left',
//             width: 350,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('सकल वेतन : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].gross_salary ? billMaker[i].gross_salary : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;

//     }
//     //    if(fields.includes('gross_salary')){
//     //     pdfDoc.font('Helvetica').text('GROSS SALARY : ' + (billMaker[i].gross_salary ? billMaker[i].gross_salary : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     if(fields.includes('basic_salary')){
//         pdfDoc.font('bengali').text('BASIC SALARY / মূল বেতন / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('मूल वेतन : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].basic_salary ? billMaker[i].basic_salary : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
//     }
//     // if(fields.includes('basic_salary')){
//     //     pdfDoc.text('BASIC SALARY : ' + (billMaker[i].basic_salary ? billMaker[i].basic_salary : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     if(fields.includes('hra')){
//         pdfDoc.font('bengali').text('HOUSE RENT ALLOWANCE / বাড়ি ভাড়া ভাতা / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('मकान किराया भत्ता : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].hra ? billMaker[i].hra : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
//     }
//     // if(fields.includes('hra')){
//     //     pdfDoc.text('HRA : ' + (billMaker[i].hra ? billMaker[i].hra : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     if(fields.includes('present_days')){
//         pdfDoc.font('bengali').text('PRESENT DAYS / বর্তমান দিন / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('वर्तमान दिन : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].present_days ? billMaker[i].present_days : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
//     }
//     // if(fields.includes('present_days')){
//     //     pdfDoc.text('Present Days : ' + (billMaker[i].present_days ? billMaker[i].present_days : ''),pdfDoc.x+160,heighh,{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     if(fields.includes('ot_hour')){
//         pdfDoc.font('bengali').text('OVERTIME / ওভারটাইম / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('अधिक समय तक : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].ot_hour ? billMaker[i].ot_hour : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
//     }
    
//     if(fields.includes('odd_hours')){
//         pdfDoc.font('bengali').text('PAID LEAVE / বেতনভোগী ছুটি / ',pdfDoc.x+300,heighh,{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('भुगतान की छुट्टी : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].odd_hours ? billMaker[i].odd_hours : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
//     }
//     if(fields.includes('absent')){
//         pdfDoc.font('bengali').text('ABSENT / অনুপস্থিত / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('अनुपस्थित : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].absent ? billMaker[i].absent : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
//     }
//     if(fields.includes('holidays')){
//         pdfDoc.font('bengali').text('HOLIDAYS / ছুটির দিন / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('छुट्टियां : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].holidays ? billMaker[i].holidays : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
//     }
//     if(fields.includes('total_days')){
//         pdfDoc.font('bengali').text('TOTAL DAYS / মোট দিন / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('कुल दिन : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].total_days ? billMaker[i].total_days : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
//     }
//     if(fields.includes('ot_rate')){
//         pdfDoc.font('bengali').text('OT RATE / OT রেট / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('ओटी दर : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].ot_rate ? billMaker[i].ot_rate : ' '),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap2) totalGap2 = pdfDoc.y;
//     }
//     // if(fields.includes('absent')){
//     //     pdfDoc.text('Absent Days : ' + (billMaker[i].absent ? billMaker[i].absent : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     // if(fields.includes('odd_hours')){
//     //     pdfDoc.text('PAID LEAVE / LEAVE ADJUSTMENT : ' + (billMaker[i].odd_hours ? billMaker[i].odd_hours : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     // if(fields.includes('ot_rate')){
//     //     pdfDoc.text('OT Rate : ' + (billMaker[i].ot_rate ? billMaker[i].ot_rate : ''),pdfDoc.x+120,heighh,{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     // if(fields.includes('ot_hour')){
//     //     pdfDoc.text('OT Hours : ' + (billMaker[i].ot_hour ? billMaker[i].ot_hour : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     // if(fields.includes('holidays')){
//     //     pdfDoc.text('HOLIDAYS ( WEEKLY + FESTIVE ) : ' + (billMaker[i].holidays ? billMaker[i].holidays : ''),pdfDoc.x+80,heighh,{
//     //         align:'left',
//     //         width: 200,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     // if(fields.includes('total_days')){
//     //     pdfDoc.text('Total Days : ' + (billMaker[i].total_days ? billMaker[i].total_days : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();

//     // }
//     // pdfDoc.moveDown();
//     // pdfDoc.moveDown();
//     pdfDoc.fontSize(10);
//     pdfDoc.font('Helvetica');
//     pdfDoc.text('_________________________________________________________________________________________________________',10,totalGap2,{
//         align:'left',
//         width: 600,
//         height:60,
//        }); 
//     pdfDoc.moveDown();
       
//     var heighh = pdfDoc.y;
//     pdfDoc.fontSize(10);
       
//     pdfDoc.font('bengali').text('Earnings / আয় / ',{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:true,
//         continued:true,
//         lineBreak:false
//        }).font('hindi').text('आय',{
//         continued:false
//        }); 
//     //    pdfDoc.font('bengali').text('Earnings / ',{
//     //     align:'left',
//     //     width: 250,
//     //     height:60,
//     //     underline:true
//     //    }); 
//        pdfDoc.moveDown();
//        pdfDoc.fontSize(9);
//     var totalGap3 = pdfDoc.y;
       
//     if(fields.includes('prop_gross')){
//         pdfDoc.font('bengali').text('PROPORTIONATE GROSS / আনুপাতিক গ্রস / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('आनुपातिक सकल : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].prop_gross ? billMaker[i].prop_gross : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
//     //    if(fields.includes('prop_gross')){
//     //     pdfDoc.font('Helvetica').text('PROP GROSS : ' + (billMaker[i].prop_gross ? billMaker[i].prop_gross : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     if(fields.includes('prop_basic')){
//         pdfDoc.font('bengali').text('PROPORTIONATE BASIC / আনুপাতিক মৌলিক / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('आनुपातिक बुनियादी : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].prop_basic ? billMaker[i].prop_basic : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
    
//     if(fields.includes('ot_amount')){
//         pdfDoc.font('bengali').text('OT AMOUNT / OT পরিমাণ / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('ओटी राशि : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].ot_amount ? billMaker[i].ot_amount : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
    
//     if(fields.includes('minor_r')){
//         pdfDoc.font('bengali').text('MINOR REIMBURSEMENT / সামান্য প্রতিদান / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('मामूली प्रतिपूर्ति : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].minor_r ? billMaker[i].minor_r : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
    
//     if(fields.includes('variable_incentive')){
//         pdfDoc.font('bengali').text('SPECIAL INCENTIVE / বিশেষ প্রণোদনা / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('विशेष प्रोत्साहन : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
    
//     if(fields.includes('actual_pay')){
//         pdfDoc.font('bengali').text('ACTUAL PAYMENT / প্রকৃত অর্থপ্রদান / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('वास्तविक भुगतान : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].actual_pay ? billMaker[i].actual_pay : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
//     //    if(fields.includes('prop_basic')){
//     //     pdfDoc.text('PROP BASIC : ' + (billMaker[i].prop_basic ? billMaker[i].prop_basic : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('odd_hours')){
//     //     pdfDoc.text('ODD HOURS DUTY INCENTIVE : ' + (billMaker[i].odd_hours ? billMaker[i].odd_hours : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('variable_incentive')){
//     //     pdfDoc.text('SPECIAL INCENTIVE (AS PER PRINCIPAL EMPLOYER DISCRETION) : ' + (billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('ot_amount')){
//     //     pdfDoc.text('OT AMOUNT : ' + (billMaker[i].ot_amount ? billMaker[i].ot_amount : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();

//     //    }
//     //    if(fields.includes('minor_r')){
//     //     pdfDoc.text('MINOR REIMBURSEMENT : ' + (billMaker[i].minor_r ? billMaker[i].minor_r : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();

//     //    }
       
//     //    if(fields.includes('production_incentive')){
//     //     pdfDoc.text('PRODUCTION OR VARIABLE INCENTIVE : ' + (billMaker[i].production_incentive ? billMaker[i].production_incentive : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();

//     //    }
//     //    if(fields.includes('actual_pay')){
//     //     pdfDoc.text('ACTUAL PAY : ' + (billMaker[i].actual_pay ? billMaker[i].actual_pay : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();

//     //    }
//        pdfDoc.fontSize(10);
//     pdfDoc.font('bengali').text('Deductions / কর্তন / ',pdfDoc.x+300,heighh,{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:true,
//         continued:true,
//         lineBreak:false
//        }).font('hindi').text('कटौती',{
//         continued:false
//        }); 
//        pdfDoc.fontSize(9);
//        pdfDoc.moveDown();
//        if(fields.includes('pf')){
//         pdfDoc.font('bengali').text('EMPLOYEE PF / কর্মচারী পিএফ / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('कर्मचारी पी.एफ : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].pf ? billMaker[i].pf : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//     }
//     if(fields.includes('esic')){
//         pdfDoc.font('bengali').text('EMPLOYEE ESIC / কর্মচারী ESIC / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('कर्मचारी ईएसआईसी : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].esic ? billMaker[i].esic : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
//     if(fields.includes('ptax')){
//         pdfDoc.font('bengali').text('P-TAX / পি-ট্যাক্স / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('पी-टैक्स : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].ptax ? billMaker[i].ptax : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
//     if(fields.includes('lwf')){
//         pdfDoc.font('bengali').text('LABOUR WELFARE FUND / শ্রম কল্যাণ তহবিল / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('श्रम कल्याण कोष : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].lwf ? billMaker[i].lwf : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
//     if(fields.includes('advance')){
//         pdfDoc.font('bengali').text('ADVANCE / অগ্রিম / ',{
//             align:'left',
//             width: 300,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('अग्रिम : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text( (billMaker[i].advance ? billMaker[i].advance : ''),{
//             continued:false,

//            }); 

//        pdfDoc.moveDown();
//        if(pdfDoc.y>totalGap3) totalGap3 = pdfDoc.y;
//     }
//     //    pdfDoc.font('Helvetica-Bold').text('Deductions',pdfDoc.x+300,heighh,{
//     //     align:'left',
//     //     width: 250,
//     //     height:60,
//     //     underline:true
//     //    }); 
//     //    pdfDoc.moveDown();
//     //    if(fields.includes('pf')){
//     //     pdfDoc.font('Helvetica').text('EMP PF : ' + (billMaker[i].pf ? billMaker[i].pf : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();
//     // }

//     //    if(fields.includes('esic')){
//     //     pdfDoc.text('EMP ESIC : ' + (billMaker[i].esic ? billMaker[i].esic : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('ptax')){
//     //     pdfDoc.text('EMP PTAX : ' + (billMaker[i].ptax ? billMaker[i].ptax : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('advance')){
//     //     pdfDoc.text('Advance : ' + (billMaker[i].advance ? billMaker[i].advance : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//     //    if(fields.includes('lwf')){
//     //     pdfDoc.text('LWF : ' + (billMaker[i].lwf ? billMaker[i].lwf : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         });
//     //    }
//     //    pdfDoc.moveDown();
//     //    pdfDoc.moveDown();
//     //    pdfDoc.moveDown();
//     //    pdfDoc.moveDown();

//        if(fields.includes('net_pay')){
//         var heighhh = totalGap3+20;

//         pdfDoc.font('Helvetica-Bold').text('NET PAYMENT / ',10,totalGap3+20,{
//             align:'left',
//             width: 600,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('bengali').text('সর্বমোট প্রদান / ',{
//             align:'left',
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('कुल भुगतान : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text(billMaker[i].net_pay ? billMaker[i].net_pay : ' ',{
//             continued:false,
//            });
//             pdfDoc.moveDown();
//         }
//         if(fields.includes('production_incentive')){
//          pdfDoc.font('Helvetica-Bold').text('PRODUCTION INCENTIVE / ',{
//              align:'left',
//              width: 600,
//              height:60,
//              continued:true,
//              lineBreak:false
//             }).font('bengali').text('উৎপাদন প্রণোদনা / ',{
//              continued:true,
//              lineBreak:false
//             }).font('hindi').text('उत्पादन प्रोत्साहन : ',{
//              continued:true,
//              lineBreak:false
//             }).font('Helvetica-Bold').text(billMaker[i].production_incentive ? billMaker[i].production_incentive : ' ',{
//              continued:false,
//             });
//              pdfDoc.moveDown();
//          }
//        if(fields.includes('gross_incentive')){
//         pdfDoc.font('Helvetica-Bold').text('TOTAL FINAL PAYMENT / ',{
//             align:'left',
//             width: 600,
//             height:60,
//             continued:true,
//             lineBreak:false
//            }).font('bengali').text('মোট চূড়ান্ত অর্থপ্রদান / ',{
//             continued:true,
//             lineBreak:false
//            }).font('hindi').text('कुल अंतिम भुगतान : ',{
//             continued:true,
//             lineBreak:false
//            }).font('Helvetica-Bold').text(billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ' ',{
//             continued:false,
//            });
//             pdfDoc.moveDown();
//         }
//         if(fields.includes('mgmt_pf')){
//             pdfDoc.font('Helvetica').text('MANAGEMENT PF / ' ,300,heighhh,{
//                 align:'left',
//                 width: 300,
//                 height:60,
//                 continued:true,
//                 lineBreak:false
//                }).font('bengali').text('ব্যবস্থাপনা / ',{
//                 continued:true,
//                 lineBreak:false
//                }).font('hindi').text('का प्रबंधन : ',{
//                 continued:true,
//                 lineBreak:false
//                }).font('Helvetica-Bold').text(billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ' ',{
//                 continued:false,
//                });
//            pdfDoc.moveDown();
//         }
//         if(fields.includes('mgmt_esic')){
//             pdfDoc.font('Helvetica').text('MANAGEMENT ESIC / ',{
//                 align:'left',
//                 width: 300,
//                 height:60,
//                 continued:true,
//                 lineBreak:false
//                }).font('bengali').text('ব্যবস্থাপনা ইএসআইসি / ',{
//                 continued:true,
//                 lineBreak:false
//                }).font('hindi').text('प्रबंधन ईएसआईसी : ',{
//                 continued:true,
//                 lineBreak:false
//                }).font('Helvetica-Bold').text(billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ' ',{
//                 continued:false,
//                });
//            pdfDoc.moveDown();
//         }
//         if(fields.includes('mgmt_lwf')){
//             pdfDoc.font('Helvetica').text('MANAGEMENT LWF / ' ,{
//                 align:'left',
//                 width: 300,
//                 height:60,
//                 continued:true,
//                 lineBreak:false
//                }).font('bengali').text('ব্যবস্থাপনা LWF / ',{
//                 continued:true,
//                 lineBreak:false
//                }).font('hindi').text('प्रबंधन एलडब्ल्यूएफ : ',{
//                 continued:true,
//                 lineBreak:false
//                }).font('Helvetica-Bold').text(billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ' ',{
//                 continued:false,
//                });
//         }
//     //    for(var ii=0;ii<(h2.length/2);ii++){
//     //     pdfDoc.text(h2[ii] + ' : ' + rows[0][ii],{
//     //     align:'left',
//     //     width: 300,
//     //     height:60,
//     //     underline:false
//     //     });
//     //     pdfDoc.moveDown();
//     //    }
//     //    pdfDoc.text('',pdfDoc.x+300,heighh,{
//     //     align:'left',
//     //     width: 0,
//     //     height:6,
//     //     });
//     //    for(ii=Math.floor(h2.length/2);ii<h2.length;ii++){
//     //     pdfDoc.text(h2[ii] + ' : ' + rows[0][ii],{
//     //     align:'left',
//     //     width: 300,
//     //     height:60,
//     //     });
//     //     pdfDoc.moveDown();
//     //    }
//     pdfDoc.font('Helvetica').text('__________________________________________________________________________________________________________________',10,pdfDoc.y+10,{
//         align:'left',
//         width: 600,
//         height:40,
//        }); 
//        pdfDoc.fontSize(9).text('* This is a computer generated payslip, hence no Signature or Stamp is required.',10,pdfDoc.y+10,{
//         align:'left',
//         width: 500,
//         height:60,
//         });

//         pdfDoc.fontSize(9).text('* Principal Employer determines Salary & Designation & provide attendance & reimburse the wages promptly & punctually before disbursement.',10,pdfDoc.y+10,{
//             align:'left',
//             width: 550,
//             height:60,
//             });
    
//     //   if(billMaker[0].company_master.stamp){
        
//     //     if (fs.existsSync(billMaker[0].company_master.stamp)) {
//     //     pdfDoc.image(billMaker[0].company_master.stamp, pdfDoc.x+450, pdfDoc.y - 20, { width: 40, height: 40, align:'right' })
//     //     .rect(pdfDoc.x+450, pdfDoc.y-20, 40, 40)
//     //     .stroke();
//     //     }
//     // }   


//     if(i!=billMaker.length - 1)
//         pdfDoc.addPage();


//        }
//         }
//       if(type==1){
//         pdfDoc.fontSize(18).font('Helvetica-Bold').text('FORM XVII',0,40,{
//             align:'center',
//             width:sizee2,
//             height:20,
//         });
// pdfDoc.font('Helvetica').text('[See Rule 78(1)(a)(i)]',pdfDoc.x,pdfDoc.y+5,{
//         align:'center',
//         width:sizee2,
//         height:20,
// });
// pdfDoc.font('Helvetica-Bold').text('Register of Wages',pdfDoc.x,pdfDoc.y+5,{
//         align:'center',
//         width:sizee2,
//         height:20,
// });
// pdfDoc.text('NAME AND ADDRESS OF CONTRACTOR',pdfDoc.x+10,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text(billMaker[0].company_master.company_name,pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text(billMaker[0].company_master.address,pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text('CLIENT NAME AND ADDRESS',pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text(billMaker[0].client_master.client_name,pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text(client[0].address,pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:sizee2 - 100,
//     height:20,
//     continued:true,
//     lineBreak:false
// });
// pdfDoc.text('WAGE PERIOD : '+mm + ' ' +billMaker[0].month_year.substr(0,4),pdfDoc.x,pdfDoc.y+5,{
//     align:'right',
//     width:sizee2 - 100,
//     height:20,
// });
// pdfDoc.moveDown();
// rows2.push(total);
// var rownUntill9 = [];
// var ll = 8;
// if(rows2.length<8){
//     ll = rows2.length;
// }
// for(var a=0;a<ll;a++)
//     rownUntill9.push(rows2[a]);

// table = {
//         // title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
//         //  "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
//         // 'WAGE SLIP : ' + ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
//         // subtitle: "Subtitle",
//         headers: h,
//         rows: rownUntill9,
//         divider: {
//             header: { disabled: false, width: 2, opacity: 1 },
//             horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
//           },
//     };
// rows2.splice(0,8);
// await pdfDoc.table(table, { 
//     // width: 2100,
//     columnsSize: size,
//     height:200,
//     columnSpacing: 15, 
//     rowSpacing: 10, 
//     prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
//    // prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),
//   prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
//         pdfDoc.font("Helvetica").fontSize(17);
//         // console.log(row);
//         // console.log('----');
//         // console.log(indexColumn);
//         // console.log(indexRow);
//         // console.log(rectRow);
//         // console.log(rectCell);
//       },
//   });
 
// //dividing into groups of 13
// var ll = (rows2.length/10);
// for(var aa = 0;aa<ll;aa++){
//     var eachRow = [];
//     var newRow = rows2.splice(0,10);
//     const newTable = {
//         // title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
//         //  "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
//         // 'WAGE SLIP : ' + ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
//         // subtitle: "Subtitle",
//         headers: h,
//         rows: newRow,
//         divider: {
//             header: { disabled: false, width: 2, opacity: 1 },
//             horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
//           },
//     };
//     pdfDoc.addPage();

//     await pdfDoc.table(newTable, { 
//         // width: 2100,
//         columnsSize: size,
//         height:200,
//         columnSpacing: 15, 
//         rowSpacing: 10, 
//         prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
//        // prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),
//       prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
//             pdfDoc.font("Helvetica").fontSize(17);
//             // console.log(row);
//             // console.log('----');
//             // console.log(indexColumn);
//             // console.log(indexRow);
//             // console.log(rectRow);
//             // console.log(rectCell);
//           },
//       });
//       if(aa==ll && newRow.length>9)
//         pdfDoc.addPage();
     
// }




// pdfDoc.text('1. The Gross Salary and all its components and bifurcations are determined by the Principal Employer only. ',10,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });

// pdfDoc.text('2. Attendance, Any reimbursement, Incentive, or any other benefits given to the employee are only after the sanction of the Principal Employer and/or mutual understanding of the Principal and Employee.',{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text('3. All payments are made through NEFT or Bank transfer, and thus requires no signature of Employees. In any other mode of payment, signature to follow. ',{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text('4. This is an auto generated computerised document, prepared on the basis of data provided by the employee and Principal. ',{
//     align:'left',
//     width:1800,
//     height:20,
// });
//   if(billMaker[0].company_master.stamp){
//     var sizee = fields.length * 65;

//     if (fs.existsSync(billMaker[0].company_master.stamp)) {
//     pdfDoc.image(billMaker[0].company_master.stamp, pdfDoc.x + sizee, pdfDoc.y, { width: 80, height: 80, align:'right' })
//     .rect(pdfDoc.x + sizee, pdfDoc.y-80, 80, 80)
//     .stroke();
//     }
// }     
//       }
     
//         pdfDoc.end();

//     }else{
//     //excel
//     let data = [];
//     let data2 =[]; 
//     if(type==2){
//     data2 = [{
//         'PRINCIPAL EMPLOYER':  billMaker[0].client_master.client_name,
//         'CONTRACTOR':billMaker[0].company_master.company_name,
//         'WAGE SLIP FOR THE MONTH OF ':mm + ' ' +billMaker[0].month_year.substr(0,4)
//     }];
// }else{
//     data2 = [{
//         'NAME & ADDRESS OF CONTRACTOR':  billMaker[0].company_master.company_name,
//         'NAME & ADDRESS OF CLIENT':billMaker[0].client_master.client_name,
//         'WAGE PERIOD':mm + ' ' +billMaker[0].month_year.substr(0,4)
//     },{       
//         'NAME & ADDRESS OF CONTRACTOR':  billMaker[0].company_master.address,
//         'NAME & ADDRESS OF CLIENT':client[0].address 
//     }];
// }
// for(let i=0;i<billMaker.length;i++){

//     data[0]={};
//     data[1]={};
//     data[i+2]={};
//     data[0]['Sl No']='Sl No';
//     data[1]['Sl No']='Sl No';
//     data[i+2]['Sl No']=i+1;
//     if(fields.includes('name')){
//         data[0]['Name Of The Worker']='नाम';
//         data[1]['Name Of The Worker']='নাম';
//         data[i+2]['Name Of The Worker']=billMaker[i].name;
//     }
//     if(fields.includes('emp_code')){
//         data[0]['EMPLOYEE CODE']='कर्मचारी कोड';   
//         data[1]['EMPLOYEE CODE']='কর্মী কোড';   
//         data[i+2]['EMPLOYEE CODE']=billMaker[i].emp_code;   
//     }
//     if(fields.includes('gender')){
//         data[0]['GENDER']='लिंग';  
//         data[1]['GENDER']='লিঙ্গ';  
//         data[i+2]['GENDER']=billMaker[i].gender;  
//     }
//     if(fields.includes('aadhaar')){
//     data[0]['AADHAR NO']='आधार नंबर'; 
//     data[1]['AADHAR NO']='আধার নং'; 
//     data[i+2]['AADHAR NO']=billMaker[i].aadhaar;  
//     }
//     if(fields.includes('uan')){
//         data[0]['UAN NO']='UAN नंबर';  
//          data[1]['UAN NO']='UAN নম্বর';  
//           data[i+2]['UAN NO']=billMaker[i].uan;  
//         }
        
//     if(fields.includes('esic_no')){
//     data[0]['ESIC NO']='ESIC नंबर';
//     data[1]['ESIC NO']='ESIC নম্বর';
//     data[i+2]['ESIC NO']=billMaker[i].esic_no;
//     }  
    
//     if(fields.includes('designation')){
//         data[0]['DESIGNATION']='पद';
//         data[1]['DESIGNATION']='নিয়োগ';
//         data[i+2]['DESIGNATION']=billMaker[i].designation;    
//         }
        
//     if(fields.includes('bank')){
//     data[0]['BANK']='बैंक का नाम';
//     data[1]['BANK']='ব্যাংকের নাম';
//     data[i+2]['BANK']=billMaker[i].bank;
//     }  
    
//     if(fields.includes('ac_no')){
//         data[0]['A/C NO']='अकाउंट नंबर';  
//         data[1]['A/C NO']='অ্যাকাউন্ট নম্বর';  
//         data[i+2]['A/C NO']=billMaker[i].ac_no;  
//         }
//     if(fields.includes('ifsc')){
//     data[0]['IFSC']='आई०ऍफ़०एस० कोड';        
//     data[1]['IFSC']='আইএফএস কোড';        
//     data[i+2]['IFSC']=billMaker[i].ifsc;        
// }
    
//     if(fields.includes('gross_salary')){
//         data[0]['GROSS SALARY']='सकल वेतन';  
//         data[1]['GROSS SALARY']='মোট বেতন';  
//         data[i+2]['GROSS SALARY']=billMaker[i].gross_salary;  
//         }
//     if(fields.includes('basic_salary')){
//     data[0]['BASIC SALARY']='मूल वेतन';      
//     data[1]['BASIC SALARY']='মূল বেতন';  
//     data[i+2]['BASIC SALARY']=billMaker[i].basic_salary;  

//     }
//     if(fields.includes('hra')){
//         data[0]['HRA']='गृह वाता';  
//         data[1]['HRA']='বাড়ি ভাড়া ভাতা';  
//         data[i+2]['HRA']=billMaker[i].hra;  

//     }
//     if(fields.includes('present_days')){
//         data[0]['PRESENT DAYS']='काम के दिन';  
//         data[1]['PRESENT DAYS']='কাজের দিন';  
//         data[i+2]['PRESENT DAYS']=billMaker[i].present_days;  

//         }
//     if(fields.includes('holidays')){
//     data[0]['HOLIDAYS ( WEEKLY + FESTIVE)']='छुट्टी का दिन';  
//     data[1]['HOLIDAYS ( WEEKLY + FESTIVE)']='ছুটির দিন';  
//     data[i+2]['HOLIDAYS ( WEEKLY + FESTIVE)']=billMaker[i].holidays;  
//     }
//     if(fields.includes('odd_hours')){
//     data[0]['PAID LEAVE / LEAVE ADJUSTMENT']='भुगतान छुट्टी समायोजन'; 
//     data[1]['PAID LEAVE / LEAVE ADJUSTMENT']='বেতনের ছুটি সমন্বয়';  
//     data[i+2]['PAID LEAVE / LEAVE ADJUSTMENT']=billMaker[i].odd_hours;  

//     }
//     if(fields.includes('absent')){
//         data[0]['ABSENT']='अनुपस्थित दिन';  
//         data[1]['ABSENT']='অনুপস্থিত দিন';  
//         data[i+2]['ABSENT']=billMaker[i].absent;  
//         }
//     if(fields.includes('total_days')){
//     data[0]['TOTAL DAYS']='कुल दिन';  
//     data[1]['TOTAL DAYS']='মোট দিন';  
//     data[i+2]['TOTAL DAYS']=billMaker[i].total_days;  
//     }
//     if(fields.includes('prop_gross')){
//         data[0]['PROP GROSS']='आनुपातिक सकल वेतन';
//         data[1]['PROP GROSS']='আনুপাতিক মোট বেতন';
//         data[i+2]['PROP GROSS']=billMaker[i].prop_gross;  
//      }   
//     if(fields.includes('ot_rate')){
//     data[0]['OT RATE']='ओवरटाइम दर';
//     data[1]['OT RATE']='ওভারটাইম হার';
//     data[i+2]['OT RATE']=billMaker[i].ot_rate;  
//     }
    
//     if(fields.includes('ot_hour')){
//         data[0]['OT HOURS']='अतिरिक्त समय अवधि';
//         data[1]['OT HOURS']='অতিরিক্ত ঘন্টা'; 
//         data[i+2]['OT HOURS']=billMaker[i].ot_hour;  
//         } 
        
//     if(fields.includes('ot_amount')){
//     data[0]['OT AMOUNT']='ओवरटाइम राशि';
//     data[1]['OT AMOUNT']='অতিরিক্ত কাজের বেতন';
//     data[i+2]['OT AMOUNT']=billMaker[i].ot_amount;  
//     }
    
//     if(fields.includes('minor_r')){
//         data[0]['MINOR REIMBURSEMENT']='मामूली प्रतिपूर्ति';
//         data[1]['MINOR REIMBURSEMENT']='সামান্য প্রতিদান';
//         data[i+2]['MINOR REIMBURSEMENT']=billMaker[i].minor_r; 
//         } 

        
//     if(fields.includes('variable_incentive')){
//     data[0]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']='विशेष प्रोत्साहन';
//     data[1]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']='বিশেষ প্রণোদনা';
//     data[i+2]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']=billMaker[i].variable_incentive; 
//     } 
    
//     if(fields.includes('actual_pay')){
//         data[0]['ACTUAL PAY']='वास्तविक भुगतान';
//         data[1]['ACTUAL PAY']='প্রকৃত বেতন';
//         data[i+2]['ACTUAL PAY']=billMaker[i].actual_pay; 
//         } 
        
//     if(fields.includes('prop_basic')){
//     data[0]['PROP BASIC']='आनुपातिक वेतन';
//     data[1]['PROP BASIC']='আনুপাতিক মৌলিক';
//     data[i+2]['PROP BASIC']=billMaker[i].prop_basic;
//     }  
    
//     if(fields.includes('pf')){
//         data[0]['PF']='कर्मचारी PF';
//         data[1]['PF']='কর্মচারী PF';
//         data[i+2]['PF']=billMaker[i].pf;  
//         }
//     if(fields.includes('esic')){
//     data[0]['ESIC']='कर्मचारी ESIC';
//     data[1]['ESIC']='কর্মচারী ESIC';
//     data[i+2]['ESIC']=billMaker[i].esic; 
//     } 
    
//     if(fields.includes('ptax')){
//         data[0]['PTAX']='कर्मचारी P TAX';
//         data[1]['PTAX']='কর্মচারী P TAX';
//         data[i+2]['PTAX']=billMaker[i].ptax;  
//         }
        
//     if(fields.includes('lwf')){
//     data[0]['LWF']='कर्मचारी LWF';
//     data[1]['LWF']='কর্মচারী LWF';
//     data[i+2]['LWF']=billMaker[i].lwf;  
//     }
    
//     if(fields.includes('advance')){
//         data[0]['ADVANCE']='एडवांस';
//         data[1]['ADVANCE']='অগ্রিম';
//         data[i+2]['ADVANCE']=billMaker[i].advance;  
//         }
        
//     if(fields.includes('net_pay')){
//     data[0]['NET PAY']='कुल भुगतान';
//     data[1]['NET PAY']='নেট বেতন';
//     data[i+2]['NET PAY']=billMaker[i].net_pay; 
//     } 
    
//     if(fields.includes('mgmt_pf')){
//         data[0]['MGMT PF']='प्रबंधन  PF';
//         data[1]['MGMT PF']='ব্যবস্থাপনা PF';
//         data[i+2]['MGMT PF']=billMaker[i].mgmt_pf;  
//         }
        
//     if(fields.includes('mgmt_esic')){
//     data[0]['MGMT ESIC']='प्रबंधन  ESIC';
//     data[1]['MGMT ESIC']='ব্যবস্থাপনা ESIC';
//     data[i+2]['MGMT ESIC']=billMaker[i].mgmt_esic;
//     }  
    
//     if(fields.includes('mgmt_lwf')){
//         data[0]['MGMT LWF']='प्रबंधन  LWF';
//         data[1]['MGMT LWF']='ব্যবস্থাপনা LWF';
//         data[i+2]['MGMT LWF']=billMaker[i].mgmt_lwf; 
//         } 
        
//     if(fields.includes('ctc')){
//     data[0]['CTC']='कंपनी के लिए लागत';
//     data[1]['CTC']='কোম্পানির খরচ';
//     data[i+2]['CTC']=billMaker[i].ctc;  
//     }
    
//     if(fields.includes('production_incentive')){
//         data[0]['PRODUCTION INCENTIVE']='उत्पादन या परिवर्तनीय प्रोत्साहन';
//         data[1]['PRODUCTION INCENTIVE']='পরিবর্তনশীল ইনসেনটিভ';
//         data[i+2]['PRODUCTION INCENTIVE']=billMaker[i].production_incentive;  
//         }
        
//     if(fields.includes('gross_incentive')){
//     data[0]['ACTUAL PAYABLE']='वास्तविक देय';
//     data[1]['ACTUAL PAYABLE']='প্রদেয়';
//     data[i+2]['ACTUAL PAYABLE']=billMaker[i].gross_incentive;  
//     }
    
//     // if(fields.includes('invoice_amount1')){
//         data[0]['INVOICE AMOUNT1']='चालान राशि 1';
//         data[1]['INVOICE AMOUNT1']='চালানের পরিমাণ 1';
//         data[i+2]['INVOICE AMOUNT1']=billMaker[i].invoice_amount1;  
//         // }
        
//     // if(fields.includes('invoice_amount2')){
//     data[0]['INVOICE AMOUNT2']='चालान राशि 2';
//     data[1]['INVOICE AMOUNT2']='চালানের পরিমাণ 2';
//     data[i+2]['INVOICE AMOUNT2']=billMaker[i].invoice_amount2;  
//     // }
    
//     // if(fields.includes('service_charge')){
//         data[0]['SERVICE CHARGE']='सेवा शुल्क';
//         data[1]['SERVICE CHARGE']='সেবা খরচ';
//         data[i+2]['SERVICE CHARGE']=billMaker[i].service_charge; 
//         // } 
        
//     // if(fields.includes('cost_of_contract')){
//     data[0]['COST OF CONTRACT STAFFING SERVICES 1']='अनुबंध स्टाफिंग सेवाओं की लागत - 1';
//     data[1]['COST OF CONTRACT STAFFING SERVICES 1']='কন্ট্রাক্ট স্টাফিং সার্ভিসের খরচ - 1';
//     data[i+2]['COST OF CONTRACT STAFFING SERVICES 1']=billMaker[i].cost_of_contract;  
//     // }
//     // if(fields.includes('cost_of_contract2')){
//     data[0]['COST OF CONTRACT STAFFING SERVICES 2']='अनुबंध स्टाफिंग सेवाओं की लागत - 1';
//     data[1]['COST OF CONTRACT STAFFING SERVICES 2']='কন্ট্রাক্ট স্টাফিং সার্ভিসের খরচ - 2';
//     data[i+2]['COST OF CONTRACT STAFFING SERVICES 2']=billMaker[i].cost_of_contract2; 
//     // }
//     }

//     var nameee='';
//         if(type==1)
//             nameee='wage_register';
//         else
//             nameee='payslip';
//         const ws = XLSX.utils.json_to_sheet(data)
//         const ws2 = XLSX.utils.json_to_sheet(data2)
//         const wb = XLSX.utils.book_new()
//         XLSX.utils.book_append_sheet(wb, ws2)
//         XLSX.utils.book_append_sheet(wb, ws)
//         XLSX.writeFile(wb, `output/${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx`)
//         const filePath = path.join(`output/${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx`);

//         fs.readFile(filePath, (err,data) =>{
//             res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', `inline; filename="${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx"`);  
//         res.send(data);
//         });
//     }
// });
// exports.postGeneration = catchAsyncErrors(async(req, res, next) => {
//     const {
//         type,
//         fields,
//         type2,
//         bill_maker_id,
//     } = req.body; 
//     // console.log(fields);
//     //pdf
//     const billMaker = await BillMaker.findAll({where:{
//         bill_maker_id:bill_maker_id,
//          status:1
//         },
//         order: [ [ 'sl_no', 'ASC' ]],
//         include:[CompanyMaster,ClientMaster]});
//     const client = await ClientAddress.findAll({where:{client_id:billMaker[0].client_id}});
//         var monthNames = [ "January", "February", "March", "April", "May", "June", 
//         "July", "August", "September", "October", "November", "December" ]; 
//         var aa = billMaker[0].month_year.substr(5,6);
//         if(aa<9){
//           aa = billMaker[0].month_year.substr(6,6);
//         }
//         var mm =  monthNames[aa-1];
//         // console.log(billMaker);
//     if(type2==1){
//         var invoiceName='';
       
//         if(type==1){
//             invoiceName = 'wage_register_'+ mm+'_'+ billMaker[0].month_year.substr(0,4) +'.pdf';
//         }
//         else{
//             invoiceName = 'payslip_'+ mm+'_'+ billMaker[0].month_year.substr(0,4) +'.pdf';
//         }

//         const invoicePath = path.join('uploads', invoiceName);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
//         let pdfDoc='';
//         var sizee2 = fields.length * 72;

//         if(type==1){
//          pdfDoc = new PDFDocument2({
//             size: [sizee2,1250],
//             margins : { 
//                 top: 10,
//                bottom:0,
//                 left: 10,
//               right: 10
//             }
//         }); 
//     }else{
//         // pdfDoc = new PDFDocument2({
//         //     size: [sizee2,400],
//         //     margins : { 
//         //         top: 10,
//         //        bottom:10,
//         //         left: 10,
//         //       right: 10
//         //     }
//         // }); 
//         pdfDoc = new PDFDocument2({size:'A4'});
//     }
//         pdfDoc.pipe(fs.createWriteStream(invoicePath));
//         pdfDoc.pipe(res);
//         var rows2=[];
//         var size=[];
//         var total=[];
//         for(let i=0;i<billMaker.length;i++){
//         var rows=[];
//         var h = [];
//         var h2 = [];
//         var r=[];
//         if(fields.includes('name')){
//             h.push('Name \n Of \n The \n Worker');
//             h2.push('Name Of The Worker');
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].name ? billMaker[i].name : '');
//             else
//                 total.push(billMaker[i].name);
//             size.push(120);
//         }
    
//         if(fields.includes('emp_code')){
//             h.push('EMPLOYEE \n CODE');
//             h2.push('EMPLOYEE CODE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].emp_code ? billMaker[i].emp_code : ''); 
//             else
//                 total.push(billMaker[i].emp_code ? billMaker[i].emp_code : '');
//         }
    
//         if(fields.includes('gender')){
//             h.push('GENDER');
//             h2.push('GENDER');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].gender ? billMaker[i].gender : ''); 
//             else
//                 total.push(billMaker[i].gender ? billMaker[i].gender : '');
//         }
            
//         if(fields.includes('aadhaar')){    
//         h.push('AADHAR NO');
//         h2.push('AADHAR NO');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].aadhaar ? billMaker[i].aadhaar : ''); 
//             else
//                 total.push(billMaker[i].aadhaar ? billMaker[i].aadhaar : '');
//         }  
        
//         if(fields.includes('uan')){        
//             h.push('UAN NO');
//             h2.push('UAN NO');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].uan ? billMaker[i].uan : ''); 
//             else
//             total.push(billMaker[i].uan ? billMaker[i].uan : ''); 
//         }
            
//         if(fields.includes('esic_no')){
//             h.push('ESIC NO');
//             h2.push('ESIC NO');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].esic_no ? billMaker[i].esic_no : ''); 
//             else
//             total.push(billMaker[i].esic_no ? billMaker[i].esic_no : ''); 
//         }
        
//         if(fields.includes('designation')){
//             h.push('DESIGNATION');
//             h2.push('DESIGNATION');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].designation ? billMaker[i].designation : ''); 
//             else
//             total.push(billMaker[i].designation ? billMaker[i].designation : ''); 
//         }
            
//         if(fields.includes('bank')){
//             h.push('BANK');
//             h2.push('BANK');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].bank ? billMaker[i].bank : ''); 
//             else
//             total.push(billMaker[i].bank ? billMaker[i].bank : ''); 
//         }
        
//         if(fields.includes('ac_no')){
//             h.push('A/C NO');
//             h2.push('A/C NO');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ac_no ? billMaker[i].ac_no : ''); 
//             else
//             total.push(billMaker[i].ac_no ? billMaker[i].ac_no : ''); 
//         }
            
//         if(fields.includes('ifsc')){
//             h.push('IFSC');
//             h2.push('IFSC');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ifsc ? billMaker[i].ifsc : ''); 
//             else
//             total.push(billMaker[i].ifsc ? billMaker[i].ifsc : ''); 
//         }      
        
//         if(fields.includes('gross_salary')){
//             h.push('GROSS \n SALARY');
//             h2.push('GROSS SALARY');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].gross_salary ? billMaker[i].gross_salary : ''); 
//             else
//             total.push(billMaker[i].gross_salary ? billMaker[i].gross_salary : ''); 
//         } 
            
//         if(fields.includes('basic_salary')){
//             h.push('BASIC \n SALARY');
//             h2.push('BASIC SALARY');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].basic_salary ? billMaker[i].basic_salary : ''); 
//             else
//             total.push(billMaker[i].basic_salary ? billMaker[i].basic_salary : ''); 
//         }      
//         if(fields.includes('hra')){
//             h.push('HRA');
//             h2.push('HRA');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].hra ? billMaker[i].hra : ''); 
//             else
//             total.push(billMaker[i].hra ? billMaker[i].hra : ''); 
//         }      
//         if(fields.includes('present_days')){
//             h.push('PRESENT \n DAYS');
//             h2.push('PRESENT DAYS');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].present_days ? billMaker[i].present_days : ''); 
//             else
//             total.push(billMaker[i].present_days ? billMaker[i].present_days : ''); 
//         }      
//         if(fields.includes('holidays')){
//             h.push('HOLIDAYS \n ( WEEKLY \n + FESTIVE )');
//             h2.push('HOLIDAYS ( WEEKLY + FESTIVE )');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].holidays ? billMaker[i].holidays : ''); 
//             else
//             total.push(billMaker[i].holidays ? billMaker[i].holidays : ''); 
//         }                  
//         if(fields.includes('odd_hours')){
//             h.push('PAID \n LEAVE / \n LEAVE \n ADJUSTMENT');
//             h2.push('PAID LEAVE / LEAVE ADJUSTMENT');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].odd_hours ? billMaker[i].odd_hours : ''); 
//             else
//             total.push(billMaker[i].odd_hours ? billMaker[i].odd_hours : ''); 
//         } 
//         if(fields.includes('absent')){
//             h.push('ABSENT');
//             h2.push('ABSENT');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].absent ? billMaker[i].absent : ''); 
//             else
//             total.push(billMaker[i].absent ? billMaker[i].absent : ''); 
//         }      
//         if(fields.includes('total_days')){
//             h.push('TOTAL DAYS');
//             h2.push('TOTAL DAYS');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].total_days ? billMaker[i].total_days : ''); 
//             else
//             total.push(billMaker[i].total_days ? billMaker[i].total_days : ''); 
//         }      
//         if(fields.includes('prop_gross')){
//             h.push('PROP GROSS');
//             h2.push('PROP GROSS');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].prop_gross ? billMaker[i].prop_gross : '');  
//             else
//             total.push(billMaker[i].prop_gross ? billMaker[i].prop_gross : '');  
//         }      
//         if(fields.includes('ot_rate')){
//             h.push('OT RATE');
//             h2.push('OT RATE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ot_rate ? billMaker[i].ot_rate : ''); 
//             else
//             total.push(billMaker[i].ot_rate ? billMaker[i].ot_rate : ''); 
//         }      
//         if(fields.includes('ot_hour')){
//             h.push('OT HOURS');
//             h2.push('OT HOURS');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ot_hour ? billMaker[i].ot_hour : ''); 
//             else
//             total.push(billMaker[i].ot_hour ? billMaker[i].ot_hour : ''); 
//         }      
//         if(fields.includes('ot_amount')){
//             h.push('OT AMOUNT');
//             h2.push('OT AMOUNT');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ot_amount ? billMaker[i].ot_amount : ''); 
//             else
//             total.push(billMaker[i].ot_amount ? billMaker[i].ot_amount : ''); 
//         }      
//         if(fields.includes('minor_r')){
//             h.push('MINOR \n REIMBURSEMENT');
//             h2.push('MINOR REIMBURSEMENT');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].minor_r ? billMaker[i].minor_r : ''); 
//             else
//             total.push(billMaker[i].minor_r ? billMaker[i].minor_r : ''); 
//         }      
//         if(fields.includes('variable_incentive')){
//             h.push('SPECIAL \n INCENTIVE \n(AS PER \n PRINCIPAL \n EMPLOYER \n DISCRETION)');
//             h2.push('SPECIAL INCENTIVE(AS PER PRINCIPAL EMPLOYER DISCRETION)');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''); 
//             else
//             total.push(billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''); 
//         }      
//         if(fields.includes('actual_pay')){
//             h.push('ACTUAL \n PAY');
//             h2.push('ACTUAL PAY');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].actual_pay ? billMaker[i].actual_pay : ''); 
//             else
//             total.push(billMaker[i].actual_pay ? billMaker[i].actual_pay : ''); 
//         }      
//         if(fields.includes('prop_basic')){
//             h.push('PROP \n BASIC');
//             h2.push('PROP BASIC');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].prop_basic ? billMaker[i].prop_basic : ''); 
//             else
//             total.push(billMaker[i].prop_basic ? billMaker[i].prop_basic : ''); 
//         }      
//         if(fields.includes('pf')){
//             h.push('PF');
//             h2.push('PF');
//             size.push(65);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].pf ? billMaker[i].pf : ''); 
//             else
//             total.push(billMaker[i].pf ? billMaker[i].pf : ''); 
//         }      
//         if(fields.includes('esic')){
//             h.push('ESIC');
//             h2.push('ESIC');
//             size.push(65);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].esic ? billMaker[i].esic : ''); 
//             else
//             total.push(billMaker[i].esic ? billMaker[i].esic : ''); 
//         }      
//         if(fields.includes('ptax')){
//             h.push('PTAX');
//             h2.push('PTAX');
//             size.push(65);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ptax ? billMaker[i].ptax : ''); 
//             else
//             total.push(billMaker[i].ptax ? billMaker[i].ptax : ''); 
//         }      
//         if(fields.includes('lwf')){
//             h.push('LWF');
//             h2.push('LWF');
//             size.push(65);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].lwf ? billMaker[i].lwf : ''); 
//             else
//             total.push(billMaker[i].lwf ? billMaker[i].lwf : ''); 
//         }      
//         if(fields.includes('advance')){
//             h.push('ADVANCE');
//             h2.push('ADVANCE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].advance ? billMaker[i].advance : ''); 
//             else
//             total.push(billMaker[i].advance ? billMaker[i].advance : ''); 
//         }          
//         if(fields.includes('net_pay')){
//             h.push('NET \n PAY');
//             h2.push('NET PAY');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].net_pay ? billMaker[i].net_pay : ''); 
//             else
//             total.push(billMaker[i].net_pay ? billMaker[i].net_pay : ''); 
//         }      
//         if(fields.includes('mgmt_pf')){
//             h.push('MGMT \n PF');
//             h2.push('MGMT PF');
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ''); 
//             else
//             total.push(billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ''); 
//         }      
//         if(fields.includes('mgmt_esic')){
//             h.push('MGMT \n ESIC');
//             h2.push('MGMT ESIC');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ''); 
//             else
//             total.push(billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ''); 
//         }      
//         if(fields.includes('mgmt_lwf')){
//             h.push('MGMT \n LWF');
//             h2.push('MGMT LWF');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ''); 
//             else
//             total.push(billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ''); 
//         }      
//         if(fields.includes('ctc')){
//             h.push('CTC');
//             h2.push('CTC');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].ctc ? billMaker[i].ctc : ''); 
//             else
//             total.push(billMaker[i].ctc ? billMaker[i].ctc : ''); 
//         }      
//         if(fields.includes('production_incentive')){
//             h.push('PRODUCTION \n OR \n VARIABLE \n INCENTIVE');
//             h2.push('PRODUCTION OR VARIABLE INCENTIVE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].production_incentive ? billMaker[i].production_incentive : ''); 
//             else
//             total.push(billMaker[i].production_incentive ? billMaker[i].production_incentive : ''); 
//         }      
//         if(fields.includes('gross_incentive')){
//             h.push('ACTUAL \n PAYABLE');
//             h2.push('ACTUAL PAYABLE');
//             size.push(70);
//             if(billMaker[i].name!='TOTAL')
//             r.push(billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ''); 
//             else
//             total.push(billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ''); 
//         }      
//         // if(fields.includes('invoice_amount1')){
//         //     h.push('INVOICE AMOUNT1');
//         //     h2.push('INVOICE AMOUNT1');
//         //     size.push(70);
//         //     r.push(billMaker[i].invoice_amount1 ? billMaker[i].invoice_amount1 : ''); 
//         // }      
//         // if(fields.includes('invoice_amount2')){
//         //     h.push('INVOICE \n AMOUNT2');
//         //     h2.push('INVOICE AMOUNT2');
//         //     size.push(70);
//         //     r.push(billMaker[i].invoice_amount2 ? billMaker[i].invoice_amount2 : ''); 
//         // }      
//         // if(fields.includes('service_charge')){
//         //     h.push('SERVICE \n CHARGE');
//         //     h2.push('SERVICE CHARGE');
//         //     size.push(70);
//         //     r.push(billMaker[i].service_charge ? billMaker[i].service_charge : ''); 
//         // }      
//         // if(fields.includes('cost_of_contract')){
//         //     h.push('COST OF \n CONTRACT \n STAFFING \n SERVICES \n 1');
//         //     h2.push('COST OF CONTRACT STAFFING SERVICES 1');
//         //     size.push(80);
//         //     r.push(billMaker[i].cost_of_contract ? billMaker[i].cost_of_contract : ''); 
//         // }      
//         // if(fields.includes('cost_of_contract2')){
//         //     h.push('COST OF \n CONTRACT \n STAFFING \n SERVICES \n 2');
//         //     h2.push('COST OF CONTRACT STAFFING SERVICES 2');
//         //     size.push(80);
//         //     r.push(billMaker[i].cost_of_contract2 ? billMaker[i].cost_of_contract2 : ''); 
//         // }  
//        rows.push(r);
//        rows2.push(r);
//        let table='';
//        if(type==2){        
//         // table = {
//         //     title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
//         //      "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
//         //     'WAGE SLIP : '+ ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
//         //     // subtitle: "Subtitle",
//         //     headers: h,
//         //     rows: rows,
//         //     divider: {
//         //         header: { disabled: false, width: 2, opacity: 1 },
//         //         horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
//         //       },
//         //   };
    
//       // A4 595.28 x 841.89 (portrait) (about width sizes)
//       // width
//     pdfDoc.fontSize(14);
      
    
//     //   await pdfDoc.table(table, { 
//     //     // width: 2100,
//     // columnsSize: [
//     //     120, 70, 70, 70, 70, 70, 70, 70, 70,
//     //      70, 70, 70, 70, 70, 70, 70, 70, 70,
//     //      70, 70, 65, 65, 65, 65, 70, 70, 70,
//     //      70, 70, 70, 70, 70, 70, 70, 80, 80,
//     //      70, 70, 70, 70, 70, 70, 70, 80, 80,
//     //   ],
//     // columnSpacing: 16, 
//     // height:200,
//     // rowSpacing: 15, 
//     // prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
//     //     prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),

//     //   });
    
//        pdfDoc.font('Helvetica-Bold').text('PAYSLIP for the month of ' + mm.toUpperCase() + ' ' +billMaker[0].month_year.substr(0,4),10,10,{
//         align:'center',
//         width: 600,
//         height:60,
//        }); 

//        if(billMaker[0].company_master.logo){
//         if (fs.existsSync(billMaker[0].company_master.logo)) {
//         pdfDoc.image(billMaker[0].company_master.logo, 8, 30, { width: 20, height: 20, align:'left' })
//         .rect(8, 30, 20, 20)
//         .stroke();
//         }
//     }   
//        pdfDoc.text('CONTRACTOR',40,35,{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:true
//        }); 
//        pdfDoc.font('Helvetica').text(billMaker[0].company_master.company_name,10,60,{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:false
//        }); 
//        pdfDoc.fontSize(10);

//        pdfDoc.text(billMaker[0].company_master.address,pdfDoc.x,pdfDoc.y+10,{
//         align:'left',
//         width: 250,
//         height:60,

//        }); 
//         pdfDoc.fontSize(14);
        
//        pdfDoc.font('Helvetica-Bold').text('PRINCIPAL EMPLOYER',pdfDoc.x+300,35,{
//         align:'left',
//         width: 250,
//         height:10,
//         underline:true
//        }); 
//        pdfDoc.font('Helvetica').text(billMaker[0].client_master.client_name,pdfDoc.x,60,{
//         align:'left',
//         width: 300,
//         height:10,
//         underline:false
//        }); 

//        pdfDoc.fontSize(10);

//        pdfDoc.text(client[0].address,pdfDoc.x,pdfDoc.y+10,{
//         align:'left',
//         width: 250,
//         height:60,
//        }); 
//        pdfDoc.moveDown();
//        pdfDoc.moveDown();

//        pdfDoc.text('_____________________________________________________________________________________________________',10,pdfDoc.y,{
//         align:'left',
//         width: 600,
//         height:60,
//        }); 
//        pdfDoc.moveDown();
//        pdfDoc.fontSize(10);
//        var heighh = pdfDoc.y;
       
//        pdfDoc.font('Helvetica-Bold').text('General Information',{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:true
//        }); 
//        pdfDoc.moveDown();
//        var totalGap=0;
//        if(fields.includes('name')){
//         pdfDoc.font('Helvetica').text('Name : ' + (billMaker[i].name ? billMaker[i].name : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();
//        totalGap++;
//     }
//        if(fields.includes('aadhaar')){
//         pdfDoc.text('Aadhar No : ' + (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        totalGap++;
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('uan')){
//         pdfDoc.text('UAN NO : ' + (billMaker[i].uan ? billMaker[i].uan : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        totalGap++;
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('esic_no')){
//         pdfDoc.text('ESIC NO : ' + (billMaker[i].esic_no ? billMaker[i].esic_no : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        totalGap++;
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('gender')){
//         pdfDoc.text('Gender : ' + (billMaker[i].gender ? billMaker[i].gender : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        totalGap++;
//        pdfDoc.moveDown();

//        }
//        if(fields.includes('emp_code')){
//         pdfDoc.text('Emp Code : ' + (billMaker[i].emp_code ? billMaker[i].emp_code : ''),pdfDoc.x+300,heighh+20,{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        totalGap--;
//        pdfDoc.moveDown();
//     }

//        if(fields.includes('designation')){
//         pdfDoc.text('Designation : ' + (billMaker[i].designation ? billMaker[i].designation : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        totalGap--;
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('bank')){
//         pdfDoc.text('Bank : ' + (billMaker[i].bank ? billMaker[i].bank : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        totalGap--;
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('ac_no')){
//         pdfDoc.text('A/C No : ' + (billMaker[i].ac_no ? billMaker[i].ac_no : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        totalGap--;
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('ifsc')){
//         pdfDoc.text('IFSC : ' + (billMaker[i].ifsc ? billMaker[i].ifsc : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();
//        totalGap--;

//        }
//        for(var k=0;k<totalGap+1;k++)
//         pdfDoc.moveDown();

//        pdfDoc.text('_____________________________________________________________________________________________________',10,pdfDoc.y,{
//         align:'left',
//         width: 600,
//         height:60,
//        }); 
//        pdfDoc.moveDown();
       
//        pdfDoc.font('Helvetica-Bold').text('Salary',{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:true
//        }); 
//        pdfDoc.moveDown();
//        heighh = pdfDoc.y;
//        if(fields.includes('gross_salary')){
//         pdfDoc.font('Helvetica').text('GROSS SALARY : ' + (billMaker[i].gross_salary ? billMaker[i].gross_salary : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();
//     }
//     if(fields.includes('basic_salary')){
//         pdfDoc.text('BASIC SALARY : ' + (billMaker[i].basic_salary ? billMaker[i].basic_salary : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();
//     }
//     if(fields.includes('hra')){
//         pdfDoc.text('HRA : ' + (billMaker[i].hra ? billMaker[i].hra : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();
//     }

//     if(fields.includes('present_days')){
//         pdfDoc.text('Present Days : ' + (billMaker[i].present_days ? billMaker[i].present_days : ''),pdfDoc.x+160,heighh,{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();
//     }
//     if(fields.includes('absent')){
//         pdfDoc.text('Absent Days : ' + (billMaker[i].absent ? billMaker[i].absent : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();
//     }
//     if(fields.includes('odd_hours')){
//         pdfDoc.text('PAID LEAVE / LEAVE ADJUSTMENT : ' + (billMaker[i].odd_hours ? billMaker[i].odd_hours : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();
//     }
//     if(fields.includes('ot_rate')){
//         pdfDoc.text('OT Rate : ' + (billMaker[i].ot_rate ? billMaker[i].ot_rate : ''),pdfDoc.x+120,heighh,{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();
//     }
//     if(fields.includes('ot_hour')){
//         pdfDoc.text('OT Hours : ' + (billMaker[i].ot_hour ? billMaker[i].ot_hour : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();
//     }
//     if(fields.includes('holidays')){
//         pdfDoc.text('HOLIDAYS ( WEEKLY + FESTIVE ) : ' + (billMaker[i].holidays ? billMaker[i].holidays : ''),pdfDoc.x+80,heighh,{
//             align:'left',
//             width: 200,
//             height:60,
//             });
//        pdfDoc.moveDown();
//     }
//     if(fields.includes('total_days')){
//         pdfDoc.text('Total Days : ' + (billMaker[i].total_days ? billMaker[i].total_days : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();

//     }
//     pdfDoc.moveDown();
//     pdfDoc.moveDown();

//     pdfDoc.text('_____________________________________________________________________________________________________',10,pdfDoc.y,{
//         align:'left',
//         width: 600,
//         height:60,
//        }); 
//     pdfDoc.moveDown();
       
//     var heighh = pdfDoc.y;
       
//        pdfDoc.font('Helvetica-Bold').text('Earnings',{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:true
//        }); 
//        pdfDoc.moveDown();
//        if(fields.includes('prop_gross')){
//         pdfDoc.font('Helvetica').text('PROP GROSS : ' + (billMaker[i].prop_gross ? billMaker[i].prop_gross : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('prop_basic')){
//         pdfDoc.text('PROP BASIC : ' + (billMaker[i].prop_basic ? billMaker[i].prop_basic : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             underline:false
//             });
//        pdfDoc.moveDown();
//     }
//     //    if(fields.includes('odd_hours')){
//     //     pdfDoc.text('ODD HOURS DUTY INCENTIVE : ' + (billMaker[i].odd_hours ? billMaker[i].odd_hours : ''),{
//     //         align:'left',
//     //         width: 300,
//     //         height:60,
//     //         underline:false
//     //         });
//     //    pdfDoc.moveDown();
//     // }
//        if(fields.includes('variable_incentive')){
//         pdfDoc.text('SPECIAL INCENTIVE (AS PER PRINCIPAL EMPLOYER DISCRETION) : ' + (billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('ot_amount')){
//         pdfDoc.text('OT AMOUNT : ' + (billMaker[i].ot_amount ? billMaker[i].ot_amount : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();

//        }
//        if(fields.includes('minor_r')){
//         pdfDoc.text('MINOR REIMBURSEMENT : ' + (billMaker[i].minor_r ? billMaker[i].minor_r : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();

//        }
       
//        if(fields.includes('production_incentive')){
//         pdfDoc.text('PRODUCTION OR VARIABLE INCENTIVE : ' + (billMaker[i].production_incentive ? billMaker[i].production_incentive : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();

//        }
//        if(fields.includes('actual_pay')){
//         pdfDoc.text('ACTUAL PAY : ' + (billMaker[i].actual_pay ? billMaker[i].actual_pay : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();

//        }
       
//        pdfDoc.font('Helvetica-Bold').text('Deductions',pdfDoc.x+300,heighh,{
//         align:'left',
//         width: 250,
//         height:60,
//         underline:true
//        }); 
//        pdfDoc.moveDown();
//        if(fields.includes('pf')){
//         pdfDoc.font('Helvetica').text('EMP PF : ' + (billMaker[i].pf ? billMaker[i].pf : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();
//     }

//        if(fields.includes('esic')){
//         pdfDoc.text('EMP ESIC : ' + (billMaker[i].esic ? billMaker[i].esic : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('ptax')){
//         pdfDoc.text('EMP PTAX : ' + (billMaker[i].ptax ? billMaker[i].ptax : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('advance')){
//         pdfDoc.text('Advance : ' + (billMaker[i].advance ? billMaker[i].advance : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        pdfDoc.moveDown();
//     }
//        if(fields.includes('lwf')){
//         pdfDoc.text('LWF : ' + (billMaker[i].lwf ? billMaker[i].lwf : ''),{
//             align:'left',
//             width: 300,
//             height:60,
//             });
//        }
//        pdfDoc.moveDown();
//        pdfDoc.moveDown();
//        pdfDoc.moveDown();
//        pdfDoc.moveDown();

//        if(fields.includes('net_pay')){
//         pdfDoc.font('Helvetica-Bold').text('NET PAY : ' + (billMaker[i].net_pay ? billMaker[i].net_pay : ''),10,pdfDoc.y+20,{
//             align:'center',
//             width: 600,
//             height:60,
//             });
//             pdfDoc.moveDown();
//         }
//        if(fields.includes('gross_incentive')){
//         pdfDoc.font('Helvetica-Bold').text('ACTUAL PAYABLE : ' + (billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ''),{
//             align:'center',
//             width: 600,
//             height:60,
//             });
//             pdfDoc.moveDown();
//         }
//         if(fields.includes('mgmt_pf')){
//             pdfDoc.font('Helvetica').text('MGMT PF : ' + (billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ''),10,pdfDoc.y,{
//                 align:'left',
//                 width: 300,
//                 height:60,
//                 });
//            pdfDoc.moveDown();
//         }
//         if(fields.includes('mgmt_esic')){
//             pdfDoc.text('MGMT ESIC : ' + (billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ''),{
//                 align:'left',
//                 width: 300,
//                 height:60,
//                 });
//            pdfDoc.moveDown();
//         }
//         if(fields.includes('mgmt_lwf')){
//             pdfDoc.text('MGMT LWF : ' + (billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ''),{
//                 align:'left',
//                 width: 300,
//                 height:60,
//                 });
//         }
//     //    for(var ii=0;ii<(h2.length/2);ii++){
//     //     pdfDoc.text(h2[ii] + ' : ' + rows[0][ii],{
//     //     align:'left',
//     //     width: 300,
//     //     height:60,
//     //     underline:false
//     //     });
//     //     pdfDoc.moveDown();
//     //    }
//     //    pdfDoc.text('',pdfDoc.x+300,heighh,{
//     //     align:'left',
//     //     width: 0,
//     //     height:6,
//     //     });
//     //    for(ii=Math.floor(h2.length/2);ii<h2.length;ii++){
//     //     pdfDoc.text(h2[ii] + ' : ' + rows[0][ii],{
//     //     align:'left',
//     //     width: 300,
//     //     height:60,
//     //     });
//     //     pdfDoc.moveDown();
//     //    }
//     pdfDoc.text('_____________________________________________________________________________________________________',10,pdfDoc.y+10,{
//         align:'left',
//         width: 600,
//         height:60,
//        }); 
//        pdfDoc.fontSize(9).text('This is a computerised auto generated document, hence Signature or Stamp is not mandatory.',10,pdfDoc.y+10,{
//         align:'left',
//         width: 500,
//         height:60,
//         });

//       if(billMaker[0].company_master.stamp){
        
//         if (fs.existsSync(billMaker[0].company_master.stamp)) {
//         pdfDoc.image(billMaker[0].company_master.stamp, pdfDoc.x+450, pdfDoc.y - 20, { width: 40, height: 40, align:'right' })
//         .rect(pdfDoc.x+450, pdfDoc.y-20, 40, 40)
//         .stroke();
//         }
//     }   


//     if(i!=billMaker.length - 1)
//         pdfDoc.addPage();


//        }
//         }
//       if(type==1){
//         pdfDoc.fontSize(18).font('Helvetica-Bold').text('FORM XVII',0,40,{
//             align:'center',
//             width:sizee2,
//             height:20,
//         });
// pdfDoc.font('Helvetica').text('[See Rule 78(1)(a)(i)]',pdfDoc.x,pdfDoc.y+5,{
//         align:'center',
//         width:sizee2,
//         height:20,
// });
// pdfDoc.font('Helvetica-Bold').text('Register of Wages',pdfDoc.x,pdfDoc.y+5,{
//         align:'center',
//         width:sizee2,
//         height:20,
// });
// pdfDoc.text('NAME AND ADDRESS OF CONTRACTOR',pdfDoc.x+10,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text(billMaker[0].company_master.company_name,pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text(billMaker[0].company_master.address,pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text('CLIENT NAME AND ADDRESS',pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text(billMaker[0].client_master.client_name,pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text(client[0].address,pdfDoc.x,pdfDoc.y+5,{
//     align:'left',
//     width:sizee2 - 100,
//     height:20,
//     continued:true,
//     lineBreak:false
// });
// pdfDoc.text('WAGE PERIOD : '+mm + ' ' +billMaker[0].month_year.substr(0,4),pdfDoc.x,pdfDoc.y+5,{
//     align:'right',
//     width:sizee2 - 100,
//     height:20,
// });
// pdfDoc.moveDown();
// rows2.push(total);
// var rownUntill9 = [];
// var ll = 8;
// if(rows2.length<8){
//     ll = rows2.length;
// }
// for(var a=0;a<ll;a++)
//     rownUntill9.push(rows2[a]);

// table = {
//         // title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
//         //  "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
//         // 'WAGE SLIP : ' + ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
//         // subtitle: "Subtitle",
//         headers: h,
//         rows: rownUntill9,
//         divider: {
//             header: { disabled: false, width: 2, opacity: 1 },
//             horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
//           },
//     };
// rows2.splice(0,8);
// await pdfDoc.table(table, { 
//     // width: 2100,
//     columnsSize: size,
//     height:200,
//     columnSpacing: 15, 
//     rowSpacing: 10, 
//     prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
//    // prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),
//   prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
//         pdfDoc.font("Helvetica").fontSize(17);
//         // console.log(row);
//         // console.log('----');
//         // console.log(indexColumn);
//         // console.log(indexRow);
//         // console.log(rectRow);
//         // console.log(rectCell);
//       },
//   });
 
// //dividing into groups of 13
// var ll = (rows2.length/10);
// for(var aa = 0;aa<ll;aa++){
//     var eachRow = [];
//     var newRow = rows2.splice(0,10);
//     const newTable = {
//         // title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
//         //  "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
//         // 'WAGE SLIP : ' + ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
//         // subtitle: "Subtitle",
//         headers: h,
//         rows: newRow,
//         divider: {
//             header: { disabled: false, width: 2, opacity: 1 },
//             horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
//           },
//     };
//     pdfDoc.addPage();

//     await pdfDoc.table(newTable, { 
//         // width: 2100,
//         columnsSize: size,
//         height:200,
//         columnSpacing: 15, 
//         rowSpacing: 10, 
//         prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
//        // prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),
//       prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
//             pdfDoc.font("Helvetica").fontSize(17);
//             // console.log(row);
//             // console.log('----');
//             // console.log(indexColumn);
//             // console.log(indexRow);
//             // console.log(rectRow);
//             // console.log(rectCell);
//           },
//       });
//       if(aa==ll && newRow.length>9)
//         pdfDoc.addPage();
     
// }




// pdfDoc.text('1. The Gross Salary and all its components and bifurcations are determined by the Principal Employer only. ',10,pdfDoc.y+5,{
//     align:'left',
//     width:1800,
//     height:20,
// });

// pdfDoc.text('2. Attendance, Any reimbursement, Incentive, or any other benefits given to the employee are only after the sanction of the Principal Employer and/or mutual understanding of the Principal and Employee.',{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text('3. All payments are made through NEFT or Bank transfer, and thus requires no signature of Employees. In any other mode of payment, signature to follow. ',{
//     align:'left',
//     width:1800,
//     height:20,
// });
// pdfDoc.text('4. This is an auto generated computerised document, prepared on the basis of data provided by the employee and Principal. ',{
//     align:'left',
//     width:1800,
//     height:20,
// });
//   if(billMaker[0].company_master.stamp){
//     var sizee = fields.length * 65;

//     if (fs.existsSync(billMaker[0].company_master.stamp)) {
//     pdfDoc.image(billMaker[0].company_master.stamp, pdfDoc.x + sizee, pdfDoc.y, { width: 80, height: 80, align:'right' })
//     .rect(pdfDoc.x + sizee, pdfDoc.y-80, 80, 80)
//     .stroke();
//     }
// }     
//       }
     
//         pdfDoc.end();

//     }else{
//     //excel
//     let data = [];
//     let data2 =[]; 
//     if(type==2){
//     data2 = [{
//         'PRINCIPAL EMPLOYER':  billMaker[0].client_master.client_name,
//         'CONTRACTOR':billMaker[0].company_master.company_name,
//         'WAGE SLIP FOR THE MONTH OF ':mm + ' ' +billMaker[0].month_year.substr(0,4)
//     }];
// }else{
//     data2 = [{
//         'NAME & ADDRESS OF CONTRACTOR':  billMaker[0].company_master.company_name,
//         'NAME & ADDRESS OF CLIENT':billMaker[0].client_master.client_name,
//         'WAGE PERIOD':mm + ' ' +billMaker[0].month_year.substr(0,4)
//     },{       
//         'NAME & ADDRESS OF CONTRACTOR':  billMaker[0].company_master.address,
//         'NAME & ADDRESS OF CLIENT':client[0].address 
//     }];
// }
// for(let i=0;i<billMaker.length;i++){

//     data[0]={};
//     data[1]={};
//     data[i+2]={};
//     data[0]['Sl No']='Sl No';
//     data[1]['Sl No']='Sl No';
//     data[i+2]['Sl No']=i+1;
//     if(fields.includes('name')){
//         data[0]['Name Of The Worker']='नाम';
//         data[1]['Name Of The Worker']='নাম';
//         data[i+2]['Name Of The Worker']=billMaker[i].name;
//     }
//     if(fields.includes('emp_code')){
//         data[0]['EMPLOYEE CODE']='कर्मचारी कोड';   
//         data[1]['EMPLOYEE CODE']='কর্মী কোড';   
//         data[i+2]['EMPLOYEE CODE']=billMaker[i].emp_code;   
//     }
//     if(fields.includes('gender')){
//         data[0]['GENDER']='लिंग';  
//         data[1]['GENDER']='লিঙ্গ';  
//         data[i+2]['GENDER']=billMaker[i].gender;  
//     }
//     if(fields.includes('aadhaar')){
//     data[0]['AADHAR NO']='आधार नंबर'; 
//     data[1]['AADHAR NO']='আধার নং'; 
//     data[i+2]['AADHAR NO']=billMaker[i].aadhaar;  
//     }
//     if(fields.includes('uan')){
//         data[0]['UAN NO']='UAN नंबर';  
//          data[1]['UAN NO']='UAN নম্বর';  
//           data[i+2]['UAN NO']=billMaker[i].uan;  
//         }
        
//     if(fields.includes('esic_no')){
//     data[0]['ESIC NO']='ESIC नंबर';
//     data[1]['ESIC NO']='ESIC নম্বর';
//     data[i+2]['ESIC NO']=billMaker[i].esic_no;
//     }  
    
//     if(fields.includes('designation')){
//         data[0]['DESIGNATION']='पद';
//         data[1]['DESIGNATION']='নিয়োগ';
//         data[i+2]['DESIGNATION']=billMaker[i].designation;    
//         }
        
//     if(fields.includes('bank')){
//     data[0]['BANK']='बैंक का नाम';
//     data[1]['BANK']='ব্যাংকের নাম';
//     data[i+2]['BANK']=billMaker[i].bank;
//     }  
    
//     if(fields.includes('ac_no')){
//         data[0]['A/C NO']='अकाउंट नंबर';  
//         data[1]['A/C NO']='অ্যাকাউন্ট নম্বর';  
//         data[i+2]['A/C NO']=billMaker[i].ac_no;  
//         }
//     if(fields.includes('ifsc')){
//     data[0]['IFSC']='आई०ऍफ़०एस० कोड';        
//     data[1]['IFSC']='আইএফএস কোড';        
//     data[i+2]['IFSC']=billMaker[i].ifsc;        
// }
    
//     if(fields.includes('gross_salary')){
//         data[0]['GROSS SALARY']='सकल वेतन';  
//         data[1]['GROSS SALARY']='মোট বেতন';  
//         data[i+2]['GROSS SALARY']=billMaker[i].gross_salary;  
//         }
//     if(fields.includes('basic_salary')){
//     data[0]['BASIC SALARY']='मूल वेतन';      
//     data[1]['BASIC SALARY']='মূল বেতন';  
//     data[i+2]['BASIC SALARY']=billMaker[i].basic_salary;  

//     }
//     if(fields.includes('hra')){
//         data[0]['HRA']='गृह वाता';  
//         data[1]['HRA']='বাড়ি ভাড়া ভাতা';  
//         data[2]['HRA']=billMaker[i].hra;  

//     }
//     if(fields.includes('present_days')){
//         data[0]['PRESENT DAYS']='काम के दिन';  
//         data[1]['PRESENT DAYS']='কাজের দিন';  
//         data[i+2]['PRESENT DAYS']=billMaker[i].present_days;  

//         }
//     if(fields.includes('holidays')){
//     data[0]['HOLIDAYS ( WEEKLY + FESTIVE)']='छुट्टी का दिन';  
//     data[1]['HOLIDAYS ( WEEKLY + FESTIVE)']='ছুটির দিন';  
//     data[i+2]['HOLIDAYS ( WEEKLY + FESTIVE)']=billMaker[i].holidays;  
//     }
//     if(fields.includes('odd_hours')){
//     data[0]['PAID LEAVE / LEAVE ADJUSTMENT']='भुगतान छुट्टी समायोजन'; 
//     data[1]['PAID LEAVE / LEAVE ADJUSTMENT']='বেতনের ছুটি সমন্বয়';  
//     data[i+2]['PAID LEAVE / LEAVE ADJUSTMENT']=billMaker[i].odd_hours;  

//     }
//     if(fields.includes('absent')){
//         data[0]['ABSENT']='अनुपस्थित दिन';  
//         data[1]['ABSENT']='অনুপস্থিত দিন';  
//         data[i+2]['ABSENT']=billMaker[i].absent;  
//         }
//     if(fields.includes('total_days')){
//     data[0]['TOTAL DAYS']='कुल दिन';  
//     data[1]['TOTAL DAYS']='মোট দিন';  
//     data[i+2]['TOTAL DAYS']=billMaker[i].total_days;  
//     }
//     if(fields.includes('prop_gross')){
//         data[0]['PROP GROSS']='आनुपातिक सकल वेतन';
//         data[1]['PROP GROSS']='আনুপাতিক মোট বেতন';
//         data[i+2]['PROP GROSS']=billMaker[i].prop_gross;  
//      }   
//     if(fields.includes('ot_rate')){
//     data[0]['OT RATE']='ओवरटाइम दर';
//     data[1]['OT RATE']='ওভারটাইম হার';
//     data[i+2]['OT RATE']=billMaker[i].ot_rate;  
//     }
    
//     if(fields.includes('ot_hour')){
//         data[0]['OT HOURS']='अतिरिक्त समय अवधि';
//         data[1]['OT HOURS']='অতিরিক্ত ঘন্টা'; 
//         data[i+2]['OT HOURS']=billMaker[i].ot_hour;  
//         } 
        
//     if(fields.includes('ot_amount')){
//     data[0]['OT AMOUNT']='ओवरटाइम राशि';
//     data[1]['OT AMOUNT']='অতিরিক্ত কাজের বেতন';
//     data[i+2]['OT AMOUNT']=billMaker[i].ot_amount;  
//     }
    
//     if(fields.includes('minor_r')){
//         data[0]['MINOR REIMBURSEMENT']='मामूली प्रतिपूर्ति';
//         data[1]['MINOR REIMBURSEMENT']='সামান্য প্রতিদান';
//         data[i+2]['MINOR REIMBURSEMENT']=billMaker[i].minor_r; 
//         } 

        
//     if(fields.includes('variable_incentive')){
//     data[0]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']='विशेष प्रोत्साहन';
//     data[1]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']='বিশেষ প্রণোদনা';
//     data[i+2]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']=billMaker[i].variable_incentive; 
//     } 
    
//     if(fields.includes('actual_pay')){
//         data[0]['ACTUAL PAY']='वास्तविक भुगतान';
//         data[1]['ACTUAL PAY']='প্রকৃত বেতন';
//         data[i+2]['ACTUAL PAY']=billMaker[i].actual_pay; 
//         } 
        
//     if(fields.includes('prop_basic')){
//     data[0]['PROP BASIC']='आनुपातिक वेतन';
//     data[1]['PROP BASIC']='আনুপাতিক মৌলিক';
//     data[i+2]['PROP BASIC']=billMaker[i].prop_basic;
//     }  
    
//     if(fields.includes('pf')){
//         data[0]['PF']='कर्मचारी PF';
//         data[1]['PF']='কর্মচারী PF';
//         data[i+2]['PF']=billMaker[i].pf;  
//         }
//     if(fields.includes('esic')){
//     data[0]['ESIC']='कर्मचारी ESIC';
//     data[1]['ESIC']='কর্মচারী ESIC';
//     data[i+2]['ESIC']=billMaker[i].esic; 
//     } 
    
//     if(fields.includes('ptax')){
//         data[0]['PTAX']='कर्मचारी P TAX';
//         data[1]['PTAX']='কর্মচারী P TAX';
//         data[i+2]['PTAX']=billMaker[i].ptax;  
//         }
        
//     if(fields.includes('lwf')){
//     data[0]['LWF']='कर्मचारी LWF';
//     data[1]['LWF']='কর্মচারী LWF';
//     data[i+2]['LWF']=billMaker[i].lwf;  
//     }
    
//     if(fields.includes('advance')){
//         data[0]['ADVANCE']='एडवांस';
//         data[1]['ADVANCE']='অগ্রিম';
//         data[i+2]['ADVANCE']=billMaker[i].advance;  
//         }
        
//     if(fields.includes('net_pay')){
//     data[0]['NET PAY']='कुल भुगतान';
//     data[1]['NET PAY']='নেট বেতন';
//     data[i+2]['NET PAY']=billMaker[i].net_pay; 
//     } 
    
//     if(fields.includes('mgmt_pf')){
//         data[0]['MGMT PF']='प्रबंधन  PF';
//         data[1]['MGMT PF']='ব্যবস্থাপনা PF';
//         data[i+2]['MGMT PF']=billMaker[i].mgmt_pf;  
//         }
        
//     if(fields.includes('mgmt_esic')){
//     data[0]['MGMT ESIC']='प्रबंधन  ESIC';
//     data[1]['MGMT ESIC']='ব্যবস্থাপনা ESIC';
//     data[i+2]['MGMT ESIC']=billMaker[i].mgmt_esic;
//     }  
    
//     if(fields.includes('mgmt_lwf')){
//         data[0]['MGMT LWF']='प्रबंधन  LWF';
//         data[1]['MGMT LWF']='ব্যবস্থাপনা LWF';
//         data[i+2]['MGMT LWF']=billMaker[i].mgmt_lwf; 
//         } 
        
//     if(fields.includes('ctc')){
//     data[0]['CTC']='कंपनी के लिए लागत';
//     data[1]['CTC']='কোম্পানির খরচ';
//     data[i+2]['CTC']=billMaker[i].ctc;  
//     }
    
//     if(fields.includes('production_incentive')){
//         data[0]['PRODUCTION INCENTIVE']='उत्पादन या परिवर्तनीय प्रोत्साहन';
//         data[1]['PRODUCTION INCENTIVE']='পরিবর্তনশীল ইনসেনটিভ';
//         data[i+2]['PRODUCTION INCENTIVE']=billMaker[i].production_incentive;  
//         }
        
//     if(fields.includes('gross_incentive')){
//     data[0]['ACTUAL PAYABLE']='वास्तविक देय';
//     data[1]['ACTUAL PAYABLE']='প্রদেয়';
//     data[i+2]['ACTUAL PAYABLE']=billMaker[i].gross_incentive;  
//     }
    
//     // if(fields.includes('invoice_amount1')){
//         data[0]['INVOICE AMOUNT1']='चालान राशि 1';
//         data[1]['INVOICE AMOUNT1']='চালানের পরিমাণ 1';
//         data[i+2]['INVOICE AMOUNT1']=billMaker[i].invoice_amount1;  
//         // }
        
//     // if(fields.includes('invoice_amount2')){
//     data[0]['INVOICE AMOUNT2']='चालान राशि 2';
//     data[1]['INVOICE AMOUNT2']='চালানের পরিমাণ 2';
//     data[i+2]['INVOICE AMOUNT2']=billMaker[i].invoice_amount2;  
//     // }
    
//     // if(fields.includes('service_charge')){
//         data[0]['SERVICE CHARGE']='सेवा शुल्क';
//         data[1]['SERVICE CHARGE']='সেবা খরচ';
//         data[i+2]['SERVICE CHARGE']=billMaker[i].service_charge; 
//         // } 
        
//     // if(fields.includes('cost_of_contract')){
//     data[0]['COST OF CONTRACT STAFFING SERVICES 1']='अनुबंध स्टाफिंग सेवाओं की लागत - 1';
//     data[1]['COST OF CONTRACT STAFFING SERVICES 1']='কন্ট্রাক্ট স্টাফিং সার্ভিসের খরচ - 1';
//     data[i+2]['COST OF CONTRACT STAFFING SERVICES 1']=billMaker[i].cost_of_contract;  
//     // }
//     // if(fields.includes('cost_of_contract2')){
//     data[0]['COST OF CONTRACT STAFFING SERVICES 2']='अनुबंध स्टाफिंग सेवाओं की लागत - 1';
//     data[1]['COST OF CONTRACT STAFFING SERVICES 2']='কন্ট্রাক্ট স্টাফিং সার্ভিসের খরচ - 2';
//     data[i+2]['COST OF CONTRACT STAFFING SERVICES 2']=billMaker[i].cost_of_contract2; 
//     // }
//     }

//     var nameee='';
//         if(type==1)
//             nameee='wage_register';
//         else
//             nameee='payslip';
//         const ws = XLSX.utils.json_to_sheet(data)
//         const ws2 = XLSX.utils.json_to_sheet(data2)
//         const wb = XLSX.utils.book_new()
//         XLSX.utils.book_append_sheet(wb, ws2)
//         XLSX.utils.book_append_sheet(wb, ws)
//         XLSX.writeFile(wb, `output/${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx`)
//         const filePath = path.join(`output/${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx`);

//         fs.readFile(filePath, (err,data) =>{
//             res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', `inline; filename="${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx"`);  
//         res.send(data);
//         });
//     }
// });


exports.resetGeneration = catchAsyncErrors(async(req, res, next) => {
    const {
        bill_maker_comid2,
        bill_maker_cliid2,
        month_year2,
    } = req.body; 
    await BillMaker.update({
        status:0
        },{
        where:{
        company_id:bill_maker_comid2,
         client_id:bill_maker_cliid2,        
         month_year:month_year2,
         status:1
        }});
        const companies = await CompanyMaster.findAll();
        const billMakers = await BillMaker.findAll({include:[CompanyMaster,ClientMaster]});
            res.render('employee/bill_maker_tab',{
                companies,
                message:'',
                billMakers,
                show:false,
                isPreview:false

            });
});

exports.deleteBillMaker = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    
     await BillMaker.destroy({where:{bill_maker_id:id}});
     await BillMakerMaster.destroy({where:{id:id}});
    res.send('Successful');

  
});

exports.searchBillMaker = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    
    const client = await BillMakerMaster.findAll({where:{
        [Op.or]:[
        {month_year:val},
        {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send(client);
    
});

//invoice generator
exports.getInvoiceGenerator = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const invoices = await InvoiceGenerator.findAll({include:[CompanyMaster,ClientMaster]});
    const {isPreview} = req.query;
    res.render('employee/invoice_generator_tab',{
            companies,
            message:'',
            invoices,
            isPreview:isPreview
        });
   
});
exports.getInvoiceCode = catchAsyncErrors( async(req, res, next) => {
    const { compId,datee } = req.body;
    const company = await CompanyMaster.findByPk(compId);
    var mm = datee.substr(5,2); 
    if(mm=='01' || mm == '02' || mm=='03'){

        var startDate = (parseInt(datee.substr(0,4))-1)+'-04-01';
        var endDate = datee.substr(0,4)+'-03-31';
        
    var ddd = (parseInt(datee.substr(2,2))-1)+'-'+datee.substr(2,2)+'-';
    var ddd2 = parseInt(datee.substr(2,2))-1+'-'+datee.substr(2,2)+'-';
    }else{

        var startDate = datee.substr(0,4)+'-04-01';
        var endDate = (parseInt(datee.substr(0,4))+1)+'-03-31';
        
    var ddd = datee.substr(2,2)+'-'+(parseInt(datee.substr(2,2))+1)+'-';
    var ddd2 = parseInt(datee.substr(2,2))-1+'-'+datee.substr(2,2)+'-';
    }
    const count = await InvoiceGenerator.findOne({where:{company_id:compId,
            date:{[Op.between]: [startDate,endDate] }     

        },order:[['id','DESC']]});      
        const count2 = await InvoiceGenerator.findOne({where:{company_id:compId,
            date:{[Op.lt]: startDate}     

        },order:[['id','DESC']]});   
    var empCode = company.company_code;
    // var codes = {
    //     "KBM":1,
    //     "GEN":1,
    //     "GIR":1,
    //     "MPI":1,
    //     "DS":1,
    // }
  var codes = {};
    companies.forEach((c,i)=>{
        if(c.company_code=="MAN")
            codes[c.company_code]=29;
        else
            codes[c.company_code]=1;
    })
    
    if(!count && Date.parse(datee)>=Date.parse(startDate) && Date.parse(datee)<= Date.parse(endDate)){
        var newId = codes[company.company_code];
        empCode+=(ddd+newId);
        // empCode+=newId;

        res.send({empCode,newId});

    }else if(count && Date.parse(datee)>=Date.parse(startDate) && Date.parse(datee)<= Date.parse(endDate)){
        var newId = count.newId + 1;

        empCode+=(ddd+newId);
        // empCode+=newId;
        res.send({empCode,newId});
    }else{
        if(!count2){
            var newId = codes[company.company_code];

        }else{
        var newId = count2.newId + 1;
        }
        empCode+=(ddd2+newId);
        // empCode+=newId;
        res.send({empCode,newId});

    }
});
// exports.getInvoiceCode2 = catchAsyncErrors( async(req, res, next) => {
//     const { compId,invoiceId,datee } = req.body;
//     const oldInvoice = await InvoiceGenerator.findByPk(invoiceId);
//     var startDate = datee.substr(0,4)+'-04-01';
//     var endDate = datee.substr(0,4)+'-04-30';
//     const company = await CompanyMaster.findByPk(compId);
//     const count = await InvoiceGenerator.findOne({where:{company_id:compId,
//         date:{[Op.between]: [startDate, endDate]}     

//     },order:[['id','DESC']]});      const count2 = await InvoiceGenerator.findOne({where:{company_id:compId

//     },order:[['id','DESC']]});       
//     var codes = {
//         "KBM":1,
//         "GEN":1,
//         "GIR":1,
//         "MPI":1
//     }
//     var empCode = company.company_code;
//     if(company.id == oldInvoice.company_id){
//         empCode = oldInvoice.bill_no;
//         var newId = oldInvoice.newId;
//         res.send({empCode,newId});

//     }
//     if(!count && Date.parse(datee)>=Date.parse(startDate)){
//         var newId = codes[company.company_code];
//         empCode+=newId;

//         res.send({empCode,newId});

//     }else{
//         if(!count2){
//             var newId = codes[company.company_code];

//         }else{
//         var newId = count2.newId + 1;
//         }
//                 empCode+=newId;
//         res.send({empCode,newId});

//     }
    
// });
exports.getInvoiceCode2 = catchAsyncErrors( async(req, res, next) => {
    const { compId,invoiceId,datee } = req.body;
    const company = await CompanyMaster.findByPk(compId);

    const oldInvoice = await InvoiceGenerator.findByPk(invoiceId);
    
    var mm = datee.substr(5,2); 
    if(mm=='01' || mm == '02' || mm=='03'){

        var startDate = (parseInt(datee.substr(0,4))-1)+'-04-01';
        var endDate = datee.substr(0,4)+'-03-31';
        
    var ddd = (parseInt(datee.substr(2,2))-1)+'-'+datee.substr(2,2)+'-';
    var ddd2 = parseInt(datee.substr(2,2))-1+'-'+datee.substr(2,2)+'-';
    }else{

        var startDate = datee.substr(0,4)+'-04-01';
        var endDate = (parseInt(datee.substr(0,4))+1)+'-03-31';
        
    var ddd = datee.substr(2,2)+'-'+(parseInt(datee.substr(2,2))+1)+'-';
    var ddd2 = parseInt(datee.substr(2,2))-1+'-'+datee.substr(2,2)+'-';
    }
    const count = await InvoiceGenerator.findOne({where:{company_id:compId,
            date:{[Op.between]: [startDate,endDate] }     

        },order:[['id','DESC']]});      
        const count2 = await InvoiceGenerator.findOne({where:{company_id:compId,
            date:{[Op.lt]: startDate}     

        },order:[['id','DESC']]});   
    var empCode = company.company_code;
    // var codes = {
    //     "KBM":1,
    //     "GEN":1,
    //     "GIR":1,
    //     "MPI":1,
    //     "DS":1,
    // }
  var codes = {};
    companies.forEach((c,i)=>{
        if(c.company_code=="MAN")
            codes[c.company_code]=29;
        else
            codes[c.company_code]=1;
    })
    var empCode = company.company_code;
    if(company.id == oldInvoice.company_id){
        empCode = oldInvoice.bill_no;
        var newId = oldInvoice.newId;
        res.send({empCode,newId});

    }
    if(!count && Date.parse(datee)>=Date.parse(startDate) && Date.parse(datee)<= Date.parse(endDate)){
        var newId = codes[company.company_code];
        empCode+=(ddd+newId);
        // empCode+=newId;

        res.send({empCode,newId});

    }else if(count && Date.parse(datee)>=Date.parse(startDate) && Date.parse(datee)<= Date.parse(endDate)){
        var newId = count.newId + 1;

        empCode+=(ddd+newId);
        // empCode+=newId;
        res.send({empCode,newId});
    }else{
        if(!count2){
            var newId = codes[company.company_code];

        }else{
        var newId = count2.newId + 1;
        }
        empCode+=(ddd2+newId);
        // empCode+=newId;
        res.send({empCode,newId});

    }
    
});
exports.postInvoiceGenerator = catchAsyncErrors(async(req, res, next) => {
    const {
        company,
        client,
        invoice_date,
        month_year,
        biller,
        bill_no,
        new_id
    } = req.body;
    const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
    var month = month_year.substr(5,6);
    if(month<=9){
        month = month.substr(1,1);
    }

    await InvoiceGenerator.create({
        newId:new_id,
        company_id:company,
        client_id:client,
        date:invoice_date,
        month_year,       
        month:monthNames[month-1],
        year:month_year.substr(0,4),
        biller,
        bill_no,
        document:'',
        status:'Reserved'
    })
    res.redirect('/employee/invoice-generator?isPreview=true');
        // res.redirect('/employee/invoice_generator_tab?isPreview=true',{
        //     companies,
        //     message:'',
        //     invoices,
        //     isPreview:isPreview
        // });
});

exports.searchInvoiceGenerator = catchAsyncErrors( async (req, res, next) => {
    const {company,month_year} = req.body;
    if(!month_year){
        const client = await InvoiceGenerator.findAll({where:{
            company_id:company
            },
            include: [ CompanyMaster,ClientMaster]
        });    
        res.send(client);
    }else{

        const client = await InvoiceGenerator.findAll({where:{
            company_id:company,month_year:month_year
            },
            include: [ CompanyMaster,ClientMaster]
        });    
            res.send(client);
    }
});
exports.searchInvoiceGenerator2 = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    
    const client = await InvoiceGenerator.findAll({where:{
        [Op.or]:[
        {month:{[Op.substring]:val}},
        {year:val},
        {bill_no:val},
        {date:{[Op.substring]:val}},
        {biller:{[Op.substring]:val}},
        {status:{[Op.substring]:val}},
        {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send(client);
    
});
exports.getInvoiceGeneratorEdit = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const invoice = await InvoiceGenerator.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster]});
    res.render('employee/invoice_generator_edit',{
            companies,
            message:'',
            invoice,
        });
   
});
exports.postInvoiceGeneratorEdit = catchAsyncErrors(async(req, res, next) => {
    const {
        company,
        client,
        invoice_date,
        month_year,
        biller,
        bill_no,
        idd,
        new_id
    } = req.body;
    const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
    var month = month_year.substr(5,6);
    if(month<=9){
        month = month.substr(1,1);
    }

    await InvoiceGenerator.update({
        newId:new_id,
        company_id:company,
        client_id:client,
        date:invoice_date,
        month_year:month_year,    
        month:monthNames[month-1],
        year:month_year.substr(0,4),
        biller:biller,
        bill_no:bill_no
    },{where:{id:idd}})
    res.redirect('/employee/invoice-generator?isPreview=true');
      
});
exports.uploadInvoiceExcel = catchAsyncErrors(async(req, res, next) => {
    const {invoiceId} = req.body;
    const invoiceFile = req.files[0].path;

    await InvoiceGenerator.update({
        document:invoiceFile
    },{where:{id:invoiceId}});

    res.redirect('/employee/invoice-generator?isPreview=true');

});


exports.changeInvoiceStatus = catchAsyncErrors(async(req, res, next) => {
    const {status,id} = req.body;

    await InvoiceGenerator.update({
        status:status
    },{where:{id:id}});

    res.send('success');

});

exports.getBillMakerBulk = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const billMakers = await BillMakerMaster.findAll({include:[CompanyMaster,ClientMaster]});
    // const {isPreview} = req.query;
    res.render('employee/bill_maker_bulk',{
            companies,
            message:'',
            billMakers,
            show:false,
            // isPreview:isPreview,
            isBulk:false
        });
   
});
exports.postBillMakerBulk = catchAsyncErrors(async(req, res, next) => {
    const {
        company,
        month_year
        } = req.body;    
    
    const companies = await CompanyMaster.findAll();
    const billMaker = await BillMakerMaster.findOne({include:[CompanyMaster,ClientMaster], 
        order: [ [ 'id', 'DESC' ]],
        limit:1,
    where:{'company_id':company,'month_year':month_year}});
        const billMakers = await BillMakerMaster.findAll({include:[CompanyMaster,ClientMaster]});
       
        res.render('employee/bill_maker_bulk',{
            companies,
            message:'Uploaded Successfully',
            show:true,
            billMakers,
            billMaker,

        });
   
});

exports.postGenerationBulk = catchAsyncErrors(async(req, res, next) => {
    const {
        type,
        fields,
        type2,
        bill_maker_comid,
        bill_maker_month_year
    } = req.body; 
    // console.log(fields);
    //pdf
    const billMaker = await BillMaker.findAll({where:{
        'month_year':bill_maker_month_year,
        'company_id':bill_maker_comid,
        
        },
        order: [ [ 'sl_no', 'ASC' ]],
        include:[CompanyMaster,ClientMaster]});
    const client = await ClientAddress.findAll({where:{client_id:billMaker[0].client_id}});
        var monthNames = [ "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December" ]; 
        var aa = billMaker[0].month_year.substr(5,6);
        if(aa<9){
          aa = billMaker[0].month_year.substr(6,6);
        }
        let allClients = [];
        billMaker.forEach((c)=>{
            if(!allClients.includes(c.client_master.client_name)){
                allClients.push(c.client_master.client_name)
            }

        })
        var mm =  monthNames[aa-1];
        // console.log(billMaker);
    if(type2==1){
        var invoiceName='';
       
        if(type==1){
            invoiceName = 'wage_register_'+ mm+'_'+ billMaker[0].month_year.substr(0,4) +'.pdf';
        }
        else{
            invoiceName = 'payslip_'+ mm+'_'+ billMaker[0].month_year.substr(0,4) +'.pdf';
        }

        const invoicePath = path.join('uploads', invoiceName);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
        let pdfDoc='';
        var sizee2 = fields.length * 72;

        if(type==1){
         pdfDoc = new PDFDocument2({
            size: [sizee2,1250],
            margins : { 
                top: 10,
               bottom:0,
                left: 10,
              right: 10
            }
        }); 
    }else{
        // pdfDoc = new PDFDocument2({
        //     size: [sizee2,400],
        //     margins : { 
        //         top: 10,
        //        bottom:10,
        //         left: 10,
        //       right: 10
        //     }
        // }); 
        pdfDoc = new PDFDocument2({size:'A4'});
    }
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        var rows2=[];
        var size=[];
        
        var total=['TOTAL','','','','','','','','','',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        for(let i=0;i<billMaker.length;i++){
        var rows=[];
        var h = [];
        var h2 = [];
        var r=[];
        if(fields.includes('name')){
            h.push('Name \n Of \n The \n Worker');
            h2.push('Name Of The Worker');
            if(billMaker[i].name!='TOTAL')            
                r.push(billMaker[i].name ? billMaker[i].name : '');
            size.push(120);
        }
    
        if(fields.includes('emp_code')){
            h.push('EMPLOYEE \n CODE');
            h2.push('EMPLOYEE CODE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].emp_code ? billMaker[i].emp_code : '');
            else
                total[1]='';
        }
    
        if(fields.includes('gender')){
            h.push('GENDER');
            h2.push('GENDER');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].gender ? billMaker[i].gender : ''); 
            else
                total[2]='';
        }
            
        if(fields.includes('aadhaar')){    
        h.push('AADHAR NO');
        h2.push('AADHAR NO');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].aadhaar ? billMaker[i].aadhaar : ''); 
            else
                total[3]='';
        }  
        
        if(fields.includes('uan')){        
            h.push('UAN NO');
            h2.push('UAN NO');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].uan ? billMaker[i].uan : ''); 
            else
                total[4]='';
        }
            
        if(fields.includes('esic_no')){
            h.push('ESIC NO');
            h2.push('ESIC NO');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].esic_no ? billMaker[i].esic_no : ''); 
            else
                total[5]='';
        }
        
        if(fields.includes('designation')){
            h.push('DESIGNATION');
            h2.push('DESIGNATION');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].designation ? billMaker[i].designation : ''); 
            else
                total[6]='';
        }
            
        if(fields.includes('bank')){
            h.push('BANK');
            h2.push('BANK');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].bank ? billMaker[i].bank : ''); 
            else
                total[7]='';
        }
        
        if(fields.includes('ac_no')){
            h.push('A/C NO');
            h2.push('A/C NO');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].ac_no ? billMaker[i].ac_no : ''); 
            else
                total[8]='';
        }
            
        if(fields.includes('ifsc')){
            h.push('IFSC');
            h2.push('IFSC');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].ifsc ? billMaker[i].ifsc : ''); 
            else
                total[9]='';
        }      
        
        if(fields.includes('gross_salary')){
            h.push('GROSS \n SALARY');
            h2.push('GROSS SALARY');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].gross_salary ? billMaker[i].gross_salary : ''); 
            else
                total[10]+= +billMaker[i].gross_salary;
        } 
            
        if(fields.includes('basic_salary')){
            h.push('BASIC \n SALARY');
            h2.push('BASIC SALARY');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].basic_salary ? billMaker[i].basic_salary : ''); 
            else
                total[11]+= +billMaker[i].basic_salary;
        }      
        if(fields.includes('hra')){
            h.push('HRA');
            h2.push('HRA');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].hra ? billMaker[i].hra : '');  
            else
                total[12]+= +billMaker[i].hra;
        }      
        if(fields.includes('present_days')){
            h.push('PRESENT \n DAYS');
            h2.push('PRESENT DAYS');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].present_days ? billMaker[i].present_days : ''); 
            else
                total[13]+= +billMaker[i].present_days;
        }      
        if(fields.includes('holidays')){
            h.push('HOLIDAYS \n ( WEEKLY \n + FESTIVE )');
            h2.push('HOLIDAYS ( WEEKLY + FESTIVE )');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].holidays ? billMaker[i].holidays : ''); 
            else
                total[14]+= +billMaker[i].holidays;
        }                  
        if(fields.includes('odd_hours')){
            h.push('PAID \n LEAVE / \n LEAVE \n ADJUSTMENT');
            h2.push('PAID LEAVE / LEAVE ADJUSTMENT');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].odd_hours ? billMaker[i].odd_hours : ''); 
            else
                total[15]+= +billMaker[i].odd_hours;
        } 
        if(fields.includes('absent')){
            h.push('ABSENT');
            h2.push('ABSENT');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].absent ? billMaker[i].absent : ''); 
            else
                total[16]+= +billMaker[i].absent;
        }      
        if(fields.includes('total_days')){
            h.push('TOTAL DAYS');
            h2.push('TOTAL DAYS');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].total_days ? billMaker[i].total_days : ''); 
            else
                total[17]+= +billMaker[i].total_days;
        }      
        if(fields.includes('prop_gross')){
            h.push('PROP GROSS');
            h2.push('PROP GROSS');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].prop_gross ? billMaker[i].prop_gross : ''); 
            else
                total[18]+= +billMaker[i].prop_gross;
        }      
        if(fields.includes('ot_rate')){
            h.push('OT RATE');
            h2.push('OT RATE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].ot_rate ? billMaker[i].ot_rate : ''); 
            else
                total[19]+= +billMaker[i].ot_rate;
        }     
        if(fields.includes('ot_hour')){
            h.push('OT HOURS');
            h2.push('OT HOURS');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].ot_hour ? billMaker[i].ot_hour : ''); 
            else
                total[20]+= +billMaker[i].ot_hour;
        }      
        if(fields.includes('ot_amount')){
            h.push('OT AMOUNT');
            h2.push('OT AMOUNT');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].ot_amount ? billMaker[i].ot_amount : ''); 
            else
                total[21]+= +billMaker[i].ot_amount;
        }      
        if(fields.includes('minor_r')){
            h.push('MINOR \n REIMBURSEMENT');
            h2.push('MINOR REIMBURSEMENT');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].minor_r ? billMaker[i].minor_r : ''); 
            else
                total[22]+= +billMaker[i].minor_r;
        }      
        if(fields.includes('variable_incentive')){
            h.push('SPECIAL \n INCENTIVE \n(AS PER \n PRINCIPAL \n EMPLOYER \n DISCRETION)');
            h2.push('SPECIAL INCENTIVE(AS PER PRINCIPAL EMPLOYER DISCRETION)');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''); 
            else
                total[23]+= +billMaker[i].variable_incentive;
        }      
        if(fields.includes('actual_pay')){
            h.push('ACTUAL \n PAY');
            h2.push('ACTUAL PAY');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].actual_pay ? billMaker[i].actual_pay : ''); 
            else
                total[24]+= +billMaker[i].actual_pay;
        }      
        if(fields.includes('prop_basic')){
            h.push('PROP \n BASIC');
            h2.push('PROP BASIC');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].prop_basic ? billMaker[i].prop_basic : ''); 
            else
                total[25]+= +billMaker[i].prop_basic;
        }      
        if(fields.includes('pf')){
            h.push('PF');
            h2.push('PF');
            size.push(65);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].pf ? billMaker[i].pf : ''); 
            else
                total[26]+= +billMaker[i].pf;
        }      
        if(fields.includes('esic')){
            h.push('ESIC');
            h2.push('ESIC');
            size.push(65);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].esic ? billMaker[i].esic : ''); 
            else
                total[27]+= +billMaker[i].esic;
        }      
        if(fields.includes('ptax')){
            h.push('PTAX');
            h2.push('PTAX');
            size.push(65);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].ptax ? billMaker[i].ptax : ''); 
            else
                total[28]+= +billMaker[i].ptax;
        }      
        if(fields.includes('lwf')){
            h.push('LWF');
            h2.push('LWF');
            size.push(65);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].lwf ? billMaker[i].lwf : ''); 
            else
                total[29]+= +billMaker[i].lwf;
        }      
        if(fields.includes('advance')){
            h.push('ADVANCE');
            h2.push('ADVANCE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].advance ? billMaker[i].advance : ''); 
            else
                total[30]+= +billMaker[i].advance;
        }          
        if(fields.includes('net_pay')){
            h.push('NET \n PAY');
            h2.push('NET PAY');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].net_pay ? billMaker[i].net_pay : ''); 
            else
                total[31]+= +billMaker[i].net_pay;
        }      
        if(fields.includes('mgmt_pf')){
            h.push('MGMT \n PF');
            h2.push('MGMT PF');
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ''); 
            else
                total[32]+= +billMaker[i].mgmt_pf;
        }      
        if(fields.includes('mgmt_esic')){
            h.push('MGMT \n ESIC');
            h2.push('MGMT ESIC');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ''); 
            else
                total[33]+= +billMaker[i].mgmt_esic;
        }      
        if(fields.includes('mgmt_lwf')){
            h.push('MGMT \n LWF');
            h2.push('MGMT LWF');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ''); 
            else
                total[34]+= +billMaker[i].mgmt_lwf;
        }      
        if(fields.includes('ctc')){
            h.push('CTC');
            h2.push('CTC');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].ctc ? billMaker[i].ctc : ''); 
            else
                total[35]+= +billMaker[i].ctc;
        }      
        if(fields.includes('production_incentive')){
            h.push('PRODUCTION \n OR \n VARIABLE \n INCENTIVE');
            h2.push('PRODUCTION OR VARIABLE INCENTIVE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].production_incentive ? billMaker[i].production_incentive : ''); 
            else
                total[36]+= +billMaker[i].production_incentive;
        }      
        if(fields.includes('gross_incentive')){
            h.push('ACTUAL \n PAYABLE');
            h2.push('ACTUAL PAYABLE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].gross_incentive ? billMaker[i].gross_incentive : '');  
            else
                total[37]+= +billMaker[i].gross_incentive;
        }      
        if(fields.includes('invoice_amount1')){
            h.push('INVOICE AMOUNT1');
            h2.push('INVOICE AMOUNT1');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].invoice_amount1 ? billMaker[i].invoice_amount1 : ''); 
            else
                total[38]+= +billMaker[i].invoice_amount1; 
        }      
        if(fields.includes('invoice_amount2')){
            h.push('INVOICE \n AMOUNT2');
            h2.push('INVOICE AMOUNT2');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].invoice_amount2 ? billMaker[i].invoice_amount2 : ''); 
            else
                total[39]+= +billMaker[i].invoice_amount2; 
        }      
        if(fields.includes('service_charge')){
            h.push('SERVICE \n CHARGE');
            h2.push('SERVICE CHARGE');
            size.push(70);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].service_charge ? billMaker[i].service_charge : ''); 
            else
                total[40]+= +billMaker[i].service_charge; 
        }      
        if(fields.includes('cost_of_contract')){
            h.push('COST OF \n CONTRACT \n STAFFING \n SERVICES \n 1');
            h2.push('COST OF CONTRACT STAFFING SERVICES 1');
            size.push(80);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].cost_of_contract ? billMaker[i].cost_of_contract : '');  
            else
                total[41]+= +billMaker[i].cost_of_contract; 
        }      
        if(fields.includes('cost_of_contract2')){
            h.push('COST OF \n CONTRACT \n STAFFING \n SERVICES \n 2');
            h2.push('COST OF CONTRACT STAFFING SERVICES 2');
            size.push(80);
            if(billMaker[i].name!='TOTAL')            
            r.push(billMaker[i].cost_of_contract2 ? billMaker[i].cost_of_contract2 : ''); 
            else
                total[42]+= +billMaker[i].cost_of_contract2; 
        }  
       rows.push(r);
       rows2.push(r);
       let table='';
       if(type==2){        
        // table = {
        //     title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
        //      "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
        //     'WAGE SLIP : '+ ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
        //     // subtitle: "Subtitle",
        //     headers: h,
        //     rows: rows,
        //     divider: {
        //         header: { disabled: false, width: 2, opacity: 1 },
        //         horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
        //       },
        //   };
    
      // A4 595.28 x 841.89 (portrait) (about width sizes)
      // width
    pdfDoc.fontSize(14);
      
    
    //   await pdfDoc.table(table, { 
    //     // width: 2100,
    // columnsSize: [
    //     120, 70, 70, 70, 70, 70, 70, 70, 70,
    //      70, 70, 70, 70, 70, 70, 70, 70, 70,
    //      70, 70, 65, 65, 65, 65, 70, 70, 70,
    //      70, 70, 70, 70, 70, 70, 70, 80, 80,
    //      70, 70, 70, 70, 70, 70, 70, 80, 80,
    //   ],
    // columnSpacing: 16, 
    // height:200,
    // rowSpacing: 15, 
    // prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
    //     prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),

    //   });
    
       pdfDoc.font('Helvetica-Bold').text('PAYSLIP for the month of ' + mm.toUpperCase() + ' ' +billMaker[0].month_year.substr(0,4),10,10,{
        align:'center',
        width: 600,
        height:60,
       }); 

       if(billMaker[0].company_master.logo){
        if (fs.existsSync(billMaker[0].company_master.logo)) {
        pdfDoc.image(billMaker[0].company_master.logo, 8, 30, { width: 20, height: 20, align:'left' })
        .rect(8, 30, 20, 20)
        .stroke();
        }
    }   
       pdfDoc.text('CONTRACTOR',40,35,{
        align:'left',
        width: 250,
        height:60,
        underline:true
       }); 
       pdfDoc.font('Helvetica').text(billMaker[0].company_master.company_name,10,60,{
        align:'left',
        width: 250,
        height:60,
        underline:false
       }); 
       pdfDoc.fontSize(10);

       pdfDoc.text(billMaker[0].company_master.address,pdfDoc.x,pdfDoc.y+10,{
        align:'left',
        width: 250,
        height:60,

       }); 
        pdfDoc.fontSize(14);
        
       pdfDoc.font('Helvetica-Bold').text('PRINCIPAL EMPLOYER',pdfDoc.x+300,35,{
        align:'left',
        width: 250,
        height:10,
        underline:true
       }); 
       pdfDoc.font('Helvetica').text(billMaker[0].client_master.client_name,pdfDoc.x,60,{
        align:'left',
        width: 300,
        height:10,
        underline:false
       }); 

       pdfDoc.fontSize(10);

       pdfDoc.text(client[0].address,pdfDoc.x,pdfDoc.y+10,{
        align:'left',
        width: 250,
        height:60,
       }); 
       pdfDoc.moveDown();
       pdfDoc.moveDown();

       pdfDoc.text('_____________________________________________________________________________________________________',10,pdfDoc.y,{
        align:'left',
        width: 600,
        height:60,
       }); 
       pdfDoc.moveDown();
       pdfDoc.fontSize(10);
       var heighh = pdfDoc.y;
       
       pdfDoc.font('Helvetica-Bold').text('General Information',{
        align:'left',
        width: 250,
        height:60,
        underline:true
       }); 
       pdfDoc.moveDown();
       var totalGap=0;
       if(fields.includes('name')){
        pdfDoc.font('Helvetica').text('Name : ' + (billMaker[i].name ? billMaker[i].name : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();
       totalGap++;
    }
       if(fields.includes('aadhaar')){
        pdfDoc.text('Aadhar No : ' + (billMaker[i].aadhaar ? billMaker[i].aadhaar : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       totalGap++;
       pdfDoc.moveDown();
    }
       if(fields.includes('uan')){
        pdfDoc.text('UAN NO : ' + (billMaker[i].uan ? billMaker[i].uan : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       totalGap++;
       pdfDoc.moveDown();
    }
       if(fields.includes('esic_no')){
        pdfDoc.text('ESIC NO : ' + (billMaker[i].esic_no ? billMaker[i].esic_no : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       totalGap++;
       pdfDoc.moveDown();
    }
       if(fields.includes('gender')){
        pdfDoc.text('Gender : ' + (billMaker[i].gender ? billMaker[i].gender : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       totalGap++;
       pdfDoc.moveDown();

       }
       if(fields.includes('emp_code')){
        pdfDoc.text('Emp Code : ' + (billMaker[i].emp_code ? billMaker[i].emp_code : ''),pdfDoc.x+300,heighh+20,{
            align:'left',
            width: 300,
            height:60,
            });
       totalGap--;
       pdfDoc.moveDown();
    }

       if(fields.includes('designation')){
        pdfDoc.text('Designation : ' + (billMaker[i].designation ? billMaker[i].designation : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       totalGap--;
       pdfDoc.moveDown();
    }
       if(fields.includes('bank')){
        pdfDoc.text('Bank : ' + (billMaker[i].bank ? billMaker[i].bank : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       totalGap--;
       pdfDoc.moveDown();
    }
       if(fields.includes('ac_no')){
        pdfDoc.text('A/C No : ' + (billMaker[i].ac_no ? billMaker[i].ac_no : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       totalGap--;
       pdfDoc.moveDown();
    }
       if(fields.includes('ifsc')){
        pdfDoc.text('IFSC : ' + (billMaker[i].ifsc ? billMaker[i].ifsc : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();
       totalGap--;

       }
       for(var k=0;k<totalGap+1;k++)
        pdfDoc.moveDown();

       pdfDoc.text('_____________________________________________________________________________________________________',10,pdfDoc.y,{
        align:'left',
        width: 600,
        height:60,
       }); 
       pdfDoc.moveDown();
       
       pdfDoc.font('Helvetica-Bold').text('Salary',{
        align:'left',
        width: 250,
        height:60,
        underline:true
       }); 
       pdfDoc.moveDown();
       heighh = pdfDoc.y;
       if(fields.includes('gross_salary')){
        pdfDoc.font('Helvetica').text('GROSS SALARY : ' + (billMaker[i].gross_salary ? billMaker[i].gross_salary : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();
    }
    if(fields.includes('basic_salary')){
        pdfDoc.text('BASIC SALARY : ' + (billMaker[i].basic_salary ? billMaker[i].basic_salary : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();
    }
    if(fields.includes('hra')){
        pdfDoc.text('HRA : ' + (billMaker[i].hra ? billMaker[i].hra : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();
    }

    if(fields.includes('present_days')){
        pdfDoc.text('Present Days : ' + (billMaker[i].present_days ? billMaker[i].present_days : ''),pdfDoc.x+160,heighh,{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();
    }
    if(fields.includes('absent')){
        pdfDoc.text('Absent Days : ' + (billMaker[i].absent ? billMaker[i].absent : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();
    }
    if(fields.includes('odd_hours')){
        pdfDoc.text('PAID LEAVE / LEAVE ADJUSTMENT : ' + (billMaker[i].odd_hours ? billMaker[i].odd_hours : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();
    }
    if(fields.includes('ot_rate')){
        pdfDoc.text('OT Rate : ' + (billMaker[i].ot_rate ? billMaker[i].ot_rate : ''),pdfDoc.x+100,heighh,{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();
    }
    if(fields.includes('ot_hour')){
        pdfDoc.text('OT Hours : ' + (billMaker[i].ot_hour ? billMaker[i].ot_hour : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();
    }
    if(fields.includes('holidays')){
        pdfDoc.text('HOLIDAYS ( WEEKLY + FESTIVE ) : ' + (billMaker[i].holidays ? billMaker[i].holidays : ''),pdfDoc.x+100,heighh,{
            align:'left',
            width: 200,
            height:60,
            });
       pdfDoc.moveDown();
    }
    if(fields.includes('total_days')){
        pdfDoc.text('Total Days : ' + (billMaker[i].total_days ? billMaker[i].total_days : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();

    }
    pdfDoc.moveDown();
    pdfDoc.moveDown();

    pdfDoc.text('_____________________________________________________________________________________________________',10,pdfDoc.y,{
        align:'left',
        width: 600,
        height:60,
       }); 
    pdfDoc.moveDown();
       
    var heighh = pdfDoc.y;
       
       pdfDoc.font('Helvetica-Bold').text('Earnings',{
        align:'left',
        width: 250,
        height:60,
        underline:true
       }); 
       pdfDoc.moveDown();
       if(fields.includes('prop_gross')){
        pdfDoc.font('Helvetica').text('PROP GROSS : ' + (billMaker[i].prop_gross ? billMaker[i].prop_gross : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();
    }
       if(fields.includes('prop_basic')){
        pdfDoc.text('PROP BASIC : ' + (billMaker[i].prop_basic ? billMaker[i].prop_basic : ''),{
            align:'left',
            width: 300,
            height:60,
            underline:false
            });
       pdfDoc.moveDown();
    }
    //    if(fields.includes('odd_hours')){
    //     pdfDoc.text('ODD HOURS DUTY INCENTIVE : ' + (billMaker[i].odd_hours ? billMaker[i].odd_hours : ''),{
    //         align:'left',
    //         width: 300,
    //         height:60,
    //         underline:false
    //         });
    //    pdfDoc.moveDown();
    // }
       if(fields.includes('variable_incentive')){
        pdfDoc.text('SPECIAL INCENTIVE (AS PER PRINCIPAL EMPLOYER DISCRETION) : ' + (billMaker[i].variable_incentive ? billMaker[i].variable_incentive : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();
    }
       if(fields.includes('ot_amount')){
        pdfDoc.text('OT AMOUNT : ' + (billMaker[i].ot_amount ? billMaker[i].ot_amount : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();

       }
       if(fields.includes('minor_r')){
        pdfDoc.text('MINOR REIMBURSEMENT : ' + (billMaker[i].minor_r ? billMaker[i].minor_r : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();

       }
       
       if(fields.includes('production_incentive')){
        pdfDoc.text('PRODUCTION OR VARIABLE INCENTIVE : ' + (billMaker[i].production_incentive ? billMaker[i].production_incentive : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();

       }
       if(fields.includes('actual_pay')){
        pdfDoc.text('ACTUAL PAY : ' + (billMaker[i].actual_pay ? billMaker[i].actual_pay : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();

       }
       
       pdfDoc.font('Helvetica-Bold').text('Deductions',pdfDoc.x+300,heighh,{
        align:'left',
        width: 250,
        height:60,
        underline:true
       }); 
       pdfDoc.moveDown();
       if(fields.includes('pf')){
        pdfDoc.font('Helvetica').text('EMP PF : ' + (billMaker[i].pf ? billMaker[i].pf : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();
    }

       if(fields.includes('esic')){
        pdfDoc.text('EMP ESIC : ' + (billMaker[i].esic ? billMaker[i].esic : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();
    }
       if(fields.includes('ptax')){
        pdfDoc.text('EMP PTAX : ' + (billMaker[i].ptax ? billMaker[i].ptax : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();
    }
       if(fields.includes('advance')){
        pdfDoc.text('Advance : ' + (billMaker[i].advance ? billMaker[i].advance : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       pdfDoc.moveDown();
    }
       if(fields.includes('lwf')){
        pdfDoc.text('LWF : ' + (billMaker[i].lwf ? billMaker[i].lwf : ''),{
            align:'left',
            width: 300,
            height:60,
            });
       }
       pdfDoc.moveDown();
       pdfDoc.moveDown();
       pdfDoc.moveDown();
       pdfDoc.moveDown();

       if(fields.includes('net_pay')){
        pdfDoc.font('Helvetica-Bold').text('NET PAY : ' + (billMaker[i].net_pay ? billMaker[i].net_pay : ''),10,pdfDoc.y+20,{
            align:'center',
            width: 600,
            height:60,
            });
            pdfDoc.moveDown();
        }
       if(fields.includes('gross_incentive')){
        pdfDoc.font('Helvetica-Bold').text('ACTUAL PAYABLE : ' + (billMaker[i].gross_incentive ? billMaker[i].gross_incentive : ''),{
            align:'center',
            width: 600,
            height:60,
            });
            pdfDoc.moveDown();
        }
        if(fields.includes('mgmt_pf')){
            pdfDoc.font('Helvetica').text('MGMT PF : ' + (billMaker[i].mgmt_pf ? billMaker[i].mgmt_pf : ''),10,pdfDoc.y,{
                align:'left',
                width: 300,
                height:60,
                });
           pdfDoc.moveDown();
        }
        if(fields.includes('mgmt_esic')){
            pdfDoc.text('MGMT ESIC : ' + (billMaker[i].mgmt_esic ? billMaker[i].mgmt_esic : ''),{
                align:'left',
                width: 300,
                height:60,
                });
           pdfDoc.moveDown();
        }
        if(fields.includes('mgmt_lwf')){
            pdfDoc.text('MGMT LWF : ' + (billMaker[i].mgmt_lwf ? billMaker[i].mgmt_lwf : ''),{
                align:'left',
                width: 300,
                height:60,
                });
        }
    //    for(var ii=0;ii<(h2.length/2);ii++){
    //     pdfDoc.text(h2[ii] + ' : ' + rows[0][ii],{
    //     align:'left',
    //     width: 300,
    //     height:60,
    //     underline:false
    //     });
    //     pdfDoc.moveDown();
    //    }
    //    pdfDoc.text('',pdfDoc.x+300,heighh,{
    //     align:'left',
    //     width: 0,
    //     height:6,
    //     });
    //    for(ii=Math.floor(h2.length/2);ii<h2.length;ii++){
    //     pdfDoc.text(h2[ii] + ' : ' + rows[0][ii],{
    //     align:'left',
    //     width: 300,
    //     height:60,
    //     });
    //     pdfDoc.moveDown();
    //    }
    pdfDoc.text('_____________________________________________________________________________________________________',10,pdfDoc.y+10,{
        align:'left',
        width: 600,
        height:60,
       }); 
       pdfDoc.fontSize(9).text('This is a computerised auto generated document, hence Signature or Stamp is not mandatory.',10,pdfDoc.y+10,{
        align:'left',
        width: 500,
        height:60,
        });

      if(billMaker[0].company_master.stamp){
        
        if (fs.existsSync(billMaker[0].company_master.stamp)) {
        pdfDoc.image(billMaker[0].company_master.stamp, pdfDoc.x+450, pdfDoc.y - 20, { width: 40, height: 40, align:'right' })
        .rect(pdfDoc.x+450, pdfDoc.y-20, 40, 40)
        .stroke();
        }
    }   


    if(i!=billMaker.length - 1)
        pdfDoc.addPage();


       }
        }
      if(type==1){
        pdfDoc.fontSize(18).font('Helvetica-Bold').text('FORM XVII',0,40,{
            align:'center',
            width:sizee2,
            height:20,
        });
pdfDoc.font('Helvetica').text('[See Rule 78(1)(a)(i)]',pdfDoc.x,pdfDoc.y+5,{
        align:'center',
        width:sizee2,
        height:20,
});
pdfDoc.font('Helvetica-Bold').text('Register of Wages',pdfDoc.x,pdfDoc.y+5,{
        align:'center',
        width:sizee2,
        height:20,
});
pdfDoc.text('NAME AND ADDRESS OF CONTRACTOR',pdfDoc.x+10,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text(billMaker[0].company_master.company_name,pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text(billMaker[0].company_master.address,pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text('CLIENT NAME AND ADDRESS',pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text(billMaker[0].client_master.client_name,pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text(client[0].address,pdfDoc.x,pdfDoc.y+5,{
    align:'left',
    width:sizee2 - 100,
    height:20,
    continued:true,
    lineBreak:false
});
pdfDoc.text('WAGE PERIOD : '+mm + ' ' +billMaker[0].month_year.substr(0,4),pdfDoc.x,pdfDoc.y+5,{
    align:'right',
    width:sizee2 - 100,
    height:20,
});
pdfDoc.moveDown();
rows2.push(total);
// console.log(total);
var rownUntill9 = [];
var ll = 8;
if(rows2.length<8){
    ll = rows2.length;
}
for(var a=0;a<ll;a++)
    rownUntill9.push(rows2[a]);
    

table = {
        // title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
        //  "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
        // 'WAGE SLIP : ' + ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
        // subtitle: "Subtitle",
        headers: h,
        rows: rownUntill9,
        divider: {
            header: { disabled: false, width: 2, opacity: 1 },
            horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
          },
    };
rows2.splice(0,8);
await pdfDoc.table(table, { 
    // width: 2100,
    columnsSize: size,
    height:200,
    columnSpacing: 15, 
    rowSpacing: 10, 
    prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
   // prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),
  prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        pdfDoc.font("Helvetica").fontSize(17);
        // console.log(row);
        // console.log('----');
        // console.log(indexColumn);
        // console.log(indexRow);
        // console.log(rectRow);
        // console.log(rectCell);
      },
  });
 
//dividing into groups of 13
var ll = (rows2.length/10);
for(var aa = 0;aa<ll;aa++){
    var eachRow = [];
    var newRow = rows2.splice(0,10);
    const newTable = {
        // title: "PRINCIPAL EMPLOYER : " + billMaker[0].client_master.client_name + '\n' +
        //  "CONTRACTOR : " + billMaker[0].company_master.company_name + '\n' +
        // 'WAGE SLIP : ' + ' FOR THE MONTH OF ' + mm + ' '+billMaker[0].month_year.substr(0,4),
        // subtitle: "Subtitle",
        headers: h,
        rows: newRow,
        divider: {
            header: { disabled: false, width: 2, opacity: 1 },
            horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
          },
    };
    pdfDoc.addPage();

    await pdfDoc.table(newTable, { 
        // width: 2100,
        columnsSize: size,
        height:200,
        columnSpacing: 15, 
        rowSpacing: 10, 
        prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(12),
       // prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(17),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            pdfDoc.font("Helvetica").fontSize(17);
            // console.log(row);
            // console.log('----');
            // console.log(indexColumn);
            // console.log(indexRow);
            // console.log(rectRow);
            // console.log(rectCell);
          },
      });
      if(aa==ll && newRow.length>9)
        pdfDoc.addPage();
     
}




pdfDoc.text('1. The Gross Salary and all its components and bifurcations are determined by the Principal Employer only. ',10,pdfDoc.y+5,{
    align:'left',
    width:1800,
    height:20,
});

pdfDoc.text('2. Attendance, Any reimbursement, Incentive, or any other benefits given to the employee are only after the sanction of the Principal Employer and/or mutual understanding of the Principal and Employee.',{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text('3. All payments are made through NEFT or Bank transfer, and thus requires no signature of Employees. In any other mode of payment, signature to follow. ',{
    align:'left',
    width:1800,
    height:20,
});
pdfDoc.text('4. This is an auto generated computerised document, prepared on the basis of data provided by the employee and Principal. ',{
    align:'left',
    width:1800,
    height:20,
});
  if(billMaker[0].company_master.stamp){
    var sizee = fields.length * 65;

    if (fs.existsSync(billMaker[0].company_master.stamp)) {
    pdfDoc.image(billMaker[0].company_master.stamp, pdfDoc.x + sizee, pdfDoc.y, { width: 80, height: 80, align:'right' })
    .rect(pdfDoc.x + sizee, pdfDoc.y-80, 80, 80)
    .stroke();
    }
}     
      }
     
        pdfDoc.end();

    }else{
    //excel
    let data = [];
    let data2 =[]; 
    if(type==2){
        data2.push({
            'PRINCIPAL EMPLOYER':  allClients[0],
            'CONTRACTOR':billMaker[0].company_master.company_name,
            'WAGE SLIP FOR THE MONTH OF ':mm + ' ' +billMaker[0].month_year.substr(0,4)           
        });
        allClients.forEach((c,i)=>{  
            if(i>0){        
            data2.push({
                'PRINCIPAL EMPLOYER':c,
            });
        }
        });
  
}else{
    data2.push({
        'NAME & ADDRESS OF CONTRACTOR':  billMaker[0].company_master.company_name,
        'NAME OF CLIENT':allClients[0],
        'WAGE PERIOD':mm + ' ' +billMaker[0].month_year.substr(0,4)
    });
    data2.push({
        'NAME & ADDRESS OF CONTRACTOR':  billMaker[0].company_master.address,
        'NAME OF CLIENT':allClients[1],
    });
    allClients.forEach((c,i)=>{  
        if(i>1){        
        data2.push({
            'NAME OF CLIENT':c 
         
        });
    }
    });

}
   
for(let i=0;i<billMaker.length;i++){

    data[0]={};
    data[1]={};
    data[i+2]={};
    data[0]['Sl No']='Sl No';
    data[1]['Sl No']='Sl No';
    data[i+2]['Sl No']=i+1;
    if(fields.includes('name')){
        data[0]['Name Of The Worker']='नाम';
        data[1]['Name Of The Worker']='নাম';
        data[i+2]['Name Of The Worker']=billMaker[i].name;
    }
    if(fields.includes('emp_code')){
        data[0]['EMPLOYEE CODE']='कर्मचारी कोड';   
        data[1]['EMPLOYEE CODE']='কর্মী কোড';   
        data[i+2]['EMPLOYEE CODE']=billMaker[i].emp_code;   
    }
    if(fields.includes('gender')){
        data[0]['GENDER']='लिंग';  
        data[1]['GENDER']='লিঙ্গ';  
        data[i+2]['GENDER']=billMaker[i].gender;  
    }
    if(fields.includes('aadhaar')){
    data[0]['AADHAR NO']='आधार नंबर'; 
    data[1]['AADHAR NO']='আধার নং'; 
    data[i+2]['AADHAR NO']=billMaker[i].aadhaar;  
    }
    if(fields.includes('uan')){
        data[0]['UAN NO']='UAN नंबर';  
         data[1]['UAN NO']='UAN নম্বর';  
          data[i+2]['UAN NO']=billMaker[i].uan;  
        }
        
    if(fields.includes('esic_no')){
    data[0]['ESIC NO']='ESIC नंबर';
    data[1]['ESIC NO']='ESIC নম্বর';
    data[i+2]['ESIC NO']=billMaker[i].esic_no;
    }  
    
    if(fields.includes('designation')){
        data[0]['DESIGNATION']='पद';
        data[1]['DESIGNATION']='নিয়োগ';
        data[i+2]['DESIGNATION']=billMaker[i].designation;    
        }
        
    if(fields.includes('bank')){
    data[0]['BANK']='बैंक का नाम';
    data[1]['BANK']='ব্যাংকের নাম';
    data[i+2]['BANK']=billMaker[i].bank;
    }  
    
    if(fields.includes('ac_no')){
        data[0]['A/C NO']='अकाउंट नंबर';  
        data[1]['A/C NO']='অ্যাকাউন্ট নম্বর';  
        data[i+2]['A/C NO']=billMaker[i].ac_no;  
        }
    if(fields.includes('ifsc')){
    data[0]['IFSC']='आई०ऍफ़०एस० कोड';        
    data[1]['IFSC']='আইএফএস কোড';        
    data[i+2]['IFSC']=billMaker[i].ifsc;        
}
    
    if(fields.includes('gross_salary')){
        data[0]['GROSS SALARY']='सकल वेतन';  
        data[1]['GROSS SALARY']='মোট বেতন';  
        data[i+2]['GROSS SALARY']=billMaker[i].gross_salary;  
        }
    if(fields.includes('basic_salary')){
    data[0]['BASIC SALARY']='मूल वेतन';      
    data[1]['BASIC SALARY']='মূল বেতন';  
    data[i+2]['BASIC SALARY']=billMaker[i].basic_salary;  

    }
    if(fields.includes('hra')){
        data[0]['HRA']='गृह वाता';  
        data[1]['HRA']='বাড়ি ভাড়া ভাতা';  
        data[2]['HRA']=billMaker[i].hra;  

    }
    if(fields.includes('present_days')){
        data[0]['PRESENT DAYS']='काम के दिन';  
        data[1]['PRESENT DAYS']='কাজের দিন';  
        data[i+2]['PRESENT DAYS']=billMaker[i].present_days;  

        }
    if(fields.includes('holidays')){
    data[0]['HOLIDAYS ( WEEKLY + FESTIVE)']='छुट्टी का दिन';  
    data[1]['HOLIDAYS ( WEEKLY + FESTIVE)']='ছুটির দিন';  
    data[i+2]['HOLIDAYS ( WEEKLY + FESTIVE)']=billMaker[i].holidays;  
    }
    if(fields.includes('odd_hours')){
    data[0]['PAID LEAVE / LEAVE ADJUSTMENT']='भुगतान छुट्टी समायोजन'; 
    data[1]['PAID LEAVE / LEAVE ADJUSTMENT']='বেতনের ছুটি সমন্বয়';  
    data[i+2]['PAID LEAVE / LEAVE ADJUSTMENT']=billMaker[i].odd_hours;  

    }
    if(fields.includes('absent')){
        data[0]['ABSENT']='अनुपस्थित दिन';  
        data[1]['ABSENT']='অনুপস্থিত দিন';  
        data[i+2]['ABSENT']=billMaker[i].absent;  
        }
    if(fields.includes('total_days')){
    data[0]['TOTAL DAYS']='कुल दिन';  
    data[1]['TOTAL DAYS']='মোট দিন';  
    data[i+2]['TOTAL DAYS']=billMaker[i].total_days;  
    }
    if(fields.includes('prop_gross')){
        data[0]['PROP GROSS']='आनुपातिक सकल वेतन';
        data[1]['PROP GROSS']='আনুপাতিক মোট বেতন';
        data[i+2]['PROP GROSS']=billMaker[i].prop_gross;  
     }   
    if(fields.includes('ot_rate')){
    data[0]['OT RATE']='ओवरटाइम दर';
    data[1]['OT RATE']='ওভারটাইম হার';
    data[i+2]['OT RATE']=billMaker[i].ot_rate;  
    }
    
    if(fields.includes('ot_hour')){
        data[0]['OT HOURS']='अतिरिक्त समय अवधि';
        data[1]['OT HOURS']='অতিরিক্ত ঘন্টা'; 
        data[i+2]['OT HOURS']=billMaker[i].ot_hour;  
        } 
        
    if(fields.includes('ot_amount')){
    data[0]['OT AMOUNT']='ओवरटाइम राशि';
    data[1]['OT AMOUNT']='অতিরিক্ত কাজের বেতন';
    data[i+2]['OT AMOUNT']=billMaker[i].ot_amount;  
    }
    
    if(fields.includes('minor_r')){
        data[0]['MINOR REIMBURSEMENT']='मामूली प्रतिपूर्ति';
        data[1]['MINOR REIMBURSEMENT']='সামান্য প্রতিদান';
        data[i+2]['MINOR REIMBURSEMENT']=billMaker[i].minor_r; 
        } 

        
    if(fields.includes('variable_incentive')){
    data[0]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']='विशेष प्रोत्साहन';
    data[1]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']='বিশেষ প্রণোদনা';
    data[i+2]['VARIABLE INCENTIVE ( IF ANY)( PRINCIPAL EMPLOYER DISCRETION)']=billMaker[i].variable_incentive; 
    } 
    
    if(fields.includes('actual_pay')){
        data[0]['ACTUAL PAY']='वास्तविक भुगतान';
        data[1]['ACTUAL PAY']='প্রকৃত বেতন';
        data[i+2]['ACTUAL PAY']=billMaker[i].actual_pay; 
        } 
        
    if(fields.includes('prop_basic')){
    data[0]['PROP BASIC']='आनुपातिक वेतन';
    data[1]['PROP BASIC']='আনুপাতিক মৌলিক';
    data[i+2]['PROP BASIC']=billMaker[i].prop_basic;
    }  
    
    if(fields.includes('pf')){
        data[0]['PF']='कर्मचारी PF';
        data[1]['PF']='কর্মচারী PF';
        data[i+2]['PF']=billMaker[i].pf;  
        }
    if(fields.includes('esic')){
    data[0]['ESIC']='कर्मचारी ESIC';
    data[1]['ESIC']='কর্মচারী ESIC';
    data[i+2]['ESIC']=billMaker[i].esic; 
    } 
    
    if(fields.includes('ptax')){
        data[0]['PTAX']='कर्मचारी P TAX';
        data[1]['PTAX']='কর্মচারী P TAX';
        data[i+2]['PTAX']=billMaker[i].ptax;  
        }
        
    if(fields.includes('lwf')){
    data[0]['LWF']='कर्मचारी LWF';
    data[1]['LWF']='কর্মচারী LWF';
    data[i+2]['LWF']=billMaker[i].lwf;  
    }
    
    if(fields.includes('advance')){
        data[0]['ADVANCE']='एडवांस';
        data[1]['ADVANCE']='অগ্রিম';
        data[i+2]['ADVANCE']=billMaker[i].advance;  
        }
        
    if(fields.includes('net_pay')){
    data[0]['NET PAY']='कुल भुगतान';
    data[1]['NET PAY']='নেট বেতন';
    data[i+2]['NET PAY']=billMaker[i].net_pay; 
    } 
    
    if(fields.includes('mgmt_pf')){
        data[0]['MGMT PF']='प्रबंधन  PF';
        data[1]['MGMT PF']='ব্যবস্থাপনা PF';
        data[i+2]['MGMT PF']=billMaker[i].mgmt_pf;  
        }
        
    if(fields.includes('mgmt_esic')){
    data[0]['MGMT ESIC']='प्रबंधन  ESIC';
    data[1]['MGMT ESIC']='ব্যবস্থাপনা ESIC';
    data[i+2]['MGMT ESIC']=billMaker[i].mgmt_esic;
    }  
    
    if(fields.includes('mgmt_lwf')){
        data[0]['MGMT LWF']='प्रबंधन  LWF';
        data[1]['MGMT LWF']='ব্যবস্থাপনা LWF';
        data[i+2]['MGMT LWF']=billMaker[i].mgmt_lwf; 
        } 
        
    if(fields.includes('ctc')){
    data[0]['CTC']='कंपनी के लिए लागत';
    data[1]['CTC']='কোম্পানির খরচ';
    data[i+2]['CTC']=billMaker[i].ctc;  
    }
    
    if(fields.includes('production_incentive')){
        data[0]['PRODUCTION INCENTIVE']='उत्पादन या परिवर्तनीय प्रोत्साहन';
        data[1]['PRODUCTION INCENTIVE']='পরিবর্তনশীল ইনসেনটিভ';
        data[i+2]['PRODUCTION INCENTIVE']=billMaker[i].production_incentive;  
        }
        
    if(fields.includes('gross_incentive')){
    data[0]['ACTUAL PAYABLE']='वास्तविक देय';
    data[1]['ACTUAL PAYABLE']='প্রদেয়';
    data[i+2]['ACTUAL PAYABLE']=billMaker[i].gross_incentive;  
    }
    
    if(fields.includes('invoice_amount1')){
        data[0]['INVOICE AMOUNT1']='चालान राशि 1';
        data[1]['INVOICE AMOUNT1']='চালানের পরিমাণ 1';
        data[i+2]['INVOICE AMOUNT1']=billMaker[i].invoice_amount1;  
        }
        
    if(fields.includes('invoice_amount2')){
    data[0]['INVOICE AMOUNT2']='चालान राशि 2';
    data[1]['INVOICE AMOUNT2']='চালানের পরিমাণ 2';
    data[i+2]['INVOICE AMOUNT2']=billMaker[i].invoice_amount2;  
    }
    
    if(fields.includes('service_charge')){
        data[0]['SERVICE CHARGE']='सेवा शुल्क';
        data[1]['SERVICE CHARGE']='সেবা খরচ';
        data[i+2]['SERVICE CHARGE']=billMaker[i].service_charge; 
        } 
        
    if(fields.includes('cost_of_contract')){
    data[0]['COST OF CONTRACT STAFFING SERVICES 1']='अनुबंध स्टाफिंग सेवाओं की लागत - 1';
    data[1]['COST OF CONTRACT STAFFING SERVICES 1']='কন্ট্রাক্ট স্টাফিং সার্ভিসের খরচ - 1';
    data[i+2]['COST OF CONTRACT STAFFING SERVICES 1']=billMaker[i].cost_of_contract;  
    }
    if(fields.includes('cost_of_contract2')){
    data[0]['COST OF CONTRACT STAFFING SERVICES 2']='अनुबंध स्टाफिंग सेवाओं की लागत - 1';
    data[1]['COST OF CONTRACT STAFFING SERVICES 2']='কন্ট্রাক্ট স্টাফিং সার্ভিসের খরচ - 2';
    data[i+2]['COST OF CONTRACT STAFFING SERVICES 2']=billMaker[i].cost_of_contract2; 
    }
    }
    var nameee='';
        if(type==1)
            nameee='wage_register';
        else
            nameee='payslip';
        const ws = XLSX.utils.json_to_sheet(data)
        const ws2 = XLSX.utils.json_to_sheet(data2)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws2)
        XLSX.utils.book_append_sheet(wb, ws)
        XLSX.writeFile(wb, `output/${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx`)
        const filePath = path.join(`output/${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx`);

        fs.readFile(filePath, (err,data) =>{
            res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `inline; filename="${nameee}_${mm}_${billMaker[0].month_year.substr(0,4)}_export.xlsx"`);  
        res.send(data);
        });
    }
});

exports.getDigitalInvoice = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const digitalInvoice = await DigitalInvoice.findAll({include:[CompanyMaster,ClientMaster],
        order: [ [ 'id', 'DESC' ]],
    });
    const {isPreview} = req.query;
    res.render('employee/digital_invoice_tab',{
            companies,
            message:'',
            digitalInvoice,
            isPreview:isPreview,
        });
   
});
exports.postDigitalInvoice = catchAsyncErrors(async(req, res, next) => {
    const {
        company,
        client,
        address,
        month_year,
        invoice_date,
        bill_no,
        description,
        amount,
        note,
        service_charge,
        total,
        cgst,
        gst_amount,
        net_total
        } = req.body;
        const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
    var month = month_year.substr(5,6);
    if(month<=9){
        month = month.substr(1,1);
    }
    if(cgst ==0){
      var cgstt=1
    }else{
       var igst=1
    }
    const invoice = await DigitalInvoice.create({
        company_id:company,
        client_id:client,
        client_address_id:address,
        date:invoice_date,
        month_year,       
        month:monthNames[month-1],
        year:month_year.substr(0,4),
        bill_no,
        description,
        note,
        amount,
        service_charge,
        total,
        cgst:cgstt,
        igst:igst,
        cgst_igst_amount:gst_amount,
        net_amount:net_total
    });


    // res.redirect('/employee/downloadDigitalInvoice/'+invoice.id);
    res.redirect('/employee/digital-invoice?isPreview=true');

   
});
exports.getEditDigitalInvoice = catchAsyncErrors(async(req, res, next) => {
    const companies = await CompanyMaster.findAll();
    const invoice = await DigitalInvoice.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster,ClientAddress]});
    res.render('employee/digital_invoice_edit',{
            companies,
            message:'',
            invoice
    });
   
});
exports.postEditDigitalInvoice = catchAsyncErrors(async(req, res, next) => {
    const {
        company,
        client,
        address,
        month_year,
        invoice_date,
        bill_no,
        description,
        amount,
        note,
        service_charge,
        total,
        cgst,
        gst_amount,
        net_total,
        idd
        } = req.body;

    const monthNames = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
    var month = month_year.substr(5,6);
    if(month<=9){
        month = month.substr(1,1);
    }

    if(cgst ==0){
        var cgstt=1
        var igst=0
      }else{
         var igst=1
         var cgstt=0
      }
    await DigitalInvoice.update({
        company_id:company,
        client_id:client,
        client_address_id:address,
        date:invoice_date,
        month_year:month_year,    
        month:monthNames[month-1],
        year:month_year.substr(0,4),
        description:description,
        bill_no:bill_no,
        amount:amount,
        note:note,
        service_charge:service_charge,
        total:total,        
        cgst:cgstt,
        igst:igst,
        cgst_igst_amount:gst_amount,
        net_amount:net_total
    },{where:{id:idd}});

    res.redirect('/employee/digital-invoice?isPreview=true');

});

exports.searchDigitalInvoice = catchAsyncErrors( async (req, res, next) => {
    const {company,month_year} = req.body;
    if(!month_year){
        const client = await DigitalInvoice.findAll({where:{
            company_id:company
            },
            include: [ CompanyMaster,ClientMaster]
        });    
        res.send(client);
    }else{

        const client = await DigitalInvoice.findAll({where:{
            company_id:company,month_year:month_year
            },
            include: [ CompanyMaster,ClientMaster]
        });    
            res.send(client);
    }
});
exports.searchDigitalInvoice2 = catchAsyncErrors( async (req, res, next) => {
    const {val} = req.body;
    
    const client = await DigitalInvoice.findAll({where:{
        [Op.or]:[
        {month:{[Op.substring]:val}},
        {year:val},
        {bill_no:val},
        {date:{[Op.substring]:val}},
        {'$client_master.client_name$':{[Op.substring]:val}},
        {'$company_master.company_name$':{[Op.substring]:val}},
        ]
    },
    include: [ CompanyMaster,ClientMaster]
});    
    res.send(client);
    
});
function changeDate(datee) {
    var ddd =  datee.split('-');      
    return [ddd[2],
    ddd[1],
    ddd[0]         
           ].join('-');
  

  };
  var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

function inWords (num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
}

exports.downloadDigitalInvoice = catchAsyncErrors( async (req, res, next) => {
    const invoice = await DigitalInvoice.findByPk(req.params.id,{include:[CompanyMaster,ClientMaster,ClientAddress]});
    const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JULY','AUG','SEP','OCT','NOV','DEC']
    const monthNames2 = ['JANUARY','FEBURARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
    var month = invoice.month_year.substr(5,6);
    if(month<=9){
        month = month.substr(1,1);
    }

    var client_namee= invoice.client_master.client_name.replace('/','');
    client_namee = client_namee.replace(' ','')
   var invoiceName = invoice.company_master.company_code+'_'+client_namee+'_'+monthNames[month-1]+'_'+invoice.bill_no+'.pdf';    const invoicePath = path.join('uploads', invoiceName);
    const clientData = await ClientMaster.findByPk(invoice.client_id,{include:ClientAddress});

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
    pdfDoc = new PDFDocument({size:'A4'});

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);


    if(invoice.company_master.logo){
        if (fs.existsSync(invoice.company_master.logo)) {
        pdfDoc.image(invoice.company_master.logo, 20, 20, { width: 100, height: 100, align:'left' })
        // .rect(20, 30, 100, 100)
        // .stroke();
        }    
    }   

    pdfDoc.fontSize(12);    
    pdfDoc.moveDown();

    pdfDoc.font('Helvetica-Bold').text(invoice.company_master.tagline,15,140,{
        align:'left',
        width:550,
        height:20,
    })
    // pdfDoc.fontSize(16);    
    
    if(invoice.company_master.company_name_logo){
        if (fs.existsSync(invoice.company_master.company_name_logo)) {
        pdfDoc.image(invoice.company_master.company_name_logo, 385, 10, { width: 200, height: 60, align:'left' })
        // .rect(20, 30, 100, 100)
        // .stroke();
        }    
    }   
    // pdfDoc.font('Helvetica-Bold').text(invoice.company_master.company_name,385,30,{
    //     align:'left',
    //     width:250,
    //     height:20,
    // })
    pdfDoc.fontSize(10);    

    pdfDoc.font('Helvetica').text(invoice.company_master.address,385,80,{
        align:'left',
        width:200,
        height:60,
    })
    pdfDoc.font('Helvetica').text('Phone: '+invoice.company_master.phone,385,pdfDoc.y,{
        align:'left',
        width:200,
        height:60,
    })
    pdfDoc.font('Helvetica').text('Email Id: '+invoice.company_master.email,385,pdfDoc.y,{
        align:'left',
        width:200,
        height:60,
    })
    pdfDoc.font('Helvetica').text('GSTIN: '+invoice.company_master.gstin,385,pdfDoc.y,{
        align:'left',
        width:200,
        height:60,
    })
    pdfDoc.font('Helvetica').text('PAN: '+invoice.company_master.pan,385,pdfDoc.y,{
        align:'left',
        width:200,
        height:60,
    })

    // pdfDoc.font('Helvetica').text('Website URL',385,pdfDoc.y,{
    //     align:'left',
    //     width:200,
    //     height:60,
    // }).link(20, 0, 20, 20, 'http://www.genesisgroup.in/')
    pdfDoc
   .fillColor('blue')
   .text('https://www.genesisgroup.in', 385, pdfDoc.y, {
    width:200,
    height:20,
     link: 'https://www.genesisgroup.in',
     underline: true
   }
);
    pdfDoc.moveDown();


    pdfDoc.fontSize(16);
    
    pdfDoc.font('Helvetica-Bold').fillColor('red').text('TAX INVOICE',385,pdfDoc.y-5,{
        align:'left',
        width:200,
        height:20
    })
    pdfDoc.fontSize(12);
    pdfDoc.moveDown();
    
    pdfDoc.font('Helvetica-Bold').fillColor('black').text('NO - '+invoice.bill_no,385,pdfDoc.y-15,{
        align:'left',
        width:200,
        height:60
    })
    const invoiceDate = changeDate(invoice.date);
    pdfDoc.moveDown();

    pdfDoc.font('Helvetica').text('Date - '+invoiceDate,385,pdfDoc.y-15,{
        align:'left',
        width:200,
        height:60,
    })
    pdfDoc.moveDown();

    pdfDoc.font('Helvetica').text('Bill For the Month - '+invoice.month+' '+invoice.year,385,pdfDoc.y-15,{
        align:'left',
        width:200,
        height:60,
    })

    pdfDoc.font('Helvetica').text('To',20,pdfDoc.y-10,{
        align:'left',
        width:200,
        height:60,
    })
    pdfDoc.moveDown();
    var y = pdfDoc.y;

    
    // pdfDoc.rect(pdfDoc.x-10, y-10, 575, 91)
    //     .fillAndStroke("#FFD580", "black");
    pdfDoc.font('Helvetica').fillColor('black').text(invoice.client_master.client_name,{
        align:'left',
        width:500,
        height:60,
    })
    // .rect(pdfDoc.x-10, pdfDoc.y-20, 575, 20)
    // .stroke();
    // pdfDoc.moveTo(pdfDoc.x-10,pdfDoc.y).lineTo(585,pdfDoc.y).stroke();

    pdfDoc.moveDown();
    
    var address='';
    var gst='';
    if(invoice.client_address){
        address=invoice.client_address.address;
        address = address.replace(/\r\n|\r/g, '\n')
        gst = invoice.client_address.gst;
    }else{
        address = clientData.client_addresses[0].address
        address = address.replace(/\r\n|\r/g, '\n')
        gst = clientData.client_addresses[0].gst
    }
    
    pdfDoc.font('Helvetica').text(address,pdfDoc.x,pdfDoc.y-10,{
        align:'left',
        width:500,
        height:60,
    })
    // pdfDoc.moveTo(pdfDoc.x-10,pdfDoc.y).lineTo(585,pdfDoc.y).stroke();
    // .rect(pdfDoc.x-10, y, 575, 40)
    // .stroke();
    
    pdfDoc.moveDown();
    pdfDoc.font('Helvetica').text('GSTIN: '+gst,pdfDoc.x,pdfDoc.y-10,{
        align:'left',
        width:200,
        height:20,
        fill:false
    })
    // .rect(pdfDoc.x-10, y, 575, 20)
    // .stroke();
    // pdfDoc.moveTo(pdfDoc.x-10,pdfDoc.y).lineTo(585,pdfDoc.y).stroke();

    pdfDoc.moveDown();
    
    pdfDoc.font('Helvetica').text('PAN: '+clientData.pan,pdfDoc.x,pdfDoc.y-10,{
        align:'left',
        width:200,
        height:20,
    })
    var yy = pdfDoc.y;
    
    pdfDoc.rect(pdfDoc.x-10, y-10, 575, (yy-y)+10)
    .stroke();
    // .fillOpacity(0.6)
        // .fillAndStroke("#FFD580", "black");
    pdfDoc.moveDown();

    //particulars
    var y1 = pdfDoc.y;
    var x1 = pdfDoc.x;
    pdfDoc.font('Helvetica-Bold').text('Sl No',pdfDoc.x,pdfDoc.y-5,{
        align:'left',
        width:50,
        height:20,  
        lineBreak:false,
    })
    var sy1= pdfDoc.y-10;
    var sx1= pdfDoc.x+40;

    pdfDoc.fillColor('black').text('Particulars',pdfDoc.x+10,pdfDoc.y-15,{
        align:'center',
        width:200,
        height:20,  
        lineBreak:false,
    })

    pdfDoc.text('HSN/SAC',pdfDoc.x+230,pdfDoc.y-14,{
        align:'right',
        width:100,
        height:20,  
        lineBreak:false,
    })
    var sx2= pdfDoc.x+30;

    pdfDoc.text('GST Rate',pdfDoc.x+100,pdfDoc.y-14,{
        align:'center',
        width:150,
        height:20,  
    })
    var sx3= pdfDoc.x+20;

    pdfDoc.text('Amount',pdfDoc.x+100,pdfDoc.y-14,{
        align:'right',
        width:100,
        height:20,  
    })
    var sx4= pdfDoc.x+20;

    pdfDoc.moveTo(10,pdfDoc.y+5).lineTo(585,pdfDoc.y+5).stroke();

    pdfDoc.fontSize(10);

    var desc = invoice.description.split("(");
    var hsn = desc[1].substring(0, desc[1].length - 1);;
    hsn = hsn.substr(hsn.length - 6); 
    pdfDoc.font('Helvetica').text('1',x1+5,y1+22,{
        align:'left',
        width:50,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text(desc[0],pdfDoc.x+40,pdfDoc.y-11,{
        align:'left',
        width:200,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text(hsn,pdfDoc.x+190,pdfDoc.y-14,{
        align:'right',
        width:100,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('18%',pdfDoc.x+100,pdfDoc.y-13,{
        align:'center',
        width:150,
        height:20,  
    })
    pdfDoc.text(invoice.amount,pdfDoc.x+100,pdfDoc.y-12,{
        align:'right',
        width:100,
        height:20,  
    })
    if(invoice.note!=''){
        
    pdfDoc.text('',x1+5,y1+45,{
        align:'left',
        width:50,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('Note: '+invoice.note,pdfDoc.x+40,pdfDoc.y-11,{
        align:'left',
        width:250,
        height:60,  
        lineBreak:false,
    })
    // pdfDoc.text('',pdfDoc.x+190,pdfDoc.y-14,{
    //     align:'right',
    //     width:100,
    //     height:20,  
    //     lineBreak:false,
    // })
    // pdfDoc.text('',pdfDoc.x+100,pdfDoc.y-13,{
    //     align:'center',
    //     width:150,
    //     height:20,  
    // })
    // pdfDoc.text('',pdfDoc.x+100,pdfDoc.y-12,{
    //     align:'right',
    //     width:100,
    //     height:20,  
    // })

    }
    pdfDoc.text('2',x1+5,y1+50,{
        align:'left',
        width:50,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.fontSize(8);

    pdfDoc.text('Contractor Service Charges for payroll management in Genesis project',pdfDoc.x+40,pdfDoc.y-11,{
        align:'left',
        width:200,
        height:60,  
        lineBreak:false,
    })
    pdfDoc.fontSize(10);

    pdfDoc.text(hsn,pdfDoc.x+190,pdfDoc.y-14,{
        align:'right',
        width:100,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('18%',pdfDoc.x+100,pdfDoc.y-13,{
        align:'center',
        width:150,
        height:20,  
    })
    pdfDoc.text(invoice.service_charge,pdfDoc.x+100,pdfDoc.y-12,{
        align:'right',
        width:100,
        height:20,  
    })

    var y2= '';
    var gst_amount = Math.round(invoice.cgst_igst_amount);

    var cgst_amount = Math.round(invoice.total * 0.09).toFixed(2)
    var net_amount_rounded = 0;
    net_amount_rounded = +invoice.total + +cgst_amount + +cgst_amount;
    net_amount_rounded = Math.round(net_amount_rounded)
    if(invoice.cgst==1){
    pdfDoc.text('',x1+5,y1+80,{
        align:'left',
        width:50,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('CGST OUTPUT @9%',pdfDoc.x+40,pdfDoc.y-11,{
        align:'right',
        width:200,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('',pdfDoc.x+190,pdfDoc.y-15,{
        align:'right',
        width:100,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('',pdfDoc.x+100,pdfDoc.y-15,{
        align:'center',
        width:150,
        height:20,  
    })
    pdfDoc.text(cgst_amount,pdfDoc.x+100,y1+70,{
        align:'right',
        width:100,
        height:20,  
    })

    pdfDoc.text('',x1+5,y1+100,{
        align:'left',
        width:50,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('SGST OUTPUT @9%',pdfDoc.x+40,pdfDoc.y-11,{
        align:'right',
        width:200,
        height:20,  
        lineBreak:false,
    })
    // var sx2= pdfDoc.x+180;

    pdfDoc.text('',pdfDoc.x+190,pdfDoc.y-15,{
        align:'right',
        width:100,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('',pdfDoc.x+100,pdfDoc.y-15,{
        align:'center',
        width:150,
        height:20,  
    })
    pdfDoc.text(cgst_amount,pdfDoc.x+100,y1+90,{
        align:'right',
        width:100,
        height:20,  
    })

    y2 = pdfDoc.y;
    }else{
        pdfDoc.text('',x1+5,y1+80,{
            align:'left',
            width:50,
            height:20,  
            lineBreak:false,
        })
        pdfDoc.text('IGST OUTPUT @18%',pdfDoc.x+40,pdfDoc.y-11,{
            align:'right',
            width:200,
            height:20,  
            lineBreak:false,
        })
    // var sx2= pdfDoc.x+180;

        pdfDoc.text('',pdfDoc.x+190,pdfDoc.y-15,{
            align:'right',
            width:100,
            height:20,  
            lineBreak:false,
        })
        pdfDoc.text('',pdfDoc.x+100,pdfDoc.y-15,{
            align:'center',
            width:150,
            height:20,  
        })
        pdfDoc.text(Math.round(invoice.cgst_igst_amount),pdfDoc.x+100,y1+70,{
            align:'right',
            width:100,
            height:20,  
        })

    y2 = pdfDoc.y;

    net_amount_rounded = +invoice.total + +invoice.cgst_igst_amount;
    net_amount_rounded = Math.round(net_amount_rounded)
    }
    
    pdfDoc.text('',x1+5,y2+20,{
        align:'left',
        width:50,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('Rounded Off',pdfDoc.x+40,pdfDoc.y-11,{
        align:'right',
        width:200,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('',pdfDoc.x+190,pdfDoc.y-15,{
        align:'right',
        width:100,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('',pdfDoc.x+100,pdfDoc.y-15,{
        align:'center',
        width:150,
        height:20,  
    })
    pdfDoc.text('0.00',pdfDoc.x+100,y2+8,{
        align:'right',
        width:100,
        height:20,  
    })
    pdfDoc.moveDown();
    pdfDoc.moveDown();

    pdfDoc.text('',x1+5,y2+70,{
        align:'left',
        width:50,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.fontSize(12)
    pdfDoc.moveTo(pdfDoc.x-15,pdfDoc.y-15).lineTo(585,pdfDoc.y-15).stroke();

    pdfDoc.font('Helvetica-Bold').text('Total',pdfDoc.x+40,pdfDoc.y-11,{
        align:'right',
        width:200,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('',pdfDoc.x+190,pdfDoc.y-15,{
        align:'right',
        width:100,
        height:20,  
        lineBreak:false,
    })
    pdfDoc.text('',pdfDoc.x+100,pdfDoc.y-15,{
        align:'center',
        width:150,
        height:20,  
    })
    pdfDoc.text(net_amount_rounded,pdfDoc.x+100,y2+60,{
        align:'right',
        width:100,
        height:20,  
    })

    var yy1 = pdfDoc.y;
    pdfDoc.moveTo(sx1,sy1-10).lineTo(sx1,yy1).stroke();
    pdfDoc.moveTo(sx2,sy1-10).lineTo(sx2,yy1).stroke();
    pdfDoc.moveTo(sx3,sy1-10).lineTo(sx3,yy1).stroke();
    pdfDoc.moveTo(sx4,sy1-10).lineTo(sx4,yy1).stroke();

    pdfDoc.rect(10, y1-10, 575, (yy1-y1)+10)
    .stroke();
    pdfDoc.moveDown();
    
    var amount_in_words = inWords(net_amount_rounded)
    amount_in_words = amount_in_words[0].toUpperCase() + amount_in_words.slice(1)
    pdfDoc.font('Helvetica').text('Amount Chargable (in Words): '+amount_in_words,10,pdfDoc.y,{
        align:'left',
        width:585,
        height:20,  
    })

    // pdfDoc.font('Helvetica-Bold').text(,10,pdfDoc.y+10,{
    //     align:'left',
    //     width:300,
    //     height:20,  
    // })
    pdfDoc.moveDown();
    var y4 = pdfDoc.y;
    pdfDoc.font('Helvetica-Bold').text('Declaration',15,pdfDoc.y,{
        align:'left',
        width:280,
        height:20,  
    })
    var y3=pdfDoc.y;
    pdfDoc.fontSize(8);
    pdfDoc.font("Helvetica").text(`1) We declare all the labourers have received their payment / will receive on scheduled date as per Principal Employer's calculation, no extra cost has been deducted (detail attachment is self explanatory).`,15,pdfDoc.y+10,{
        align:'left',
        width:280,
        height:60,  
    })
    
    pdfDoc.text(`2) The total Payment should be made in cheque or NEFT only, favouring `+invoice.company_master.company_name,15,pdfDoc.y+5,{
        align:'left',
        width:280,
        height:60,  
    })
    
    pdfDoc.text(`3) TDS, as deducted, should be credited to `+invoice.company_master.pan,15,pdfDoc.y+5,{
        align:'left',
        width:280,
        height:60,  
    })
    
    pdfDoc.text(`4) Honour of invoice is subject to satisfactory, checking, approval and acceptance of all the above mentioned components. All services have been rendered & no dispute/claim will be entertained in future against the contractor.`,15,pdfDoc.y+5,{
        align:'left',
        width:280,
        height:60,  
    })
    
    pdfDoc.text(`5) E-Invoice Date/Number may slightly vary due to GST Portal Technicalities.`,15,pdfDoc.y+5,{
        align:'left',
        width:280,
        height:60,  
    })
    
    pdfDoc.text(`6) We work on prepaid basis only.`,15,pdfDoc.y+5,{
        align:'left',
        width:280,
        height:60,  
    })
    var yy4 = pdfDoc.y;
    var sx5 = pdfDoc.x+280;
    pdfDoc.fontSize(10);
    pdfDoc.font("Helvetica-Bold").text('Terms & Condition',300,y3-10,{
        align:'left',
        width:270,
        height:20,  
    })
    
    pdfDoc.fontSize(8);

    pdfDoc.font("Helvetica").text(`1) THE CONTRACT OF STAFFING COST IS FULLY REIMBURSED TOWARDS PAYMENT OF WAGES AND COST OF STATUTE. CONTRACTOR HAS GOT NO MARGIN IN THAT. CONTRACTOR SERVICE CHARGES IS SHOWN SEPARATELY.`,300,pdfDoc.y+10,{
        align:'left',
        width:280,
        height:60,  
    })
    
    pdfDoc.text(`2) TAX INVOICE WILL BE GENERATED AND REACH YOU WITHIN 24HRS AFTER YOUR FULL PAYMENT OF INVOICE.`,300,pdfDoc.y+5,{
        align:'left',
        width:280,
        height:60,  
    })
    
    pdfDoc.text(`3) THE RATE OF WAGES, ITS BASIC COMPONENT, ALLOWANCES, CONVEYANCE, INCENTIVE AND ALL OTHER PARTS ARE DETERMINED BY THE PRINCIPAL AND ATTENDANCE IS ALSO SUPPLIED BY THEM. THE CONTRACTOR EXACTLY CALCULATES ON THE DATA AS PROVIDED BY THE PRINCIPAL.`,300,pdfDoc.y+5,{
        align:'left',
        width:280,
        height:60,  
    })
    
    pdfDoc.moveTo(sx5,y3-25).lineTo(sx5,yy4).stroke();
    
    pdfDoc.rect(10, y4-10, 575, (yy4-y4)+10)
    .stroke();

    pdfDoc.font('Helvetica-Bold').text('Bank Details - ',15,yy4+15,{
        align:'left',
        width:280,
        height:60,  
    })
    var y5=pdfDoc.y;
    pdfDoc.font('Helvetica').text('BANK ACCOUNT NAME - '+invoice.company_master.bank_name,15,pdfDoc.y+5,{
        align:'left',
        width:280,
        height:60,  
    })
    
    pdfDoc.font('Helvetica').text('IFSC CODE - '+invoice.company_master.ifsc,300,pdfDoc.y,{
        align:'left',
        width:280,
        height:60,  
    })

    pdfDoc.font('Helvetica').text('BANK ACCOUNT NUMBER - '+invoice.company_master.bank_ac,15,pdfDoc.y-5,{
        align:'left',
        width:280,
        height:60,  
    })
    var yy5 = pdfDoc.y;

    
    pdfDoc.rect(10, y5-15, 575, (yy5-y5)+15)
    .stroke();

    
    pdfDoc.font('Helvetica-Bold').text('For '+invoice.company_master.company_name,10,yy5+10,{
        align:'left',
        width:280,
        height:60,  
    })

    if(invoice.company_master.stamp){
        if (fs.existsSync(invoice.company_master.stamp)) {
        pdfDoc.image(invoice.company_master.stamp, 20, pdfDoc.y, { width: 60, height: 40, align:'left' })
        // .rect(20, pdfDoc.y-40, 60, 40)
        // .stroke();
        }    
    }   
    
    if(invoice.company_master.signature){
        if (fs.existsSync(invoice.company_master.signature)) {
        pdfDoc.image(invoice.company_master.signature, 100, pdfDoc.y-40, { width: 60, height: 40, align:'left' })
        // .rect(100, pdfDoc.y-40, 60, 40)
        // .stroke();
        }    
    }   


    pdfDoc.font('Helvetica-Bold').text('AUTHORIZED SIGNATORY',10,pdfDoc.y+5,{
        align:'left',
        width:280,
        height:60,  
    })

    pdfDoc.end();
    
});

exports.deleteDigitalInvoice = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.body;
    console.log(id);
    
     await DigitalInvoice.destroy({where:{id:id}});
    res.send('Successful');

  
});