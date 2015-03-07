var express = require('express');
var router = express.Router();
var services = require('../servicemgr');

router.get('/', function(req, res, next) {
    var data = {};
    Object.keys(services.services).forEach(function(key) {
        var service = services.get(key);
        data[service.name] = {
            display_name: service.display_name,
            metadata_endpoint: '/services/' + service.name
        };
    });
    res.send({ services : data });
});

router.param('service_name', function(req, res, next, id) {
    req.service = services.get(id);
    if (!req.service) {
        err = new Error('Invalid service name "' + id + '"');
        err.status = 404;
        return next(err);
    }
    next();
});

router.get('/:service_name', function(req, res, next) {
    res.send({
        'display_name': req.service.display_name,
        'subscription_data': req.service.subscription_data
    });
});

module.exports = router;
