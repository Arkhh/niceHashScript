angular.module('niceHashManager')
    .controller('mainCtrl', function ($rootScope, $scope,NiceHashAPI,$filter,$timeout) {


       $scope.infos = {
            apiKey: '983e61df-b8aa-4236-85c1-b47b574995ec',
            niceHashID: '19336',
            location: '0',
            algo: '3'
        };

        $scope.balance=0;



        var orderBy = $filter('orderBy');
        $scope.botRunning =false;
        $scope.maxHash={X11:0.35}; // max hash value for X11
        //$scope.maxHash={X11:0.1}; // Example if you want to change the value to 0.1
        $scope.minHash={X11:0.05}; // min hash value for X11

        $scope.algo_Association = [
            {
                name: "Scrypt",
                code: "0"
            },
            {
                name: "SHA256",
                code: "1"
            },
            {
                name: "ScryptNf",
                code: "2"
            },
            {
                name: "X11",
                code: "3"
            },
            {
                name: "X13",
                code: "4"
            },
            {
                name: "Keccak",
                code: "5"
            },
            {
                name: "X15",
                code: "6"
            },
            {
                name: "Nist5",
                code: "7"
            },
            {
                name: "NeoScrypt",
                code: "8"
            },
            {
                name: "Lyra2RE",
                code: "9"
            },
            {
                name: "WhirlpoolX",
                code: "10"
            },
            {
                name: "Qubit",
                code: "11"
            },
            {
                name: "Quark",
                code: "12"
            },
            {
                name: "Axiom",
                code: "13"
            },
            {
                name: "Lyra2REv2",
                code: "14"
            },
            {
                name: "Multi-Algorithm",
                code: "100"
            }
        ];

        function showAlgo (algo_id) {
            algo_id = algo_id.toString();
            var found = $filter('filter')($scope.algo_Association, {code: algo_id}, true);
            if (found.length) {
                return found[0].name;
            } else {
                return algo_id;
            }
        }

        function calcFilledPercent (currentSpeed, algo) {
            var percent = 0;

            //if(algo===3){ // TODO multi algo...
            if(algo!==undefined){

                if($scope.maxHash.X11<0.05||angular.isNumber($scope.maxHash.X11)===false)
                {
                    return 'Wrong Max Hash minimum is 0.05 GH/S    ';
                }
                else{
                    percent = ((currentSpeed/$scope.maxHash.X11)*100).toFixed(2);
                    return percent;
                }
            }

        }

        function refill(orderID,algo){

            NiceHashAPI.refillOrder($scope.infos,orderID,0.01,algo)
                .then(function (data) {
                    if(data.result.error === undefined){
                        console.log(data);
                            setTimeout(function() { return; },5000);
                    }
                    else{
                        console.log(data.result);
                        $scope.errors2.push('API Error Refill : '+data.result.error);
                    }
                });
        }



        $scope.processData = function () {

            if($scope.infos.algo.length>0&&$scope.infos.apiKey.length>0&&$scope.infos.niceHashID.length>0&&$scope.infos.location.length>0){



            NiceHashAPI.getOrders($scope.infos)
                .then(function (data) {

                    $scope.errors = [];
                    $scope.orders=[];
                    $scope.orders_unsorted=[];
                    if (data.result.error === undefined) {
                        if (data.result.orders.length > 0) {
                            $scope.orders_unsorted = (data.result.orders);
                            angular.forEach($scope.orders_unsorted, function(order) {
                                order.algoString= showAlgo(order.algo);
                                $scope.orders.push(order);
                                if(order.btc_avail<0.00025){
                                    refill(order.id,order.algo);
                                }
                            });
                            $scope.orders = orderBy($scope.orders, '+order.price');
                            console.log($scope.orders);
                            $scope.refreshPercentage();
                            getBalance();



                        }
                        else {
                            $scope.errors.push('Data is correct but no orders to show ( check API request in console )')
                            //$scope.botRunning=false;
                        }
                    }
                    else {
                        $scope.errors.push(data.result.error);
                    }
                }, function (message) {
                    if (message !== null) {
                        $scope.errors.push(message);
                    }
                    else {
                        $scope.errors.push('Error with the API request');
                        //$scope.botRunning=false;
                    }

                });
            }
            else
            {
                $scope.errors.push('One or many infos are missing please check the form');
            }

        };

        function botRoutine(){
            if($scope.botRunning===false){
                return;
            }
            $scope.errors2=[];
            var lowestFilledPrice=0;
            $scope.processData();
            lowestFilledPrice=getHighestFilledOrder();
            if(lowestFilledPrice>0){
                filterOrdersToEdit(lowestFilledPrice);
                if($scope.ordersToMaxSpeed.length>0)
                {
                    editOrders($scope.ordersToMaxSpeed, $scope.maxHash.X11);
                }

                if($scope.ordersToMinSpeed.length>0)
                {
                    editOrders($scope.ordersToMinSpeed,$scope.minHash.X11);
                }

            }
            else{
                editOrders($scope.orders, $scope.maxHash.X11); // No orders filled so price = 0 then we have to set all the orders to MAX hash
            }
            $scope.launchSpeedBot();



        }


        function getBalance(){
            NiceHashAPI.getBalance($scope.infos)
                .then(function (data) {
                    $scope.balance = data.result.balance_confirmed;
                },function(message){
                    console.log("Can't get balance : "+message);
                });

        }

        function getHighestFilledOrder(){
            var price = 0;
            //$scope.orders[0].filled='Filled'; //TEST
            //$scope.orders[1].filled='Filled'; //TEST
            //$scope.orders[2].filled='Filled'; //TEST

            angular.forEach($scope.orders, function(order) {
                if(order.filled==='Filled')
                {
                    price=order.price;
                }
            });
            //console.log(price);
            return price;

        }

        function filterOrdersToEdit(lowestFilledPrice){
            $scope.ordersToMaxSpeed = [];
            $scope.ordersToMinSpeed = [];
            //$scope.orders[0].limit_speed="0.35"; TEST
            //$scope.orders[1].limit_speed="0.35"; TEST
            //$scope.orders[2].limit_speed="0.35"; TEST
            angular.forEach($scope.orders, function(order) {
                if(order.price<=lowestFilledPrice)
                {
                    $scope.ordersToMaxSpeed.push({id:order.id,algo:order.algo,limit_speed:order.limit_speed});
                }

                if(order.price>lowestFilledPrice)
                {
                    $scope.ordersToMinSpeed.push({id:order.id,algo:order.algo,limit_speed:order.limit_speed});
                }
            });
        }


        function editOrders(orders, speed){
            $scope.errors2=[];
            /*
            if(orders[0].id!==undefined){
                if(speed===$scope.maxHash.X11){
                    if(orders[0].limit_speed==$scope.maxHash.X11){
                        orders.splice(0,1);
                        if(orders.length>0) {
                            editOrders(orders, speed);
                        }
                    }
                }
                if(speed===$scope.minHash.X11){
                    if(orders[0].limit_speed==$scope.minHash.X11){
                        orders.splice(0,1);
                        if(orders.length>0) {
                            editOrders(orders, speed);
                        }
                    }
                }*/

                //console.log('API call : ' + 'Order ID '+orders[0].id + ' Speed '+speed + ' ALGO: '+orders[0].algo);

                    NiceHashAPI.updateSpeed($scope.infos,orders[0].id,speed,orders[0].algo)
                        .then(function (data) {
                            if(data.result.error === undefined){
                                //console.log(data);
                                orders.splice(0,1);
                                if(orders.length>0)
                                {
                                    setTimeout(function() { editOrders(orders,speed); },5000);
                                }
                            }
                            else{
                                $scope.errors2.push(orders[0].id + ' Order update returned an API Error: '+data.result.error);
                                orders.splice(0,1);
                                if(orders.length>0)
                                {
                                    setTimeout(function() { editOrders(orders,speed); },5000);
                                }
                            }
                    });

            return;
        }



        $scope.launchSpeedBot = function () {
            $scope.botRunning=true;

                if($scope.botRunning===true){
                    $timeout(botRoutine, 35000);
                }
                else{
                    return ;
                }
            };



        $scope.stopSpeedBot = function () {
            $scope.botRunning=false;

        };

        $scope.refreshPercentage = function (){

            angular.forEach($scope.orders, function(order) {
                order.percentFilled = calcFilledPercent(order.accepted_speed,order.algo);
                if(order.percentFilled>40){
                    order.filled='Filled';
                }
                else{
                    order.filled='Not Filled';
                }
            });


        }

    });