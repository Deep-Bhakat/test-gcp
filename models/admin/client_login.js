const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const ClientLogin = sequelize.define('client_login',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    code:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    email:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    username:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    password:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = ClientLogin;
