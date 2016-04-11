/*
 * GET home page.
 */
var fs = require("fs");


exports.index = function(req, res){
    fs.readFile( __dirname + "/../static/index.html", 'utf8', function (err, data) {
        console.log( data );
        res.end( data );
    });
};