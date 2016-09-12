var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var multiparty = require('multiparty');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var paginate = require('express-paginate');
var fs = require('fs');
var app = express();
var routes = require('./routes');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
app.get('/sign_up',routes.sign_up);
app.post('/sign_up',routes.sign_up_post);
app.get('/list_test',routes.list_test);
app.post('/upload',routes.upload);
app.get('/upload',routes.upload);
app.get('/indexNew',routes.indexNew);
app.get('/', routes.index);
app.get('/login',routes.login);
app.post('/login',routes.login_post);
app.get('/logout',routes.logout);
app.post('/board_write',routes.board_write_post);
app.get('/board_write',routes.board_write);
app.get('/freeboard_list',routes.freeboard_list);
app.get('/freeboard_list_search',routes.freeboard_list_search);
app.get('/freeboard_post/:id',routes.freeboard_post);
app.get('/freeboard_post_psw/:id',routes.freeboard_post_psw);
app.post('/freeboard_post_psw/:id',routes.freeboard_post_psw_mp);
app.post('/freeboard_post_update/:id',routes.freeboard_post_update);
app.post('/freeboard_post_update_next/:id',routes.freeboard_post_update_next);
module.exports = app;
