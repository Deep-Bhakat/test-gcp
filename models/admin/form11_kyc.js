const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Form11KYC = sequelize.define('form11_kyc',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    kyc_type:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    number:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    remarks:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
});

module.exports = Form11KYC;
