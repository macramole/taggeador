var maxWidth=Math.min(window.innerHeight,window.innerWidth) * 0.95;

var outerRadius = maxWidth / 2,
    innerRadius = outerRadius * 0.58,
    categoriaRadius = innerRadius * 1.6,
    bubbleRadius=innerRadius-40,
    linkRadius=innerRadius-20,
    nodesTranslate=(outerRadius-innerRadius) + (innerRadius-bubbleRadius),
    chordsTranslate=(outerRadius);

d3.selectAll("#images")
    .style("width",window.innerWidth + "px")
    .style("height",window.innerHeight + "px")

d3.select(document.getElementById("bpg"))
        .style("width",(outerRadius*2) + "px")
        .style("height",(outerRadius*2) + "px");

d3.select(document.getElementById("mainDiv"))
    .style("width",(outerRadius*2) + "px")
    .style("height",(outerRadius*2) + "px");

d3.select(document.getElementById("cloud"))
    .style("width",(outerRadius*2) + "px")
    .style("height",(outerRadius*2) + "px");

// d3.select(document.getElementById("cloudTags"))
//     .style("width",(outerRadius*2) + "px")
//     .style("height",(outerRadius*2) + "px");

d3.select(document.getElementById("graficos"))
    .style("width",(outerRadius*2) + "px")
    .style("height",(outerRadius*2) + "px");
d3.select(document.getElementById("flip"))
    .style("width",(outerRadius*2) + "px")
    .style("height",(outerRadius*2) + "px");


var svg = d3.select(document.getElementById("svgDiv"))
    .style("width", (outerRadius*2) + "px")
    .style("height", (outerRadius*2) + "px")
    .append("svg")
    .attr("id","svg")
    .style("width", (outerRadius*2) + "px")
    .style("height", (outerRadius*2) + "px")
    /*.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", function() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }));*/

var chordsSvg=svg.append("g") //sólo el círculo con las palabras
    .attr("class","chords")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")");


var linksSvg=svg.append("g") //aca está casi todo
    .attr("class","links")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")")


var highlightSvg=svg.append("g")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")")
    .style("opacity",0);

var highlightLink=highlightSvg.append("path");

var nodesSvg=svg.append("g") //aca está el pack
    .attr("class","nodes")
    .attr("transform", "translate(" + nodesTranslate + "," + nodesTranslate + ")");


 var bubble = d3.layout.pack()
    .sort(null)
    .size([bubbleRadius*2, bubbleRadius*2])
    .padding(5);

var chord = d3.layout.chord()
    .padding(0.05)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

var diagonal = d3.svg.diagonal.radial();
    //.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });


var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 10);


// var fills= d3.scale.ordinal().range(["#00AC6B","#20815D","#007046","#35D699","#60D6A9"]);

var categorias = ["tecnologias", "sentidos", "disciplinasCientificas", "color", "tipoActividad", "personas", "lugar", "disciplinasArtisticas"];
var categoriasHuman = ["Tecnologias", "Sentidos", "D. científicas", "Color", "Tipo de actividad", "Personas", "Lugar", "D. artísticas"];
// var categorias = ["tecnologias", "sentidos", "disciplinasCientificas", "tipoActividad", "personas", "lugar", "disciplinasArtisticas"];
// var categoriasHuman = ["Tecnologias", "Sentidos", "D. científicas", "Tipo de actividad", "Personas", "Lugar", "D. artísticas"];
var fillsCategorias = d3.scale.category10();

var linkGroup;

var chordsById={},
    nodesById={},
    nodes=[],
    renderLinks=[];

var tags = [];
var imagenes = [];
var imagenesSueltas = [];
var links = [];

var formatNumber = d3.format(",.0f"),
    formatCurrency = function(d) { return "$" + formatNumber(d)};

   var buf_indexByName={},
    indexByName = {},
    nameByIndex = {},
    labels = [],
    chords = [];


function log(message) {
   // console.log(message);
}
//Events
