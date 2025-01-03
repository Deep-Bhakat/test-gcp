const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const EPS = sequelize.define('eps',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    sr_no:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    name_address:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    age:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    relationship:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
});

module.exports = EPS;
