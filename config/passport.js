var passport = require('passport');
var User = require('../models/user');

var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
      done(err, user);
  });
});

passport.use('local.signup', new LocalStrategy({  // local.signup is a passport strategy
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},
function(req, email, password, done){

  req.checkBody('email', 'Invalid email').notEmpty().isEmail(); // Validator - validate email
  req.checkBody('password', 'Invalid password').notEmpty().isLength({min : 4}); // Validator - validate password
  var errors = req.validationErrors();  // Validator - errors

  if(errors){ // If there are any errors
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  };

  // Find User

  // User should not exist during sign up
  User.findOne({'email' : email}, function(err, user){
    if(err){  // Error
      return done(err);
    }
    if(user){ // No error, but email already exists
      return done(null, false, {message : 'Email is already in use.'});
    }

    // No error, email does not exist already, all good to go
    var newUser = new User();
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    newUser.save(function(err, result){
        if(err){
          return done(err);
        }
        return done(null, newUser);
    });
  });
}));


passport.use('local.signin', new LocalStrategy({  // local.signin is a passport strategy
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},
function(req, email, password, done){
  // Repeat validation
  req.checkBody('email', 'Invalid email').notEmpty().isEmail(); // Validator - validate email
  req.checkBody('password', 'Invalid password').notEmpty().isLength({min : 4}); // Validator - validate password
  var errors = req.validationErrors();  // Validator - errors

  if(errors){ // If there are any errors
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  };


  // Find User again - but reverse process

  // User should exist during sign in

  User.findOne({'email' : email}, function(err, user){
    if(err){  // Error
      return done(err);
    }
    if(!user){ // No error, email does not exist
      return done(null, false, {message : 'No user found'});
    }

    if(!user.validatePassword(password)){ // No error, email does not exist
      return done(null, false, {message : 'Invalid password'});
    }

    // No error, email exists already, all good to go
    return done(null, user);

  });

}));
