//https://github.com/antivanov/js-crawler
var Crawler = require("js-crawler");



new Crawler().configure({depth: 3})
    .crawl("http://listofdomains.org/ALEXA/Alexa_1.html", function onSuccess(page) {
        //console.log(page.url);
        //console.log(page.content);
        var re = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
        var re1 = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
        // var re2 =/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/g



        var emails = page.content.match(re1);
        if(emails) {
            emails.forEach(function (element) {
                console.log(element);
            });
        }
        //console.log(page.status);
    });
