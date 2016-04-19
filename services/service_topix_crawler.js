//https://github.com/antivanov/js-crawler
//https://github.com/cheeriojs/cheerio

//logger
var winston = require('winston');
winston.level = 'debug';
winston.add(winston.transports.File, {filename: '/var/log/dozenlikes/topix.log'});
winston.remove(winston.transports.Console);

var Crawler = require("js-crawler");


var request = require('request');

var cheerio = require('cheerio');
var Article = require('../models/article.js')

var crawlForSlideshow = function (num, callback) {

    var parce_website = function (response, html) {
        $ = cheerio.load(html);

        var info = {}
        $("script:contains('st_request.itemSubtype =')").text().replace(/\s{2,}/g, ' ').split(';').map(function (a) {
            if (a.search("st_request.itemType") != -1) {
                a = a.split('=')[1].replace(/[ "]/g, '');
                info.itemType = a;
                return a
            }
            if (a.search("st_request.itemSubtype") != -1) {
                a = a.split('=')[1].replace(/[ "]/g, '');
                info.itemSubtype = a;
                return a
            }
            if (a.search("st_request.numslides") != -1) {
                a = a.split('=')[1].replace(/[ "]/g, '');
                info.numslides = a;
                return a
            }
            if (a.search("st_request.action") != -1) {
                a = a.split('=')[1].replace(/[ "]/g, '');
                info.action = a;
                return a
            }
        });

        var is_slider = $("script:contains('st_request.itemSubtype = \"slideshow\"')");
        var is_slider1 = $("script:contains('st_request.action = \"slideshow\"')");
        if (is_slider == false && is_slider1 == false) {
            // winston.log('debug',"-----BAD----" + num);
            // winston.log('debug',info);
            // return
        } else {
            // winston.log('debug',"-----GOOD----" + num);
            // winston.log('debug',info);
            // return
        }

        var article = {
            source_url: "http://stars.topix.com/slideshow/" + num,
            type: "slideshow",
            categories: ["celebs", "lists"],
            tags: [],
            source: "topix",

            title: "",
            description: ""
        }

        article.title = $('.str-content-header.js-page-header').text().replace(/\s{2,}/g, ' ');
        var is_first = true;
        article.objects = $(".js-slide-item").map(function (i, el) {
            this === el

            var data = {
                type: "img",
                title: "",
                image_url: "",
                width: 0,
                height: 0,
                description: ""
            }

            $(this).find('.str-caption-wrapper h2 ').map(function (i, el) {
                this === el
                data.title = $(this).text();
            });

            $(this).find('.str-slideshow.js-slideshow a img').map(function (i, el) {
                this === el
                var a = $(this).attr();
                data.image_url = a['data-img-src'];
                data.width = a['width'];
                data.height = a['height'];
            });

            $(this).find('.str-overlay-subcaption.js-overlay-caption div p').map(function (i, el) {
                this === el
                var a = $(this).text().replace(/\s{2,}/g, ' ');
                data.description = a;
            });

            return data;
        });
        if (article.objects.length != 0) {
            var pages = [];
            for (var i = 0; i < article.objects.length - 1; i++) {
                if (article.objects[i].image_url != article.objects[i + 1].image_url) {
                    pages.push(article.objects[i]);
                }
            }
            pages.push(article.objects[article.objects.length - 1]); // last one
            article.objects = pages;
            article.num_of_pages = article.objects.length;

            Article.createFromJson(article, callback);
            // winston.log('debug',"-----GOOD----" + num);
            // winston.log('debug',article.pages)
            // winston.log('debug',info);
            // callback()
            // winston.log('debug',article);
        } else {
            // winston.log('debug'," - - - empty " + num)
            // winston.log('debug',"-----BAD----" + num);
            // winston.log('debug',info);
            // winston.log('debug',article);
            callback("error: cant parse");
        }
    }

    request("http://stars.topix.com/slideshow/" + num + "/slide1?no_cover=1", function (error, response, html) {
        if (!error && response.statusCode == 200) {
            parce_website(response, html);
        } else {
            callback("can't get request: " + error);
        }
    });

    // winston.log('debug'," + + + starting " + num);
    // new Crawler().configure({depth: 1})
    //     .crawl("http://stars.topix.com/slideshow/" + num, function onSuccess(page) {
    //         $ = cheerio.load(page.content);
    //
    //         var info = {}
    //         $("script:contains('st_request.itemSubtype =')").text().replace(/\s{2,}/g, ' ').split(';').map(function (a) {
    //             if (a.search("st_request.itemType") != -1) {
    //                 a = a.split('=')[1].replace(/[ "]/g, '');
    //                 info.itemType = a;
    //                 return a
    //             }
    //             if (a.search("st_request.itemSubtype") != -1) {
    //                 a = a.split('=')[1].replace(/[ "]/g, '');
    //                 info.itemSubtype = a;
    //                 return a
    //             }
    //             if (a.search("st_request.numslides") != -1) {
    //                 a = a.split('=')[1].replace(/[ "]/g, '');
    //                 info.numslides = a;
    //                 return a
    //             }
    //             if (a.search("st_request.action") != -1) {
    //                 a = a.split('=')[1].replace(/[ "]/g, '');
    //                 info.action = a;
    //                 return a
    //             }
    //         });
    //
    //         var is_slider = $("script:contains('st_request.itemSubtype = \"slideshow\"')");
    //         var is_slider1 = $("script:contains('st_request.action = \"slideshow\"')");
    //         if (is_slider == false && is_slider1 == false) {
    //             // winston.log('debug',"-----BAD----" + num);
    //             // winston.log('debug',info);
    //             // return
    //         } else {
    //             // winston.log('debug',"-----GOOD----" + num);
    //             // winston.log('debug',info);
    //             // return
    //         }
    //
    //         var article = {
    //             source_url: "http://stars.topix.com/slideshow/" + num,
    //             type: "slideshow",
    //             categories: ["celebs", "lists"],
    //             tags: [],
    //             source: "topix",
    //
    //             title: "",
    //             description: ""
    //         }
    //
    //         article.title = $('.str-content-header.js-page-header').text().replace(/\s{2,}/g, ' ');
    //         var is_first = true;
    //         article.objects = $(".js-slide-item").map(function (i, el) {
    //             this === el
    //
    //             var data = {
    //                 type: "img",
    //                 title: "",
    //                 image_url: "",
    //                 width: 0,
    //                 height: 0,
    //                 description: ""
    //             }
    //
    //             $(this).find('.str-caption-wrapper h2 ').map(function (i, el) {
    //                 this === el
    //                 data.title = $(this).text();
    //             });
    //
    //             $(this).find('.str-slideshow.js-slideshow a img').map(function (i, el) {
    //                 this === el
    //                 var a = $(this).attr();
    //                 data.image_url = a['data-img-src'];
    //                 data.width = a['width'];
    //                 data.height = a['height'];
    //             });
    //
    //             $(this).find('.str-overlay-subcaption.js-overlay-caption div p').map(function (i, el) {
    //                 this === el
    //                 var a = $(this).text().replace(/\s{2,}/g, ' ');
    //                 data.description = a;
    //             });
    //
    //             return data;
    //         });
    //         if (article.objects.length != 0) {
    //             var pages = [];
    //             for (var i = 0; i < article.objects.length - 1; i++) {
    //                 if (article.objects[i].image_url != article.objects[i + 1].image_url) {
    //                     pages.push(article.objects[i]);
    //                 }
    //             }
    //             pages.push(article.objects[article.objects.length - 1]); // last one
    //             article.objects = pages;
    //             article.pages = article.objects.length;
    //
    //             Article.createFromJson(article, callback);
    //             // winston.log('debug',"-----GOOD----" + num);
    //             // winston.log('debug',article.pages)
    //             // winston.log('debug',info);
    //             // callback()
    //             // winston.log('debug',article);
    //         } else {
    //             // winston.log('debug'," - - - empty " + num)
    //             // winston.log('debug',"-----BAD----" + num);
    //             // winston.log('debug',info);
    //             // winston.log('debug',article);
    //             callback("error: cant parse");
    //         }
    //     }, function (a) {
    //         callback("error: in crawler, " + a);
    //     });
}


var i = 15000;
var good_array = [];
var callbackfunction = function (err, article) {
    if (err) {
        winston.log('debug', i + " - err: " + err);
    } else {
        winston.log('info', i + " - done: " + article.title);
        good_array.push(i);
    }
    i += 1;
    if (i < 19000) {
        crawlForSlideshow(i, callbackfunction);
    } else {
        winston.log('info', good_array);
        winston.log('info', "----------");
    }
}
crawlForSlideshow(i, callbackfunction);


//story
//http://stars.topix.com/story/14019