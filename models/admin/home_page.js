const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const HomePage = sequelize.define('home_page',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    date:{
        type: Sequelize.DATEONLY,
        notEmpty: true, 
    },    
    heading:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    context:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = HomePage;
