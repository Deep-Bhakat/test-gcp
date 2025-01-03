exports.index = (req, res, next) => {
    res.render('client/index');
};

exports.dashboard = (req, res, next) => {
    res.render('client/dashboard');
};
exports.getEmployeeDatabase = (req, res, next) => {
    res.render('client/employee_database_tab');
};

exports.getEmployeeDatabaseEdit = (req, res, next) => {
    res.render('client/employee_database_edit');
};
exports.getEmployeeDatabaseEdit2 = (req, res, next) => {
    res.render('client/employee_database_edit2');
};
exports.getEmployeeDatabaseEdit3 = (req, res, next) => {
    res.render('client/employee_database_edit3');
};

exports.getEmployeeDatabaseEdit4 = (req, res, next) => {
    res.render('client/employee_database_edit4');
};
exports.getEmployeeDatabaseEdit5 = (req, res, next) => {
    res.render('client/employee_database_edit5');
};
exports.getNewRegistrationFormPrint = (req, res, next) => {
    res.render('client/new_registration_form_print');
};

exports.getNewRegistrationFormPrint2 = (req, res, next) => {
    res.render('client/employee_database_edit2_print');
};
exports.getNewRegistrationFormPrint3 = (req, res, next) => {
    res.render('client/employee_database_edit3_print');
};

exports.getNewRegistrationFormPrint4 = (req, res, next) => {
    res.render('client/employee_database_edit4_print');
};
exports.getNewRegistrationFormPrint5 = (req, res, next) => {
    res.render('client/employee_database_edit5_print');
};
exports.getInvoiceRegister = (req, res, next) => {
    res.render('client/invoices_registers_tab');
};

exports.getPaymentsEnet = (req, res, next) => {
    res.render('client/payments_enet');
};
exports.getMasterSheet = (req, res, next) => {
    res.render('client/master_sheet');
};

exports.getInvoiceRegister = (req, res, next) => {
    res.render('client/invoices_registers_tab');
};


exports.getAccountsLedger = (req, res, next) => {
    res.render('client/accounts-ledger');
};
exports.getClientAccountsLedger = (req, res, next) => {
    res.render('client/client-accounts-ledger');
};
exports.getClientReport = (req, res, next) => {
    res.render('client/client-report');
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
        res.render('client/statute', {
            e
        });
    } catch (err) {
        console.log(err)
    }
};