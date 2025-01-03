const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const LWF = sequelize.define('lwf',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    period:{
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

module.exports = LWF;
