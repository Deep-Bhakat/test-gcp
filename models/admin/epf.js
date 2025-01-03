const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const EPF = sequelize.define('epf',{
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
    address:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    relationship:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    dob:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    total_share:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    is_minor:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    guardian_name_address:{
        type: Sequelize.STRING,
    }
});

module.exports = EPF;
