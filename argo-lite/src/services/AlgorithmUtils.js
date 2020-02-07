const jsnx = require('jsnetworkx');

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
    return null;
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