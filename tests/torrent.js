var tp = require('torrent-project-api')

tp.search('friends s01e01', function (err, result) {
    if (err) return console.error(err)

    console.log('Found ' + result.torrents.length + ' torrents out of ' + result.total + ' results.')

    console.log('The top result was: ' + result.torrents[0].title)

    tp.magnet(result.torrents[0], function (err, link) {
        if (err) return console.error(err)
        console.log('Here is a magnet link for it:')
        console.log(link)
    })
})


