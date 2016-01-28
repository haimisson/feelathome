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

    var tempGauge;

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
                    if(tempGauge == null) {
                        createGauge("temp", "Temperature", 0, 40);
                    }
                    $scope.latestSensorValue = data[0];
                    tempGauge.redraw($scope.latestSensorValue.tempIn);
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    }

    function createGauge(name, label, min, max)
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
        config.darkBlueZones = [{ from: config.min, to: config.min + range*0.1 }];
        config.lightBlueZones = [{ from: config.min + range*0.1, to: config.min + range*0.25 }];
        config.yellowZones = [{ from: config.min + range*0.75, to: config.min + range*0.9 }];
        config.redZones = [{ from: config.min + range*0.9, to: config.max }];

        tempGauge = new Gauge(name + "GaugeContainer", config);
        tempGauge.render();
    }

    function drawgraph() {
        // define dimensions of graph
        var m = [50, 50, 50, 50]; // margins
        var w = 1000 - m[1] - m[3]; // width
        var h = 400 - m[0] - m[2]; // height

        var data = $scope.data.slice();

        var x_dim_accessor = function(d) {return new Date(d.timestamp)};
        var y_dim_accessor = function(d) {return d.tempIn};

        var x_range;
        var y_range;

        x_range = [
            d3.min(data, x_dim_accessor),
            d3.max(data, x_dim_accessor)
        ];

        y_range = [
            //d3.min(data, y_dim_accessor),
            0,
            d3.max(data, y_dim_accessor)
        ];

        render(data);

        function render(data){

            // X scale will fit all values from data[] within pixels 0-w
            var x = d3.time.scale().domain(x_range).range([0, w]);
            // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
            var y = d3.scale.linear().domain(y_range).range([h, 0]);
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
                })

            // Add an SVG element with the desired dimensions and margin.
            d3.select("#graph").selectAll("svg").remove();
            var graph = d3.select("#graph").append("svg:svg")
                .attr("width", 1300)//w + m[1] + m[3])
                .attr("height", h + m[0] + m[2])
                .append("svg:g")
                .attr("transform", "translate(" + (150 + m[3]) + "," + m[0] + ")");

            // create xAxis
            var xAxis = d3.svg.axis().scale(x).tickSize(h+5).tickSubdivide(true).tickPadding(8).orient("bottom");

            var difference = Math.floor((x_range[1] - x_range[0]) / (1000*60*60*24));

            if(difference == 0) {
                xAxis.ticks(d3.time.minutes, 30).tickFormat(d3.time.format('%X'));
            }
            else if(difference > 0) {
                xAxis.ticks(d3.time.hours, 4).tickFormat(d3.time.format('%X'));
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
                .text("Value");

            graph.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate("+ (w/2) +",350)")  // centre below axis
                .text("Date");

            var focus = graph.append("svg:g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("circle")
                .attr("r", 4.5);

            focus.append("text")
                .attr("x", 9)
                .attr("dy", ".35em");

            graph.append("rect")
                .attr("class", "overlay")
                .attr("width", w)
                .attr("height", h)
                .on("mouseover", function() { focus.style("display", null); })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", mousemove);

            var bisectDate = d3.bisector(function(d) { return new Date(d.timestamp); }).left;
            var time = d3.time.format("%X");
            var date = d3.time.format("%x")

            function mousemove() {
                var x0 = x.invert(d3.mouse(this)[0]),
                    i = bisectDate(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i],
                    d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                focus.attr("transform", "translate(" + x(x_dim_accessor(d)) + "," + y(d.tempIn) + ")");
                focus.select("text").text(date(new Date(d.timestamp)) + " " + time(new Date(d.timestamp)) + ": " + d.tempIn);
            }

            // Add the line by appending an svg:path element with the data line we created above
            // do this AFTER the axes above so that the line is above the tick-lines
            graph.append("svg:path").attr("d", line(data));
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