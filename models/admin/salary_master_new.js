const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const SalaryMasterNew = sequelize.define('salary_master_new',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    year:{
        type: Sequelize.STRING,
    },  
    month:{
        type: Sequelize.STRING,
    },
    month_year:{
        type: Sequelize.STRING,
    },
    document:{
        type: Sequelize.STRING,
    },
   
});

module.exports = SalaryMasterNew;
