var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var serviceController = new Controller();
var postModel = require('../models/post.js');

serviceController.before('*', function(next) {
	this.res.header("Access-Control-Allow-Origin", "*");
	next();
});

serviceController.tags = function() {
    postModel.find({},{ "tags" : true }).lean().exec( function(err, posts) {
        var allTags = {};

        posts.forEach( function(post) {
            var postTags = post.tags;
            for ( var categoria in postTags ) {
                if ( categoria != "fecha" ) {
                    var tags = postTags[categoria] || [];
                    tags.forEach( function( tag ) {
                        if ( !allTags[ tag ] ) {
                            allTags[ tag ] = {
                                nombre : tag,
                                cantidad : 1,
                                categoria : categoria,
                                imagenesRelacionadas : [ post._id ]
                            }
                        } else {
                            allTags[ tag ].imagenesRelacionadas.push( post._id );
                            allTags[ tag ].cantidad++;
                        }
                    });
                }
            }
        });
        //this.posts = posts;
		var allTagsRaw = [];
        for ( var tag in allTags ) {
            allTagsRaw.push(allTags[tag]);
        }

		this.res.send(allTagsRaw);
    }.bind(this));

    /*var allTags = {
        color: [],
        disciplinasArtisticas: [],
        disciplinasCientificas: [],
        tipoActividad: [],
        sentidos: [],
        tecnologias: [],
        lugar: [],
        personas: []
    };*/
};

serviceController.imagenes = function() {
    postModel
        .find({},{ "tags" : true, "blog" : true, "images.url" : true })
        .populate("blog", "name color")
        .lean()
        .exec( function(err, posts) {
            var allImages = {};
            posts.forEach(function(post) {
                var image = {};
                image.id = post._id;
                image.blog =  {
                    name: post.blog.name,
                    color: post.blog.color,
                };
                image.imagenes = [];

                post.images = post.images || [];
                post.images.forEach(function(i) {
                    image.imagenes.push(i.url);
                });

                image.cantTags = 1;

                for ( categoria in post.tags ) {
                    post.tags[categoria] = post.tags[categoria] || [];
                    image.cantTags += post.tags[categoria].length;
                }

                allImages[post.blog.name] = allImages[post.blog.name] || [];
                allImages[post.blog.name].push(image);
            });

            this.res.send(allImages);
    }.bind(this));
}

module.exports = serviceController;
