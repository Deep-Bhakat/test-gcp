const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const ClientAddress = sequelize.define('client_address',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    address:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    pin:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    state:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    gst:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }
});

module.exports = ClientAddress;
