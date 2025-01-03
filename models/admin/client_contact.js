const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const ClientContact = sequelize.define('client_contact',{
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
    phone:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    email:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }
});

module.exports = ClientContact;
