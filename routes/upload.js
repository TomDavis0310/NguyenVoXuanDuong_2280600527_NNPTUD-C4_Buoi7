var express = require('express');
var router = express.Router();
const upload = require('../utils/uploadHandler');

// Upload a single image
router.post('/single', upload.single('image'), function (req, res, next) {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  res.send({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});

// Upload multiple images (up to 10)
router.post('/multiple', upload.array('images', 10), function (req, res, next) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: 'No files uploaded' });
  }
  let urls = req.files.map((f) => `/uploads/${f.filename}`);
  res.send({
    message: 'Files uploaded successfully',
    count: req.files.length,
    urls,
  });
});

module.exports = router;
