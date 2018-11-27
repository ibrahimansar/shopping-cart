var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');

require('./config/passport');  // No need for a variable here, because we are not going to use it. Just want to run the file by requiring


var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var userRoutes = require('./routes/user');

//var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://macismail:macismail@macismail-shard-00-00-xzraf.mongodb.net:27017,macismail-shard-00-01-xzraf.mongodb.net:27017,macismail-shard-00-02-xzraf.mongodb.net:27017/shopping"
  + "?authSource=admin&w=1";
// MongoClient.connect(uri, function(err, db) {
//    if(err)
//     console.log(err);
//    db.close();
// });

var dbOptions = {
    db: {native_parser: true},
    replset: {
      auto_reconnect:true,
      rs_name: 'macismail-shard-0',
      poolSize: 10,
      socketOptions: {
        keepAlive: 1000,
        connectTimeoutMS: 30000
      }
    },
    server: {
      poolSize: 5,
      socketOptions: {
        keepAlive: 1000,
        connectTimeoutMS: 30000
      }
    },
    mongos: {
      "ssl": true,
      "sslValidate": false
    }
  };

var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/shopping');
mongoose.connect(uri, dbOptions);





var app = express();
app.engine('.hbs', expressHbs({defaultLayout : 'layouts', extname : '.hbs'}));
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

app.use(logger('dev'));
// app.use(bodyParser.json);
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(validator());

app.use(cookieParser());
app.use(session({
  secret: 'mysupersecret',
  resave : false,
  saveUninitialized : false,
  store : new MongoStore({ mongooseConnection : mongoose.connection }), // Session Store - Same mongodb connection
  cookie : { maxAge : 10 * 60 * 1000 }
}));

// Session Store - Compatible session stores (connect-mongo)
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use('/user', userRoutes); // user first
app.use('/', routes); // then others

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
