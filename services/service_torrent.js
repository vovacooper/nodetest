var request = require('request');
var zlib = require('zlib');
var tp = require('torrent-project-api')

var options = {
    url: 'https://torrentproject.se/hourlydump.txt.gz',
    headers: {
        'X-some-headers'  : 'Some headers',
        'Accept-Encoding' : 'null',
    },
    encoding: null
};

request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {

        //var encoding = response.headers['content-type']
        //if (encoding && encoding.indexOf('gzip') >= 0) {
            zlib.gunzip(body, function(ss, dezipped) {
                var text = dezipped.toString();
                var lines = text.split("\n");

                lines.forEach (function(line){
                    var parts = line.split("|");
                    var torrent = {
                        hash:parts[0],
                        title:parts[1],
                        category:parts[2],
                        seeds: 0,
                        leechs: 0,
                        size: 0,
                        link_:parts[3],
                        torrent_link:parts[4]
                    }

                    tp.magnet(torrent, function (err, link) {
                        torrent.magnet_link = link;
                        console.log(link)
                    });
                    tp.trackers(torrent, function (err, trackers) {
                        torrent.trackers = trackers;
                        console.log(trackers)
                    })
                    tp.peers(torrent.hash, function (err, peers) {
                        torrent.seeds = peers.seeds;
                        torrent.leechs = peers.leechs;
                        console.log(peers)
                    })

                    console.log(torrent.hash)
                });

                //console.log("dezipped:" + dezipped);

            });
        //}


        //body = body.split("\\n");

        //console.log(body[0]) // Show the HTML for the Google homepage.
    }
})