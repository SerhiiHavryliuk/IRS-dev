var express = require('express');
var router = express.Router();
var fs = require('fs');

function addRouter(path, params) {
    var link;

    //params.page.name = path;
    params.page = {};

    if (path === 'index') {
        link = '/';
    } else {
        link = '/' + path;
    }

    router.get(link, function(req, res, next) {
        res.render(path, params);
    });
}

fs.readFile('pages.json', function (err, data) {
    var json,
        item;

    if (err) {
        throw err;
    }

    json = JSON.parse(data);

    for (item in json) {

        if (json.hasOwnProperty(item)) {
            addRouter(item, json[item]);
        }

    }

});


module.exports = router;
