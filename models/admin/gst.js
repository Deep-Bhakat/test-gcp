const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const GST = sequelize.define('gst',{
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
    form1:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    form1_details:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    form3b:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    payment_proff:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = GST;
