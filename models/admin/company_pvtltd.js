const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const CompanyPvtLtd = sequelize.define('company_pvtltd',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    director_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    pan:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    phone:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    din:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }
});

module.exports = CompanyPvtLtd;
