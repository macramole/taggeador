const COOKIE_FILTER_BLOG = "filterBlog";

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function addFilterTag(columnIndex, criteria) {
    $filterTag = $("<li>Filtro: </li>");
    $icon = $("<span class='glyphicon glyphicon-remove'></span>");
    columnName = $("th").eq(columnIndex).text();
    $filterInfo = $("<strong></strong>").text(columnName + ' "' + criteria + '"');

    $filterTag.append($filterInfo).append($icon).appendTo("ul.filters");
}

function filterTable(columnIndex, criteria) {
    $('#tblPostList tr:gt(0)').each( function() {
        $tr = $(this);
        $td = $("td", $tr).eq(columnIndex);
        if ( $td.text() != criteria ) {
            $tr.addClass("filtered");
        }
    } );

    addFilterTag(columnIndex, criteria);
    document.cookie = COOKIE_FILTER_BLOG + "=" + criteria;
}

function unfilterTable() {
    $('#tblPostList tr').removeClass("filtered");
    $('#tblPostList td a').removeClass("filtering");
    $("ul.filters li").remove();
    document.cookie = COOKIE_FILTER_BLOG + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function checkCookieAndFilter() {
    var cookieFilterBlog = getCookie(COOKIE_FILTER_BLOG);
    if ( cookieFilterBlog ) {
        filterTable(1, cookieFilterBlog);
    }
    // console.log("checking hash");
    // if ( window.location.hash != "" ) {
    //     var hash = window.location.hash.substring(1);
    //     var wHash = hash.split("&");
    //     var criteriaToFilter;
    //
    //     wHash.forEach(function(hash) {
    //         var keyAndValue = hash.split("=");
    //         if ( keyAndValue[0] == "filterBlog" ) {
    //             criteriaToFilter = keyAndValue[1];
    //         }
    //     });
    //
    //     if ( criteriaToFilter ) {
    //         filterTable(1, criteriaToFilter);
    //     }
    // }
}

$( function() {
    $('#tblPostList tr').click( function() {
		if ( $(this).attr('data-id') ) {
			location.href = "post/" + $(this).attr('data-id');
		}
	});

  $('#tblPostList td a').click( function(e) {
      e.preventDefault();
      if ( !$(this).hasClass("filtering") ) {
        e.stopPropagation();
        filterTable(1, $(this).text());

        $('#tblPostList td a').addClass("filtering");
      }
  });
    $("ul.filters").on("click", "li", function() {
        unfilterTable();
    });

	$('#btnSync').click( function() {
		var $this = $(this);

		if ( !$this.hasClass("syncing") ) {
			$this
				.addClass('syncing')
				.children('span.txt').text("Sincronizando...");

			$.post("/sync", {}, function(data) {
				$this
					.removeClass('syncing')
					.children('span.txt').text("Sincronizar");

                if ( data.errors && data.errors.length ) {
                    strErr = "Errores en la sincronización:\n";
                    data.errors.forEach(function(e) {
                        strErr += e.blog + ": " + e.error;
                    });
                    alert( strErr );
                }

				if ( data.saved == 0 ) {
					alert("No hay nuevos posts.");
				} else {
					alert("Hay " + data.saved + " nuevos posts.");
					location.reload();
				}
			}, 'json');
		}
	});

	$('#btnNext').click( function() {
		location.href = '/nextUntaggedPost';
	});

    checkCookieAndFilter();
});
