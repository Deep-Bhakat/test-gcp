const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const CompanyMaster = sequelize.define('company_master',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    company_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    company_code:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    address:{
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
    type:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    proprietor:{
        type: Sequelize.STRING
    },        
    proprietor_phone:{
        type: Sequelize.STRING
    },            
    pan:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    tan:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    gstin:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    trade_license:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },            
    pf:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    ptax:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    esic:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    lwf:{
        type: Sequelize.STRING,
        notEmpty: true, 
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
    tagline:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    stamp:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },        
    signature:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },      
    company_name_logo:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = CompanyMaster;
