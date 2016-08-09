var mongoose = require('mongoose');
var md5 = require('MD5');

var userSchema = mongoose.Schema({
	user : String,
	pass : {
		type : String,
		easycrud : "passwordField"
	},
	role : Number
});

userSchema.methods.validPassword = function(password) {
	return this.pass == password;//md5(password);
};

module.exports = mongoose.model('User', userSchema);
