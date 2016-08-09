var mongoose = require('mongoose');
//var blogModel = require('./blog.js');

var postSchema = mongoose.Schema({
	blog : { type: mongoose.Schema.ObjectId, ref: "Blog" },
	postId : Number,
	images : [{
		url : String,
		tags : {
			fecha : Date,
			personas : [String],
			lugar : [String],
			tecnologias : [String],
			sentidos : [String],
			tipoActividad : [String],
			disciplinasCientificas : [String],
			disciplinasArtisticas : [String],
			color : [String]
		}
	}],
	url : String,
	tags : {
		fecha : String,
		personas : [String],
		lugar : [String],
		tecnologias : [String],
		sentidos : [String],
		tipoActividad : [String],
		disciplinasCientificas : [String],
		disciplinasArtisticas : [String]
		// color : [String]
	},
	tagged : { type: Boolean, default: false }
});

postSchema.statics.saveTags = function( id, tags, callback ) {
	this.findById(id, function(err, post) {
		post.tagged = true;
		post.tags = tags;
		post.save();
		callback(err);
	});
};

postSchema.statics.getNextUntaggedPost = function (callback, blogName) {
	if ( blogName ) {
		console.log("search by blog name: " + blogName);
		var blogModel = require('./blog.js');
		blogModel.findOne({ name: blogName }, function(err, blog) {
			if (err) throw err;
			this.findOne({
				tagged : false,
				blog : blog._id
			}, function(err, post) {
				if (err) throw err;
				if ( post ) {
					callback( post.id );
				} else {
					callback( null );
				}
			})
		}.bind(this));
	} else {
		this.findOne({ tagged : false }, function(err, post) {
			if (err) throw err;
			if ( post ) {
				callback( post.id );
			} else {
				callback( null );
			}
		});
	}
};

postSchema.statics.getTags = function (callback) {
	this.find({}, 'tags').lean().exec( function(err, tags) {
		if (err) throw err;
		var allTags = {};

		tags.forEach(function(a) {
			for ( var categoria in a.tags ) {
				if ( categoria != "fecha" ) {
					if ( !allTags[categoria] ) {
						allTags[categoria] = [];
					}

					a.tags[categoria].forEach(function(strTag) {
						if ( allTags[categoria].indexOf(strTag) == -1 ) {
							allTags[categoria].push( strTag );
						}
					});
				}
			}
		});

		callback(allTags);
	});
};
var model = mongoose.model('Post', postSchema);
model.easycrud = {
	ignore : true
};
module.exports = model;
//module.exports = mongoose.model('Post', postSchema);
