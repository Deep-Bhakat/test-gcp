const Sequelize = require('sequelize')
const {Connector} = require('@google-cloud/cloud-sql-connector');

const connector = new Connector();
const clientOpts = connector.getOptions({
  instanceConnectionName: 'node-js-project-2:asia-south1:mysql',
  ipType: 'PUBLIC',
});

const sequelize = new Sequelize('genesis','user1','test123',{
    // const sequelize = new Sequelize('genesis','root','',{
    ...clientOpts,
    dialect: 'mysql',
  dialectOptions: {
    // Your mysql2 options here

    socketPath: '/cloudsql/node-js-project-2:asia-south1:mysql',
  },
});
// const sequelize = new Sequelize('genesisgroup','kaniska','Apiece_1000',{
//     host:'localhost',
//     dialect:'mysql'
// });




// const pool = await mysql.createPool({
 
//   user: 'my-user',
//   password: 'my-password',
//   database: 'db-name',
// });
// const conn = await pool.getConnection();
// const [result] = await conn.query(`SELECT NOW();`);
// console.table(result); // prints returned time value from server

// await pool.end();
// connector.close();
module.exports = sequelize;
