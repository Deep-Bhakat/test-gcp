const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const PF = sequelize.define('pf',{
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
    },
    challan_details:{
        type: Sequelize.STRING,
    } ,
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = PF;
