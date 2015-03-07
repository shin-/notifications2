var express = require('express');
var router = express.Router();

var models = require('../models');
var services = require('../servicemgr');
var utils = require('../utils');


function check_data(req, res, next) {
    if (!(req.body.event && req.body.service &&
          req.body.subscription_data && req.body.user)) {
        return next(utils.apiError('Invalid payload', 400));
    }

    req.service = req.body.service;
    req.sub_data = req.body.subscription_data;

    if (!services.exists(req.service)) {
        return next(utils.apiError('Invalid service name', 400));
    }
    next();
}

function load_models(req, res, next) {
    models.Event.find({ where: { name: req.body.event }}).then(function(ev) {
        if (!ev) {
            return next(utils.apiError('Invalid event name', 400));
        }
        req.ev = ev;
        models.User.find({ where: { uuid: req.body.user }}).then(function(u) {
            if (!u) {
                return next(utils.apiError('Invalid user ID', 400));
            }
            req.u = u;
            next();
        });
    });
}

router.param('sub_id', function(req, res, next, id) {
    models.Subscription.find(id).then(function(sub) {
        if (!sub) {
            return next(utils.apiError('No subscription for id ' + id, 404));
        }
        req.sub = sub;
        next();
    });
});

router.put('/', check_data, load_models, function(req, res, next) {
    services.subscribe(req.u, req.ev, req.service, req.sub_data,
        function(err, uuid) {
            if (err) {
                return next(utils.apiError(err, 400));
            }
            res.send({
                status: 'created',
                uuid: uuid
            });
        }
    );
});

router.get('/:sub_id', function(req, res, next) {
    res.send({
        uuid: req.sub.uuid,
        subscription_data: JSON.parse(req.sub.subscription_data)
    });
});

router.delete('/:sub_id', function(req, res, next) {
    req.sub.destroy().then(function() {
        res.send({ status: 'removed' });
    });
});

module.exports = router;
