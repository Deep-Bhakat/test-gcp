const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const AttendanceRegister = sequelize.define('attendance_register',{
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
    },
    comment:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    } 
});

module.exports = AttendanceRegister;
