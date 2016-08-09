// var WEBSERVICE_URL = "http://ec2-54-207-91-5.sa-east-1.compute.amazonaws.com/service/tags";
var WEBSERVICE_URL = "http://localhost:8080/service/tags";

var categorias = ["tecnologias", "sentidos", "disciplinasCientificas", "color", "tipoActividad", "personas", "lugar", "disciplinasArtisticas"];
var fillsCategorias = d3.scale.category10();

var layout;

var arrWords = [];

var linearSize = d3.scale.pow();

var cloudWidth = outerRadius*2;
var cloudHeight = outerRadius*2;

var dataTagsRelations = [];

d3.json(WEBSERVICE_URL, function(json) {

	// console.log(json);
	for ( index in json ) {
		var palabra = json[index];
		arrWords.push({
			text: palabra.nombre,
			categoria: palabra.categoria,
			size: palabra.cantidad
		});
	}

	var minSize = d3.min(arrWords, function(d) {
		return d.size;
	});
	var maxSize = d3.max(arrWords, function(d) {
		return d.size;
	});

	linearSize
		.domain([minSize, maxSize])
		.range([13,110]);

	layout = d3.layout.cloud()
	    .size([cloudWidth, cloudHeight])
	    .words(arrWords)
	    .padding(10)
	    // .spiral("rectangular")
	    // .rotate(function() { return getRandomInt(-40,40) })
	    .rotate(function() { return 0 })
	    .font("Arial")
	    .fontSize(function(d) { return linearSize(d.size); })
	    .on("end", draw);

	processDataTagsRelations(json);
	layout.start();
});


function draw(words) {
	var svg = d3.select("#cloud svg")
	  .attr("width", cloudWidth)
	  .attr("height", cloudHeight);

	drawTagsRelations(svg);

	var cloudTags = d3.select("#cloudTags")
		.style("width", cloudWidth + "px")
		.style("height", cloudHeight + "px")
		;

	cloudTags
		.append("div")
		.classed("position", true)
		.style("width", cloudWidth + "px")
		.style("height", cloudHeight + "px")

		.selectAll("div.tag")
		.data(words)
		.enter()

		.append("div")
		.classed("tag", true)
		.attr("data-tag", function(d) {
			return d.text;
		})
		.style("font-size", function(d) { return d.size + "px"; })
		.text(function(d) { return d.text; })
		.on("click", function(d) {
			var tag = d.text;
			var $text = d3.select("#cloudTags div.tag[data-tag='" + tag + "']");
			var active = $text.classed("active");

			if ( !active ) {
				onTagClick(d.text, false);
			} else {
				assocLinks = d3.selectAll(".link[data-tag='" + tag + "']");
				assocLinksToUnpin = [];

				assocLinks[0].forEach( function(assocLink) {
					var d3AssocLink = d3.select(assocLink);
			        var assocNode = nodesById[d3AssocLink.attr("data-node")];
					var indexToDelete = assocNode.pinnedByTag.indexOf(tag);

					//le saco el tag al node y también le tengo que bajar data-pinned del html
					if ( indexToDelete !== -1 ) {
						assocNode.pinnedByTag.splice(indexToDelete, 1);
						$node = d3.select(".node circle[data-id='" + d3AssocLink.attr("data-node") + "']");
						$node.attr("data-pinned", Number($node.attr("data-pinned")) - 1 );
					}

					if ( assocNode.pinnedByTag.length == 0 ) {
						assocLinksToUnpin.push(assocLink);
					}
				});

				unpinNodesByLinks([assocLinksToUnpin]);
				setImagesFromPinned();
				cloudUnSelectTag(tag);
			}
		})
		.on("mouseover", function(d) {
			activateRelations(d);
		})
		.on("mouseleave", function(d) {
			deactivateRelations(d);
		})
		;

	d3.selectAll("#cloudTags div.tag")
		.style("transform", function(d) {
			var x = d.x - this.getBoundingClientRect().width / 2;
			var y = d.y - this.getBoundingClientRect().height * 0.8;
			return "translate(" + [x + "px", y + "px"] + ")rotate(" + d.rotate + ")";
		})



	// svg.append("g")
	// 	.attr("transform", "translate(" + cloudWidth / 2 + "," + cloudHeight / 2 + ")")
	// 	.selectAll("text")
	// 	.data(words)
	// 	.enter()
	//
	// 	.append("text")
	// 	.attr("data-tag", function(d) {
	// 		return d.text;
	// 	})
	// 	.style("font-size", function(d) { return d.size + "px"; })
	// 	// .attr("data-size", function(d) { return d.size; })
	// 	// .style("fill", function(d, i) { return fillsCategorias( categorias.indexOf( d.categoria ) ); })
	// 	.style("fill", "black")
	//
	// 	.attr("text-anchor", "middle")
	// 	.attr("transform", function(d) {
	// 		return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
	// 	})
	// 	.text(function(d) { return d.text; })
	// 	.on("click", function(d) {
	// 		var tag = d.text;
	// 		var $text = d3.select("#cloud text[data-tag='" + tag + "']");
	// 		var active = $text.classed("active");
	//
	// 		if ( !active ) {
	// 			onTagClick(d.text, false);
	// 		} else {
	// 			assocLinks = d3.selectAll(".link[data-tag='" + tag + "']");
	// 			assocLinksToUnpin = [];
	//
	// 			assocLinks[0].forEach( function(assocLink) {
	// 				var d3AssocLink = d3.select(assocLink);
	// 		        var assocNode = nodesById[d3AssocLink.attr("data-node")];
	// 				var indexToDelete = assocNode.pinnedByTag.indexOf(tag);
	//
	// 				//le saco el tag al node y también le tengo que bajar data-pinned del html
	// 				if ( indexToDelete !== -1 ) {
	// 					assocNode.pinnedByTag.splice(indexToDelete, 1);
	// 					$node = d3.select(".node circle[data-id='" + d3AssocLink.attr("data-node") + "']");
	// 					$node.attr("data-pinned", Number($node.attr("data-pinned")) - 1 );
	// 				}
	//
	// 				if ( assocNode.pinnedByTag.length == 0 ) {
	// 					assocLinksToUnpin.push(assocLink);
	// 				}
	// 			});
	//
	// 			unpinNodesByLinks([assocLinksToUnpin]);
	// 			setImagesFromPinned();
	// 			cloudUnSelectTag(tag);
	// 		}
	// 	})
	// 	.on("mouseover", function(d) {
	// 		activateRelations(d);
	// 	})
	// 	.on("mouseleave", function(d) {
	// 		deactivateRelations(d);
	// 	})
	// 	;
}

function cloudSelectTag(which) {
	var $text = d3.select("#cloudTags div.tag[data-tag='" + which + "']");
	$text.classed("active", true);
	$text.classed("unactive", false);

	if ( parseInt($text.style("font-size")) < 50 ) {
		$text.classed("big", true);
	}

	d3.selectAll("#cloud text")[0].forEach( function (otherText) {
		var $otherText = d3.select(otherText);
		if ( !$otherText.classed("active") ) {
			$otherText.classed("unactive", true);
		}
	});
	// } else {
	// 	if ( d3.selectAll("#cloud text.active")[0].length == 0 ) {
	// 		d3.selectAll("#cloud text").classed("unactive", false);
	// 	}
	// }
}
function cloudUnSelectTag(which) {
	var $text = d3.select("#cloudTags div.tag[data-tag='" + which + "']");
	if ( $text.classed("active") ) {
		$text.classed("active", false);
		$text.classed("unactive", true);
		$text.classed("big", false);

		if ( d3.selectAll("#cloud text.active")[0].length == 0 ) {
			d3.selectAll("#cloud text").classed("unactive", false);
		}
	}
}
function cloudUnselectAll() {

	var $texts = d3.selectAll("#cloudTags div.tag");
	$texts[0].forEach(function(text) {
		var $text = d3.select(text);
		$text.classed("active", false);
		$text.classed("unactive", false);
	});
}

function processDataTagsRelations(json) {
	var words = layout.words();

	for ( i in json ) {
		var palabra1 = json[i];
		for ( j in json ) {
			var palabra2 = json[j];
			if ( palabra1 == palabra2 ) {
				continue;
			}
			if ( _tagRelationExists( palabra1.nombre, palabra2.nombre ) ) {
				continue;
			}

			var strength = _getTagRelationStrength(palabra1, palabra2);

			if ( strength > 0 ) {
				var relation = {
					source : _getWordDataFromText(palabra1.nombre),
					target : _getWordDataFromText(palabra2.nombre),
					strength : strength
				}
				dataTagsRelations.push(relation);
			}
		}
	}
}
function drawTagsRelations(svg) {
	var group = svg.append("g")
		.attr("id","cloudRelations")
		.attr("transform", "translate(" + cloudWidth / 2 + "," + cloudHeight / 2 + ")")
		;

	var line = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })

	dataTagsRelations.forEach( function(relation) {
		var sourceYOffset = Math.abs(relation.source.y0) + Math.abs(relation.source.y1)
		sourceYOffset = sourceYOffset / 8;
		var targetYOffset = Math.abs(relation.target.y0) + Math.abs(relation.target.y1)
		targetYOffset = targetYOffset / 8;

		var data = [{
			x : relation.source.x,
			y : relation.source.y - sourceYOffset
		}, {
			x : relation.target.x,
			y : relation.target.y - targetYOffset
		}];

		group
			.datum(data)
			.append("path")
			.attr("d", line)
			.style("stroke-width", relation.strength + "px")
			.attr("data-source", relation.source.text)
			.attr("data-target", relation.target.text);
	});
}
function activateRelations(word) {
	var paths1 = d3.selectAll("#cloudRelations path[data-source='"+ word.text +"']");
	var paths2 = d3.selectAll("#cloudRelations path[data-target='"+ word.text +"']");
	paths1.classed("active", true);
	paths2.classed("active", true);

	// var text = d3.select("#cloud text[data-tag='"+ word.text +"']");
	var text = d3.select("#cloudTags div.tag[data-tag='"+ word.text +"']");
	text.style("color", fillsCategorias( categorias.indexOf(word.categoria) ));

	paths1[0].forEach(function(path) {
		var $path = d3.select(path);
		var $relatedTag = d3.select("#cloudTags div.tag[data-tag='"+ $path.attr("data-target") +"']");
		$relatedTag.classed("related", true);
		$relatedTag.style("border-bottom-width", $path.style("stroke-width"));
	});
	paths2[0].forEach(function(path) {
		var $path = d3.select(path);
		var $relatedTag = d3.select("#cloudTags div.tag[data-tag='"+ $path.attr("data-source") +"']");
		$relatedTag.classed("related", true);
		$relatedTag.style("border-bottom-width", $path.style("stroke-width"));
	});
}
function deactivateRelations(word) {
	var paths = d3.selectAll("#cloudRelations path");
	paths.classed("active", false);

	// if ( !word.classed("active") ) {
		// var text = d3.select("#cloud text[data-tag='"+ word.text +"']");
		var text = d3.select("#cloudTags div.tag[data-tag='"+ word.text +"']");
		text.style("color", "");
	// }
	d3.selectAll("#cloudTags div.tag").classed("related", false);
}
function _getWordDataFromText(text) {
	var words = layout.words();

	for ( i in words ) {
		var word = words[i];
		if ( word.text == text ) {
			return word;
		}
	}

	return null;
}
function _tagRelationExists(palabra1, palabra2) {
	for ( var i in dataTagsRelations ) {
		var relation = dataTagsRelations[i];
		if (
			(relation.source.text == palabra1 &&
				relation.target.text == palabra2 )
				||
				(relation.target.text == palabra1 &&
					relation.source.text == palabra2 )) {
			return true;
		}
	}

	return false;
}
function _getTagRelationStrength(tagJson1, tagJson2) {
	var strength = 0;

	tagJson1.imagenesRelacionadas.forEach( function(imagenRelacionada1) {
		if ( tagJson2.imagenesRelacionadas.indexOf( imagenRelacionada1 ) !== -1 ) {
			strength++;
		}
	} );

	return strength;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
