const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const InvoiceGenerator = sequelize.define('invoice_generator',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    newId:{
        type: Sequelize.INTEGER,
        notEmpty: true, 
    },
    date:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    month:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    month_year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    bill_no:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    biller:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    status:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }
});

module.exports = InvoiceGenerator;
