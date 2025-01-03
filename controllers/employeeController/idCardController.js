const fs = require('fs')
const path = require('path');
const catchAsyncErrors = require('../../utils/catchAsyncErrors');
const CompanyMaster = require('../../models/admin/company_master');
const ClientMaster = require('../../models/admin/client_master');
const PDFDocument = require('pdfkit');
const NewRegistration = require('../../models/admin/new_registration');

exports.getIndividualIdCard = catchAsyncErrors( async (req, res, next) => {
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    res.render('employee/individual_idcard_module',{
        permissions
    });
   
});

exports.postIndividualIdCard = catchAsyncErrors( async (req, res, next) => {

    
    const employee = await NewRegistration.findByPk(req.body.employeeId,{include:[CompanyMaster,ClientMaster]});
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
    pdfDoc.fontSize(10).text('Aadhar     - '+employee.aadhar,pdfDoc.x, pdfDoc.y+5, {
        align: 'left',
        width: 150,
    });
    // pdfDoc.moveDown();

    pdfDoc.fontSize(10).text('Designation     - '+employee.designation,pdfDoc.x, pdfDoc.y+5, {
        align: 'left',
        width: 150,
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

    pdfDoc.fontSize(8).text('*This Card is non-Transferable & valid only inside work place',pdfDoc.x, pdfDoc.y+5, {
        align: 'left',
        width: 300,
    });
    



    pdfDoc.end();

});

exports.getBulkIdCard = catchAsyncErrors( async (req, res, next) => {
    const employees = await NewRegistration.findAll({include:[CompanyMaster,ClientMaster],limit:50});
    var permissions;
    if( req.session.permissions){
        permissions= req.session.permissions;
    }
    const companies = await CompanyMaster.findAll();

    res.render('employee/bulk_idcard_module',{
        employees,
        companies,
        permissions
    });
   
});


exports.postBulkIdCard = catchAsyncErrors( async (req, res, next) => {
    const { 
        selectedEmployees
    } = req.body; 

    const employees = await NewRegistration.findAll({where:{id:selectedEmployees},include:[CompanyMaster,ClientMaster]});
    const pdfDoc = new PDFDocument({
        margins : { 
            top: 0,
           bottom:0,
            left: 0,
          right: 0
        }
    });
    const invoiceName = 'All_Emp_id_card' + '.pdf';
    const invoicePath = path.join('uploads', invoiceName);
    //for creating pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    const bgPath = path.join('output', 'bb.jpg');
    
    
    
    // pdfDoc.image(bgPath, 10, 10, {
    //     align: 'left',
    //     valign: 'top',
    //     height: 240,
    //     width: 290
    // });
    pdfDoc.rect(10,10,270,206).stroke();

    if(employees[0].photo){
        if (fs.existsSync(employees[0].photo)) {
    pdfDoc.image(employees[0].photo, 200, 75, { width: 50, height: 50 })
        .rect(200, 75, 50, 50)
        .stroke();
    }
}
//     if(employees[0].company_master.logo){    
//         if (fs.existsSync(employees[0].company_master.logo)) {    
//     pdfDoc.image(employees[0].company_master.logo, 20, 20, {
//         width:25,
//         height:25,
//         align: 'left',
//         valign: 'top'
//     });
// }
//     }
    pdfDoc.fontSize(15).text(employees[0].client_master.client_name, 10, 25, {
        align: 'center',
        width: 270
    });
    
    pdfDoc.fontSize(10).text('Client Code - '+employees[0].client_code, 10, 45, {
        align: 'right',
        width: 250
    });

    pdfDoc.moveDown();
    pdfDoc.fontSize(10).text('Emp Id - '+employees[0].emp_code, 10, 60, {
        align: 'right',
        width: 250
    });
    pdfDoc.fontSize(10).text('Employee - '+employees[0].emp_name, 20, 90, {
        align: 'left',
        width: 180,
    });
    // pdfDoc.moveDown();
    pdfDoc.fontSize(10).text('Aadhar     - '+employees[0].aadhar, pdfDoc.x, pdfDoc.y+5,{
        align: 'left',
        width: 250,
    });
    // pdfDoc.moveDown();
    pdfDoc.fontSize(10).text('Designation     - '+employees[0].designation,pdfDoc.x, pdfDoc.y+5, {
        align: 'left',
        width: 250,
    });
    // pdfDoc.moveDown();

    pdfDoc.fontSize(10).text('Address   - '+employees[0].address,pdfDoc.x, pdfDoc.y+5, {
        align: 'left',
        lineBreak: false,
        width: 230,
    });
    // pdfDoc.moveDown();
    // pdfDoc.fontSize(10).text('PF - ' +employees[0].pf, {      
    //     width: 280,
    //     align: 'left'
    //   });
   
    // pdfDoc.moveDown();
 
    // pdfDoc.fontSize(10).text('ESIC - '+employees[0].esic, {
    //     align: 'left',
    //     width: 300,
    //     lineBreak: false,
    //     lineGap: 0
    // });
    // pdfDoc.moveDown();

    pdfDoc.fontSize(8).text('*This Card is non-Transferable & valid only inside work place',pdfDoc.x, pdfDoc.y+5, {
        align: 'left',
        width: 250,
    });
    var w = 285;
    var h = 10;
    var a=2;
    //all other employees
    for(var i=1;i<employees.length;i++){

        if(a%2==1){
            h+=216;
            w=5;            
        }
        if(a%6==1){
            pdfDoc.addPage();
            h=10;
            w=5;            
        } 
        
        // pdfDoc.image(bgPath, w+5, h, {
        //     align: 'left',
        //     valign: 'top',
        //     height: 240,
        //     width: 290
        // });
    pdfDoc.rect(w+5,h,270,206).stroke();

        if(employees[i].photo){
            if (fs.existsSync(employees[i].photo)) {   
        pdfDoc.image(employees[i].photo, w+200, h+65, { width: 50, height: 50 })
            .rect(w+200, h+65, 50, 50)
            .stroke();
        }
    }
//         if(employees[i].company_master.logo){    
//             if (fs.existsSync(employees[i].company_master.logo)) {        
//         pdfDoc.image(employees[i].company_master.logo, w+10, h+10, {
//             width:25,
//             height:25,
//             align: 'left',
//             valign: 'top'
//         });
//     }
// }
        pdfDoc.fontSize(15).text(employees[i].client_master.client_name, w+10, h+15, {
            align: 'center',
            width: 270,
            height:40
        });
        
    pdfDoc.fontSize(10).text('Client Code - '+employees[i].client_code, w, h+35, {
        align: 'right',
        width: 270
    });
        pdfDoc.moveDown();
        pdfDoc.fontSize(10).text('Emp Id - '+employees[i].emp_code, w+10, h+50, {
            align: 'right',
            width: 250
        });

        pdfDoc.fontSize(10).text('Employee - '+employees[i].emp_name,w+20, h+80, {
            align: 'left',
            width: 250,
        });
        // pdfDoc.moveDown();
        pdfDoc.fontSize(10).text('Aadhar     - '+employees[i].aadhar,pdfDoc.x, pdfDoc.y+5, {
            align: 'left',
            width: 250,
        });
        // pdfDoc.moveDown();

        pdfDoc.fontSize(10).text('Designation    - '+employees[i].designation,pdfDoc.x, pdfDoc.y+5, {
            align: 'left',
            width: 250,
        });
        // pdfDoc.moveDown();
        pdfDoc.fontSize(10).text('Address   - '+employees[i].address,pdfDoc.x, pdfDoc.y+5, {
            align: 'left',
            lineBreak: false,
            width: 230,
        });
        // pdfDoc.moveDown();
        // pdfDoc.fontSize(10).text('PF - ' +employees[i].pf, {  
        //     width: 280,
        //     align: 'left'
        // });
    
        // pdfDoc.moveDown();
    
        // pdfDoc.fontSize(10).text('ESIC - '+employees[i].esic, {
        //     align: 'left',
        //     width: 250,
        //     lineBreak: false,
        //     lineGap: 0
        // });
        // pdfDoc.moveDown();

        pdfDoc.fontSize(8).text('*This Card is non-Transferable & valid only inside work place', pdfDoc.x, pdfDoc.y+5,{
            align: 'left',
            width: 260,
        });
        w+=280;
        a++;
    }


    pdfDoc.end();
   
});