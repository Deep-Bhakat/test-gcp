const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const BillMakerMaster = sequelize.define('bill_maker_master',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    month_year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }
});

module.exports = BillMakerMaster;
