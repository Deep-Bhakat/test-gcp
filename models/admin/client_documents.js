const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const ClientDocuments = sequelize.define('client_document',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    document:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
});

module.exports = ClientDocuments;
