var encabezados = ["plata","barrio","ropa","domingo","sarmiento","esquema","mapa","facebook","profesor","martillo","cocina","rezo"];
var duplas = ["plata - compañero","barrio - bandera","ropa - abuelo/a","domingo - vereda","sarmiento - pelos","esquema - zapatilla","mapa - ecuación","facebook - pizarrón","profesor - pizza","martillo - genes","cocina - diploma","rezo - celular"];
var grupos = [];
var ordenGrupos = [1, 2, 0, 3]; //indices

var width = window.screen.availWidth * 0.98;
var height = window.screen.availHeight * 0.89;
var marginLeft = 157;
var marginGrupo = 0;
var marginGrupoY = height /4;
var realWidth = width - marginLeft - marginGrupo * 2;
var grupoHeight = height / 2;

var gruposCheckeados = [];

var coloresGrupos = d3.scale.category10();
var selectedNode = null;

var link = [];
var node = [];
var force = [];

var isDragging = false;

function showInfo(nodeData) {
    var mainNode = selectedNode ? selectedNode : nodeData;
    var relatedNode = selectedNode ? nodeData : null;
    var index = grupos.indexOf(nodeData.grupo);

    var relatedInfo = [];

    if ( relatedNode != null ) {
        link[index].data().forEach(function(unLink) {
            if ( unLink.source.id == mainNode.id && unLink.target.id == relatedNode.id ) {
                relatedInfo = unLink.palabras;
            }
        });
    }

    if ( relatedInfo.length == 0 ) {
        relatedNode = null;
    }

    //console.log(relatedInfo);

    $("#info").html("");
    var $ul = $("<ul></ul>");
    var $liId = $("<li class='id'></li>").text(mainNode.id);
    if ( relatedNode ) {
        $liId.html( mainNode.id + "<br>" + relatedNode.id );
    }
    var $liComienzo = $("<li class='comienzo'></li>").text(mainNode.comienzo);

    $ul.append($liId).append($liComienzo);
    //console.log(d);
    mainNode.puente.forEach(function (palabra) {
        var liPuenteText = palabra;
        var $liPuente = $("<li class='puente'></li>").text(liPuenteText);
        relatedInfo.forEach(function(palabraRelacionada) {
            if ( palabraRelacionada.palabra == palabra && palabraRelacionada.relacion.relacion == 1 ) {
                if ( liPuenteText.indexOf("~") === -1 ) {
                    liPuenteText += " ~";
                }
                liPuenteText += " <span class='relacion1'>" + palabraRelacionada.palabra + "</span>";
                $liPuente.html(liPuenteText);
            }
            if ( palabraRelacionada.relacion.observacion == palabra ) {
                if ( liPuenteText.indexOf("~") === -1 ) {
                    liPuenteText += " ~";
                }
                var liPuenteClass = "relacion" + palabraRelacionada.relacion.relacion;

                liPuenteText += " <span class='" + liPuenteClass + "'>" + palabraRelacionada.palabra + "</span>";
                $liPuente.addClass().html(liPuenteText);
            }
        });
        $ul.append($liPuente);
    });

    var $liFinal = $("<li class='final'></li>").text(mainNode.final);
    var $liRelaciones = $("<li class='relaciones'></li>").text("Relaciones: " + mainNode.cantRelaciones);

    if ( relatedInfo.length ) {
        $liRelaciones.text("Relaciones: " + relatedInfo.length);
    }

    $ul.append($liFinal).append($liRelaciones);

    $("#info").append($ul);
    $("#info").addClass("active");
}

function highlightRelations(nodeData) {
    var index = grupos.indexOf(nodeData.grupo);

    node.forEach(function(unNode) {
        unNode.transition().style("opacity", function( unNode ) {
            if ( unNode == nodeData ) {
                return 1;
            }
            var linkData = link[index].data();

            for ( i in linkData ) {
                var oLinkData = linkData[i];
                if ( oLinkData.source.id == nodeData.id && oLinkData.target.id == unNode.id ) {
                    return 1;
                }
                if ( oLinkData.target.id == nodeData.id && oLinkData.source.id == unNode.id ) {
                    return 1;
                }
            }

            return 0.1;
        });
    });

    link.forEach(function(unLink, linkIndex) {
        unLink.transition()
        // .style("stroke-width", function( oLinkData ) {
        //     if ( oLinkData.source.id == nodeData.id || oLinkData.target.id == nodeData.id ) {
        //         return Math.pow(oLinkData.strength,2.5);
        //     }
        //     return 1;
        // })
        .style("opacity", function( oLinkData ) {
            if ( oLinkData.source.id == nodeData.id || oLinkData.target.id == nodeData.id ) {
                return 1;
            }
            if ( linkIndex == index ) {
                return 0.1;
            } else {
                return 0.3;
            }

        });
    });
}

function unhighlightAll() {
    $("#info").removeClass("active");
    link.forEach(function(unLink){
        // unLink.transition().style("stroke-width", 1).style("opacity", 1);
        unLink.transition().style("opacity", 1);
    });
    node.forEach(function(unNode) {
        unNode.transition().style("opacity", 1);
    })

}

function selectNode(unNode) {
    var index;

    if (unNode) {
        index = grupos.indexOf(unNode.grupo);
    }

    if ( unNode == selectedNode ) {
        selectedNode = null;
    } else {
        selectedNode = unNode;

        if ( selectedNode != null ) {
            showInfo(selectedNode);
            highlightRelations(selectedNode);
        } else {
            unhighlightAll();
        }
    }

    node.forEach(function(unNode) {
        unNode.classed("selected", function(d) {
            return d == selectedNode;
        });
    });

    // node[index]
}

function init(categoria, gruposSeleccionados) {
    d3.select("body svg").remove();

    gruposCheckeados = gruposSeleccionados;

    if ( gruposCheckeados.length == 0 ) {
        return;
    }

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    gruposSeleccionados.forEach( function(grupoSeleccionado) {
        var index = grupos.indexOf(grupoSeleccionado);

        force[index] = d3.layout.force()
            //.gravity(.05)
            .distance(200)
            //.linkDistance(200)
            .charge(1000)
            .size([realWidth/(gruposCheckeados.length+3), grupoHeight])
            .nodes(dataD3network.nodes[categoria][grupoSeleccionado])
            .links(dataD3network.links[categoria][grupoSeleccionado])
            .gravity(0)
            .chargeDistance(0)
            .start();

        force[index].grupo = grupoSeleccionado;

        link[index] = svg.selectAll(".link.i" + index)
            .data(dataD3network.links[categoria][grupoSeleccionado])
            .enter().append("line")
            // .attr("x1", function(d) { return d.source.x; })
            // .attr("y1", function(d) { return d.source.y; })
            // .attr("x2", function(d) { return d.target.x; })
            // .attr("y2", function(d) { return d.target.y; })
            .attr("class", "link i" + index)
            .style("stroke-width", function( oLinkData ) {
                // if ( oLinkData.source.id == nodeData.id || oLinkData.target.id == nodeData.id ) {
                    return Math.pow(oLinkData.strength,2.5);
                // }
                // return 1;
            })
            .attr("stroke-linecap", "round");

        link[index].grupo = grupoSeleccionado;
        /*var dragNode = d3.behavior.drag().on("drag", function(d, i) {
            d.x += d3.event.dx;
            d.y += d3.event.dy;

            //d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
        });*/

        var nodeDrag = force[index].drag().on("dragstart", function(d) {
            d.fixed = true;
            isDragging = true;
            unhighlightAll();
            // console.log("drag");
        }).on("dragend", function(d) {
            isDragging = false;
            // console.log("nodrag");
        });

        node[index] = svg.selectAll(".node." + categoria + ".i" + index)
            .data(dataD3network.nodes[categoria][grupoSeleccionado])
            .enter().append("circle")
            // .attr("cx", function(d) { return d.x + (width/4)*index; })
            // .attr("cy", function(d) { return d.y; })
            .attr("class", "node " + categoria + " i" + index)
            .attr("data-grupo", grupoSeleccionado)
            .attr("r", function(d) { return Math.pow(d.cantRelaciones + 5,1.3); })
            .style("fill", coloresGrupos(index))
            .on("mouseover", function(d) {
                if ( isDragging ) {
                    return;
                }
                showInfo(d);

                if ( selectedNode == null ) {
                    highlightRelations(d);
                }
            })
            .on("mouseleave", function(d) {
                if ( isDragging ) {
                    return;
                }
                if ( selectedNode == null ) {
                    unhighlightAll();
                } else {
                    showInfo(selectedNode)
                }
            })
            .on("dblclick", function(d) {
                //d3.event.stopPropagation();
                /*if ( isDragging ) {
                    return;
                }*/
                // console.log(d);
                selectNode(d);
            })
            .call(nodeDrag);

        force[index].on("tick", tick(index));

        $("li[data-index=" + index + "] > .cantidad").text("(" + force[index].nodes().length + ")");
    });
}

function tick(index) {
    return function(e) {
        var realWidth = width - marginLeft - marginGrupo * 2;
        var xOffset = marginLeft + marginGrupo  + ( (width/gruposCheckeados.length) * gruposCheckeados.indexOf(grupos[index]) ) + marginGrupo;

        if ( force[index].nodes() ) {
          node[index]
            .attr("cx", function(d) { return d.x + xOffset; })
            .attr("cy", function(d) { return d.y + marginGrupoY; });
        }

        link[index].attr("x1", function(d) { return d.source.x + xOffset })
        .attr("y1", function(d) { return d.source.y + marginGrupoY; })
        .attr("x2", function(d) { return d.target.x + xOffset })
        .attr("y2", function(d) { return d.target.y + marginGrupoY; });


        //node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    };
}

function initUI() {

    var $botones = $("#botones");
    encabezados.forEach( function( categoria, index ) {
        var $li = $("<li></li>");
        var $button = $("<button type='button' class='btnDupla'></button>");
        $button
            .text(duplas[index])
            .attr("data-index", index)
            .click( function() {
                var $this = $(this);

                var gruposSeleccionados = [];
                // console.log($("#grupos :checked + span"));

                d3.selectAll("#grupos :checked + span")[0].forEach(function (grupoSeleccionado) {
                    grupoSeleccionado = $(grupoSeleccionado);
                    gruposSeleccionados.push(grupoSeleccionado.text());
                });

                init( encabezados[ $this.attr("data-index") ], gruposSeleccionados );

                $("#botones li button").removeClass("active");
                $this.addClass("active");
            });

        $li.append($button);
        $botones.append($li);
    });

    $("body").click(function() {
        selectNode(null);
    });

    $("#comousar h4 a").click(function() {
        $("#comousar").remove();
    });

    for ( grupo in dataD3network.nodes[encabezados[0]] ) {
        grupos.push(grupo);
    }

    // grupos.forEach( function( grupo, index ) {
    ordenGrupos.forEach( function(index, ordenIndex) {
        var grupo = grupos[index];
        var $li = $("<li></li>").css("background-color", coloresGrupos(index)).attr("data-index", index);
        var $input = $("<input type='checkbox' />")
        var $span = $("<span></span>").text(grupo);
        var $div = $("<div class='cantidad'></div>");

        if ( ordenIndex <= 1 ) {
            $input.attr("checked", true);
        }

        $li.append($input).append($span).append($div);
        $("#grupos").append($li);

        $input.change(function() {
            $(".btnDupla.active").click();
            if ( !$(this).is(":checked") ) {
                $(this).siblings(".cantidad").text("");
            }
        });
    });
};

/*d3.json("d3network.json", function(error, json) {
    if (error) throw error;

    dataD3network = json;
*/
$(function(){
	initUI();
    $("#botones li button").first().click();
});

d3.selection.prototype.dblTap = function(callback) {
  var last = 0;
  return this.each(function() {
    d3.select(this).on("touchstart", function(e) {
        if ((d3.event.timeStamp - last) < 500) {
          //Touched element
          console.log(this);
          return callback(e);
        }
        last = d3.event.timeStamp;
    });
  });
}

/*});*/
