//http://expressjs.com/en/advanced/developing-template-engines.html
var express = require('express');
var app = express();
var fs = require("fs");
var routes = require('./routes')

app.get('/', routes.site.index);
app.get('/test', routes.test.index);
app.get('/test/:num', routes.test.num);

//app.get('/', function (req, res) {
//
//    console.log( req.address );
//    res.end("Hello");
//
//})
app.use('/static', express.static('static'));

app.get('/listUsers', function (req, res) {
    fs.readFile( __dirname + "/" + "static/index.html", 'utf8', function (err, data) {
        console.log( data );
        res.end( data );
    });
})

var server = app.listen(8000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})

