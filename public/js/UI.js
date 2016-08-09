var UI = {
    showNewPost : function() {
      Tumblr.getPost( function(data) {

        $("#post .images").html("");
        console.log(data);

        data.images.forEach( function(image) {
          $img = $("<img></img>").attr("src", image);
          $div = $("<div></div>").addClass("image");
          $("#post .images").append( $div.append($img) );
        });

      });
    }
};
