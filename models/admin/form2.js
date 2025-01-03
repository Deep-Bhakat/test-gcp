const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Form2 = sequelize.define('form2',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name_address:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    dob:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    relationship:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    signature:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    signature_employer:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    date:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    factory_name_address:{
        type: Sequelize.STRING,
    },
    place:{
        type: Sequelize.STRING,
    }
});

module.exports = Form2;
