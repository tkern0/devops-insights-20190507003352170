
var express = require('express');
var router = express.Router();
var REQUEST = require('request');

var request = REQUEST.defaults( {
    strictSSL: false
});

var OPENWEATHERURL = "http://api.openweathermap.org/data/2.5/weather?appid=6b7b471967dd0851d0010cdecf28f829&units=metric";

exports.getWeather = function(req, res) {
    var city = req.query.city;
    var lat = req.query.lat;
    var lon = req.query.lon;

    var aurl;
    // Prefer using city when possible
    if ((city === null) || (typeof(city) === 'undefined')) {
        var noLat = (lat === null) || (typeof(lat) === 'undefined');
        var noLon = (lon === null) || (typeof(lon) === 'undefined');
        if (noLat && noLon) {
            return res.status(400).send('no required paramaters present');
        } else if (noLat) {
            return res.status(400).send('longitude missing');
        } else if (noLon) {
            return res.status(400).send('latitude missing');
        }
        aurl = OPENWEATHERURL + '&lat=' + lat + '&lon=' + lon;
    } else {
        aurl = OPENWEATHERURL + '&q=' + city + ',nz';
    }

    request({
    method: 'GET',
        url: aurl,
          json: true
    }, function(err, resp, body) {
        if(err) {
            res.status(400).send('Failed to get the data');
        } else {
            if(body.cod === 200) {
                var weath = "Conditions are " + body.weather[0].main + " and temperature is " + body.main.temp + ' C';
                var response = {
                    city: body.name,
                    weather: weath,
                    coord: body.coord
                };
                return res.status(200).send(response);
            } else {
                return res.status(400).send({msg:'Failed'});
            }
        }
    });
};
router.get('/getWeather', exports.getWeather);

exports.router = router;
