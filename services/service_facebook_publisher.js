var config = require('../config/config').config;
var Article = require('../models/article.js')
var winston = require('winston');
winston.level = 'debug';
winston.add(winston.transports.File, {filename: '/var/log/dozenlikes/service_facebook_publisher.log'});


var FB = require('fb');
FB.setAccessToken('EAACEdEose0cBAIZB48HAa53x9rYrYASfXtVDbY2LskIRdP9dHp0bzpKxO78XSbZCD2BCrEKk0OHP8450wTIpRrsPUW3bVzDp585vsBWMedVzdcnKTWULkJi4jV7b2lOrlsogSUGNpq352Fz85SLxjtlHefvEZBcHB9ckKpQ8QZDZD');

var link = 'www.dozenlikes.com'
var body = ""

winston.log('info', 'posting to facebook');
Article.getRandom(function (err, article) {
    if (err) {
        winston.log('debug', err);
        return;
    }
    FB.api('1013626285396106/feed', 'post', {message: body, link: link + "/" + article.id}, function (res) {
        if (!res || res.error) {
            winston.log('debug', !res ? 'error occurred' : res.error);
            return;
        }
        winston.log('info', res);
    });
});


//
// FB.api('1013626285396106/feed', 'get', function (res) {
//     if (!res || res.error) {
//         console.log(!res ? 'error occurred' : res.error);
//         return;
//     }
//     var body = 'WOW :)';
//     res.data.map(function (group) {
//         FB.api(group.id + '/feed', 'post', {message: body, link: link}, function (res) {
//             if (!res || res.error) {
//                 console.log(!res ? 'error occurred' : res.error);
//                 return;
//             }
//             console.log("ok :)");
//         })
//     });
//     console.log("Done");
// });
