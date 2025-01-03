const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const PaymentBankingClients = sequelize.define('payment_banking_clients',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    // client:{
    //     type: Sequelize.STRING,
    //     notEmpty: true, 
    // },
    code:{
        type: Sequelize.STRING,
        notEmpty: true,    
    }
});

module.exports = PaymentBankingClients;
