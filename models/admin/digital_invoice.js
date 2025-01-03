const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const DigitalInvoice = sequelize.define('digital_invoice',{
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
    amount:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    description:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    note:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    service_charge:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    total:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    cgst:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    igst:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    cgst_igst_amount:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    net_amount:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }
});

module.exports = DigitalInvoice;
