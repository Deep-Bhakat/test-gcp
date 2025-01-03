const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Collection = sequelize.define('collection',{
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
    labour:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    pf:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    esic:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    ptax:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    service:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    gst:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    others:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    total:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = Collection;
