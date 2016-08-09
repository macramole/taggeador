var mongoose = require('mongoose');


var blogSchema = mongoose.Schema({
	name : String,
	color : String,
	posts : [ { type: mongoose.Schema.ObjectId, ref: "Post" } ]
});

module.exports = mongoose.model('Blog', blogSchema);
