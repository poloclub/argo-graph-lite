import { autorun, runInAction } from "mobx";

import PreferencesStore from "./PreferencesStore";
import GraphStore from "./GraphStore";
import ImportStore from "./ImportStore";
import ProjectStore from "./ProjectStore";
// import { peakCSV } from "../services/CSVUtils";
import parse from "csv-parse/lib/sync";
import SearchStore from "./SearchStore";
import { runSearch } from "../ipc/client";

export class AppState {
  constructor() {
    this.preferences = new PreferencesStore();
    this.graph = new GraphStore();
    this.import = new ImportStore();
    this.search = new SearchStore();
    this.project = new ProjectStore();
  }
}

const appState = new AppState();

window.appState = appState;

window.loadInitialSampleGraph = () => {
  appState.graph.loadImmediateStates(JSON.stringify({"rawGraph":{"edges":[{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"},{"source_id":"31929","target_id":"31856"},{"source_id":"31856","target_id":"31929"},{"source_id":"38261","target_id":"35008"},{"source_id":"38261","target_id":"37364"},{"source_id":"37364","target_id":"38261"},{"source_id":"35008","target_id":"38261"}],"nodes":[{"degree":46,"id":"30401","node_id":"30401","pagerank":0.0001610475429392458},{"degree":45,"id":"29146","node_id":"29146","pagerank":0.0001405571154125152},{"degree":47,"id":"29389","node_id":"29389","pagerank":0.00013845517423706656},{"degree":40,"id":"37364","node_id":"37364","pagerank":0.00012864913969860785},{"degree":38,"id":"38261","node_id":"38261","pagerank":0.0001237408416451602},{"degree":40,"id":"5775","node_id":"5775","pagerank":0.00011927467467788308},{"degree":37,"id":"31856","node_id":"31856","pagerank":0.00010983296244476881},{"degree":31,"id":"35008","node_id":"35008","pagerank":0.00010964397869485237},{"degree":33,"id":"31929","node_id":"31929","pagerank":0.00010307110662161878}]},"overrides":{},"positions":{"5775":[77.86556229750985,-55.159588742684996],"29146":[-93.98867061884496,-31.81789645431793],"29389":[91.23582494216866,-20.63352663130463],"30401":[4.7336307214701705,-110.74468363311841],"31856":[54.85930885163915,-75.73220165746379],"31929":[25.175584737628157,-80.12587471476122],"35008":[-75.94943003609173,-70.10017127574636],"37364":[-28.932282891551885,-97.427016420678],"38261":[-45.855556856078145,-72.4841433931064]}}));
};

// Load initial sample graph when Argo Lite is ready
window.addEventListener('load', (event) => {
  window.loadInitialSampleGraph();
});

const updateTimeout = null;

// Load graph on frontend once the rawGraph has been returned from IPC
// Once a graph has been loaded and displayed, even if nodes are all deleted, still consider it "hasGraph"
autorun(() => {
  if (!appState.graph.hasGraph && appState.graph.rawGraph.nodes.length > 0) {
    appState.graph.hasGraph = true;
  }
})

autorun(() => {
  if (appState.graph.frame) {
    appState.graph.frame.setAllNodesShape(appState.graph.nodes.shape);
    appState.graph.frame.setLabelRelativeSize(appState.graph.nodes.labelSize);
    appState.graph.frame.setLabelLength(appState.graph.nodes.labelLength);
    appState.graph.frame.updateGraph(appState.graph.computedGraph);
  }
});

autorun(() => {
  if (appState.graph.frame && appState.graph.positions) {
    appState.graph.frame.updatePositions(appState.graph.positions);
    appState.graph.positions = null;
  }
});

// autorun(() => {
//   const nodeFile = appState.import.importConfig.nodeFile;
//   if (nodeFile.path) {
//     peakCSV(nodeFile.path, nodeFile.hasColumns, edgeFile.delimiter).then(it => {
//       runInAction("preview top N lines of node file", () => {
//         nodeFile.topN = it;
//         nodeFile.columns = Object.keys(it[0]);
//         nodeFile.mapping.id = nodeFile.columns[0];
//         nodeFile.ready = true;
//       });
//     });
//   }
// });

autorun(() => {
  const searchStr = appState.search.searchStr;
  if (searchStr.length >= 3) {
    runSearch(searchStr);
  } else {
    appState.search.panelOpen = false;
    appState.search.candidates.splice(0, appState.search.candidates.length);
    if (appState.graph.frame) {
      appState.graph.frame.highlightNodeIds([], true);
    }
  }
});

// autorun(() => {
//   const edgeFile = appState.import.importConfig.edgeFile;
//   if (edgeFile.path) {
//     peakCSV(edgeFile.path, edgeFile.hasColumns, edgeFile.delimiter).then(it => {
//       runInAction("preview top N lines of edge file", () => {
//         edgeFile.topN = it;
//         edgeFile.columns = Object.keys(it[0]);
//         edgeFile.mapping.fromId = edgeFile.columns[0];
//         edgeFile.mapping.toId = edgeFile.columns[0];
//         edgeFile.ready = true;
//       });
//     });
//   }
// });

// Argo-lite specific: extract CSV from File object and update related fields.
autorun(() => {
  const file = appState.import.selectedEdgeFileFromInput;
  const hasHeader = appState.import.importConfig.edgeFile.hasColumns;
  const delimiter = appState.import.importConfig.edgeFile.delimiter;

  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.readAsText(file);

  reader.onload = () => {
    // Read entire CSV into memory as string
    const fileAsString = reader.result;
    // Get top 20 lines. Or if there's less than 10 line, get all the lines.
    const lines = fileAsString.split('\n');
    const lineNumber = lines.length;
    const topLinesAsString = lines.map(l => l.trim()).filter((l, i) => i < 20).join('\n');
    console.log(topLinesAsString);

    // Parse the top lines
    const it = hasHeader ? parse(topLinesAsString, {
        comment: "#",
        trim: true,
        auto_parse: true,
        skip_empty_lines: true,
        columns: hasHeader,
        delimiter
      }) : parse(topLinesAsString, {
        comment: "#",
        trim: true,
        auto_parse: true,
        skip_empty_lines: true,
        columns: undefined,
        delimiter
      });

    runInAction("preview top N lines of edge file", () => {
      appState.import.importConfig.edgeFile.topN = it;
      appState.import.importConfig.edgeFile.columns = Object.keys(it[0]);
      appState.import.importConfig.edgeFile.mapping.fromId = appState.import.importConfig.edgeFile.columns[0];
      appState.import.importConfig.edgeFile.mapping.toId = appState.import.importConfig.edgeFile.columns[0]
      appState.import.importConfig.edgeFile.ready = true;
    });
  };

  reader.onerror = () => {
    console.error(reader.error);
  };
});

autorun(() => {
  const file = appState.import.selectedNodeFileFromInput;
  const hasHeader = appState.import.importConfig.nodeFile.hasColumns;
  const delimiter = appState.import.importConfig.nodeFile.delimiter;

  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.readAsText(file);

  reader.onload = () => {
    // Read entire CSV into memory as string
    const fileAsString = reader.result;
    // Get top 20 lines. Or if there's less than 10 line, get all the lines.
    const lines = fileAsString.split('\n');
    const lineNumber = lines.length;
    const topLinesAsString = lines.map(l => l.trim()).filter((l, i) => i < 20).join('\n');
    console.log(topLinesAsString);

    // Parse the top lines
    const it = hasHeader ? parse(topLinesAsString, {
        comment: "#",
        trim: true,
        auto_parse: true,
        skip_empty_lines: true,
        columns: hasHeader,
        delimiter
      }) : parse(topLinesAsString, {
        comment: "#",
        trim: true,
        auto_parse: true,
        skip_empty_lines: true,
        columns: undefined,
        delimiter
      });

    runInAction("preview top N lines of edge file", () => {
      appState.import.importConfig.nodeFile.topN = it;
      appState.import.importConfig.nodeFile.columns = Object.keys(it[0]);
      appState.import.importConfig.nodeFile.mapping.fromId = appState.import.importConfig.nodeFile.columns[0];
      appState.import.importConfig.nodeFile.mapping.toId = appState.import.importConfig.nodeFile.columns[0]
      appState.import.importConfig.nodeFile.ready = true;
    });
  };

  reader.onerror = () => {
    console.error(reader.error);
  };
});

export default appState;
