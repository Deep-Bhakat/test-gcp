const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const UserManagement = sequelize.define('user_management',{
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
    mobile:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    email:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    code:{
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

module.exports = UserManagement;
