var fs = require("fs");
var logger = require("logger");
logger.includeDate = false;

function populateChildren(jsonPathFrom, jsonPathTo) {
	for ( var index in jsonPathFrom ) {
		var newNode = {
			name : jsonPathFrom[index].title,
		}

		if ( jsonPathFrom[index].ideas ) {
			newNode.children = [];
			populateChildren( jsonPathFrom[index].ideas, newNode.children )
		}

		jsonPathTo.push( newNode );

		//logger.info( jsonPathFrom[index] );
	}
}

var nodosMindset = JSON.parse(fs.readFileSync('nodos.json', 'utf8'));
var nodosD3 = {};

nodosD3.name = nodosMindset.title;
nodosD3.children = [];

populateChildren( nodosMindset.ideas, nodosD3.children );
fs.writeFileSync("nodosD3.json", JSON.stringify(nodosD3), "utf-8");
logger.info("Done :)");
