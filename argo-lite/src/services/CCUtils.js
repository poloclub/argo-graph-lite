var jsgraphs = require('js-graph-algorithms');

export function connectedComponents(rawGraph) {
    var idDict = {};
    var i;
    for (i = 0; i < rawGraph.nodes.length; i++) {
        idDict[rawGraph.nodes[i].id] = i;
    }
    var g = new jsgraphs.Graph(rawGraph.nodes.length);
    rawGraph.edges.forEach(e => {
        g.addEdge(idDict[e.source_id], idDict[e.target_id]);
    });
    var cc = new jsgraphs.ConnectedComponents(g);
    console.log("!!!!!!!!!!1");
    return cc.componentCount();
}
 