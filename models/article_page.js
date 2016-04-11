// article.js
// article model logic.
var winston = require('winston');
winston.add(winston.transports.File, {filename: process.env['LOG_FILE']});


var neo4j = require('neo4j');
var errors = require('./errors');
var config = require('../config/config');
var uuid = require('node-uuid');
var request = require('request');

var db = new neo4j.GraphDatabase(process.env['NEO4J_URL']);

// Private constructor:

var ArticlePage = module.exports = function ArticlePage(_node) {
    this._node = _node;
    this.id = _node.properties.id;
}

// Public instance constructor:

ArticlePage.prototype.patch = function (props, callback) {
    var query = [
        'MATCH (article_page:ArticlePage {id: {id}})',
        'SET article_page += {props}',
        'RETURN article_page',
    ].join('\n');

    var params = {
        id: this.id,
        props: props,
    };

    var self = this;

    db.cypher({
        query: query,
        params: params,
    }, function (err, results) {
        if (err) return callback(err);

        if (!results.length) {
            err = new Error('obj has been patched! id: ' + self.id);
            return callback(err);
        }

        // Update our node with this updated+latest data from the server:
        self._node = results[0]['article_page'];

        callback(null, self);
    });
};

ArticlePage.prototype.del = function (callback) {
    var query = [
        'MATCH (article_page:ArticlePage {id: {id}})',
        'OPTIONAL MATCH (article_page) -[rel]- (other)',
        'DELETE article_page, rel',
    ].join('\n')

    var params = {
        id: this.id,
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err) {
        callback(err);
    });
};


ArticlePage.prototype.setRel = function (other, callback) {
    var query = [
        'MATCH (article_page:ArticlePage {id: {id}})',
        'MATCH (otherarticle_page:ArticlePage {id: {other_id}})',
        'MERGE (article_page) -[a:Next]-> (otherarticle_page)',
        'MERGE (otherarticle_page) -[b:Prev]-> (article_page)',
    ].join('\n')

    var params = {
        id: this.id,
        other_id: other.id,
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err) {
        callback(err);
    });
};

ArticlePage.prototype.delRel = function (other, callback) {
    var query = [
        'MATCH (article_page:ArticlePage {id: {id}})',
        'MATCH (otherarticle_page:ArticlePage {id: {other_id}})',
        'MATCH (article_page) -[rel]-> (otherarticle_page)',
        'MATCH (otherarticle_page) -[rel]-> (article_page)',
        'DELETE rel',
    ].join('\n')

    var params = {
        id: this.id,
        other_id: other.id,
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err) {
        callback(err);
    });
};

// Calls callback w/ (err, following, others), where following is an array of
// users this user follows, and others is all other users minus him/herself.
// Article.prototype.getFollowingAndOthers = function (callback) {
//     // Query all users and whether we follow each one or not:
//     var query = [
//         'MATCH (user:User {username: {thisUsername}})',
//         'MATCH (other:User)',
//         'OPTIONAL MATCH (user) -[rel:follows]-> (other)',
//         'RETURN other, COUNT(rel)', // COUNT(rel) is a hack for 1 or 0
//     ].join('\n')
//
//     var params = {
//         thisUsername: this.username,
//     };
//
//     var user = this;
//     db.cypher({
//         query: query,
//         params: params,
//     }, function (err, results) {
//         if (err) return callback(err);
//
//         var following = [];
//         var others = [];
//
//         for (var i = 0; i < results.length; i++) {
//             var other = new User(results[i]['other']);
//             var follows = results[i]['COUNT(rel)'];
//
//             if (user.username === other.username) {
//                 continue;
//             } else if (follows) {
//                 following.push(other);
//             } else {
//                 others.push(other);
//             }
//         }
//
//         callback(null, following, others);
//     });
// };


// Static methods:

ArticlePage.get = function (id, callback) {
    var query = [
        'MATCH (article_page:ArticlePage {id: {id}})',
        'RETURN article_page',
    ].join('\n')

    var params = {
        id: id,
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err, results) {
        if (err) {
            // console.log(err);
            callback(err);
            return
        }
        if (!results.length) {
            err = new Error('No such ArticlePage  with id: ' + id);
            return callback(err);
        }
        var obj = new ArticlePage(results[0]['article_page']);
        callback(null, obj);
    });
};

ArticlePage.getAll = function (callback) {
    var query = [
        'MATCH (article_page:ArticlePage)',
        'RETURN article_page',
    ].join('\n');

    db.cypher({
        query: query,
    }, function (err, results) {
        if (err) {
            // console.log(err);
            callback(err);
            return
        }
        var objects = results.map(function (result) {
            return new ArticlePage(result['article_page']);
        });
        callback(null, objects);
    });
};

// Creates the user and persists (saves) it to the db, incl. indexing it:
ArticlePage.create = function (props, callback) {
    var query = [
        'CREATE (article_page:ArticlePage {props})',
        'RETURN article_page',
    ].join('\n');

    props.id = uuid.v1();

    props.date_created = Date.now();
    props.date_modified = Date.now();

    props.likes = 1;
    props.dislikes = 0;

    props.visits = 1;

    request.post({
        // url: 'http://dozenlikes.com/img/',
        url: process.env['IMAGE_SERVICE_URL'],
        json: {
            image_url: props.image_url
        }
    }, function (err, response, image_id) {
        if (err) {
            // console.log(err);
            callback(err);
            return
        }

        props.image_id = image_id
        var params = {
            props: props
        };

        db.cypher({
            query: query,
            params: params,
        }, function (err, results) {
            if (err) {
                // console.log(err);
                callback(err);
                return
            }
            var article_page = new ArticlePage(results[0]['article_page']);
            callback(null, article_page);
        });
    });
};


// Static initialization:

db.createConstraint({
    label: 'Article',
    property: 'id',
}, function (err, constraint) {
    if (err) {
        winston.log('exception', err);     // Failing fast for now, by crash the application.
        //throw err;     // Failing fast for now, by crash the application.
    }
    if (constraint) {
        console.log('(Registered unique article constraint.)');
    } else {
        // Constraint already present; no need to log anything.
    }
})


