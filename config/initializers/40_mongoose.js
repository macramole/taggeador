var mongoose = require("mongoose");

module.exports = function() {
  switch (this.env) {
    case 'development':
      mongoose.connect('mongodb://localhost/taggeador');
      break;/*
    case 'production':
      mongoose.connect('??');
      break;*/
  }
/*
  mongoose.model('Blog', blogSchema);
  mongoose.model('Post', postSchema);
  console.log("a");*/
};
