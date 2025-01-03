const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const BillMaker = sequelize.define('bill_maker',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    sl_no:{
        type: Sequelize.INTEGER,
    },
    month_year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    aadhaar:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    uan:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    esic_no:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    gender:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    emp_code:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    designation:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    bank:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    ac_no:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    ifsc:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    gross_salary:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    basic_salary:{
        type: Sequelize.STRING,
    },
    hra:{
        type: Sequelize.STRING,
    },
    odd_hours:{
        type: Sequelize.STRING,
    },
    present_days:{
        type: Sequelize.STRING,
    },
    holidays:{
        type: Sequelize.STRING,
    },
    absent:{
        type: Sequelize.STRING,
    },
    total_days:{
        type: Sequelize.STRING,
    },
    basic_salary:{
        type: Sequelize.STRING,
    },
    prop_gross:{
        type: Sequelize.STRING,
    },
    ot_rate:{
        type: Sequelize.STRING,
    },
    ot_hour:{
        type: Sequelize.STRING,
    },
    ot_amount:{
        type: Sequelize.STRING,
    },
    minor_r:{
        type: Sequelize.STRING,
    },
    variable_incentive:{
        type: Sequelize.STRING,
    },
    actual_pay:{
        type: Sequelize.STRING,
    },
    prop_basic:{
        type: Sequelize.STRING,
    },
    pf:{
        type: Sequelize.STRING,
    },
    esic:{
        type: Sequelize.STRING,
    },
    ptax:{
        type: Sequelize.STRING,
    },
    lwf:{
        type: Sequelize.STRING,
    },
    advance:{
        type: Sequelize.STRING,
    },
    net_pay:{
        type: Sequelize.STRING,
    },
    mgmt_pf:{
        type: Sequelize.STRING,
    },
    mgmt_esic:{
        type: Sequelize.STRING,
    },
    mgmt_lwf:{
        type: Sequelize.STRING,
    },
    ctc:{
        type: Sequelize.STRING,
    },
    production_incentive:{
        type: Sequelize.STRING,
    },
    gross_incentive:{
        type: Sequelize.STRING,
    },
    invoice_amount1:{
        type: Sequelize.STRING,
    },
    invoice_amount2:{
        type: Sequelize.STRING,
    },
    service_charge:{
        type: Sequelize.STRING,
    },
    cost_of_contract:{
        type: Sequelize.STRING,
    },
    cost_of_contract2:{
        type: Sequelize.STRING,
    },
    status:{
        type: Sequelize.INTEGER,
    },
    selected_fields:{
        type: Sequelize.STRING,
    },
});

module.exports = BillMaker;
