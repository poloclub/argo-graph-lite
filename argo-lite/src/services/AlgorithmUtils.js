const jsnx = require('jsnetworkx');
const jsgraphs = require('js-graph-algorithms');

/**
 * Convert Argo-lite snapshot for use in the JSNetworkX library.
 * @param {*} snapshot Argo-lite Snapshot Object exported by GraphStore
 */
export function convertToJsnx(snapshot) {
    const jsnxGraph = new jsnx.Graph();
    jsnxGraph.addNodesFrom(snapshot.rawGraph.nodes.map(n => [n.id, n]));
    jsnxGraph.addEdgesFrom(snapshot.rawGraph.edges.map(e => [e.source_id, e.target_id]));
    return jsnxGraph;
}

/**
 * Convert Argo-lite snapshot for use in the ngraph library.
 * @param {*} snapshot Argo-lite Snapshot Object exported by GraphStore
 */
export function convertToNGraph(snapshot) {
    return null;
}

/**
 * Convert Argo-lite snapshot for use in the js-graph-algorithms library.
 * @param {*} snapshot Argo-lite Snapshot Object exported by GraphStore
 */
export function convertToJSGraph(snapshot) {
    var idDict = {};
    var i;
    for (i = 0; i < snapshot.rawGraph.nodes.length; i++) {
        idDict[snapshot.rawGraph.nodes[i].id] = i;
    }
    var g = new jsgraphs.Graph(snapshot.rawGraph.nodes.length);
    snapshot.rawGraph.edges.forEach(e => {
        g.addEdge(idDict[e.source_id], idDict[e.target_id]);
    });
    return [g, idDict];
}

/**
 * Convert Argo-lite snapshot for use in the js-graph-algorithms library (Weighted).
 * @param {*} snapshot Argo-lite Snapshot Object exported by GraphStore
 */
export function convertToJSGraphWeightedDi(snapshot) {
    var idDict = {};
    var i;
    for (i = 0; i < snapshot.rawGraph.nodes.length; i++) {
        idDict[snapshot.rawGraph.nodes[i].id] = i;
    }
    var g = new jsgraphs.WeightedDiGraph(snapshot.rawGraph.nodes.length);
    snapshot.rawGraph.edges.forEach(e => {
        g.addEdge(new jsgraphs.Edge(idDict[e.source_id], idDict[e.target_id], 1.0));
    });
    return [g, idDict];
}

/**
 * Convert Argo-lite snapshot to the GEXF format.
 * @param {*} snapshot Argo-lite Snapshot Object exported by GraphStore
 */
export function convertToGexf(snapshot) {
    return null;
}

/**
 * Calculate the average clustering coefficient of the (undirected unweighted) graph.
 * @param {*} snapshot Argo-lite Snapshot Object exported by GraphStore
 */
export function averageClusteringCoefficient(snapshot) {
    const jsnxGraph = convertToJsnx(snapshot);
    const result = jsnx.averageClustering(jsnxGraph);
    console.log('Computing Clustering Coefficient');
    return result;
}

/**
 * Calculate the number of connected components in a graph
 * @param {*} rawGraph the rawGraph inside appState
 */
export function connectedComponents(snapshot) {
    var cc = new jsgraphs.ConnectedComponents(convertToJSGraph(snapshot)[0]);
    return cc.componentCount();
}

/**
 * Calculate the density of a graph
 * @param {*} rawGraph the rawGraph inside appState
 */
export function graphDensity(snapshot) {
    const nodeCount = snapshot.rawGraph.nodes.length;
    const edgeCount = snapshot.rawGraph.edges.length / 2;
    return (2 * edgeCount) / ((nodeCount) * (nodeCount - 1));
}

/**
 * Calculate the average degree of a graph
 * @param {*} rawGraph the rawGraph inside appState
 */
export function averageDegree(snapshot) {
    let sum = 0;
    snapshot.rawGraph.nodes.forEach(e => {
            sum += e.degree;
        }
    )
    return sum / snapshot.rawGraph.nodes.length;
}

/**
 * Calculate the diameter of a graph
 * @param {*} rawGraph the rawGraph inside appState
 */
export function exactGraphDiameter(snapshot) {
    let temp = convertToJSGraphWeightedDi(snapshot);
    let jsg = temp[0];
    let idDict = temp[1]
    let dia = -1;
    snapshot.rawGraph.nodes.forEach(e => {
        let dijkstra = new jsgraphs.Dijkstra(jsg, idDict[e.id]);
        snapshot.rawGraph.nodes.forEach(f => {
            if(dijkstra.hasPathTo(idDict[f.id])){
                let pathLength = dijkstra.pathTo(idDict[f.id]).length;
                dia = Math.max(dia, pathLength);
            }
        })
    });
    return dia;
}
 