const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const CompanyDocuments = sequelize.define('company_document',{
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

module.exports = CompanyDocuments;
