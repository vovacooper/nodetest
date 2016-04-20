var config = require('../config/config').config;
var Article = require('../models/article.js')
var winston = require('winston');
winston.level = 'debug';
winston.add(winston.transports.File, {filename: '/var/log/dozenlikes/service_facebook_publisher.log'});

var FB = require('fb');


var link = 'www.dozenlikes.com';
var body = "";

// //Dozenlikes general
FB.setAccessToken('EAAOO3uYHbTYBAHPyeVzOieR7W4NrIm2rUa5sOMUAJoXomCid9LkZB5B3PTWuu29ZCCGxoUeJ5XZCG6nY1qxLBCDjo1VT9IO7lIEuYiFBtKS0lKn5hrJTR1TAjR6RKM6ukDtB4V346N8P4QO4wzb19tk5qzeExQZD');
winston.log('info', 'posting to facebook');
Article.getRandom(function (err, article) {
    if (err) {
        winston.log('debug', err);
        return;
    }
    FB.api('1013626285396106/feed', 'post', {message: body, link: link + "/" + article.id, access_token: 'EAAOO3uYHbTYBAHPyeVzOieR7W4NrIm2rUa5sOMUAJoXomCid9LkZB5B3PTWuu29ZCCGxoUeJ5XZCG6nY1qxLBCDjo1VT9IO7lIEuYiFBtKS0lKn5hrJTR1TAjR6RKM6ukDtB4V346N8P4QO4wzb19tk5qzeExQZD'}, function (res) {
        if (!res || res.error) {
            winston.log('debug', !res ? 'error occurred' : res.error);
            return;
        }
        winston.log('info', res);
    });
});

// dozen science
// FB.setAccessToken('EAAOO3uYHbTYBAKfLemVTWzTJ7giR3iSAhG89PoCSbjIfr7KZCk2sapBO8ZAzG5kXZAxCCzKSwUZAn942NlNX0tTGgaYbZC5NDbuAnGI9o0tgLZB4QpQp9xNHOz6pj5uLMogY6qFxvGZCXOjVvazXUO8sJzuZB9WWOEUZD');
winston.log('info', 'posting to science facebook');
Article.getRandomByCategory('science', function (err, article) {
    if (err) {
        winston.log('debug', err);
        return;
    }
    FB.api('847502542045293/feed', 'post', {message: body, link: link + "/" + article.id ,access_token: 'EAAOO3uYHbTYBAKfLemVTWzTJ7giR3iSAhG89PoCSbjIfr7KZCk2sapBO8ZAzG5kXZAxCCzKSwUZAn942NlNX0tTGgaYbZC5NDbuAnGI9o0tgLZB4QpQp9xNHOz6pj5uLMogY6qFxvGZCXOjVvazXUO8sJzuZB9WWOEUZD'}, function (res) {
        if (!res || res.error) {
            winston.log('debug', !res ? 'error occurred' : res.error);
            return;
        }
        winston.log('info', res);
    });
});

//dozen celebs
FB.setAccessToken('EAAOO3uYHbTYBAAfC8kXaYGXCj5RNmC2ZA38ysMaR1F1nvm0yGjIgkr2F3ZCc2rJuXLKWHbdvzq0SpSg56Ix9piXTkmO2LBnEsqkBhTqNfiygI924MxrgH9IF4DA8IIBwY6dtq33TWvyrbwf8p0PHO3ZCM10JXAZD');
winston.log('info', 'posting to celebs facebook');
Article.getRandomByCategory('celebrity_2', function (err, article) {
    if (err) {
        winston.log('debug', err);
        return;
    }
    FB.api('1787238558178893/feed', 'post', {message: body, link: link + "/" + article.id ,access_token: 'EAAOO3uYHbTYBAAfC8kXaYGXCj5RNmC2ZA38ysMaR1F1nvm0yGjIgkr2F3ZCc2rJuXLKWHbdvzq0SpSg56Ix9piXTkmO2LBnEsqkBhTqNfiygI924MxrgH9IF4DA8IIBwY6dtq33TWvyrbwf8p0PHO3ZCM10JXAZD'}, function (res) {
        if (!res || res.error) {
            winston.log('debug', !res ? 'error occurred' : res.error);
            return;
        }
        winston.log('info', res);
    });
});



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
