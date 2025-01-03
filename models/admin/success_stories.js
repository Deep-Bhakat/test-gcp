const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const SuccessStories = sequelize.define('success_stories',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    report:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    month:{
        type: Sequelize.INTEGER,
        notEmpty: true, 
    },
    year:{
        type: Sequelize.INTEGER,
        notEmpty: true, 
    },
});

module.exports = SuccessStories;
