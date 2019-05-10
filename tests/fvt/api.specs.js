
(function () {

    'use strict';

    var apiv1 = require('../../routes/apiv1');
    var assert = require('chai').assert;
    var REQUEST = require('request');

    var request = REQUEST.defaults( {
        strictSSL: false
    });

    var appUrl = process.env.APP_URL;

    describe('Get Weather', function() {
        it('with valid city', function(done) {
            if(!appUrl) {
                assert.fail("Environment variable APP_URL is not defined");
                return done();
            }
            request({
                  method: 'GET',
                  url: appUrl + '/api/v1/getWeather?city=hamilton'
            }, function(err, resp, body) {
                if(err) {
                    assert.fail('Failed to get the response');
                } else {
                    assert.equal(resp.statusCode, 200);
                    var pbody = JSON.parse(body);
                    assert(pbody.coord.lat === -37.79, "City latitude was not returned correctly");
                    assert(pbody.coord.lon === 175.28, "City longitude was not returned correctly");
                    done();
                }
            });
        });

        it('without parameters', function(done) {
            if(!appUrl) {
                assert.fail("Environment variable APP_URL is not defined");
                return done();
            }
            request({
                method: 'GET',
                  url: appUrl + '/api/v1/getWeather'
            }, function(err, resp, body) {
                if(err) {
                    assert.fail('Failed to get the response');
                } else {
                    assert.equal(resp.statusCode, 400);
                    done();
                }
            });
        });

        it('with another valid city', function(done) {
            if(!appUrl) {
                assert.fail("Environment variable APP_URL is not defined");
                return done();
            }
            request({
                method: 'GET',
                  url: appUrl + '/api/v1/getWeather?city=auckland'
            }, function(err, resp, body) {
                if(err) {
                    assert.fail('Failed to get the response');
                } else {
                    assert.equal(resp.statusCode, 200);
                    var pbody = JSON.parse(body);
                    assert(pbody.coord.lat === -36.85, "City latitude was not returned correctly");
                    assert(pbody.coord.lon === 174.77, "City longitude was not returned correctly");
                    done();
                }
            });
        });

        it('with latitude and longitude', function(done) {
            if(!appUrl) {
                assert.fail("Environment variable APP_URL is not defined");
                return done();
            }
            request({
                method: 'GET',
                  url: appUrl + '/api/v1/getWeather?lat=-36.5&lon=175.5'
            }, function(err, resp, body) {
                if(err) {
                    assert.fail('Failed to get the response');
                } else {
                    assert.equal(resp.statusCode, 200);
                    var pbody = JSON.parse(body);
                    assert(pbody.city === "Coromandel", "City name was not returned correctly");
                    done();
                }
            });
        });

        it('with just latitude', function(done) {
            if(!appUrl) {
                assert.fail("Environment variable APP_URL is not defined");
                return done();
            }
            request({
                method: 'GET',
                  url: appUrl + '/api/v1/getWeather?lat=-36.5'
            }, function(err, resp, body) {
                if(err) {
                    assert.fail('Failed to get the response');
                } else {
                    assert.equal(resp.statusCode, 400);
                    done();
                }
            });
        });

        it('with just longitude', function(done) {
            if(!appUrl) {
                assert.fail("Environment variable APP_URL is not defined");
                return done();
            }
            request({
                method: 'GET',
                  url: appUrl + '/api/v1/getWeather?lon=175.5'
            }, function(err, resp, body) {
                if(err) {
                    assert.fail('Failed to get the response');
                } else {
                    assert.equal(resp.statusCode, 400);
                    done();
                }
            });
        });

    });
})();
