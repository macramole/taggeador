var Tumblr = {
  /**
  * Muestra un post sin taggear
  **/
  getPost : function(callback) {
    $.get("/getTumblrPost", {}, function(data) {
      callback(data);
    }, 'json');
  }
};
