//Public Published Sentia Application
var _ = require('underscore');
var express = require('express');
var hbs = require('hbs');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var settings = require("./settings.js");

var app = express();

var port = process.env.PORT || '3000';

//local settings
app.locals.sentiasettings = require('./settings');
app.locals.sentiasettings.clientSettings =  _.clone(app.locals.sentiasettings);

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

// routes
//pass local app variables to route
require('./routes/index').init(app);
app.use(app.locals.sentiasettings.baseUrl || '/', require('./routes/index').router);
app.use(app.locals.sentiasettings.baseUrl + '/api', require('./routes/api'));

//pass local app variables to route
require('./routes/reports').init(app);
app.use(app.locals.sentiasettings.baseUrl + '/reports', require('./routes/reports').router);
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
        error: {}
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



