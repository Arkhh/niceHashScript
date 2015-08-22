'use strict';

angular.module('niceHashManager')
    .service('NiceHashAPI', function ($q, requestBuilder) {



        var API_ENDPOINT = 'http://lasthop.ca:8080/https://www.nicehash.com/api?method=';



        function getOrders(infos){

            return requestBuilder.getRequestPromise({
                method: 'GET',
                url: API_ENDPOINT + 'orders.get&my=&id=' + infos.niceHashID + '&key=' + infos.apiKey + '&location=' + infos.location + '&algo=' + infos.algo
            });
        }

        function getBalance(infos){

            return requestBuilder.getRequestPromise({
                method: 'GET',
                url: API_ENDPOINT + 'balance&id=' + infos.niceHashID + '&key=' + infos.apiKey
            });
        }

        function updateSpeed(infos, orderId, speed,algo){
            return requestBuilder.getRequestPromise({
                method         : 'POST',
                url            : API_ENDPOINT + 'orders.set.limit&id='+infos.niceHashID+'&key='+infos.apiKey+'&location='+infos.location+'&algo='+algo+'&order='+orderId+'&limit='+speed
            });
        }

        function refillOrder(infos, orderId, amount,algo){
            return requestBuilder.getRequestPromise({
                method         : 'POST',
                url            : API_ENDPOINT + 'orders.refill&id='+infos.niceHashID+'&key='+infos.apiKey+'&location='+infos.location+'&algo='+algo+'&order='+orderId+'&amount='+amount
            });
        }




        return {
            "getOrders"            : getOrders,
            "updateSpeed"          : updateSpeed,
            "refillOrder"          : refillOrder,
            "getBalance"           : getBalance
        };

    });
