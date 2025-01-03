const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const SalaryMaster = sequelize.define('salary_master',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    attendance:{
        type: Sequelize.STRING,
    },  
    pro_basic:{
        type: Sequelize.STRING,
    },
    pro_gross:{
        type: Sequelize.STRING,
    },
    employee_pf:{
        type: Sequelize.STRING,
    },
    employee_esic:{
        type: Sequelize.STRING,
    },
    ptax:{
        type: Sequelize.STRING,
    },
    lwf:{
        type: Sequelize.STRING,
    },
    advance:{
        type: Sequelize.STRING,
    },
    others:{
        type: Sequelize.STRING,
    },
    net_pay:{
        type: Sequelize.STRING,
    },
    management_pf:{
        type: Sequelize.STRING,
    },
    management_esic:{
        type: Sequelize.STRING,
    },
    month_year:{
        type: Sequelize.STRING,
    },
    month:{
        type: Sequelize.INTEGER,
    },
    year:{
        type: Sequelize.INTEGER,
    },
    date:{
        type: Sequelize.DATEONLY,
    },
});

module.exports = SalaryMaster;
