var express = require('express');
var router = express.Router();
var models = require('../models');

router.get('/', function(req, res, next) {
  res.send({
    version: '1.0'
  });
});

module.exports = router;
