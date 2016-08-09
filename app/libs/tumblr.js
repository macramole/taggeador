var tumblr = require("tumblr");
var blog = require("../models/blog.js");
var post = require("../models/post.js");
var POSTS_LIMIT = 20;

var oauth = {
	consumer_key : "wpqIPKw9Y0lFBsuDPg9sMhz2wbhQrMcmlWQitRBpXWPTgPU3gb",
	consumer_secret : "P5V4STo9lcuzql48X8s539qlI4l1rjKhdLJ8wMgpFIVaPcodtp",
	token : "",
	token_secret : ""
};

module.exports = {
	/**
	 * Chequea todos los blogs por posts nuevos
	 *
	 * @param {type} callback
	 * @returns {undefined}
	 */
	findNewPosts : function(callback) {
		blog.find( function(err, blogs) {
			getAllPosts(blogs, function(fetchErrors, posts) {
				var objPostByIds = {};
				var arrPostIds = [];
				var saved = 0;

				posts.forEach( function(post) {
					arrPostIds.push(post.id);
					objPostByIds[post.id] = post;
				});

				//Busco los posts que ya estén guardados
				post.find( { postId : { $in : arrPostIds } }, function(err, dbPosts) {
					if ( err ) throw new Error(err);

					//si ya existen no actualizo (en principio) los dejo pasar, ya los tengo.
					dbPosts.forEach( function(post, index) {
						delete objPostByIds[post.postId];
					});

					//los que me quedaron los agrego a la db
					for ( i in objPostByIds ) {
						var objPost = objPostByIds[i];
						//console.log("post:");
						//console.log(post);

						//datos básicos del post
						var newPost = post({
							blog : objPost.blogRef._id,
							postId : objPost.id,
							url : objPost.post_url
						});

						//imágenes
						objPost['photos'].forEach( function( photo) {
							newPost.images.push({
								url : photo.alt_sizes[1].url
							});
						});


						/*post.blogRef.posts.push(newPost._id);
						post.blogRef.save( function(err, theUpdatedBlog) {
							if ( err ) throw new Error(err);
						});*/


						newPost.save( function(err, theNewPost) {
							if ( err ) throw new Error(err);

							post.populate(theNewPost, [{ path: 'blog', model: 'Blog' }], function(err, populatedPost) {
								populatedPost.blog.posts.push( populatedPost._id );
								populatedPost.blog.save( function(err, theUpdatedBlog) {
									if ( err ) throw new Error(err);
								});
							});
						});

						saved++;
					};

					console.log("Posts fetched: " + posts.length);
					console.log("Posts saved: " + saved);
					callback({ "posts" : posts.length, "saved" : saved, "errors" : fetchErrors });
				});
			});
		});
	},

	/**
	 * Devuelve un post sin taggear
	 *
	 * @param {type} callback
	 * @returns {undefined}
	 */
	getUntaggedPost : function(callback) {

	}
};

/**
 * Función recursiva que busca los posts de cada blog pasado como parámetro
 *
 * @param {type} blogs
 * @param {type} callback
 * @param {type} currentBlog
 * @param {type} currentPosts
 * @returns {undefined}
 */
function getAllPosts(blogs, callback, currentBlog, currentPosts, currentErrors) {
	if ( !currentBlog ) {
		currentBlog = 0;
	}
	if ( !currentPosts ) {
		currentPosts = [];
	}
	if ( !currentErrors ) {
		currentErrors = [];
	}

	var blogName = blogs[currentBlog].name + ".tumblr.com";
	var blogRef = blogs[currentBlog];

	console.log("Checking: " + blogName);

	getAllBlogPosts( new tumblr.Blog( blogName, oauth), function(err, posts) {
		if (err) {
			currentErrors.push(err);
		}

		posts.forEach( function( post ) {
			post.blogRef = blogRef;
			currentPosts.push(post);
		});

		currentBlog++;

		if ( currentBlog < blogs.length ) {
			//console.log(currentPosts);
			getAllPosts( blogs, callback, currentBlog, currentPosts, currentErrors );
		} else {
			console.log("End checking");
			callback(currentErrors, currentPosts);
		}
	});
}

/**
* Función recursiva que saca los posts del blog (objecto de Tumblr) pasado como parámetro
**/
function getAllBlogPosts(blog, callback, currentPosts) {
	if ( !currentPosts ) {
		currentPosts = [];
	}

	getPosts( blog, currentPosts.length, function( err, posts ) {

		if ( posts ) {
			posts.forEach( function( post ) {
				currentPosts.push(post);
			});

			if ( posts.length >= POSTS_LIMIT ) {
				console.log("getting more");
				getAllBlogPosts(blog, callback, currentPosts);
			} else {
				console.log("no more posts here");
				callback(err, currentPosts);
			}
		} else { //error ?
			console.log("looks like an error here");
			console.log(err);
			callback(err, []);
		}

	});
}

/**
* Función los posts del blog (objecto de Tumblr) pasado como parámetro con determinado offset
**/
function getPosts(blog, offset, callback) {
	if ( !offset ) {
		offset = 0;
	}
	console.log("getting posts from " + blog.host);
	blog.posts({offset: offset, limit : 20, type:"photo" }, function( error, response ) {
		var err = null;
		if ( error ) {
			err = {
				blog: blog.host,
				error: error
			};
		}
		var postsFetched = response.posts ? response.posts.length : 0;
		console.log( postsFetched + " posts fetched");
		callback(err, response.posts );
	});
};
