// The map is more useful to use inside the ConsoleModule so this function acts as a quick passthrough for the google api
function init() {
    angular.element(document.getElementById("map")).scope().init();
}

var ConsoleModule = angular.module('ConsoleModule', ['ngRoute']);

ConsoleModule.config(['$routeProvider', '$locationProvider','$sceDelegateProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $sceDelegateProvider, $httpProvider) {
    $routeProvider.when('/', {
        templateUrl: '/partials/Bycity.html',
        controller: 'wcontroller',
        controllerAs: 'wcontroller'
    });
}]);

ConsoleModule.controller('wcontroller', ['$scope', '$http', '$routeParams', '$timeout', '$sce',
    function($scope, $http, $routeParams, $timeout, $sce) {

    // Kind of hacky cause it doesn't want to work manually putting it into the base document
    var script = document.createElement('script');
    script.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAzJa1V-QaHdETwp3QMo1EOFS8ly5b0y6o&callback=init');
    script.setAttribute('type', 'text/javascript');
    document.getElementById('map').appendChild(script);

    function setWeather(response, index) {
        if (response.data.msg == "Failed") {
            return;
        }

        city = response.data.city == "" ? "Unknown Location" : response.data.city;
        switch(index) {
        case 0: {
            $scope.city1m = city;
            $scope.city1Weather = response.data.weather;
            break;
        } case 1: {
            $scope.city2m = city;
            $scope.city2Weather = response.data.weather;
            break;
        } case 2: {
            $scope.city3m = city;
            $scope.city3Weather = response.data.weather;
            break;
        } case 3: {
            $scope.city4m = city;
            $scope.city4Weather = response.data.weather;
            break;
        }}

        if (markers[index] != null) {
            markers[index].setMap(null);
        }
        markers[index] = new google.maps.Marker({
            position: {lat: response.data.coord.lat, lng: response.data.coord.lon},
            map: map,
            title: response.data.city
        });

        // This data should already be sanitised by the openweathermap api
        runSQL(
            "update dwb30208.data set name = '" +
            city +
            "', lat = " +
            response.data.coord.lat +
            ", lon = " +
            response.data.coord.lon +
            ", last = '" +
            response.data.weather +
            "' where index = " +
            index
        );
    }

    /*
      Runs an SQL command on the d2 database and returns the results to the callback function
      For some reason $http doesn't want to work through the CORS proxy properly, so we have to
       use XMLHttpRequest()s instead
    */
    var base_url = "https://cors-anywhere.herokuapp.com/https://dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net/dbapi/v3";
    var auth = ""; // This gets set in $scope.init()
    function runSQL(command, callback) {
        var xhr_query = new XMLHttpRequest();
        xhr_query.open("POST", base_url + "/sql_jobs", true);
        xhr_query.setRequestHeader('Content-type', 'application/json');
        xhr_query.setRequestHeader('Authorization', auth);
        xhr_query.onload = function() {
            var xhr_result = new XMLHttpRequest();
            xhr_result.open("GET", base_url + "/sql_jobs/" + JSON.parse(xhr_query.responseText).id, true);
            xhr_result.setRequestHeader('Content-type', 'application/json');
            xhr_result.setRequestHeader('Authorization', auth);
            if (typeof callback == "function") {
                xhr_result.onload = function() {
                    callback(JSON.parse(xhr_result.responseText));
                };
            }
            xhr_result.onerror = function() {
                console.error("Error retrieving query results");
                console.error(xhr_result);
            };
            xhr_result.send();
        };
        xhr_query.onerror = function() {
            console.error("Error performing query");
            console.error(xhr_query);
        };
        xhr_query.send(JSON.stringify({
            "commands": command,
            "limit": "4",
            "separator": ";",
            "stop_on_error": "no"
        }));
    }

    var markers = [null, null, null, null];
    var map = null;
    $scope.init = function() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -40.62, lng: 174.73},
            zoom: 5
        });

        map.addListener('click', function(e) {
            $http({
                method: "GET",
                url: '/api/v1/getWeather?lat=' + e.latLng.lat() + "&lon=" + e.latLng.lng()
            }).then(function(response) {
                setWeather(response, 0);
            });
        });

        // Pull the default data from our db2 database
        var xhr_token = new XMLHttpRequest();
        xhr_token.open("POST", base_url + "/auth/tokens", true);
        xhr_token.setRequestHeader('Content-type', 'application/json');
        xhr_token.onload = function() {
            var res_token = JSON.parse(xhr_token.responseText);
            auth = "Bearer " + res_token.token;

            runSQL("select * from dwb30208.data", function(data) {
                // Get stored information
                var rows = data.results[0].rows;
                for (var i = 0; i < rows.length; i++) {
                    var name = rows[i][1];
                    var lat = rows[i][2];
                    var lon = rows[i][3];
                    var last = rows[i][4];

                    switch(i) {
                    case 0: {
                        $scope.city1m = name;
                        $scope.city1Weather = last;
                        break;
                    } case 1: {
                        $scope.city2m = name;
                        $scope.city2Weather = last;
                        break;
                    } case 2: {
                        $scope.city3m = name;
                        $scope.city3Weather = last;
                        break;
                    } case 3: {
                        $scope.city4m = name;
                        $scope.city4Weather = last;
                        break;
                    }}

                    // For testing, this function should only be called once so this should never go through
                    if (markers[i] != null) {
                        markers[i].setMap(null);
                    }
                    markers[i] = new google.maps.Marker({
                        position: {lat: Number(lat), lng: Number(lon)},
                        map: map,
                        title: name
                    });
                }

                /*
                  Update information
                  Can't put this in a loop cause it uses promises
                */
                $http({
                    method: "GET",
                    url: '/api/v1/getWeather?lat=' + rows[0][2] + "&lon=" + rows[0][3]
                }).then(function(response) {
                    setWeather(response, 0);
                });
                $http({
                    method: "GET",
                    url: '/api/v1/getWeather?lat=' + rows[1][2] + "&lon=" + rows[1][3]
                }).then(function(response) {
                    setWeather(response, 1);
                });
                $http({
                    method: "GET",
                    url: '/api/v1/getWeather?lat=' + rows[2][2] + "&lon=" + rows[2][3]
                }).then(function(response) {
                    setWeather(response, 2);
                });
                $http({
                    method: "GET",
                    url: '/api/v1/getWeather?lat=' + rows[3][2] + "&lon=" + rows[3][3]
                }).then(function(response) {
                    setWeather(response, 3);
                });
            });
        };
        // Not the best idea to put this out on github but I have no other way to get it into the app
        xhr_token.send(JSON.stringify({
            "userid": "dwb30208",
            "password": "rd3xnf696ns-lh58"
        }));
    };

    $scope.city = function(which) {
        var name = "";
        switch(which) {
        case 1: {
            name = $scope.city1m;
            break;
        } case 2: {
            name = $scope.city2m;
            break;
        } case 3: {
            name = $scope.city3m;
            break;
        } case 4: {
            name = $scope.city4m;
            break;
        }}

        if (name.length == 0) {
            return;
        }

        $http({
            method: "GET",
            url: '/api/v1/getWeather?city=' + name
        }).then(function(response) {
            setWeather(response, which - 1);
        });
    };

}]);
