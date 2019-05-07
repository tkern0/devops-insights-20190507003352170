
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

    $scope.somemessage = "Some weather";
    $scope.city1Name = "";
    $scope.city1Weather = "";

    $scope.city = function(which) {

        var data = "";
        if(which === 1) {
            data = $scope.city1m;
        } else if(which === 2) {
            data = $scope.city2m;
        } else if(which === 3) {
            data = $scope.city3m;
        } else if(which === 4) {
            data = $scope.city4m;
        }

        if(data.length === 5) {
            $http({
                method: "GET",
                url: '/api/v1/getWeather?city=' + data
            }).then( function(response) {
                if(which === 1) {
                    $scope.city1Name = response.data.city;
                    $scope.city1Weather = response.data.weather;
                } else if(which === 2) {
                    $scope.city2Name = response.data.city;
                    $scope.city2Weather = response.data.weather;
                } else if(which === 3) {
                    $scope.city3Name = response.data.city;
                    $scope.city3Weather = response.data.weather;
                } else if(which === 4) {
                    $scope.city4Name = response.data.city;
                    $scope.city4Weather = response.data.weather;
                }
            });
        } else {
            if(which === 1) {
                    $scope.city1Name = "";
                    $scope.city1Weather = "";
                } else if(which === 2) {
                    $scope.city2Name = "";
                    $scope.city2Weather = "";
                } else if(which === 3) {
                    $scope.city3Name = "";
                    $scope.city3Weather = "";
                } else if(which === 4) {
                    $scope.city4Name = "";
                    $scope.city4Weather = "";
                }
        }
    };

}]);
