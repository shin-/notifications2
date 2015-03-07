var express = require('express');
var router = express.Router();

var models = require('../models');
var workers = require('../workers');

function load_models(req, res, next) {
    models.Event.find({ where: { name: req.body.event }}).then(function(ev) {
        if (!ev) {
            return next(utils.apiError('Invalid event name', 400));
        }
        req.ev = ev;
        next();
    });
}

router.put('/', load_models, function(req, res, next) {
    models.Subscription.findAll({ where: { EventId: req.ev.id}}).then(
        function(subscriptions) {
            // console.log(subscriptions);
            workers.dispatch(subscriptions, req.ev, req.body);
            res.json('ok');
        }
    ).catch(next);
});

module.exports = router;