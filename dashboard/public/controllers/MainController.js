angular.module('FeelAtHome', []).controller('MainController', function($scope, $http, $timeout) {

    $scope.sensors = ["Sensor 1", "Sensor 2", "Sensor 3"];
    $scope.alarmtypes = ["Fire", "Hot", "Cold", "Humidity"];
    $scope.timeBetweenRequests = [ 1, 3, 5, 10, 20, 50, 100];
    $scope.numberOfRequests = [ 1, 3, 5, 10];
    $scope.statusPercent = 0;
    $scope.requests = new Array();
    $scope.event = new Object();

    var counter = 0;

    $scope.postEvent = function() {

        counter = 0;
        $scope.statusPercent = 0;
        $scope.requests = new Array();
        $scope.$applyAsync;

        $('#statusModal').modal('toggle');

        $scope.event.sensor = $scope.sensorInput;
        $scope.event.alarmtype = $scope.alarmtypeInput;
        $scope.event.value = $scope.valueInput;
        $scope.event.timestamp =  new Date().toUTCString();

        var timeBetweenRequests = $scope.timeBetweenRequestsInput;

        sendRequest();
        setProgressBar(1/$scope.numberOfRequestsInput);
        $scope.$applyAsync;

        for(i=1; i<=($scope.numberOfRequestsInput-1); i++) {
            $timeout(function() { sendRequest() },(timeBetweenRequests * i *  1000));
        }
    }

    var sendRequest = function() {
        $http.post($scope.urlInput, $scope.event)
            .success(function(data, status) {
                console.log(data);

                if(counter <= $scope.numberOfRequestsInput-1) {
                    counter = counter + 1;
                }

                setProgressBar((counter/$scope.numberOfRequestsInput)*100);
                var request = new Object();
                request.requestCount = counter;
                request.statusCode = status;
                request.body = data;
                request.timestamp = new Date();

                $scope.requests.push(request);
                $scope.$applyAsync;
            })
            .error(function(data, status) {
                console.log('Error: ' + data);

                if(counter <= $scope.numberOfRequestsInput-1) {
                    counter = counter + 1;
                }

                setProgressBar((counter/$scope.numberOfRequestsInput)*100);
                var request = new Object();
                request.requestCount = counter;
                request.statusCode = status;
                request.body = data;
                request.timestamp = new Date();

                $scope.requests.push(request);
                $scope.$applyAsync;
            });
    }

    var setProgressBar = function(percentage) {
        $scope.statusPercent = percentage;
        document.getElementById("progress-bar").style.width = percentage + "%";
    }


});