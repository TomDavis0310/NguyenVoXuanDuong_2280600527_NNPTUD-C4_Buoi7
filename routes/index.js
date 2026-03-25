var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', { title: 'NNPTUD-C4 Buoi7' });
});

module.exports = router;
