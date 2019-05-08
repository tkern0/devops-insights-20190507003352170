
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

        $http({
            method: "GET",
            url: '/api/v1/getWeather?city=' + data
        }).then(function(response) {
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
        });
    };

}]);
