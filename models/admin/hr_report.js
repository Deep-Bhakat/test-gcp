const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const HRReport = sequelize.define('hr_report',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    marathon:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    month:{
        type: Sequelize.INTEGER,
        notEmpty: true, 
    },
    year:{
        type: Sequelize.INTEGER,
        notEmpty: true, 
    },
    comment:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    comment2:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = HRReport;
