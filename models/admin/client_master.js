const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const ClientMaster = sequelize.define('client_master',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    client_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    email:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    phone:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    pan:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    service_charge:{
        type: Sequelize.STRING
    },        
    bank_ac:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    bank_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    ifsc:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    logo:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = ClientMaster;
