//https://github.com/cheeriojs/cheerio

//logger
var winston = require('winston');
winston.level = 'debug';
winston.add(winston.transports.File, {filename: '/var/log/dozenlikes/lolwot.log'});


var Crawler = require("js-crawler");

var cheerio = require('cheerio');
var Article = require('./models/article.js')

var request = require('request');

var jsonfile = require('jsonfile')
var util = require('util')
var path = require('path');
var appDir = path.dirname(require.main.filename);
var file = appDir + '/tmp/data.json'

var crawlForSlideshow = function (url, image_url, category, callback) {
    var pages = [];
    var parsefunction = function () {
        var article = {
            type: "slideshow",
            category: category,
            subcategory: "",

            image_url: image_url,
            title: "",
            description: "",

            objects: [],
            pages: 10
        }

        $ = cheerio.load(pages[0]);

        article.title = $("article > h1").text();
        article.description = $($("article > p")[0]).text();


        // page 1
        var page1 = {
            type: "img",
            title: "",
            image_url: "",
            width: 0,
            height: 0,
            description: ""
        };

        page1.title = $($("article > h2")[0]).text();
        page1.image_url = $($("article > p > img")[0]).attr()['src']
        page1.description = $($("article > p")[2]).text();

        article.objects.push(page1);

        var page2 = {
            type: "img",
            title: "",
            image_url: "",
            width: 0,
            height: 0,
            description: ""
        };

        page2.title = $($("article > h2")[0]).text();
        page2.image_url = $($("article > p > img")[1]).attr()['src']
        page2.description = $($("article > p")[5]).text();

        article.objects.push(page2);


        for (var i = 1; i < 5; i++) {
            $ = cheerio.load(pages[i]);
            // page 1
            var page1 = {
                type: "img",
                title: "",
                image_url: "",
                width: 0,
                height: 0,
                description: ""
            };

            page1.title = $($("article > h2")[0]).text();
            page1.image_url = $($("article > p > img")[0]).attr()['src']
            page1.description = $($("article > p")[1]).text();

            article.objects.push(page1);

            var page2 = {
                type: "img",
                title: "",
                image_url: "",
                width: 0,
                height: 0,
                description: ""
            };

            page2.title = $($("article > h2")[1]).text();
            page2.image_url = $($("article > p > img")[1]).attr()['src']
            page2.description = $($("article > p")[4]).text();

            article.objects.push(page2);
        }

        // winston.log('debug',article);
        callback(undefined, article);
    }

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
}


var crawl = function (i, lolwotlist, callback) {
    if (i > lolwotlist.length) {
        callback(undefined, "Done");
    }
    crawlForSlideshow(lolwotlist[i].link, lolwotlist[i].image, "home", function (err, article) {
        if (err) {
            winston.log('debug',err)
        }
        Article.createFromJson(article, function (err, article) {
            if (err) {
                winston.log('warn', err.message)
            }else {
                winston.log('debug', i + " - done: " + article.title)
            }
            crawl(i+1, lolwotlist, callback);
        });
    });
}


//Load To File
// var lolwotlist = [];
// var get_links = function (offset, callback) {
//     winston.log('debug',"offset: " + offset);
//     request('http://www.lolwot.com/posts.php?category=home&cb=1460288040395&offset=' + offset, function (error, response, html) {
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
// }
//
// get_links(0, function (err, res) {
//     jsonfile.writeFile(file, res, function (err) {
//         console.error(err)
//     })
//     winston.log('debug',"done writing to file");
// })

//Load From File
jsonfile.readFile(file, function (err, obj) {
    // console.dir(obj)
    crawl(0, obj, function (err, res) {
        if (err) {
            winston.log('debug',err)
        }
        winston.log('debug',res)
    });
})

