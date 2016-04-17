//https://github.com/thingdom/node-neo4j/tree/v2



var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:1234@localhost:7474');
db.cypher({
    query: "MATCH (a)-[r]->(b)\
    WHERE labels(a) <> [] AND labels(b) <> []\
    RETURN DISTINCT head(labels(a)) AS This, type(r) as To, head(labels(b)) AS That\
    LIMIT 10",
}, callback);

function callback(err, results) {
    if (err) throw err;
    var result = results[0];
    if (!result) {
        console.log('No user found.');
    } else {
        //var user = result['user'];
        console.log(results);
    }
};

