// Draw routes.  Locomotive's router provides expressive syntax for drawing
// routes, including support for resourceful routes, namespaces, and nesting.
// MVC routes can be mapped to controllers using convenient
// `controller#action` shorthand.  Standard middleware in the form of
// `function(req, res, next)` is also fully supported.  Consult the Locomotive
// Guide on [routing](http://locomotivejs.org/guide/routing.html) for additional
// information.
module.exports = function routes() {
    this.root('login#show');
    this.post('login', 'login#login');
    this.match('logout', 'login#logout');

    this.match('list', 'pages#list');
    this.match('post/:id', 'pages#post', { as:'post' });
    this.match('nextUntaggedPost', 'pages#nextUntaggedPost');
    this.match('sync', 'pages#sync', { via:'POST' });
    this.match('saveTags', 'pages#saveTags', { as: 'saveTags', via:'POST' });
    this.match('getTags', 'pages#getTags');

    this.match('service/tags', 'service#tags');
    this.match('service/imagenes', 'service#imagenes');

	/*this.match('*', function(req, res, next) {
		res.send("404");
		next();
  });*/
};
