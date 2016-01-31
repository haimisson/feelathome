module.exports = function (app) {

    var SensorValue = require('./model/sensorValueModel').SensorValue;

    // api routes ===========================================================
    app.post('/SensorValue', function (req, res) {
        var sensorValue = new SensorValue(req.body);
        sensorValue.save();
        res.json("ok");
    });

    app.get('/LatestSensorValue', function(req, res) {
        SensorValue.find().limit(1).sort({$natural: -1}).exec(function(err, sensorValue) {
            res.send(sensorValue);
        });
    });

    app.get('/SensorValues', function(req, res) {
        SensorValue.find({"timestamp": {"$gte": new Date(req.query.fromDate), "$lte": new Date(req.query.toDate)}}, function(err, sensorValues) {
            res.send(sensorValues);
        });
    });

    // frontend routes =========================================================
    app.get('/', function (req, res) {
        res.sendfile('./dashboard/public/views/index.html');
    });

};