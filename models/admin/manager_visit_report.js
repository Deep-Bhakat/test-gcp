const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const ManagerVisitReport = sequelize.define('manager_visit_report',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    unit:{
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
    }
});

module.exports = ManagerVisitReport;
