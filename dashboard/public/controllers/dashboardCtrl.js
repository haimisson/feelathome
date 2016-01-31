angular.module('FeelAtHome', ['ngMaterial','ngMaterial','ngMessages']).controller('dashboardCtrl', function($scope, $http, $timeout, $mdSidenav) {

    $scope.data = [];
    $scope.latestSensorValue = {};
    var newDate = new Date();
    $scope.fromDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 0,0,0,0);
    $scope.toDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 23,59,59,999);
    $scope.maxDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 23,59,59,999);
    $scope.minDate = new Date(2015, 0, 1, 0, 0, 0, 0);

    $scope.changeFromDate = function(newValue) {
        $scope.fromDate = new Date(newValue.getFullYear(), newValue.getMonth(), newValue.getDate(), 0,0,0,0);
        $scope.toDate = new Date(newValue.getFullYear(), newValue.getMonth(), newValue.getDate(), 23,59,59,999);
        getSensorValues($scope.fromDate, $scope.toDate);
    };

    $scope.changeToDate = function(newValue) {
        $scope.toDate = new Date(newValue.getFullYear(), newValue.getMonth(), newValue.getDate(), 23,59,59,999);
        getSensorValues($scope.fromDate, $scope.toDate);
    };

    var tempInGauge;
    var tempOutGauge;
    var airGauge;

    $scope.toggleLeft = buildDelayedToggler('left');

    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
        var timer;

        return function debounced() {
            var context = $scope,
                args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
            }, wait || 10);
        };
    }

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
        return debounce(function() {
            $mdSidenav(navID)
                .toggle();
        }, 200);
    }

    function buildToggler(navID) {
        return function() {
            $mdSidenav(navID)
                .toggle();
        }
    }

    function getSensorValues(fromDate, toDate) {

        $http.get('/SensorValues', { params: { 'fromDate': (new Date(fromDate)).toISOString(), 'toDate': (new Date(toDate)).toISOString() }})
            .success(function (data) {
                $scope.data = data;
                drawgraph();
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    }

    function getLatestSensorValue() {
        $http.get('/LatestSensorValue')
            .success(function(data) {
                if($scope.latestSensorValue.timestamp != data[0].timestamp) {
                    if(tempInGauge == null) {
                        createTempInGauge("tempIn", "Temp In", 0, 40);
                    }
                    if(tempOutGauge == null) {
                        createTempOutGauge("tempOut", "Temp Out", -20, 50);
                    }
                    if(airGauge == null) {
                        createAirGauge("air", "Air Quality", 50, 400);
                    }
                    $scope.latestSensorValue = data[0];
                    tempInGauge.redraw($scope.latestSensorValue.tempIn);
                    tempOutGauge.redraw($scope.latestSensorValue.tempOut);
                    airGauge.redraw($scope.latestSensorValue.airQ);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    }

    function createTempInGauge(name, label, min, max)
    {
        var config =
        {
            size: 200,
            label: label,
            min: undefined != min ? min : 0,
            max: undefined != max ? max : 100,
            minorTicks: 5
        }

        var range = config.max - config.min;
        config.darkBlueZones = [{ from: config.min, to: config.min + range*0.2 }];
        config.lightBlueZones = [{ from: config.min + range*0.2, to: config.min + range*0.35 }];
        config.yellowZones = [{ from: config.min + range*0.65, to: config.min + range*0.8 }];
        config.redZones = [{ from: config.min + range*0.8, to: config.max }];

        tempInGauge = new TempGauge(name + "GaugeContainer", config);
        tempInGauge.render();
    }

    function createTempOutGauge(name, label, min, max)
    {
        var config =
        {
            size: 200,
            label: label,
            min: undefined != min ? min : 0,
            max: undefined != max ? max : 100,
            minorTicks: 5
        }

        var range = config.max - config.min;
        config.darkBlueZones = [{ from: config.min, to: config.min + range*0.2 }];
        config.lightBlueZones = [{ from: config.min + range*0.2, to: config.min + range*0.35 }];
        config.yellowZones = [{ from: config.min + range*0.65, to: config.min + range*0.8 }];
        config.redZones = [{ from: config.min + range*0.8, to: config.max }];

        tempOutGauge = new TempGauge(name + "GaugeContainer", config);
        tempOutGauge.render();
    }

    function createAirGauge(name, label, min, max)
    {
        var config =
        {
            size: 200,
            label: label,
            min: undefined != min ? min : 0,
            max: undefined != max ? max : 100,
            minorTicks: 5
        }

        var range = config.max - config.min;
        config.greenZones = [{ from: config.min, to: 150}];
        config.yellowZones = [{ from: 150, to: 200 }];
        config.orangeZones = [{ from: 200, to: 300}];
        config.redZones = [{ from: 300, to: config.max }];

        airGauge = new AirGauge(name + "GaugeContainer", config);
        airGauge.render();
    }

    function drawgraph() {
        // define dimensions of graph
        var m = [50, 50, 50, 50]; // margins
        var w = 1000 - m[1] - m[3]; // width
        var h = 400 - m[0] - m[2]; // height

        var data = $scope.data.slice();

        var x_dim_accessor = function(d) {return new Date(d.timestamp)};
        var y_dim_accessor = function(d) {return parseInt(d.tempIn)};
        var y2_dim_accessor = function(d) {return parseInt(d.tempOut)};
        var y3_dim_accessor = function(d) {return parseInt(d.airQ)};

        var x_range;
        var y_range;
        var y2_range;

        x_range = [
            d3.min(data, x_dim_accessor),
            d3.max(data, x_dim_accessor)
        ];

        //y_range = [
        //    d3.min(data, y_dim_accessor),
        //    d3.max(data, y_dim_accessor)
        //];
        //
        //y_range_compute = [
        //    d3.min(data, y2_dim_accessor),
        //    d3.max(data, y2_dim_accessor)
        //];
        //
        //if(y_range[0] > y_range_compute[0]) {
        //    y_range[0] = y_range_compute[0];
        //}
        //if(y_range[1] < y_range_compute[1]) {
        //    y_range[1] = y_range_compute[1];
        //}

        y_range = [
            -20,
            50
        ]

        y2_range = [
            d3.min(data, y3_dim_accessor),
            d3.max(data, y3_dim_accessor)
        ];

        render(data);

        function render(data){

            // X scale will fit all values from data[] within pixels 0-w
            var x = d3.time.scale().domain(x_range).range([0, w]);
            // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
            var y = d3.scale.linear().domain(y_range).range([h, 0]);
            var y2 = d3.scale.linear().domain(y2_range).range([h, 0]);
            // automatically determining max range can work something like this
            // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

            // create a line function that can convert data[] into x and y points
            var line = d3.svg.line()
                // assign the X function to plot our line as we wish
                .x(function(d,i) {
                    return x(x_dim_accessor(d));
                })
                .y(function(d) {
                    return y(y_dim_accessor(d));
                });

            var line2 = d3.svg.line()
                .x(function(d,i) {
                    return x(x_dim_accessor(d));
                })
                .y(function(d) {
                    return y(y2_dim_accessor(d));
                });

            var line3 = d3.svg.line()
                .x(function(d,i) {
                    return x(x_dim_accessor(d));
                })
                .y(function(d) {
                    return y2(y3_dim_accessor(d));
                });

            // Add an SVG element with the desired dimensions and margin.
            d3.select("#graph").selectAll("svg").remove();
            var graph = d3.select("#graph").append("svg:svg")
                .attr("width", 1300)//w + m[1] + m[3])
                .attr("height", h + m[0] + m[2])
                .append("svg:g")
                .attr("transform", "translate(" + (150 + m[3]) + "," + m[0] + ")");

            // create xAxis
            var xAxis = d3.svg.axis().scale(x).tickSize(h+5).tickSubdivide(true).tickPadding(8).orient("bottom");

            var difference = Math.floor((x_range[1] - x_range[0]) / (1000*60*60));

            if(difference == 0) {
                xAxis.ticks(d3.time.seconds, 1).tickFormat(d3.time.format('%X'));
            }
            else if(difference <= 5) {
                xAxis.ticks(d3.time.minutes, 30).tickFormat(d3.time.format('%X'));
            }
            else if(difference <= 10) {
                xAxis.ticks(d3.time.hours, 1).tickFormat(d3.time.format('%X'));
            }
            else if(difference <= 20) {
                xAxis.ticks(d3.time.hours, 2).tickFormat(d3.time.format('%X'));
            }
            else if(difference <= 30) {
                xAxis.ticks(d3.time.hours, 5).tickFormat(d3.time.format('%d.%m %X'));
            }
            else if(difference <= 40) {
                xAxis.ticks(d3.time.hours, 8).tickFormat(d3.time.format('%d.%m %X'));
            }
            else if(difference <= 50) {
                xAxis.ticks(d3.time.hours, 10).tickFormat(d3.time.format('%d.%m %X'));
            }
            else if(difference <= 60) {
                xAxis.ticks(d3.time.hours, 12).tickFormat(d3.time.format('%d.%m %X'));
            }
            else if(difference > 60) {
                xAxis.ticks(d3.time.days, 1).tickFormat(d3.time.format('%x'));
            }

            // Add the x-axis.
            graph.append("svg:g")
                .attr("class", "x axis")
                .call(xAxis);

            // create left yAxis
            var yAxis = d3.svg.axis().scale(y).ticks(8).tickSize(-w - m[1]/2).orient("left").tickPadding(8);
            // Add the y-axis to the left
            var gy = graph.append("svg:g")
                .attr("class", "y axis")
                .attr("transform", "translate(-25,0)")
                .call(yAxis);

            gy.selectAll("g").filter(function(d) { return d; })
                .classed("minor", true);

            // create right yAxis
            var y2Axis = d3.svg.axis().scale(y2).orient("right");
            // Add the y-axis to the left
            var gy2 = graph.append("svg:g")
                .attr("class", "y axis")
                .attr("transform", "translate(900,0)")
                .call(y2Axis);

            gy2.selectAll("g").filter(function(d) { return d; })
                .classed("minor", true);

            // now rotate text on x axis
            // solution based on idea here: https://groups.google.com/forum/?fromgroups#!topic/d3-js/heOBPQF3sAY
            // first move the text left so no longer centered on the tick
            // then rotate up to get 45 degrees.
            //graph.selectAll(".x text")  // select all the text elements for the xaxis
            //    .attr("transform", function(d) {
            //        return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
            //    });

            // now add titles to the axes
            graph.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(-60,"+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .text("Temperature");

            graph.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(960,"+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .text("Air Quality");

            graph.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate("+ (w/2) +",350)")  // centre below axis
                .text("Date");

            // Add the line by appending an svg:path element with the data line we created above
            // do this AFTER the axes above so that the line is above the tick-lines
            graph.append("svg:path").attr("d", line(data)).style("stroke", "orange");
            graph.append("svg:path").attr("d", line2(data)).style("stroke", "blue");
            graph.append("svg:path").attr("d", line3(data)).style("stroke", "green");
        }
    }
    getSensorValues($scope.fromDate, $scope.toDate);
    getLatestSensorValue();
    setInterval(getLatestSensorValue, 5000);

})
    .controller('sidenavCtrl', function ($scope, $timeout, $mdSidenav) {
        $scope.close = function () {
            $mdSidenav('left').close();

        };
    })