const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Notification = sequelize.define('notification',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    heading:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    upload:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    date:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    from_date:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    to_date:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    comment:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = Notification;
