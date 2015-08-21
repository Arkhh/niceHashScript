'use strict';

angular.module('niceHashManager')
    .service('requestBuilder', function($http, $q ) {

        function getRequestPromise(request){

            console.log("API REQUEST FOR DEBUG PURPOSE : "+request.url);
            var deferred = $q.defer();


            $http(request)

                .success(function(data) {

                    deferred.resolve(data);

                }).error(function(message) {

                    deferred.reject(message);

                    });

            return deferred.promise;
        }

        return {
            'getRequestPromise' : getRequestPromise
        };

    });
