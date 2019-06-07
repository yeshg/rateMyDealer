var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// For MongoDB
var monk = require('monk');
var db = monk('localhost:27017/ratemydealer');

// create index and user routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// instantiate express, assign app variable to it
var app = express();

// view engine setup (where to find views)
app.set('views', path.join(__dirname, 'views'));  // serve views from /views/
app.set('view engine', 'ejs');                    // use EJS engine to render views

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // serve static objects from /public/

// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  next();
});

// requests to http://localhost:3000/<arg1> should route to <arg2>
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
