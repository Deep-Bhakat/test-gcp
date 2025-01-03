const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Chat = sequelize.define('chat',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    message:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    to:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    from:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    from_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    to_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    read:{
        type: Sequelize.BOOLEAN,
        notEmpty: true, 
    },
    date:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    time:{
        type: Sequelize.TIME,
        notEmpty: true, 
    }
});

module.exports = Chat;
