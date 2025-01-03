const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const UserManagementPermissions = sequelize.define('user_management_permissions',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    permission:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }
});

module.exports = UserManagementPermissions;
