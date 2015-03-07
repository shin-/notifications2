var express = require('express');
var router = express.Router();
var models = require('../models');

router.get('/', function(req, res, next) {
  models.Event.all().then(function(events) {
      res.send({
        events: events.map(function(e) {
          return e.name;
        })
      });
  });
});

module.exports = router;
