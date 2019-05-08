// The map is more useful to use inside the ConsoleModule so this function acts as a quick passthrough for the google api
function initMapPassThrough() {
    angular.element(document.getElementById("body")).scope().initMap()
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

    var map;
    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -40.62, lng: 174.73},
            zoom: 5
        });
        map.addListener('click', function(e) {
            $http({
                method: "GET",
                url: '/api/v1/getWeather?lat=' + e.latLng.lat + "&lon=" + e.latLng.lng
            }).then(parseResponse);
        });
    }

    var markers = [null, null, null, null]
    function parseResponse(response) {
        if (response.data.msg == "Failed") {
            return;
        }

        switch(which) {
        case 1: {
            $scope.city1Weather = response.data.weather;
            break;
        } case 2: {
            $scope.city2Weather = response.data.weather;
            break;
        } case 3: {
            $scope.city3Weather = response.data.weather;
            break;
        } case 4: {
            $scope.city4Weather = response.data.weather;
        }}

        if (markers[which - 1] != null) {
            markers[which - 1].setMap(null);
        }
        markers[which - 1] = new google.maps.Marker({
            position: {lat: response.data.coord.lat, lng: response.data.coord.lon},
            map: map,
            title: response.data.city
        });
    }

    $scope.city = function(which) {

        var data = "";
        switch(which) {
        case 1: {
            data = $scope.city1m;
            break;
        } case 2: {
            data = $scope.city2m;
            break;
        } case 3: {
            data = $scope.city3m;
            break;
        } case 4: {
            data = $scope.city4m;
            break;
        }}

        if (data.length == 0) {
            return;
        }

        $http({
            method: "GET",
            url: '/api/v1/getWeather?city=' + data
        }).then(parseResponse);
    };

}]);
