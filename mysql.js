//http://www.sitepoint.com/using-node-mysql-javascript-client/
var mysql = require("mysql");


// First you need to create a connection to the db
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Aa123456",
    database: "impospace"
});

con.connect(function (err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});
//
//con.end(function(err) {
//    // The connection is terminated gracefully
//    // Ensures all previously enqueued queries are still
//    // before sending a COM_QUIT packet to the MySQL server.
//});

con.query('SELECT * FROM users', function (err, rows) {
    if (err) throw err;

    console.log('Data received from Db:\n');
    rows.forEach(function(element){
        console.log(element.id + " - " + element.username);
    });
    //console.log(rows);
});