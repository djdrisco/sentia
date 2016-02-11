var express = require('express');
var router = express.Router();

var expressApp = null;

var init = function(app){
    if(app===undefined){
        console.error('app undefined. app is required to use this module');
        process.exit(1);
    }
    else{
        expressApp = app;
    }
};

/* GET home page. */
//new
router.get('/', function(req, res) {
    res.render('homeindex', {title: 'Sentia - Enlightenment for your Environment',baseUrl: expressApp.locals.sentiasettings.clientSettings.baseUrl});
});

/* Software Discovery feature page (beta) */
//There is dependency here where each instance needs to have
//softwarediscovery python script installed , so it can determine
//what software is installed and store that in elastic search

router.get('/softwarediscovery', function(req, res) {
    res.render('index', { title: 'Sentia - Enlightenment for your Environment',baseUrl: expressApp.locals.sentiasettings.clientSettings.baseUrl });
});

router.get('/networkchart', function(req, res, next) {
    res.render('networkchartindex', { title: 'Sentia - Enlightenment for your Environment',baseUrl: expressApp.locals.sentiasettings.clientSettings.baseUrl });
});

module.exports.init = init;
module.exports.router = router;
