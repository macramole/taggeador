fetchData();

var intervalId;
var counter=2;
var renderLinks=[];

function main() {
    initialize();
    updateNodes();
    updateChords();
    intervalId=setInterval(onInterval,1);

    d3.select("#buttons .minimizar").on("click", function() {
        minimizarGrafico();
        d3.select("#buttons").classed("minimizar", true);
	});

    d3.select("#buttons .unselect").on("click", function() {
        unpinAll();
        cloudUnselectAll();
    });

    d3.select("#buttons .switch").on("click", function() {
        // d3.selectAll(".grafico")[0].forEach(function(grafico) {
        //     if ( d3.select(grafico).classed("active") ) {
        //         d3.select(grafico).classed("active", false);
        //     } else {
        //         d3.select(grafico).classed("active", true);
        //     }
        // });
        var flipped = d3.select("#flip").classed("flipped");
        d3.select("#flip").classed("flipped", !flipped);
    });


    d3.select("#bpg").on("mouseover", function(e) {
        if ( d3.select("#graficos").classed("minimizado") ) {
            d3.event.stopPropagation();
            maximizarGrafico("#bpg");
        }
    });
    d3.select("#cloud").on("mouseover", function(e) {
        if ( d3.select("#graficos").classed("minimizado") ) {
            d3.event.stopPropagation();
            maximizarGrafico("#cloud");
        }
    });

    setInterval( function() {
        if ( d3.select("#images img")[0].length && d3.select("#graficos.minimizado")[0][0] == null  ) {
    			window.scrollBy(0, 1);
    		}
	}, 80);

    Opentip.styles.muntref = {
        extends : "dark",
        stem : true,
        delay : 0,
        // fixed : true,
        // targetJoint : ["center","top"]
    }
    Opentip.defaultStyle = "muntref";
    d3.selectAll(".node.grupo, .node.imagenes")[0].forEach(function(node) {
        var text = d3.select(node.children[1]).attr("data-id");
        if ( d3.select(node.children[1]).attr("data-grupo") ) {
            text = d3.select(node.children[1]).attr("data-grupo");
        }
        new Opentip(node, text );
    });
    new Opentip("#buttons .minimizar", "Minimizar", {
        target : true
    });
    new Opentip("#buttons .unselect", "Limpiar selección", {
        target : true
    });
    new Opentip("#buttons .switch", "Cambiar gráfico", {
        target : true
    });
}

function onInterval() {
    if(links.length==0) {
        clearInterval(intervalId);
    }
    else {
       // renderLinks=[];
        for (var i=0; i < counter; i++) {
            if (links.length > 0) {
                renderLinks.push(links.pop());
            }
        }
        counter=30;
        //counter++;
        updateLinks(renderLinks);
    }
}

function minimizarGrafico() {
    d3.select("#graficos").classed("minimizado", true);
}

function maximizarGrafico(cual) {
    d3.select("#graficos").classed("minimizado", false);
    // d3.select(cual).classed("minimizado", false);
    d3.select("#buttons").classed("minimizar", false);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
