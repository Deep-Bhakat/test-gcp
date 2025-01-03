const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const ESIC = sequelize.define('esic',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    month_year:{
        type: Sequelize.STRING,
    },
    ecr_challan:{
        type: Sequelize.STRING,
    },
    contribution:{
        type: Sequelize.STRING,
    },
    payment_proff:{
        type: Sequelize.STRING,
    }
});

module.exports = ESIC;
