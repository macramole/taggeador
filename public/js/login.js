$( function() {
  $('form').submit(function() {
		$.post( $(this).attr('action'), $(this).serialize(), function(data) {
			if ( data && data.status == "success" ) {
				location.href = data.goto;
			}
		}, 'json').fail(function() {
			$("section#login").addClass("animated shake");
			$("section#login").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){ 
				$("section#login").removeClass("animated shake");
			});
		});
		return false;
	});
});
