const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Login = sequelize.define('login',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    username:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    password:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }
});

module.exports = Login;
