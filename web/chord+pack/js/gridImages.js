var msnry;

msnry = new Masonry("#images", {
    itemSelector : ".item",
    columnWidth : '.width',
    percentPosition : true,
    gutter : ".width-gutter"
});


function addImagesMasonry(images) {
    if ( images.length ) {
        msnry.appended(images);

        var imgLoad = imagesLoaded( "#images" );
        imgLoad.on("progress", function(instance, image) {
            msnry.layout();
        });

        d3.selectAll(images).on("click", function(none, index) {
            if ( d3.event.target.tagName == "A" ) {
                return;
            }
            var d3Image = d3.select(images[index]);
            var isBig = d3Image.classed("big");
            var isBigger = d3Image.classed("bigger");
            if ( !isBig && !isBigger ) {
                d3Image.classed("big", true);
            } else if ( isBig ) {
                d3Image.classed("big", false);
                d3Image.classed("bigger", true);
            } else if ( isBigger ) {
                d3Image.classed("bigger", false);
            }
            /**
                Arreglar el tema del tamaño, cuando se agranda el primero medio
                que se caga todo
            **/
            d3Image.on("transitionend", function() {
                msnry.layout();
            })
        });
    }
}

function removeImagesMasonry(images) {
    if ( images.length ) {

        images.forEach(function(i) {
            msnry.remove(i);

        });

        msnry.layout();

    }
}
