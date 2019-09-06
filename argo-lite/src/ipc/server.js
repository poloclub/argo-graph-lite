import { app, dialog, ipcMain, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import createGraph from 'ngraph.graph';
import pageRank from 'ngraph.pagerank';
import Database from 'better-sqlite3';
import {
  ADD_NODE,
  ADD_NODES,
  ADD_SELECT_NODE,
  CHOOSE_EDGE_FILE,
  CHOOSE_GRAPH_FILE,
  CHOOSE_NODE_FILE,
  CHOOSE_STATE_FILE,
  CHOSEN_EDGE_FILE,
  CHOSEN_GRAPH_FILE,
  CHOSEN_NODE_FILE,
  CHOSEN_STATE_FILE,
  GET_NEIGHBORS,
  IMPORT_GRAPH,
  IMPORTED_GRAPH,
  LOAD_GRAPH_SQLITE,
  LOADED_GRAPH_SQLITE,
  CREATE_NEW_PROJECT,
  CREATED_NEW_PROJECT,
  OPEN_GRAPH,
  OPENED_GRAPH,
  FETCH_WORKSPACE_PROJECTS,
  FETCHED_WORKSPACE_PROJECTS,
  SAVE_GRAPH_JSON,
  SAVE_GRAPH_SQLITE,
  SAVE_GRAPH_STATE,
  SAVED_GRAPH_JSON,
  SAVED_GRAPH_STATE,
  SEARCH_REQUEST,
  SEARCH_RESPONSE,
  SHOW_ITEM_IN_FOLDER,
  SAVE_GRAPH_STATE_TO_PROJECT,
  SAVED_GRAPH_STATE_TO_PROJECT,
  DELETE_FILE,
  RENAME_FILE,
  SHOW_WORKSPACE_FOLDER,
  SAVE_USER_CONFIG,
  LOAD_USER_CONFIG,
  LOADED_USER_CONFIG,
  SAVED_USER_CONFIG,
  CHANGE_WORKSPACE_FOLDER,
  CHANGED_WORKSPACE_FOLDER,
} from '../constants';

import { readCSV } from '../services/CSVUtils';

let currentDb = null;

// The user data path defined by electron, different depending on OS.
const USER_DATA_PATH = app.getPath('userData');

// The default workspace folder used by our application,
// unless the config file contains another path.
const DEFAULT_WORKSPACE_PATH = path.join(USER_DATA_PATH, 'workspace');

// Application config file (might or might not be present) containing
// global user preference for this application.
const USER_CONFIG_FILE_PATH = path.join(USER_DATA_PATH, 'argoconfig.json');

let USER_CONFIG = {
  workspace: DEFAULT_WORKSPACE_PATH
};

if (fs.existsSync(USER_CONFIG_FILE_PATH)) {
  USER_CONFIG = JSON.parse(fs.readFileSync(USER_CONFIG_FILE_PATH));
} else {
  // Since the config file doesn't yet exist, create the config file.
  fs.writeFileSync(USER_CONFIG_FILE_PATH, JSON.stringify(USER_CONFIG));
}

// Check the config file content and see if there's a different workspace path
// set by the user.
let WORKSPACE_PATH = DEFAULT_WORKSPACE_PATH;
if (USER_CONFIG.workspace && USER_CONFIG.workspace != '') {
  WORKSPACE_PATH = USER_CONFIG.workspace;
}


var createTempNodeTables = function(name) {
  currentDb.exec(`
    DROP TABLE IF EXISTS \`${name}\`;
    CREATE TEMPORARY TABLE IF NOT EXISTS \`${name}\` (
    \`node_id\` VARCHAR(255),
    \`pagerank\` REAL,
    \`degree\` INTEGER,
    PRIMARY KEY(\`node_id\`)
    );
    
    DROP TABLE IF EXISTS \`${name}_properties\`;
    CREATE TEMPORARY TABLE IF NOT EXISTS \`${name}_properties\` (
    \`node_id\` VARCHAR ( 255 ),
    \`key\` ARCHAR ( 255 ),
    \`value\` TEXT
    );`);
};

var getNodeProps = function(name) {
  currentDb.exec(`
    INSERT INTO ${name}_properties
    SELECT
      ${name}.node_id AS node_id,
      node_properties.key AS key,
      node_properties.value AS value
    FROM ${name}
    INNER JOIN node_properties ON ${name}.node_id = node_properties.node_id;
    `);
};

var createTempEdgeTable = function(name, nodesName, allNodes) {
  currentDb.exec(`
    DROP TABLE IF EXISTS \`${name}\`;
    CREATE  TEMPORARY TABLE IF NOT EXISTS \`${name}\` (
      \`source_id\` VARCHAR ( 255 ),
      \`target_id\` VARCHAR ( 255 ),
      PRIMARY KEY(\`source_id\`,\`target_id\`)
    );
    WITH thenodes(node_id) AS (SELECT node_id FROM ${nodesName} UNION SELECT node_id FROM ${allNodes})
    INSERT INTO ${name}
    SELECT source_id, target_id
    FROM edges
    WHERE (source_id IN thenodes AND target_id IN thenodes)
    `);
};

var getNodesArr = function(nodesName) {
  const propsMap = new Map();
  const nodesArrNoProp = currentDb
    .prepare(`SELECT * FROM ${nodesName}`)
    .all()
    .map(it => ({
      id: it.node_id, // the codebase has been using the id attribute for awhile, but in the user interfaces we should aim to only show "node_id", though they are the same thing.
      ...it,
    }));

  nodesArrNoProp.forEach(({ node_id }) => (propsMap[node_id] = {}));
  currentDb
    .prepare(`SELECT * FROM ${nodesName}_properties`)
    .all()
    .forEach(({ node_id, key, value }) => (propsMap[node_id][key] = value));

  return nodesArrNoProp.map(it => ({
    ...it,
    ...propsMap[it.node_id],
  }));
};

function actualLoadSQL(currentDb) {

  var nodesName = 'topnodes';
  var edgesName = 'topedges';
  createTempNodeTables(nodesName);
  currentDb.exec(`
    INSERT INTO topnodes
    SELECT node_id, pagerank, degree
    FROM nodes
    ORDER BY pagerank desc
    LIMIT 200;
    `);
  getNodeProps(nodesName);
  createTempEdgeTable(edgesName, nodesName, nodesName);

  const edgesArr = currentDb.prepare(`SELECT * FROM ${edgesName}`).all();
  const nodesArr = getNodesArr(nodesName);

  return {
    rawGraph: { nodes: nodesArr, edges: edgesArr },
    metadata: {
      nodeProperties: Object.keys(nodesArr[0]),
      nodeComputed: ['pagerank', 'degree'],
      edgeProperties: ['source_id', 'target_id'],
    },
  };
}

export function loadGraphSQLite(window) {
  dialog.showOpenDialog(
    {
      properties: ['openFile'],
      filters: [{ name: 'Argo Graph File', extensions: ['argograph'] }],
    },
    filePaths => {
      if (filePaths) {
        // fs.readFile(filePaths[0], 'utf8', (err, data) => {
        //   window.webContents.send(LOADED_GRAPH_JSON, JSON.parse(data));
        // });
        currentDb = new Database(filePaths[0])
        window.webContents.send(IMPORTED_GRAPH, actualLoadSQL(currentDb));
      }
    },
  );
}

function actualLoadState(file) {
  if (file === '') {
    return 'null';
  }
  return fs.readFileSync(file, 'utf8');
}

export default function registerIPC(window) {

  /**
   * Fetch workspace projects and send to the rendering process
   * The rendering process is supposed to update state whenever this is called.
   */
  function fetchWorkspaceProjects() {
      const projects = [];
      // Get every directory that is a valid project directory
      // from the default workspace directory
      // A valid project directory contains 'argo-project.json' metadata file
      fs.readdirSync(WORKSPACE_PATH)
        .map(name => path.join(WORKSPACE_PATH, name))
        .filter((name) => fs.lstatSync(name).isDirectory()
          && fs.existsSync(path.join(name, 'argo-project.json')))
        .forEach((projectDirectoryPath) => {
          const metadata = JSON.parse(fs.readFileSync(path.join(projectDirectoryPath, 'argo-project.json')));
          metadata.projectPath = projectDirectoryPath;
          // Check whether the 'argograph' file is in the directory
          metadata.graphDataPath = path.join(projectDirectoryPath, 'data.argograph');
          metadata.hasGraphData = fs.existsSync(metadata.graphDataPath);
          metadata.snapshotPaths = fs.readdirSync(projectDirectoryPath)
            .filter(name => name.split('.').pop() === 'argosnapshot')
            .map(name => path.join(projectDirectoryPath, name))
            .filter(name => fs.lstatSync(name).isFile());
          projects.push(metadata);
        });
      window.webContents.send(FETCHED_WORKSPACE_PROJECTS, projects);
  }
  // ipcMain.on(LOAD_GRAPH_JSON, () => {
  //   dialog.showOpenDialog(
  //     {
  //       properties: ['openFile'],
  //       filters: [{ name: 'Argo Graph File', extensions: ['db'] }],
  //     },
  //     (filePaths) => {
  //       if (filePaths) {
  //         fs.readFile(filePaths[0], 'utf8', (err, data) => {
  //           window.webContents.send(LOADED_GRAPH_JSON, JSON.parse(data));
  //         });
  //       }
  //     },
  //   );
  // });
  ipcMain.on(CREATE_NEW_PROJECT, (event, projectMetadata) => {
    const projectPath = path.join(WORKSPACE_PATH, projectMetadata.name);
    // Create the project folder and metadata file argo-project.json
    fs.mkdirSync(projectPath);
    fs.writeFileSync(path.join(projectPath, 'argo-project.json'), JSON.stringify(projectMetadata));
    window.webContents.send(CREATED_NEW_PROJECT);
  });

  ipcMain.on(FETCH_WORKSPACE_PROJECTS, () => {
    // Fetch workspace projects and send to frontend
    fetchWorkspaceProjects();
  });

  ipcMain.on(DELETE_FILE, (event, filePath) => {
    fs.unlinkSync(filePath);
    fetchWorkspaceProjects();
  });

  ipcMain.on(RENAME_FILE, (filePath, newName) => {
    fs.renameSync(filePath, path.join(filePath, '..', newName));
    fetchWorkspaceProjects();
  });

  ipcMain.on(OPEN_GRAPH, (event, graphPath, statePath) => {
    currentDb = new Database(graphPath);
    window.webContents.send(OPENED_GRAPH, {
      ...actualLoadSQL(currentDb),
      state: actualLoadState(statePath),
    });
  });

  ipcMain.on(GET_NEIGHBORS, (event, node_id, attr, num, order) => {
    var nodesName = 'newnodes';
    var allnodes = 'topnodes';
    var edgesName = 'newedges';
    createTempNodeTables(nodesName);
    currentDb.exec(`
    INSERT INTO ${nodesName}
    SELECT * FROM nodes WHERE node_id in
    (SELECT DISTINCT * FROM 
    (SELECT target_id FROM edges WHERE source_id='${node_id}'
    UNION
    SELECT source_id FROM edges WHERE target_id='${node_id}'
    EXCEPT
    SELECT node_id FROM ${allnodes}))
    ORDER BY ${attr} ${order} LIMIT ${num};`);
    currentDb.exec(`
    INSERT INTO ${allnodes}
    SELECT * FROM ${nodesName};`);
    getNodeProps(nodesName);
    createTempEdgeTable(edgesName, nodesName, allnodes);

    const edgesArr = currentDb.prepare(`SELECT * FROM ${edgesName}`).all();
    const nodesArr = getNodesArr(nodesName);

    window.webContents.send(ADD_NODES, {
      nodes: nodesArr,
      edges: edgesArr,
    });
  });

  ipcMain.on(ADD_NODE, (event, node_id) => {
    var nodesName = 'newnodes';
    var allnodes = 'topnodes';
    var edgesName = 'newedges';
    createTempNodeTables(nodesName);
    currentDb.exec(`
    INSERT INTO newnodes
    SELECT * FROM nodes WHERE node_id='${node_id}';`);
    getNodeProps(nodesName);
    createTempEdgeTable(edgesName, nodesName, allnodes);

    const edgesArr = currentDb.prepare(`SELECT * FROM ${edgesName}`).all();
    const nodesArr = getNodesArr(nodesName);

    window.webContents.send(ADD_SELECT_NODE, {
      nodes: nodesArr,
      edges: edgesArr,
    });
  });

  ipcMain.on(SAVE_GRAPH_STATE, (event, json) => {
    // TODO: race cond.: what if user closes the window before save is complete?
    dialog.showSaveDialog(
      {
        filters: [
          { name: 'Argo Graph Snapshot File', extensions: ['argosnapshot'] },
        ],
      },
      filePath => {
        if (filePath) {
          fs.writeFile(filePath, json, () => {
            window.webContents.send(SAVED_GRAPH_STATE, filePath);
          });
        }
      },
    );
  });

  // snapshotName is the filename without extension
  ipcMain.on(SAVE_GRAPH_STATE_TO_PROJECT, (event, json, projectDirectoryPath, snapshotName) => {
    // TODO: race cond.: what if user closes the window before save is complete?
    const filePath = path.join(projectDirectoryPath, snapshotName + '.argosnapshot');
    fs.writeFile(filePath, json, () => {
      window.webContents.send(SAVED_GRAPH_STATE_TO_PROJECT, snapshotName);
    });
  });

  ipcMain.on(LOAD_GRAPH_SQLITE, event => {
    loadGraphSQLite(window);
  });

  ipcMain.on(SAVE_GRAPH_JSON, (event, json) => {
    // TODO: race cond.: what if user closes the window before save is complete?
    dialog.showSaveDialog(
      { filters: [{ name: 'Argo Graph File', extensions: ['argo'] }] },
      filePath => {
        if (filePath) {
          fs.writeFile(filePath, json, () => {
            window.webContents.send(SAVED_GRAPH_JSON, filePath);
          });
        }
      },
    );
  });


  function sqlliteSaveHelper (pathToSave, graph) {
    const saveHelperProcess = fork(path.resolve(app.getAppPath(), './src/ipc/sqlite_save_process.js'));
    saveHelperProcess.send({
      dbPath: pathToSave,
      graph
    });
    saveHelperProcess.on('message', (msg) => {
      if (msg === 'success') {
        console.log('Save successful');
        window.webContents.send(IMPORTED_GRAPH); // let client know, so that it can refetch project after import
      } else {
        console.error(`Save graph failed: ${msg}`);
      }
    });
  }

  ipcMain.on(SAVE_GRAPH_SQLITE, (event, json) => {
    // TODO: race cond.: what if user closes the window before save is complete?
    dialog.showSaveDialog(
      { filters: [{ name: 'Argo Graph File', extensions: ['argograph'] }] },
      filePath => {
        if (filePath) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          const graph = JSON.parse(json);
          sqlliteSaveHelper(filePath, graph.graph)
        }
      },
    );
  });

  ipcMain.on(SEARCH_REQUEST, (event, searchStr, order) => {
    currentDb.exec(`
    DROP TABLE IF EXISTS \`searchnodes\`;
    CREATE TEMPORARY TABLE IF NOT EXISTS \`searchnodes\` (
    \`node_id\` VARCHAR(255),
    PRIMARY KEY(\`node_id\`)
    );
    DELETE FROM \`searchnodes\`;
    `);

    var searchDb = 'nodes_search';

    // FUTURE CODE FOR SEARCHING ONLY LOCAL NODES
    // if (false) {
    //   searchDb = "nodes_search_local";
    //   currentDb.exec(
    //     `CREATE TABLE IF NOT EXISTS ${searchDb} USING fts5(node_id)`,
    //   );
    //   currentDb.exec(`INSERT INTO ${searchDb} SELECT value FROM node_properties WHERE node_id IN (SELECT node_id FROM topnodes) AND key="title";`);
    // }

    currentDb.exec(`
    INSERT INTO searchnodes
    SELECT DISTINCT node_id FROM ${searchDb}
    WHERE ${searchDb} MATCH '${searchStr}*';
    `);

    const nodeIds = currentDb.prepare('SELECT * FROM searchnodes').all();
    const propsMap = new Map();
    nodeIds.forEach(({ node_id }) => (propsMap[node_id] = {}));

    currentDb
      .prepare(
        'SELECT * FROM node_properties WHERE node_id IN (SELECT node_id FROM searchnodes)',
      )
      .all()
      .forEach(({ node_id, key, value }) => (propsMap[node_id][key] = value));

    var propsArr = currentDb
      .prepare(
        `SELECT * FROM nodes
        WHERE node_id
        IN (SELECT node_id
        FROM (SELECT node_id, degree FROM nodes WHERE node_id
          IN (SELECT node_id FROM searchnodes)
          )
        )
        ORDER BY ${order} desc`,
      )
      .all();

    propsArr.forEach(e => Object.assign(e, propsMap[e.node_id]));

    window.webContents.send(SEARCH_RESPONSE, JSON.stringify(propsArr));
  });

  ipcMain.on(SHOW_ITEM_IN_FOLDER, (event, path) => {
    shell.showItemInFolder(path);
  });

  ipcMain.on(SHOW_WORKSPACE_FOLDER, (event) => {
    shell.openItem(WORKSPACE_PATH);
  });

  ipcMain.on(CHOOSE_NODE_FILE, () => {
    dialog.showOpenDialog(
      {
        filters: [{ name: 'CSV File', extensions: ['csv'] }],
        properties: ['openFile'],
      },
      filePaths => {
        if (filePaths) {
          window.webContents.send(CHOSEN_NODE_FILE, filePaths[0]);
        }
      },
    );
  });

  ipcMain.on(CHOOSE_EDGE_FILE, () => {
    dialog.showOpenDialog(
      {
        filters: [{ name: 'CSV File', extensions: ['csv'] }],
        properties: ['openFile'],
      },
      filePaths => {
        if (filePaths) {
          window.webContents.send(CHOSEN_EDGE_FILE, filePaths[0]);
        }
      },
    );
  });

  ipcMain.on(CHOOSE_GRAPH_FILE, () => {
    dialog.showOpenDialog(
      {
        filters: [{ name: 'ARGO Database File', extensions: ['argograph'] }],
        properties: ['openFile'],
      },
      filePaths => {
        if (filePaths) {
          window.webContents.send(CHOSEN_GRAPH_FILE, filePaths[0]);
        }
      },
    );
  });

  ipcMain.on(CHOOSE_STATE_FILE, () => {
    dialog.showOpenDialog(
      {
        filters: [
          { name: 'ARGO Graph Snapshot File', extensions: ['argosnapshot'] },
        ],
        properties: ['openFile'],
      },
      filePaths => {
        if (filePaths) {
          window.webContents.send(CHOSEN_STATE_FILE, filePaths[0]);
        }
      },
    );
  });

  ipcMain.on(IMPORT_GRAPH, async (event, config) => {
    let nodesArr = [];
    if (config.hasNodeFile) {
      console.log(`[${new Date().toUTCString()}] Start reading nodes CSV`);
      nodesArr = await readCSV(config.nodes.path, config.nodes.hasColumns, config.delimiter);
    }
    console.log(`[${new Date().toUTCString()}] Start reading edges CSV`);
    const edges = await readCSV(config.edges.path, config.edges.hasColumns, config.delimiter);
    
    const importInput = {
      config,
      nodesArr,
      edges
    };

    console.log(`[${new Date().toUTCString()}] Start import process`);
    const importHelperProcess = fork(path.resolve(app.getAppPath(), './src/ipc/import_process.js'));
    importHelperProcess.send(importInput);
    importHelperProcess.on('message', (msg) => {
      console.log(`[${new Date().toUTCString()}] Return from import process`);
      const outputGraph = msg;

      // Prepare to save to SQLite
      const pathToSave = path.join(WORKSPACE_PATH, config.newProjectName, 'data.argograph');
  
      sqlliteSaveHelper(pathToSave, outputGraph);
    });

  });

  ipcMain.on(LOAD_USER_CONFIG, () => {
    window.webContents.send(LOADED_USER_CONFIG, USER_CONFIG);
  });

  ipcMain.on(SAVE_USER_CONFIG, (event, userConfig) => {
    fs.writeFileSync(USER_CONFIG_FILE_PATH, JSON.stringify(userConfig));
    window.webContents.send(SAVED_USER_CONFIG);
  });

  ipcMain.on(CHANGE_WORKSPACE_FOLDER, () => {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    },
    filePaths => {
      if (filePaths && filePaths.length == 1) {
        window.webContents.send(CHANGED_WORKSPACE_FOLDER, filePaths[0]);
      }
    });
  });
}

export function cleanUp() {
  if (currentDb !== null) {
    currentDb.close();
  }
}
