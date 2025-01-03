const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const NewRegistrationIncrements = sequelize.define('new_registration_increment',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    date_of_increment:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    basic_salary:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    hra:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    gross_salary:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
});

module.exports = NewRegistrationIncrements;
