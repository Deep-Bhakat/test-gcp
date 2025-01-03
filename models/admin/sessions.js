const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const Sessions = sequelize.define('sessions',{    
    session_id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    expires: {
        type: Sequelize.DATE
    },
      data: {
        type: Sequelize.TEXT
    }
},{
    freezeTableName: true,
    tableName:'session'
} );

module.exports = Sessions;
