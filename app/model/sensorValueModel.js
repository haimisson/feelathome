'use strict';

var mongoose = require('mongoose');
var SchemaTypes = mongoose.Schema.Types,
    Schema = mongoose.Schema;

var SensorValueSchema = new Schema({
        timestamp: {type: SchemaTypes.Date},
        tempIn: {type: SchemaTypes.String},
        tempOut: {type: SchemaTypes.String},
        airQ: {type: SchemaTypes.String},
        icon: {type: SchemaTypes.String}
    },
    // mongoose adds an s at the end of the collection name
    // to force it using another collection specify here
    { collection: 'sensorvalues'} );

var sensorValue = mongoose.model('sensorvalues', SensorValueSchema);

module.exports = {
    SensorValue: sensorValue
};