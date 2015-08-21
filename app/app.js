'use strict';

angular.module('niceHashManager', ['ngRoute','ui.bootstrap'])

    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'views/main.html',
                    controller: 'mainCtrl'
                }).
                otherwise({
                    redirectTo: '/'
                });
        }])

    .run(function($rootScope) {

    });
