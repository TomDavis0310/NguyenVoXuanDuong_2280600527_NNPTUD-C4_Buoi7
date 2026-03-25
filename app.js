var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const rateLimit = require('express-rate-limit');
let mongoose = require('mongoose');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

app.use('/', indexRouter);
app.use('/api/v1/users/login', authLimiter);
app.use('/api/v1/users/changepassword', authLimiter);
app.use('/api/v1/users', apiLimiter, require('./routes/users'));
app.use('/api/v1/products', apiLimiter, require('./routes/products'));
app.use('/api/v1/categories', apiLimiter, require('./routes/categories'));
app.use('/api/v1/roles', apiLimiter, require('./routes/roles'));
app.use('/api/v1/orders', apiLimiter, require('./routes/orders'));
app.use('/api/v1/upload', apiLimiter, require('./routes/upload'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/NNPTUD-C4-Buoi7');
mongoose.connection.on('connected', function () {
  console.log('connected');
});
mongoose.connection.on('disconnected', function () {
  console.log('disconnected');
});
mongoose.connection.on('disconnecting', function () {
  console.log('disconnecting');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
