/**
 * Created by vovacooper on 02/03/2016.
 */

exports.config = function(){

    // NEO4J
    process.env['NEO4J_URL'] = "http://neo4j:Aa123456@localhost:7474";

    // process.env['IMAGE_SERVICE_URL'] = "http://localhost:2000/img/";
    process.env['IMAGE_SERVICE_URL'] = "http://dozenlikes.com/img/";

    //LOG
    process.env['LOG_FILE'] = "/var/log/dozenlikes/nodejs.log";

    // process.env['NEO4J_URL'] = "http://neo4j:Aa123456@dozenlikes.com:7474";
    // process.env['GRAPHENEDB_URL'] = "http://neo4j:Aa123456@dozenlikes.com:7474";
    // process.env['NEO4J_AUTH'] = "";
}();

