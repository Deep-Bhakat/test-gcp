const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Agreement = sequelize.define('agreement',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    from_date:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    to_date:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    remarks:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = Agreement;
