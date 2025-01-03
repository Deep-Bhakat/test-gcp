const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const NewRegistrationNominee = sequelize.define('new_registration_nominee',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    nominee_name:{
        type: Sequelize.STRING,
    },      
    nominee_relation:{
        type: Sequelize.STRING,
    },     
    nominee_dob:{
        type: Sequelize.STRING,
    },     
    nominee_share:{
        type: Sequelize.STRING,
    },     
});

module.exports = NewRegistrationNominee;
