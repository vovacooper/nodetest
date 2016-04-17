/**
 * Created by vovacooper on 21/03/2016.
 */


var FB = require('fb');



var FB = require('fb');
FB.setAccessToken('CAACEdEose0cBAJndye5ntcPZAgmqTqab5sIwXNWGnZCZAKCgtcqvUadevPTZAQwiLu2vHCQtVsQtpOCFXVafX5NcGesJqzFsBaNckhqG4fWpXZBZAjDAfYIFCKyizL4GSQaO1TxqmwYBvhh1gygkZCD06n956MaIXUzI8BaaNfPdsOza3SGQ6ZC2KWUgD2QtElORV1eZABPLp7kxkC0oSb92Y');

var link = 'vovacooper.github.io/testwebpage1'

FB.api('me/groups', 'get', function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    var body = 'WOW :)';
    res.data.map(function(group){
        FB.api( group.id +'/feed', 'post', { message: body , link: link}, function (res) {
            if (!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
            }
            console.log("ok :)");
        })
    });
    console.log("Done");
});
