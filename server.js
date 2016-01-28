// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cors           = require('./cors');
var morgan         = require('morgan');
var mongoose       = require('mongoose');

// configuration ===========================================

// set port
var port = process.env.PORT || 8080;

// set CORS header
app.use(cors());

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// logging
app.use(morgan('dev'));

// mongoose ================================================
var database = {
    host: '127.0.0.1',
    port: 27017,
    db: 'feelathome',
    //username: '',
    //password: '',
    url : 'mongodb://<host>/<db>'
};
mongoose.connect('mongodb://' + database.host + '/' + database.db);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log("Connection with database succeeded.");
});

// routes ==================================================
require('./app/routes')(app); // configure routes

// start app ===============================================
// startup app at http://localhost:8080
app.listen(port);               

// shoutout to the user                     
console.log('port ' + port);

// expose app           
exports = module.exports = app;