const Database = require('better-sqlite3');

const run = (dbPath, graph) => {
  const currentDb = new Database(dbPath);

  currentDb.exec('PRAGMA journal_mode=OFF;');
  currentDb.exec('PRAGMA synchronous=OFF;');
  currentDb.exec(
    'CREATE TABLE IF NOT EXISTS edges (source_id VARCHAR(255), target_id VARCHAR(255));',
  );
  currentDb.exec('DELETE FROM edges;');
  const insertRow = currentDb.prepare('INSERT INTO edges VALUES(?,?);');
  graph.edges.forEach(({ source_id, target_id }) => {
    insertRow.run(source_id, target_id);
  });
  currentDb.exec(`CREATE TABLE IF NOT EXISTS nodes (
  node_id VARCHAR(255),
  pagerank REAL,
  degree INTEGER
  );`);
  currentDb.exec('DELETE FROM nodes;');
  const insertNode = currentDb.prepare(
    'INSERT INTO nodes VALUES(?, ?, ?);',
  );
  graph.nodes.forEach(({ pagerank, degree, id }) => {
    insertNode.run(id, pagerank, degree);
  });
  currentDb.exec(
    'CREATE INDEX idx_source_id_edges ON edges(source_id);',
  );
  currentDb.exec(
    'CREATE INDEX idx_target_id_edges ON edges(target_id);',
  );
  currentDb.exec('CREATE INDEX idx_node_id_edges ON nodes(node_id);');
  currentDb.exec(`CREATE TABLE IF NOT EXISTS node_properties (
  node_id VARCHAR(255),
  key VARCHAR(255),
  value TEXT
  );`);
  currentDb.exec('DELETE FROM node_properties');
  const insertProp = currentDb.prepare(
    'INSERT INTO node_properties VALUES(?, ?, ?);',
  );
  graph.nodes.forEach(n => {
    for (const prop in n) {
      if (n.hasOwnProperty(prop) && prop !== 'pagerank' && prop !== 'degree' && prop !== 'id') {
        insertProp.run(n.node_id, prop, n[prop]);
      }
    }
  });
  // not saving anything additional for now
  currentDb.exec(
    'CREATE VIRTUAL TABLE IF NOT EXISTS nodes_search USING fts5(node_id)',
  );
  currentDb.exec('INSERT INTO nodes_search SELECT node_id FROM nodes;');

  // clean up
  currentDb.close();

  // return a message to indicate success/completion
  return 'success';
};

process.on('message', (msg) => {
    const output = run(msg.dbPath, msg.graph);
    process.send(output);
});


