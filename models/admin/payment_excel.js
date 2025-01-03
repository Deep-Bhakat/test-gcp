const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const PaymentExcel = sequelize.define('payment_excel',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    emp_code:{
        type: Sequelize.STRING,
        notEmpty: false, 
    },
    amount:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    ac_no:{
        type: Sequelize.STRING,
        notEmpty: false, 
    },
    ifsc:{
        type: Sequelize.STRING,
        notEmpty: false, 
    },
    mode:{
        type: Sequelize.STRING,
        notEmpty: false, 
    },
    type:{
        type: Sequelize.STRING,
        notEmpty: false, 
    },
    date:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    month_year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
});

module.exports = PaymentExcel;
