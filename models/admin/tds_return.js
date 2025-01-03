const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const TDSReturn= sequelize.define('tds_return',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    quarter:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    reason:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    amount:{
        type: Sequelize.INTEGER,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.INTEGER,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = TDSReturn;
