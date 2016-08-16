/**
 * Daisy Chain Data Fetches to ensure all data is loaded prior to updates (async calls)
 */

// var dataDispatch=d3.dispatch("end");
var dataCalls=[];
var numCalls=0;
var URL_WEBSERVICE = "http://localhost:8080/service/";
// var URL_WEBSERVICE = "http://ec2-54-207-91-5.sa-east-1.compute.amazonaws.com/service/";
var OFFLINE_MODE = true;

function fetchData() {
    if ( !OFFLINE_MODE ) {
        dataCalls=[];
        addStream(URL_WEBSERVICE + "tags", onFetchTags);
        addStream(URL_WEBSERVICE + "imagenes", onFetchImagenes);
        startFetch();
    } else {
        onFetchTags(dumpTags);
        onFetchImagenes(dumpImagenes);
        main();
    }
}

function onFetchTags(json) {
    tags = json;
    /*var tagsCategorizados = [];
    json.forEach(function(tag) {
        tagsCategorizados[ tag.categoria ] = tagsCategorizados[ tag.categoria ] || [];
        tagsCategorizados[ tag.categoria ].push(tag);
    });
    for ( categoria in tagsCategorizados ) {
        tags.push( tagsCategorizados[categoria] );
    }*/
    tags.sort( function(a, b) {
        return categorias.indexOf(a.categoria) - categorias.indexOf(b.categoria);
    });

    tags.forEach( function(tag) {
        tag.imagenesRelacionadas.forEach(function(idImagen) {
            links.push({
                tag : tag.nombre,
                imagen : idImagen
            });
        });
    });
    //console.log(links);
    endFetch();
}
function onFetchImagenes(json) {
    for ( var blog in json ) {
        json[blog].forEach(function(imagen) {
            imagen.value = imagen.cantTags;
        });

        imagenes.push({
            id : blog,
            grupo : blog,
            children : json[blog]
        });
    }

    endFetch();
}

function addStream(file,func) {
    var o={};
    o.file=file;
    o.function=func;
    dataCalls.push(o);
}

function startFetch() {
    numCalls=dataCalls.length;
    dataCalls.forEach(function (d) {
        if ( d.file.indexOf("csv") != -1 ) {
            d3.csv(d.file, d.function);
        } else {
            d3.json(d.file, d.function);
        }
    })
}

function endFetch() {
    numCalls--;
    if (numCalls==0) {
       // dataDispatch.end();
        main();
    }
}
