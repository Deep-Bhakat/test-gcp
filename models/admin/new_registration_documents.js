const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const NewRegistrationDocuments = sequelize.define('new_registration_document',{
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

module.exports = NewRegistrationDocuments;
