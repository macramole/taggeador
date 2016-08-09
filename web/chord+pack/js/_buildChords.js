
function buildChords() {
    var  matrix = [];
    labels=[];
    chords=[];

    for (var i=0; i < tags.length; i++) {
        var l={};
        l.index=i;
        l.label="null";
        l.angle=0;
        labels.push(l);

        var c={}
        c.label="null";
        c.source={};
        c.target={};
        chords.push(c);

    }


    buf_indexByName=indexByName;

    indexByName=[];
    //nameByIndex=[];
    var tagsByIndex = [];
    n = 0;

    // Compute a unique index for each package name
    tags.forEach(function(d) {

        //d = d.nombre;
        if (!(d in indexByName)) {
              tagsByIndex[n] = d;
              indexByName[d.nombre] = n++;
        }
    });

     tags.forEach(function(d) {
        var source = indexByName[d.nombre],
            row = matrix[source];
        if (!row) {
            row = matrix[source] = [];
            for (var i = -1; ++i < n;) row[i] = 0;
        }

        row[indexByName[d.nombre]]= Number(d.cantidad);
        //totalPacAmount+=Number(d.cantidad);
    });

  //  console.log("totalPacAmount=" + totalPacAmount)
    chord.matrix(matrix);

    var tempLabels=[];
    var tempChords=[];

    chords=chord.chords();
    //var i=0;
    chords.forEach(function (d) {
        d.label=tagsByIndex[d.source.index].nombre;
        d.categoria = tagsByIndex[d.source.index].categoria;
        d.angle=(d.source.startAngle + d.source.endAngle) / 2
        var o={};
        o.startAngle= d.source.startAngle;
        o.endAngle= d.source.endAngle;
        o.index= d.source.index;
        o.value= d.source.value;
        o.currentAngle= d.source.startAngle;
        o.currentLinkAngle= d.source.startAngle;
        //o.cantidad = d.source.cantidad;
        //console.log(d);
        o.source= d.source;
        o.categoria = tagsByIndex[d.source.index].categoria;
        o.relatedLinks=[];
        chordsById[d.label]= o;
        //i++;
    });

    log("buildChords()");
}
