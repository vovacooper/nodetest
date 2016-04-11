//https://github.com/antivanov/js-crawler
//https://github.com/cheeriojs/cheerio

//logger
var winston = require('winston');
winston.add(winston.transports.File, {filename: '/var/log/dozenlikes/topix.log'});

var Crawler = require("js-crawler");

var cheerio = require('cheerio');
var Article = require('./models/article.js')

var crawlForSlideshow = function (num, callback) {
    // console.log(" + + + starting " + num);
    new Crawler().configure({depth: 1})
        .crawl("http://stars.topix.com/slideshow/" + num, function onSuccess(page) {
            $ = cheerio.load(page.content);

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
                // console.log("-----BAD----" + num);
                // console.log(info);
                // return
            } else {
                // console.log("-----GOOD----" + num);
                // console.log(info);
                // return
            }

            var article = {
                type: "slideshow",
                category: "celebs",
                subcategory: "stars",
                
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
                article.pages = article.objects.length;

                Article.createFromJson(article, callback);
                // console.log("-----GOOD----" + num);
                // console.log(article.pages)
                // console.log(info);
                // callback()
                // console.log(article);
            } else {
                // console.log(" - - - empty " + num)
                // console.log("-----BAD----" + num);
                // console.log(info);
                // console.log(article);
                callback("error: cant parse")
            }
        });
}


var i = 15000
var good_array = []
var callbackfunction = function (err, article) {
    if (err) {
        console.log(i + " - err: " + err);
    } else {
        console.log(i + " - done: " + article.title)
        good_array.push(i)
    }
    i += 1;
    if (i < 19000) {
        crawlForSlideshow(i, callbackfunction);
    } else {
        console.log(good_array);
        console.log("----------");
    }
}
crawlForSlideshow(i, callbackfunction);


//story
//http://stars.topix.com/story/14019