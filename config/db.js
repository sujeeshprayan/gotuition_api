// var mysql   =   require('mysql');
// var pool    =   mysql.createPool({
//     'host'  : 'localhost',
//     'user'  :  'root',
//     'password' : '',
//     'database' : 'gotuition'
// });
// pool.getConnection(function(error,connection){
//     if(error)
//     {
//         throw error;
//     }
// });

// module.exports  =   pool;



var mysql = require('mysql');
var utli = require('util');

var pool = mysql.createPool({
   connectionLimit: 100,
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'gotuition',
   timezone: 'Asia/Kolkata'
});

pool.getConnection((err, connection) => {
   if (err) {
       if (err.code === 'PROTOCOL_CONNECTION_LOST') {
           console.error('Database connection was closed.')
       }
       if (err.code === 'ER_CON_COUNT_ERROR') {
           console.error('Database has too many connections.')
       }
       if (err.code === 'ECONNREFUSED') {
           console.error('Database connection was refused.')
       }
   }
   if (connection) connection.release()
   return
})

pool.query = utli.promisify(pool.query);

module.exports = pool