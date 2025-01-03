const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const BillSummary = sequelize.define('bill_summary',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    month:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    bill_date:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    bill_no:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    total_bill:{
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
    lwf:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    gst:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    tds:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    service:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    net_profit:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    pf_out:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    esic_out:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    ptax_out:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    lwf_out:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    gst_out:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    tds_out:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    service_out:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    net_profit_out:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = BillSummary;
