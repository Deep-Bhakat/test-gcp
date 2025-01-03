const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const LabourReturn = sequelize.define('labour_return',{
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
    period:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = LabourReturn;
