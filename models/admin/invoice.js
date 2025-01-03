const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Invoice = sequelize.define('invoice',{
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
    invoice_no:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    remarks:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = Invoice;
