
(function () {
    'use strict';
    var requireHelper = require('./requireHelper');
    var apiv1 = requireHelper.require('tests/coverage/instrumented/routes/apiv1');
    var assert = require('chai').assert;
    var sinon = require('sinon');

    // create mock request and response
    var reqMock = {};

    var resMock = {};
    resMock.status = function() {
        return this;
    };
    resMock.send = function() {
        return this;
    };
    resMock.end = function() {
        return this;
    };
    sinon.spy(resMock, "status");
    sinon.spy(resMock, "send");

    describe('Get Weather', function() {
        it('without city', function() {
            reqMock = {query: {}};
            apiv1.getWeather(reqMock, resMock);
            assert(resMock.status.lastCall.calledWith(400), 'Unexpected status code:' + resMock.status.lastCall.args);
        });
        it('with valid city and error from request call', function() {
            reqMock = {query: {
                city: "auckland"
            }};

            var request = function( obj, callback ){
                callback("error", null, null);
            };
            apiv1.__set__("request", request);
            apiv1.getWeather(reqMock, resMock);

            assert(resMock.status.lastCall.calledWith(400), 'Unexpected response: ' + resMock.status.lastCall.args);
            assert(resMock.send.lastCall.calledWith('Failed to get the data'), 'Unexpected response: ' + resMock.send.lastCall.args);
        });
        it('with incomplete city name', function() {
            reqMock = {query: {
                city: "wellingto"
            }};

            var request = function( obj, callback ){
                callback(null, null, {});
            };
            apiv1.__set__("request", request);
            apiv1.getWeather(reqMock, resMock);

            assert(resMock.status.lastCall.calledWith(400), 'Unexpected response: ' + resMock.status.lastCall.args);
            assert(resMock.send.lastCall.args[0].msg === 'Failed', 'Unexpected response: ' + resMock.send.lastCall.args);
        });
        it('with valid city', function() {
            reqMock = {query: {
                city: "El Paso"
            }};
            var body = {
                cod: 200,
                name: 'El Paso',
                weather: [{
                    main: 'cold'
                }],
                main: {
                    temp: 11
                }
            };

            var request = function( obj, callback ){
                callback(null, null, body);
            };
            apiv1.__set__("request", request);
            apiv1.getWeather(reqMock, resMock);

            assert(resMock.status.lastCall.calledWith(200), 'Unexpected response: ' + resMock.status.lastCall.args);
            assert(resMock.send.lastCall.args[0].city === 'El Paso', 'Unexpected response: ' + resMock.send.lastCall.args[0].city);
            assert(resMock.send.lastCall.args[0].weather === 'Conditions are cold and temperature is 11 C', 'Unexpected response: ' + resMock.send.lastCall.args[0].weather);
        });
        it('with valid lat lon', function() {
            reqMock = {
                query: {
                    lat: -35,
                    lon: 174
                }
            };
            var body = {
                cod: 200,
                name: 'Kaeo',
                weather: [{
                    main: 'Rain'
                }],
                main: {
                    temp: 16
                }
            };

            var request = function( obj, callback ){
                callback(null, null, body);
            };
            apiv1.__set__("request", request);
            apiv1.getWeather(reqMock, resMock);

            assert(resMock.status.lastCall.calledWith(200), 'Unexpected response: ' + resMock.status.lastCall.args);
            assert(resMock.send.lastCall.args[0].city === 'Kaeo', 'Unexpected response: ' + resMock.send.lastCall.args[0].city);
            assert(resMock.send.lastCall.args[0].weather === 'Conditions are Rain and temperature is 16 C', 'Unexpected response: ' + resMock.send.lastCall.args[0].weather);
        });
        it('with just lat', function() {
            reqMock = {query: {
                lat: -35
            }};

            var request = function( obj, callback ){
                callback(null, null, {});
            };
            apiv1.__set__("request", request);
            apiv1.getWeather(reqMock, resMock);

            assert(resMock.status.lastCall.calledWith(400), 'Unexpected response: ' + resMock.status.lastCall.args);
            assert(resMock.send.lastCall.args[0].msg === 'Longitude missing', 'Unexpected response: ' + resMock.send.lastCall.args);
        });
        it('with just lon', function() {
            reqMock = {query: {
                lon: 174
            }};

            var request = function( obj, callback ){
                callback(null, null, {});
            };
            apiv1.__set__("request", request);
            apiv1.getWeather(reqMock, resMock);

            assert(resMock.status.lastCall.calledWith(400), 'Unexpected response: ' + resMock.status.lastCall.args);
            assert(resMock.send.lastCall.args[0].msg === 'Latitude missing', 'Unexpected response: ' + resMock.send.lastCall.args);
        });
        it('with no paramaters', function() {
            reqMock = {query: {}};

            var request = function( obj, callback ){
                callback(null, null, {});
            };
            apiv1.__set__("request", request);
            apiv1.getWeather(reqMock, resMock);

            assert(resMock.status.lastCall.calledWith(400), 'Unexpected response: ' + resMock.status.lastCall.args);
            assert(resMock.send.lastCall.args[0].msg === 'No required parameters present', 'Unexpected response: ' + resMock.send.lastCall.args);
        });
    });
}());
