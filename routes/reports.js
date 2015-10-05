var express = require('express');
var router = express.Router();
var async = require('async');
var AWS = require('aws-sdk');
var express = require('express');
var _ = require('lodash');
var proxy = require('proxy-agent');
var https_proxy = require("https-proxy-agent");



if (process.env.HTTP_PROXY) {
    AWS.config.update({
        httpOptions: {agent: https_proxy(process.env.HTTPS_PROXY)}
    });
}

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

var templatePath = require.resolve('../views/jade/index.jade');
router.get('/', function(req, res){
     res.render(templatePath, {settings: expressApp.locals.sentiasettings});
});

router.get('/vpcs', function(req, res) {
    collect_regions("describeVpcs", {}, function(err, data) {
        if (err) return console.error(err);
        res.json(data);
    });
});

router.get('/external_ips', function(req, res) {
    collect_regions("describeAddresses", {}, function(err, data) {
        if (err) return console.error(err);
        res.json(data);
    });
});

router.get('/instances', function(req, res) {
    collect_regions("describeInstances", {}, function(err, data) {
        if (err) return console.error(err);
        res.json(data);
    });
});

router.get('/instances/:inst_ids', function(req, res) {
    collect_regions("describeInstances", {InstanceIds: req.params.inst_ids.split(',')}, function(err, data) {
        if (err) return console.error(err);
        res.json(data);
    });
});

router.get('/security_groups', function(req, res) {
    collect_regions("describeSecurityGroups", {}, function(err, data) {
        if (err) return console.error(err);
        res.json(data);
    });
});

router.get('/security_groups/:group_id', function(req, res) {
    collect_regions("describeSecurityGroups", {GroupIds: [req.params.group_id]}, function(err, data) {
        if (err) return console.error(err);
        res.json(data);
    });
});

router.get('/subnets', function(req, res) {
    collect_regions("describeSubnets", {}, function(err, data) {
        if (err) return console.error(err);
        res.json(data);
    });
});

module.exports.init = init;
module.exports.router = router;
function collect_regions(action, params, callback) {
    async.map(expressApp.locals.sentiasettings.regions, function(region, cb) {
        var ec2 = new AWS.EC2({
            region: region,
            apiVersion: expressApp.locals.sentiasettings.apiVersion
        });
        ec2[action](params, function(err, data) {
            if (err) {
                if (err.code && err.code.split('.')[1] === 'NotFound') {
                    // if "not found" error, simply return empty
                    return cb(null, {Region: region});
                } else {
                    return cb(err);
                }
            }
            data.Region = region;
            cb(null, data);
        });
    }, callback);
}
