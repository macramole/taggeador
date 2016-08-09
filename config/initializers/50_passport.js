var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var userModel = require("../../app/models/user.js");

module.exports = function() {
	passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  passport.deserializeUser(function(id, done) {
    userModel.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy(
		function(username, password, done) {
			userModel.findOne({ user: username }, function(err, user) {
				if (err) { return done(err); }
				if ( !user ) {
					return done(null, false);
				}

				if ( !user.validPassword(password) ) {
					return done(null, false);
				}

				return done(null, user);
			});
		}
	));
};
