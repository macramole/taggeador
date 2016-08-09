$( function() {
    $.get('/getTags',{}, function(allTags) {

		//for ( var categoria in allTags ) {
			$('textarea').textext({
				plugins : 'tags autocomplete arrow'
			}).bind('getSuggestions', function(e, data) {
				var list = allTags[ $(e.target).attr('id') ],
				textext = $(e.target).textext()[0],
				query = (data ? data.query : '') || '';

				$(this).trigger('setSuggestions', {
					result: textext.itemManager().filter(list, query)
				});
			});

		$('textarea').each(function() {
			$(this).textext()[0].tags().addTags( eval($(this).attr("data-tagsItems")) );
		});
	}, 'json');

	$('input').datepicker({
		format: "dd/mm/yyyy",
		language: "es",
		autoclose: true,
        todayHighlight: true
	});

});
