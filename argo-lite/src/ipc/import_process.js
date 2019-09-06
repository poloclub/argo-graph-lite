const createGraph = require('ngraph.graph');
const pageRank = require('ngraph.pagerank');

const runImport = (config, nodesArr, edges) => {
    const graph = createGraph();

    const degreeDict = {};
    
    if (config.hasNodeFile) {
        nodesArr.forEach(node =>
          graph.addNode(node[config.nodes.mapping.id].toString(), {
            id: node[config.nodes.mapping.id].toString(),
            degree: 0,
            ...node,
          }),
        );
        nodesArr = nodesArr.map(n => ({
          ...n,
          id: n[config.nodes.mapping.id].toString(),
          degree: 0,
          pagerank: 0,
        }));
        nodesArr.forEach(n => (degreeDict[n.id] = 0));
      }
    
    if (config.edges.createMissing) {
        edges.forEach(it => {
          const from = it[config.edges.mapping.fromId].toString();
          const to = it[config.edges.mapping.toId].toString();
          if (!graph.hasNode(from)) {
            graph.addNode(from, { id: from, degree: 0 });
            nodesArr.push({ id: from, degree: 0, pagerank: 0 });
            degreeDict[from] = 0;
          }
          if (!graph.hasNode(to)) {
            graph.addNode(to, { id: to, degree: 0 });
            nodesArr.push({ id: to, degree: 0, pagerank: 0 });
            degreeDict[to] = 0;
          }
        });
      }
    
    const edgesSet = new Set(
        edges
          .map(
            it =>
              `${it[config.edges.mapping.fromId]}😈${
                it[config.edges.mapping.toId]
              }`,
          )
          .concat(
            edges.map(
              it =>
                `${it[config.edges.mapping.toId]}😈${
                  it[config.edges.mapping.fromId]
                }`,
            ),
          ),
    );
    
    const edgesArr = [];
    edgesSet.forEach(it => {
        const [from, to] = it.split('😈');
        graph.addLink(from, to);
        degreeDict[from] += 1;
        edgesArr.push({
          source_id: from,
          target_id: to,
        });
    });
    
    const rank = pageRank(graph);
    
    nodesArr = nodesArr.map(n => ({
        ...n,
        pagerank: rank[n.id],
        degree: degreeDict[n.id],
    }));

    return {
      nodes: nodesArr,
      edges: edgesArr
    };
};

process.on('message', (msg) => {
    const output = runImport(
        msg.config,
        msg.nodesArr,
        msg.edges
    );
    process.send(output);
});


