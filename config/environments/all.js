var express = require('express');
var passport = require('passport');
var util = require('util');

module.exports = function() {
	this.datastore(require('locomotive-mongoose'));
	this.set('view engine', 'jade');
	this.format('html', { extension: '.jade' });
	this.locals.pretty = true;

	this.use(express.cookieParser());
	this.use(express.bodyParser());
	this.use(express.session({ secret: 'unaclave' }));
	this.use(passport.initialize());
	this.use(passport.session());

	// Warn of version mismatch between global "lcm" binary and local installation
	// of Locomotive.
	//if (this.version !== require('locomotive').version) {
	  //console.warn(util.format('version mismatch between local (%s) and global (%s) Locomotive module', require('locomotive').version, this.version));
	//}
};
