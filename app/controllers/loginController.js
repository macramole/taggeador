var locomotive = require('locomotive')
  , Controller = locomotive.Controller;
	
var passport = require('passport');
var ensureLogin = require('connect-ensure-login');
var loginController = new Controller();

loginController.before('show', ensureLogin.ensureLoggedOut('/list'));

loginController.show = function() {
	this.isLoginPage = true;
	this.render();
};

loginController.before('login', passport.authenticate('local'));

loginController.login = function() {
	if ( this.req.isAuthenticated() ) {
		this.res.send({ status : "success", goto : "/list" });
	} else {
		this.res.send({ status : "fail" });
	}
};

loginController.logout = function() {
	this.req.logout();
	this.redirect("/");
};

module.exports = loginController;
