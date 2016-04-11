/*
 * GET home page.
 */

exports.index = function(req, res){
    console.log( "test index" );
    res.end( "test index" );
};



exports.num = function (req, res, next) {
    var str = "num = " +  req.params.num;
    console.log( str );
    res.end( str );
};