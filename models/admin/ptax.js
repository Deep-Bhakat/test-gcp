const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const PTAX = sequelize.define('ptax',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    month_year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    challan:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    payment_proff:{
        type: Sequelize.STRING,
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = PTAX;
