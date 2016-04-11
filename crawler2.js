//https://github.com/antivanov/js-crawler
//https://github.com/cheeriojs/cheerio

var Crawler = require("js-crawler");
//var $ = require('jQuery');
var jsdom = require('jsdom');

var cheerio = require('cheerio');


new Crawler().configure({depth: 1})
    .crawl("http://www.lolwot.com/10-of-the-deadliest-creatures-lurking-in-the-amazon-jungle/", function onSuccess(page) {
        //console.log(page.url);
        //console.log(page.content);

        $ = cheerio.load(page.content);

        var p = $('p');

        console.log(p);

    });


