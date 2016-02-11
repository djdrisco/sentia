//Internal Private Sentia Application which is implements security
var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var express = require('express');
var hbs = require('hbs');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

var port = process.env.PORT || '3000';

app.locals.sentiasettings = require('./securesettings');
app.locals.sentiasettings.clientSettings =  _.clone(app.locals.sentiasettings);
app.locals.sentiasettings.db = {};

MongoClient.connect('mongodb://' + app.locals.sentiasettings.mongodb.host + ':' + app.locals.sentiasettings.mongodb.port + '/' + app.locals.sentiasettings.dbs.auth, {safe: true}, function(err, db) {
    if (err) throw err;
    app.locals.sentiasettings.db.auth = db;
});

//trust reverse proxy nginx
app.set("trust proxy", true);
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.engine('jade', require('jade').__express);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(app.locals.sentiasettings.baseUrl, express.static(path.join(__dirname, 'dist/'), {redirect: ''}));  //grunt publishes static content from 'src' to 'dist' when all grunt task build is run

var blocks = {};

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

// Just use auth-check module with session setup - the session setup is done in auth-check
var authCheck = require('auth-check');
authCheck.init(app,'/login?login-required&referrer=');


// auth
app.use(function(req, res, next) {
    if (req.headers["x-authenticated-user"]) {
        req.session.auth = {user: req.headers["x-authenticated-user"]};
        // TODO: Lookup user details and cache them with a maxage
    }
    next();
});

// Force user to be logged-in for access, and ensure they have permissions for access
//using auth-check to do authentication verification, if not logged in redirects to login page
//auth-check is a re-usable module to verify that a user is logged in

app.use(authCheck.authenticationVerification);

// ensure user they have permissions for access
app.use(function(req, res, next) {
    var users = app.locals.sentiasettings.db.auth.collection('users');
    if(req.session && req.session.auth && req.session.auth.user) {
        users.find({
            user: req.session.auth.user,
            $or: [{permissions: 'sentia'}, {permissions: 'all'}]
        }).toArray(function (err, items) {
            if (items && items.length > 0) {
                return next();
            }
            res.writeHead(200, {'Content-type': 'text/plain'});
            res.end("Access denied.");
        });
    }
    else{
        res.writeHead(200, {'Content-type': 'text/plain'});
        res.end("Access denied.");
    }

});

// routes
//pass local app variables to route
require('./routes/index').init(app);
app.use(app.locals.sentiasettings.baseUrl || '/', require('./routes/index').router);
app.use(app.locals.sentiasettings.baseUrl + '/api', require('./routes/api'));

//pass local app variables to route
require('./routes/reports').init(app);
app.use(app.locals.sentiasettings.baseUrl + '/reports', require('./routes/reports').router);

// catch 404 and forward to error handlers
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        baseUrl: expressApp.locals.sentiasettings.clientSettings.baseUrl
    });
});
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
// handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

//for testing server routes
module.exports = {
    app: app
};



