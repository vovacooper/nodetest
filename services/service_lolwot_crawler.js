//https://github.com/cheeriojs/cheerio

//logger
var winston = require('winston');
winston.level = 'debug';
winston.add(winston.transports.File, {filename: '/var/log/dozenlikes/lolwot.log'});
winston.remove(winston.transports.Console);

var Crawler = require("js-crawler");

var cheerio = require('cheerio');
var Article = require('../models/article.js')

var request = require('request');

var jsonfile = require('jsonfile')
var util = require('util')
var path = require('path');
var appDir = path.dirname(require.main.filename);
var file = appDir + '/../jsondata/data.json'

var crawlForSlideshow = function (url, image_url, callback) {
    var pages = [];
    var parsefunction = function () {
        var article = {
            source_url: url,

            type: "slideshow",
            categories: [],
            tags: [],
            source: "lolwot",

            image_url: image_url,
            title: "",
            description: "",

            objects: [],
            num_of_pages: 0
        };

        $ = cheerio.load(pages[0]);

        article.title = $("article > h1").text();
        article.description = $($("article > p")[0]).text();

        var num_of_pages = parseInt($(".page-nav-number").text().split(" ")[3]);
        
        $('article').attr('class').split(/\s+/).forEach(function (val) {
            var arr = val.split(/-+/g);
            if (arr[0] == 'category') {
                article.categories.push(arr.splice(1).join('_'));
            }
            if (arr[0] == 'tag') {
                article.tags.push(arr.splice(1).join('_'));
            }
        });

        for (var j = 0; j < num_of_pages; j++) {
            $ = cheerio.load(pages[j]);
            var num_pages = $('article h2').length;

            for (var i = 0; i < num_pages; i++) {
                // page 1
                var page = {
                    type: "img",
                    title: "",
                    image_url: "",
                    width: 0,
                    height: 0,
                    description: ""
                };
                try {
                    page.title = $($("article > h2")[i]).text();
                    page.image_url = $($($("article > h2")[i]).next()).find('img').attr()['src'];
                    page.description = $($("article > h2")[i]).next().next().text();

                    article.objects.push(page);
                    article.num_of_pages += 1;
                } catch (err) {
                    continue;
                }
            }
        }
        callback(undefined, article);
    };

    request(url + '/1', function (error, response, html) {
        if (!error && response.statusCode == 200) {
            // winston.log('debug',html);
            pages.push(html);
            request(url + '/2', function (error, response, html) {
                if (!error && response.statusCode == 200) {
                    // winston.log('debug',html);
                    pages.push(html);
                    request(url + '/3', function (error, response, html) {
                        if (!error && response.statusCode == 200) {
                            // winston.log('debug',html);
                            pages.push(html);
                            request(url + '/4', function (error, response, html) {
                                if (!error && response.statusCode == 200) {
                                    // winston.log('debug',html);
                                    pages.push(html);
                                    request(url + '/5', function (error, response, html) {
                                        if (!error && response.statusCode == 200) {
                                            // winston.log('debug',html);
                                            pages.push(html);
                                            parsefunction();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};


var crawl = function (i, lolwotlist, callback) {
    if (i > lolwotlist.length) {
        callback(undefined, "Done");
    }
    if(lolwotlist[i]["ribbon-type"] != "list"){
        winston.log('debug', i + " - type: " + lolwotlist[i]["ribbon-type"] + " is not list");
        crawl(i + 1, lolwotlist, callback);
        return;
    }
    crawlForSlideshow(lolwotlist[i].link, lolwotlist[i].image, function (err, article) {
        if (err) {
            winston.log('debug', err);
        }
        Article.createFromJson(article, function (err, article) {
            if (err) {
                winston.log('warn', i + " - err: " + err);
            } else {
                winston.log('info', i + " - done: " + article.title);
            }
            crawl(i + 1, lolwotlist, callback);
        });
    });
};

// Load To File
// var lolwotlist = [];
// var get_links = function (offset, callback) {
//     winston.log('debug',"offset: " + offset);
//     request('http://www.lolwot.com/posts.php?category=home&cb=1461066990121&offset=' + offset, function (error, response, html) {
//         if (!error && response.statusCode == 200 && html != "[]") {
//             var obj = eval(html);
//             lolwotlist = lolwotlist.concat(obj);
//             // lolwotlist.push(html);
//
//             get_links(lolwotlist.length, callback);
//         } else {
//             callback(error, lolwotlist);
//         }
//     });
// };
//
// get_links(0, function (err, res) {
//     jsonfile.writeFile(file, res, function (err) {
//         console.error(err)
//     })
//     winston.log('debug',"done writing to file");
// });

// Load From File
jsonfile.readFile(file, function (err, obj) {
    crawl(0, obj, function (err, res) {
        if (err) {
            winston.log('debug', err);
        }
        winston.log('debug', res);
    });
});

