// The map is more useful to use inside the ConsoleModule so this function acts as a quick passthrough for the google api
function initMap() {
    angular.element(document.getElementById("map")).scope().initMap();
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
    script.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAzJa1V-QaHdETwp3QMo1EOFS8ly5b0y6o&callback=initMap');
    script.setAttribute('type', 'text/javascript');
    document.getElementById('map').appendChild(script);

    cityNames = [
        $scope.city1m,
        $scope.city2m,
        $scope.city3m,
        $scope.city4m
    ];
    cityWeathers = [
        $scope.city1Weather,
        $scope.city2Weather,
        $scope.city3Weather,
        $scope.city4Weather
    ];
    function setWeather(response, index) {
        if (response.data.msg == "Failed") {
            return;
        }

        cityWeathers[index] = response.data.weather;

        if (markers[index] != null) {
            markers[index].setMap(null);
        }
        markers[index] = new google.maps.Marker({
            position: {lat: response.data.coord.lat, lng: response.data.coord.lon},
            map: map,
            title: response.data.city
        });
    }

    var markers = [null, null, null, null];
    var map = null;
    $scope.initMap = function() {

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

        // Pull the default data from out db2 database
        $http({
            method: "POST",
            url: "https://dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net/dbapi/v3/auth/tokens",
            // Not the best idea to put this out on github but I have no other way to get it into the app
            data: {"userid": "dwb30208", "password": "rd3xnf696ns-lh58"}
        }).then(function(response) {
            var auth_header = {"Authorisation": "Bearer " + response.data.token};
            $http({
                method: "POST",
                url: "https://dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net/dbapi/v3/sql_jobs",
                header: auth_header,
                data: {
                    "commands": "select * from dwb30208.data",
                    "limit": "4",
                    "separator": ";",
                    "stop_on_error": "no"
                }
            }).then(function(response) {
                $http({
                    method: "GET",
                    url: "https://dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net/dbapi/v3/sql_jobs/" + response.data.id,
                    header: auth_header
                }).then(function(response) {
                    // Get stored information
                    var rows = response.data.results.rows;
                    for (var i = 0; i < rows.length; i++) {
                        var name = rows[i][1];
                        var lat = rows[i][2];
                        var lon = rows[i][3];
                        var last = rows[i][4];

                        cityNames[i] = name;
                        cityWeathers[i] = last;

                        markers[i] = new google.maps.Marker({
                            position: {lat: lat, lng: lon},
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
            });
        });
    };

    $scope.city = function(which) {

        $http({
            method: "GET",
            url: '/api/v1/getWeather?city=' + cityNames[which - 1]
        }).then(function(response) {
            setWeather(response, which - 1);
        });
    };

}]);
