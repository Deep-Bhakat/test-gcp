const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const NewRegistrationAppointments = sequelize.define('new_registration_appointment',{
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

module.exports = NewRegistrationAppointments;
