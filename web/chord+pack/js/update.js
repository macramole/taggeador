function updateLinks(links) {
    //console.log("as");
    linkGroup=linksSvg.selectAll("g.links")
        .data(links);

    var enter=linkGroup.enter().append("g").attr("class","links");
    var update=linkGroup.transition();


    /* LINKS */
     enter.append("path")
        .attr("class", function(d) {
            var relatedChord=chordsById[d.tag];
            return "link " + relatedChord.categoria;
        })
        //.attr("id",function (d) { return "l_" + d.Key;})
        .attr("d", function (d,i) {
              d.links=createLinks(d);
              if ( d.links ) {
                  var diag = diagonal(d.links[0],i);
                  diag += "L" + String(diagonal(d.links[1],i)).substr(1);
                  diag += "A" + (linkRadius) + "," + (linkRadius) + " 0 0,0 " +  d.links[0].source.x + "," + d.links[0].source.y;
                  return diag;
              }
        })
        .attr("data-node", function(d) {
            return nodesById[d.imagen].id;
        })
        .attr("data-grupo", function(d) {
            return nodesById[d.imagen].blog.name;
        })
        .attr("data-tag", function(d) {
            return d.tag;
        })
        .style("fill", function(d) {
            var relatedChord=chordsById[d.tag];
            var color = categorias.indexOf(relatedChord.categoria);
            //no se porque no anda la función mando directamente
            return coloresCategorias[ color ];
        });

      linkGroup.exit().remove();

    function createLinks(d) {
        var target={};
        var source={};
        var link={};
        var link2={};
        var source2={};

        var relatedChord=chordsById[d.tag];
        var relatedNode=nodesById[d.imagen];

        var r=linkRadius;
        var currX=(r * Math.cos(relatedChord.currentLinkAngle-1.57079633));
        var currY=(r * Math.sin(relatedChord.currentLinkAngle-1.57079633));

        var a=relatedChord.currentLinkAngle-1.57079633; //-90 degrees

        //console.log(relatedChord);
        relatedChord.currentLinkAngle=relatedChord.currentLinkAngle+(1/relatedChord.value)*(relatedChord.endAngle-relatedChord.startAngle);

        var a1=relatedChord.currentLinkAngle-1.57079633;

        source.x=(r * Math.cos(a)) //+ 10;
        source.y=(r * Math.sin(a)) //+ 20;
        target.x=relatedNode.x-(chordsTranslate-nodesTranslate);
        target.y=relatedNode.y-(chordsTranslate-nodesTranslate);
        source2.x=(r * Math.cos(a1));
        source2.y=(r * Math.sin(a1));
        link.source=source;
        link.target=target;
        link2.source=target;
        link2.target=source2;
        link.relatedNode = relatedNode;

        return [link,link2];
    }
}

function updateNodes() {

    var node = nodesSvg.selectAll("g.node")
        .data(nodes);

    var enter=node.enter().append("g")
        .attr("class", function(d) {
            var clase = "node";

            switch(d.depth) {
                case 0:
                    clase += " root";
                    break;
                case 1:
                    clase += " grupo";
                    break;
                case 2:
                    clase += " imagenes";
                    break;
            }

            return clase;
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    enter
        .append("text")
        .classed("plusOne",true)
        .attr("dy", ".35em")
        .text("+1")
    ;

    enter.append("circle")
        .attr("r", function(d) {
            if ( d.depth != 1 ) {
                return d.r;
            } else {
                return d.r * 1.02;
            }

        })
        .attr("data-id", function(d) {
            return d.id;
        })
        .attr("data-grupo", function(d) {
            if ( d.depth == 2 ) {
                return d.blog.name;
            }
        })
        .style("fill", function(d) {
            if ( d.depth == 1 ) {
                // return "red";
                return d.children[0].blog.color;
            }

        })
        .on("mouseover", function(d) {
            switch ( d.depth ) {
                case 0:
                    return;
                    break;
                case 1:
                    var assocNodes = d3.selectAll("circle[data-grupo=" + d.id + "]");
                    var assocNodesIds = [];

                    var selectedLinks = d3.selectAll(".link");
                    selectedLinks.classed( "unselected", true );

                    assocNodes[0].forEach(function(node){
                        var d3Node = d3.select(node);
                        var nodeId = d3Node.attr("data-id");
                        assocNodesIds.push( nodeId );

                        var assocLinks = d3.selectAll(".link[data-node='" + nodeId + "']");
                        assocLinks.classed("selected", true);
                        assocLinks.classed("unselected", false);
                        assocLinks[0].forEach(function (assocLink) {
                            var categoria = assocLink.className.animVal.split(" ")[1];
                            selectCategoria(categoria, assocLinks);
                        });

                    });

                    selectNodes(assocNodesIds);
                    break;
                case 2:
                    var selectedLinks = d3.selectAll(".link");
                    selectedLinks.classed( "unselected", true );

                    var assocLinks = d3.selectAll(".link[data-node='" + d.id + "']");

                    assocLinks.classed("selected", true);
                    assocLinks.classed("unselected", false);
                    assocLinks[0].forEach(function (assocLink) {
                        var categoria = assocLink.className.animVal.split(" ")[1];
                        selectCategoria(categoria, assocLinks);
                    });

                    selectNode(d.id);
            }
        })
        .on("mouseleave", function(d) {
            var selectedLinks = d3.selectAll(".link");
            selectedLinks.classed( "selected unselected", false );

            unselectNodes();
            unselectCategoria();
        })
        .on("click", function(d) {
            switch ( d.depth ) {
                case 0:
                    return;
                    break;
                case 1:
                    var assocNodes = d3.selectAll("circle[data-grupo=" + d.id + "]");
                    var assocNodesIds = [];
                    var todosSeleccionados = true;

                    assocNodes[0].forEach(function(node){
                        var d3Node = d3.select(node);
                        var nodeId = d3Node.attr("data-id");
                        assocNodesIds.push( nodeId );

                        if ( !d3Node.classed("pinned") ) {
                            todosSeleccionados = false;
                        }
                    });
                    // console.log(todosSeleccionados);
                    assocNodesIds.forEach( function(id) {
                        pinNode(nodesById[id], !todosSeleccionados);
                    } );
                    break;
                case 2:
                    pinNode(d);
            }
        })
        ;

    // node.exit().remove().transition(500).style("opacity",0);
}

function updateChords() {
    var categoriaArcGroup = chordsSvg.selectAll("g.categoriaArc")
        .data(categorias);

    var categoriasAngles = [];

    var categoriaEnter =
            categoriaArcGroup
                .enter()
                .append("g")
                .attr("class","categoriaArc")
                .attr("data-categoria", function(d) {
                    return d;
                });

    /**
     * Arco de grupos de tags
     */
    categoriaEnter.append("path")
        .style("fill", function(d, i) {
            var color = categorias.indexOf(d);
            var a = fillsCategorias( color );
            console.log(d + " " + color + " " + a);
            return a;
        })
        .attr("d", function (d,i) {
            var angles = { startAngle : 10000, endAngle : -1 };
            var anglesPadding = 0.025;

            chords.forEach( function(chord) {
                if ( chord.categoria == d ) {
                    if ( chord.source.startAngle < angles.startAngle ) {
                        angles.startAngle = chord.source.startAngle;
                    }
                    if ( chord.source.endAngle > angles.endAngle ) {
                        angles.endAngle = chord.source.endAngle;
                    }
                }
            });

            angles.startAngle -= anglesPadding;
            angles.endAngle += anglesPadding;

            categoriasAngles[i] = angles.startAngle + (angles.endAngle - angles.startAngle) * 0.5;

            var arc = d3.svg.arc(d,i).innerRadius(categoriaRadius).outerRadius(innerRadius-20);
            return arc(angles, i);
        })
        .on("mouseover", function(d) {
            selectCategoria(d);

            var assocLinks;
            assocLinks = d3.selectAll(".link." + d);

            var assocNodesIds = [];
            assocLinks[0].forEach(function (assocLink) {
                var d3AssocLink = d3.select(assocLink);
                assocNodesIds.push( d3AssocLink.attr("data-node") );
            });

            // selectNodes(assocNodesIds);
            // console.log(d);
        })
        .on("mouseleave", function(d) {
            unselectCategoria();
            unselectNodes();
        })
        /*************
        Desactivo la funcionalidad del click en el arco.
        **************/
        // .on("click", function(d) {
            // var assocLinks = d3.selectAll(".link." + d);
            // var todosSeleccionados = true;
            //
            // for ( var i = 0 ; i < assocLinks[0].length ; i++ ) {
            //     var assocLink = assocLinks[0][i];
            //     var d3AssocLink = d3.select(assocLink);
            //     var d3AssocNode = d3.select("circle[data-id='" + d3AssocLink.attr("data-node") +  "']");
            //     if ( !d3AssocNode.classed("pinned") ) {
            //         todosSeleccionados = false;
            //         break;
            //     }
            // }
            //
            // pinNodesByLinks( assocLinks, !todosSeleccionados);
        // })
        ;

    /**
     * Path para poner el texto
     */
    categoriaEnter.append("path")
        .attr("id", function(d, i) {
            return "cat" + i;
        })
        .style("stroke", "none")
        .style("stroke-width", "0px")
        .style("fill", "none")
        .attr("d", function (d,i) {
            var angles = { startAngle : 10000, endAngle : -1 };
            var anglesPadding = -0.025;

            chords.forEach( function(chord) {
                if ( chord.categoria == d ) {
                    if ( chord.source.startAngle < angles.startAngle ) {
                        angles.startAngle = chord.source.startAngle;
                    }
                    if ( chord.source.endAngle > angles.endAngle ) {
                        angles.endAngle = chord.source.endAngle;
                    }
                }
            });

            angles.startAngle += anglesPadding;
            angles.endAngle -= anglesPadding;

            var arc = d3.svg.arc(d,i).innerRadius(categoriaRadius).outerRadius(categoriaRadius + 0.1);
            return arc(angles, i);
        });

    /**
     * Texto de categoría de tags
     */
    categoriaEnter
        .append("text")
        .attr("dy", "-0.5em")
        .attr("class","categoriaText")
        .append("textPath")
        .attr("xlink:href", function(d, i) {
            return "#cat" + i;
        })
        .attr("startOffset", "25%")
        .style("fill", function(d) {
            return fillsCategorias( categorias.indexOf(d) )
        })
        .text(function(d, i) { return categoriasHuman[i]; })
        ;

    var arcGroup = chordsSvg.selectAll("g.arc")
        .data(chords, function (d) {
            return d.label;
        });

    var enter =
            arcGroup
                .enter()
                .append("g")
                .attr("class","arc")
                .attr("data-categoria", function(d) {
                    return d.categoria;
                });

    /**
     * Texto de los tags
     */
    enter.append("text")
        .attr("class","chord")
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text( function(d) {
            return trimLabel(d.label);
        })
        .attr("data-tag", function(d) {
            return trimLabel(d.label);
        })
        .style("fill", function(d) {
            return fillsCategorias( categorias.indexOf(d.categoria) )
        })
        .on("mouseover", function (d) {
            var assocLinks;
            assocLinks = d3.selectAll(".link[data-tag='" + d.label + "']");

            assocLinks.classed("selected", true);
            assocLinks.classed("unselected", false);
            var assocNodesIds = [];
            assocLinks[0].forEach(function (assocLink) {
                var categoria = assocLink.className.animVal.split(" ")[1];
                selectCategoria(categoria, assocLinks);

                var d3AssocLink = d3.select(assocLink);
                assocNodesIds.push( d3AssocLink.attr("data-node") );
            });
            selectNodes(assocNodesIds);

            //coloreo el arco asociado
            var $assocArc = d3.select(".arcText[data-tag='" + d.label + "']");
            $assocArc.classed("selected", true);

        })
        .on("mouseout", function (d) {
            unselectNodes();
            assocLinks = d3.selectAll(".link[data-tag='" + d.label + "']");
            assocLinks.classed("selected", false);
            assocLinks.classed("unselected", false);

            //coloreo el arco asociado
            var $assocArc = d3.select(".arcText[data-tag='" + d.label + "']");
            $assocArc.classed("selected", false);
        })
        .on("click", function(d) {
            onTagClick(d);
        })
        ;

    enter.append("path")
        .attr("class", "arcText")
        .attr("data-tag", function(d) {
            return trimLabel(d.label);
        })
        .style("stroke", function(d) {
            return fillsCategorias( categorias.indexOf(d.categoria) )
        })
        .attr("d", function (d,i) {
            var arc=d3.svg.arc(d,i).innerRadius(innerRadius-20).outerRadius(innerRadius);
            return arc(d.source,i);
        });

    arcGroup.exit().remove();
}

function selectCategoria( d, selectedLinks ) {
    // if ( !selectedLinks ) {
    //     selectedLinks = d3.selectAll(".link." + d)
    // }

    var allLinks = d3.selectAll(".link");
    allLinks.classed( "unselected", true );

    if ( selectedLinks ) {
        selectedLinks.classed( "selected", true );
        selectedLinks.classed( "unselected", false );
    }
    // var noCategoriaArcs = d3.selectAll(".categoriaArc");
    // noCategoriaArcs.classed("selected", true);

    var categoriaArcs = d3.selectAll(".categoriaArc[data-categoria='" + d + "']");
    categoriaArcs.classed("selected", true);
    categoriaArcs.classed("unselected", false);

    var noArcs = d3.selectAll(".arc[data-categoria='" + d + "']");
    // noArcs.classed("unselected", true);
    noArcs.classed("selected", true);

    // var arcs = d3.selectAll(".arc[data-categoria='" + d + "']");
    // arcs.classed("selected", true);
    // arcs.classed("unselected", false);
}

function unselectCategoria() {
    var selectedLinks = d3.selectAll(".link");
    selectedLinks.classed( "selected unselected", false );

    var categoriaArcs = d3.selectAll(".categoriaArc");
    categoriaArcs.classed("selected unselected", false);

    var arcs = d3.selectAll(".arc");
    arcs.classed("selected unselected", false);
}

function trimLabel(label) {
    if (label.length > 25) {
        return String(label).substr(0,25) + "...";
    }
    else {
        return label;
    }
}

function setPinnedChords() {
    d3.selectAll("path.link").classed("pinned", false);

    var pinnedTags = d3.selectAll("text.chord.pinned");
    pinnedTags[0].forEach(function(pinnedTag) {
        var d3PinnedTag = d3.select(pinnedTag);
        var d3Links = d3.selectAll("path.link[data-tag=" + d3PinnedTag.attr("data-tag")  + "]");
        d3Links.classed("pinned", true);
    });
}

function selectNode(id) {
    selectNodes([id]);
}
function selectNodes(arrIds) {
    var allNodes = d3.selectAll(".node circle");
    allNodes.classed("unselected", true);

    arrIds.forEach( function(id) {
        var d = nodesById[id];
        if (d) {
            var assocNode = d3.select(".node circle[data-id='" + d.id + "']");
            assocNode.classed("selected", true);
            assocNode.classed("unselected", false);

            // var plusOne = assocNode[0][0].previousSibling;
            // if ( plusOne && assocNode.classed("pinned") ) {
            //     d3.select(plusOne).classed("selected", true);
            // }

            if ( d.depth == 2 ) {
                var groupNode = d3.selectAll(".grupo circle[data-id='" + d.blog.name + "']");
                groupNode.classed("selected", true);
                groupNode.classed("unselected", true);
            }
        }
    });
}
function unselectNodes() {
    var assocNodes = d3.selectAll("circle.selected, circle.unselected");
    assocNodes.classed("selected unselected", false);
    // d3.selectAll(".plusOne").classed("selected", false);
}
function pinNode(d, noToggle) {
    if ( d.depth == 0 ) {
        return;
    }

    var assocNode = d3.selectAll(".node circle[data-id='" + d.id + "']");
    var isPinned = assocNode.classed("pinned");

    if ( !isPinned ) {
        assocNode.attr("data-pinned", "1");
    }

    if ( !noToggle ) {
        assocNode.classed("pinned", !isPinned );
    } else {
        if ( !isPinned ) {
            assocNode.classed("pinned", true );
        } else {
            var cantPinned = Number(assocNode.attr("data-pinned"));
            cantPinned++;
            assocNode.attr("data-pinned", String(cantPinned));

            if ( cantPinned == 2 ) {
                assocNode.classed("bigPinned", true);
            } else if ( cantPinned > 2 ) {
                assocNode.classed("bigPinned", false);
                assocNode.classed("biggerPinned", true);
            }

        }
    }

    if ( !assocNode.classed("pinned") ) {
        assocNode.attr("data-pinned", "0");
        assocNode.classed("bigPinned biggerPinned", false);
    }

    setImagesFromPinned();
}
function unpinNode(d) {
    var assocNode = d3.selectAll(".node circle[data-id='" + d.id + "']");
    assocNode.attr("data-pinned", "0");
    assocNode.classed("pinned bigPinned biggerPinned", false);
    setImagesFromPinned();
}
function unpinAll() {
    d3.selectAll(".node circle.pinned")
        .classed("pinned bigPinned biggerPinned", false)
        .attr("data-pinned", "0")
        ;

    setImagesFromPinned();
}

function setImagesFromPinned() {
    var d3PinnedNodes = d3.selectAll(".node circle.pinned");
    var pinnedNodes = [];

    d3PinnedNodes[0].forEach(function(htmlPinnedNode) {
        var d3PinnedNode = d3.select(htmlPinnedNode);
        pinnedNodes.push( {
            node : nodesById[ d3PinnedNode.attr("data-id") ],
            cantPinned : Number(d3PinnedNode.attr("data-pinned")),
        });
    });

    var arrImagenes = [];
    pinnedNodes.forEach(function(objPinnedNode) {
       var pinnedNode = objPinnedNode.node;

       if ( pinnedNode.imagenes ) {
           pinnedNode.imagenes.forEach(function(img) {
               arrImagenes.push({
                  image : img,
                  nodeid : pinnedNode.id,
                  cantPinned : objPinnedNode.cantPinned,
                  proyecto : pinnedNode.blog.name,
                  color : pinnedNode.blog.color
               });
           });
        } else {
            pinnedNode.children.forEach( function(child) {
                child.imagenes.forEach(function(img) {
                    arrImagenes.push({
                       image : img,
                       nodeid : child.id,
                       cantPinned : objPinnedNode.cantPinned,
                       proyecto : child.blog.name,
                       color : child.blog.color
                    });
                });
            } );
        }
    });
    addImages(arrImagenes);
}
function hideImages() {
    d3.select("#images img").remove();
}
function pinNodesByLinks(assocLinks, noToggle) {
    var nodesToPin = [];

    assocLinks[0].forEach( function(assocLink) {
        var d3AssocLink = d3.select(assocLink);
        var assocNode = nodesById[d3AssocLink.attr("data-node")];
        var tag = d3AssocLink.attr("data-tag");

        if ( nodesToPin.indexOf(assocNode) === -1 ) {
            assocNode.pinnedByTag = assocNode.pinnedByTag ? assocNode.pinnedByTag : [];
            if ( assocNode.pinnedByTag.indexOf(tag) === -1 ) {
                assocNode.pinnedByTag.push(tag);
            }
            nodesToPin.push(assocNode);
            pinNode(assocNode, noToggle);
        } else {
            assocNode.pinnedByTag.push(d3AssocLink.attr("data-tag"));
        }
    } );
}
function unpinNodesByLinks(assocLinks) {
    var nodesToPin = [];

    assocLinks[0].forEach( function(assocLink) {
        var d3AssocLink = d3.select(assocLink);
        var assocNode = nodesById[d3AssocLink.attr("data-node")];

        assocNode.pinnedByTag = [];
        unpinNode(assocNode);
    } );
}
function addImages(arrImagenes) {
    var currentImages = [];

    d3
        .selectAll("#images img")[0]
        .forEach( function( img ) {
            var d3img = d3.select(img);
            currentImages.push(d3img.attr("src"));
        });

    var imagesToAdd = [];
    arrImagenes.forEach(function(objImage) {
        var image = objImage.image;
        if ( currentImages.indexOf(image) == -1 ) {
            var newItem = d3
                .select("#images")
                .append("div")
                .attr("data-src", image)
                .attr("data-nodeid", objImage.nodeid)
                .classed("item", true)
                .style("color", objImage.color)
            ;

            newItem
                .append("img")
                .attr("src", image)
            ;

            newItem
                .append("span.proyecto")
                // .text("Proyecto: ")
                .append("a")
                .attr("href", "http://" + objImage.proyecto + ".tumblr.com")
                .attr("target", "_blank")
                .text(objImage.proyecto)

            newItem
                .append("span")
                .classed("tags", true);

            imagesToAdd.push(newItem[0][0]);
        } else {
            var d3Img = d3.select("#images .item[data-src='" + image + "']")

            if ( objImage.cantPinned == 2 ) {
                d3Img.classed("big", true);
                d3Img.classed("bigger", false);
            } else if ( objImage.cantPinned > 2 ) {
                d3Img.classed("big", false);
                d3Img.classed("bigger", true);
            } else {
                d3Img.classed("big", false);
                d3Img.classed("bigger", false);
            }

            d3Img.on("transitionend", function() {
                msnry.layout();
            })

        }
    });

    addImagesMasonry(imagesToAdd);

    var imagesToRemove = [];
    currentImages.forEach( function(currentImage) {
        var esta = false;
        for ( var i = 0 ; i < arrImagenes.length ; i++ ) {
            if ( arrImagenes[i].image == currentImage ) {
                esta = true;
                break;
            }
        }

       if ( !esta ) {
            var d3Img = d3.select("#images .item[data-src='" + currentImage + "']");
            imagesToRemove.push(d3Img[0][0]);
       }
    });

    removeImagesMasonry(imagesToRemove);
    setTagsToImages();
    removeTagsFromImages(imagesToRemove);

    // console.log(imagesToAdd.length + " imágenes agregadas");
    // console.log(imagesToRemove.length + " imágenes removidas");
}
function setTagsToImages() {
    var d3Items = d3.selectAll("#images .item");
    d3Items[0].forEach(function(item) {
        var d3Item = d3.select(item);
        var assocNode = nodesById[d3Item.attr("data-nodeid")];
        var d3ItemTags = d3.select(item.childNodes[2]);

        d3ItemTags.text("");

        if ( assocNode.pinnedByTag ) {
            assocNode.pinnedByTag.forEach(function(tag) {
                d3ItemTags.text( d3ItemTags.text() + "#" + tag + " " );
            });
        }
    });
}
function removeTagsFromImages(imagesToRemove) {
    imagesToRemove.forEach(function(item) {
        var d3Item = d3.select(item);
        var assocNode = nodesById[d3Item.attr("data-nodeid")];

        if ( assocNode.pinnedByTag ) {
            assocNode.pinnedByTag.forEach(function(tag) {
                cloudUnSelectTag(tag);
            });
        }

        assocNode.pinnedByTag = [];
    });
}

function _getChordDataByTagName(tagName) {
    var d;
    for ( i in chords ) {
        var chord = chords[i];
        if ( chord.label == tagName ) {
            d = chord;
            break;
        }
    }
    return d;
}
function onTagClick(d, forceFirstClick) {
    if ( typeof(d) == "string" ) {
        d = _getChordDataByTagName(d);
    }
    if ( typeof(forceFirstClick) != "undefined" ) {
        d.firstClick = forceFirstClick;
    }

    assocLinks = d3.selectAll(".link[data-tag='" + d.label + "']");

    var noToggle = false;

    chords.forEach(function(chord) {
        if ( chord != d ) {
            chord.firstClick = false;
        }
    });

    if ( !d.firstClick ) {
        noToggle = true;
        d.firstClick = true;
        cloudSelectTag(d.label);
    } else {
        d.firstClick = false;
    }

    pinNodesByLinks(assocLinks, noToggle);
}
