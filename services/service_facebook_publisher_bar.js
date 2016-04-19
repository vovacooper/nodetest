var config = require('../config/config').config;
var Article = require('../models/article.js')
var winston = require('winston');
winston.level = 'debug';
winston.add(winston.transports.File, {filename: '/var/log/dozenlikes/service_facebook_publisher.log'});


var FB = require('fb');
FB.setAccessToken('CAACEdEose0cBANAreqD0rxjXT0BMf60Hlpo4oxcvHF5r7Qk1U2rhmCZAUL5ZC0WC6QcUHY81KwzszFZAyO9PupeBgFBSH2GZAMQxgvJTjfQu6MKC6csDANpDyYtP9jzFmzBvyBSnOYC5a2Ubuy7CL1fl63D1HF9gxPppZCgdP0a0ZCxvkwf5MHZAGlVoDiMFRvajpoKlirYLPlLtg5czav5');
//
var link = 'http://www.dozenlikes.com/13-selfies-that-are-just-too-much/?ref=bar'
var body = 'WOW :)';
//
// winston.log('info', 'posting to facebook');
// Article.getRandom(function (err, article) {
//     if (err) {
//         winston.log('debug', err);
//         return;
//     }
//     FB.api('1013626285396106/feed', 'post', {message: body, link: link + "/" + article.id}, function (res) {
//         if (!res || res.error) {
//             winston.log('debug', !res ? 'error occurred' : res.error);
//             return;D
//         }
//         winston.log('info', res);
//     });
// });



FB.api('me/groups', 'get', function (res) {
    if (!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    res.data.map(function (group) {
        FB.api(group.id + '/feed', 'post', {message: body, link: link}, function (res) {
            if (!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
            }
            console.log("ok :)");
        })
    });
    console.log("Done");
});
