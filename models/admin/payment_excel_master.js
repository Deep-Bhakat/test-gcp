const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const PaymentExcelMaster = sequelize.define('payment_excel_master',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    date:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    month_year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }
});

module.exports = PaymentExcelMaster;
