function initialize() {
    buildChords();

    var root={};
    root.children = imagenes;
    root.grupo = "root";

    nodes = bubble.nodes(root);

    nodes.forEach (function (d) {
        if (d.depth > 0) {
            nodesById[d.id]=d;
        }
    });
}
