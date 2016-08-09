var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var pagesController = new Controller();
var postModel = require('../models/post.js');
require('../models/blog.js');
var ensureLogin = require('connect-ensure-login');

var easycrud = require("easycrud");

function dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

pagesController.before('*', ensureLogin.ensureLoggedIn('/') );
pagesController.before('*', function(next) {
	this.isAdmin = this.req.user.role == 1;
	next();
});

pagesController.list = function() {
    console.log("asd");
    postModel.find().sort('tagged').populate({ path: 'blog', model: 'Blog' }).exec( function(err, posts) {
        console.log("asdasd");
		//junto los tags en un string
		posts.forEach( function(post) {
			var arrTagsList = [];
			//post.tagsList = "";
			for ( var categoriaTag in postModel.schema.tree.tags ) {
				if ( categoriaTag != "fecha" && post.tags[categoriaTag] instanceof Array && post.tags[categoriaTag].length > 0 ) {
					arrTagsList = arrTagsList.concat(post.tags[categoriaTag]);
					//post.tagsList += post.tags[categoriaTag].join(', ');
				}
			}
			post.tagsList = arrTagsList.join(', ');

            var dateAdded = dateFromObjectId( post.id );
            post.dateAdded = pad(dateAdded.getDate(),2) + "-" + pad(dateAdded.getMonth(),2) + "-" + dateAdded.getFullYear();
		});

        if ( this.param("c") ) {
            switch( this.param("c") ) {
                case "1" :
                    this.showOk = true;
                    break;
                case "2" :
                    this.showContinueAndSaveFinish = true;
                    break
            }
        }

		this.posts = posts;
        this.adminNavInfo = easycrud.getNavInfo();
		this.render();
	}.bind(this));
};

pagesController.sync = function() {
	var tumblr = require("../libs/tumblr.js");
	tumblr.findNewPosts( function(result) {
		this.res.send(result);
	}.bind(this));
};

pagesController.nextUntaggedPost = function() {
	postModel.getNextUntaggedPost( function(id) {
		this.redirect( this.postPath(id) );
	}.bind(this));
};

pagesController.post = function() {
	postModel.findById( this.param("id") ).lean().exec( function(err, post) {

		//armo un array con categorias de tags para luego hacer el formulario
		this.tagsCategorias = [];
		for ( var categoriaTag in postModel.schema.tree.tags ) {
			this.tagsCategorias.push(categoriaTag);
		}


		this.post = post;
		this.render();
	}.bind(this));
};

pagesController.saveTags = function() {
	var jsonTags = {};

	for ( var categoriaTag in postModel.schema.tree.tags ) {
		if ( this.param(categoriaTag) ) {
			if ( categoriaTag != "fecha" ) {
				jsonTags[categoriaTag] = eval( this.param(categoriaTag) );
			} else {
				jsonTags[categoriaTag] = this.param(categoriaTag);
			}
		} else {
			if ( categoriaTag != "fecha" ) {
				jsonTags[categoriaTag] = [];
			} else {
				jsonTags[categoriaTag] = null;
			}
		}
	}

	postModel.saveTags( this.param("id"), jsonTags, function(err) {
		if (!err) {
            if ( this.param("btnSaveContinue") ) {
                postModel.getNextUntaggedPost( function(id) {
                    if ( id ) {
                        this.redirect( this.postPath(id) );
                    } else {
                        this.redirect("/list?c=2");
                    }
            	}.bind(this), this.req.cookies.filterBlog);
            } else {
                this.redirect("/list?c=1");
            }
		} else {
			this.res.send( err );
		}

	}.bind(this));


};

pagesController.getTags = function() {
	postModel.getTags( function(allTags) {
		this.res.send(allTags);
	}.bind(this));
};

module.exports = pagesController;
