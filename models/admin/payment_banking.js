const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const PaymentBanking = sequelize.define('payment_banking',{
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
    payment_type:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = PaymentBanking;
