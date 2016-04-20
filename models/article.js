// article.js
// article model logic.

var neo4j = require('neo4j');
var errors = require('./errors');
var config = require('../config/config');
var winston = require('winston');
winston.level = 'debug';
// winston.add(winston.transports.File, {filename: process.env['LOG_FILE']});


var uuid = require('node-uuid');
var ArticlePage = require('./article_page.js')
var request = require('request');

var db = new neo4j.GraphDatabase(process.env['NEO4J_URL']);

// Private constructor:

var Article = module.exports = function Article(_node) {
    this._node = _node;
    this.id = _node.properties.id;
}

// Public instance constructor:

Article.prototype.patch = function (props, callback) {
    var query = [
        'MATCH (article:Article {id: {id}})',
        'SET article += {props}',
        'RETURN article',
    ].join('\n');

    props.date_modified = Date.now();
    var params = {
        id: this.id,
        props: props,
    };

    var self = this;

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
            err = new Error('Article has been deleted! id: ' + self.id);
            return callback(err);
        }

        // Update our node with this updated+latest data from the server:
        self._node = results[0]['article'];

        callback(null, self);
    });
};

Article.prototype.del = function (callback) {
    // Use a Cypher query to delete both this user and his/her following
    // relationships in one query and one network request:
    // (Note that this'll still fail if there are any relationships attached
    // of any other types, which is good because we don't expect any.)
    var query = [
        'MATCH (article:Article {id: {id}})',
        'OPTIONAL MATCH (article) -[rel]- (other)',
        'DELETE article, rel',
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

//Rel
Article.prototype.addFirstObj = function (other, callback) {
    var query = [
        'MATCH (article:Article {id: {article_id}})',
        'MATCH (article_page:ArticlePage {id: {article_page_id}})',
        'MERGE (article) -[rel:Next]-> (article_page)'
    ].join('\n');

    var params = {
        article_id: this.id,
        article_page_id: other.id
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err) {
        callback(err);
    });
};

Article.prototype.addTags = function (tags, callback) {
    var query = ['MATCH (a:Article {id:{article_id}})'];
    tags.forEach(function (tag) {
        var temp = "a" + uuid.v1().replace(/-/g, "");
        query.push('MERGE (' + temp + ':Tag:' + tag + ' )');
        query.push('MERGE (' + temp + ' )<-[:IS]-(a)');
    });
    query = query.join('\n');

    var params = {
        article_id: this.id
    };

    db.cypher({
        query: query,
        params: params
    }, function (err) {
        callback(err);
    });
};

Article.prototype.addCategories = function (categories, callback) {
    var query = ['MATCH (a:Article {id:{article_id}})'];
    categories.forEach(function (category) {
        var temp = "a" + uuid.v1().replace(/-/g, "");
        query.push('MERGE (' + temp + ':Category:' + category + ' )');
        query.push('MERGE (' + temp + ')<-[:IS]-(a)');
    });
    query = query.join('\n');

    var params = {
        article_id: this.id
    };

    db.cypher({
        query: query,
        params: params
    }, function (err) {
        callback(err);
    });
};




// Static methods:

Article.get = function (id, callback) {
    var query = [
        'MATCH (article:Article {id: {id}})',
        'RETURN article',
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
            err = new Error('No such Article with id: ' + id);
            return callback(err);
        }
        var article = new Article(results[0]['article']);
        callback(null, article);
    });
};

Article.getAll = function (callback) {
    var query = [
        'MATCH (article:Article)',
        'RETURN article',
    ].join('\n');

    db.cypher({
        query: query,
    }, function (err, results) {
        if (err) {
            // console.log(err);
            callback(err);
            return
        }
        var articles = results.map(function (result) {
            return new Article(result['article']);
        });
        callback(null, articles);
    });
};

Article.getRandom = function (callback) {
    var query = [
        'MATCH (a:Article)',
        'WITH   count(a) as count ,collect(a) as collection',
        'RETURN collection[toInt(count * rand())] as article',
    ].join('\n');

    db.cypher({
        query: query,
    }, function (err, results) {
        if (err) {
            // console.log(err);
            callback(err);
            return
        }
        callback(null, new Article(results[0]['article']));
    });
};
//match (a:science)<-[:IS]-(b:Article) return b.id;
Article.getRandomByCategory = function (category, callback) {
    var query = [
        'MATCH (:'+category+')<-[:IS]-(a:Article)',
        'WITH   count(a) as count ,collect(a) as collection',
        'RETURN collection[toInt(count * rand())] as article'
    ].join('\n');

    db.cypher({
        query: query
    }, function (err, results) {
        if (err) {
            // console.log(err);
            callback(err);
            return
        }
        callback(null, new Article(results[0]['article']));
    });
};

// Creates the user and persists (saves) it to the db, incl. indexing it:
Article.create = function (props, callback) {
    var query = [
        'CREATE (article:Article {props})',
        'RETURN article',
    ].join('\n');

    // props.id = uuid.v1();
    props.id = props.title.toLowerCase().replace(/[ !?'"]/g, '-').replace(/[,.'’_?!@#$%^&*()+~]/g, '');
    props.id = props.id.replace(/[^\x20-\x7E]+/g, '');

    while (props.id[0] == "-") {
        props.id = props.id.slice(1);
    }
    while (props.id[props.id.length - 1] == "-") {
        props.id = props.id.slice(0, -1);
    }

    props.date_created = Date.now();
    props.date_modified = Date.now();

    props.likes = 1;
    props.dislikes = 0;

    props.visits = 1;


    var create_article = function (params) {
        db.cypher({
            query: query,
            params: params,
        }, function (err, results) {
            // if (err) {
            //     // TODO: This assumes username is the only relevant constraint.
            //     // We could parse the constraint property out of the error message,
            //     // but it'd be nicer if Neo4j returned this data semantically.
            //     // Alternately, we could tweak our query to explicitly check first
            //     // whether the username is taken or not.
            //     err = new errors.ValidationError(
            //         'The username ‘' + props.id + '’ is taken.');
            // }
            if (err) {
                // console.log(err);
                callback(err);
                return
            }
            var article = new Article(results[0]['article']);
            callback(null, article);
        });
    }

    if (props.image_url != undefined) {
        request.post({
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
            create_article(params);
        });
    } else {
        var params = {
            props: props
        };
        create_article(params);
    }
};

Article.createChain = function (obj, array, callback) {
    ArticlePage.create(array[0], function (err, newelement) {
        if (err) {
            // console.log(err);
            callback(err);
            return;
        }

        obj.setRel(newelement, function (err) {
            if (err) {
                // console.log(err);
                callback(err);
                return;
            }
            if (array.length > 1) {
                array.splice(0, 1);
                Article.createChain(newelement, array, callback);
            } else {
                callback();
            }
        });
    })
}

Article.createFromJson = function (raw_article, callback) {
    var article_prop = {
        source_url: raw_article.source_url,

        title: raw_article.title,
        type: raw_article.type,
        num_of_pages: raw_article.num_of_pages,

        source: raw_article.source,

        image_url: raw_article.image_url,
        description: raw_article.description,

        status: "pending"
    };

    Article.create(article_prop, function (err, article) {
        if (err) {
            callback(err);
            return;
        }
        if (raw_article.objects[0] == undefined) {
            callback("there are no pictures ?!?!?!?! article:" + article.id);
            return;
        }
        article.addTags(raw_article.tags, function (err) {
            if(err) winston.log('exception', err);
        });
        article.addCategories(raw_article.categories, function (err) {
            if(err) winston.log('exception', err);
        });

        ArticlePage.create(raw_article.objects[0], function (err, firstObj) {
            if (err) {
                callback(err);
                return;
            }

            article.addFirstObj(firstObj,
                function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                }
            );
            if (raw_article.objects.length > 1) {
                raw_article.objects.splice(0, 1);
                Article.createChain(firstObj, raw_article.objects, function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(undefined, raw_article);
                });
            } else {
                callback(undefined, raw_article);
            }
        });
    })
};

// Static initialization:
db.createConstraint({
    label: 'Article',
    property: 'id',
}, function (err, constraint) {
    if (err) {
        winston.log('exception', err);     // Failing fast for now, by crash the application.
    }
    if (constraint) {
        winston.log('(Registered unique article constraint.)');
    } else {
        // Constraint already present; no need to log anything.
    }
});

