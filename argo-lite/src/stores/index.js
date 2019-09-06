import { autorun, runInAction } from "mobx";

import PreferencesStore from "./PreferencesStore";
import GraphStore from "./GraphStore";
import ImportStore from "./ImportStore";
import ProjectStore from "./ProjectStore";
import { peakCSV } from "../services/CSVUtils";
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

window.testSave = () => {
  window.saveLOL = appState.graph.saveImmediateStates();
};

window.testLoad = () => {
  appState.graph.loadImmediateStates(window.saveLOL);
};
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

autorun(() => {
  const nodeFile = appState.import.importConfig.nodeFile;
  if (nodeFile.path) {
    peakCSV(nodeFile.path, nodeFile.hasColumns, edgeFile.delimiter).then(it => {
      runInAction("preview top N lines of node file", () => {
        nodeFile.topN = it;
        nodeFile.columns = Object.keys(it[0]);
        nodeFile.mapping.id = nodeFile.columns[0];
        nodeFile.ready = true;
      });
    });
  }
});

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

autorun(() => {
  const edgeFile = appState.import.importConfig.edgeFile;
  if (edgeFile.path) {
    peakCSV(edgeFile.path, edgeFile.hasColumns, edgeFile.delimiter).then(it => {
      runInAction("preview top N lines of edge file", () => {
        edgeFile.topN = it;
        edgeFile.columns = Object.keys(it[0]);
        edgeFile.mapping.fromId = edgeFile.columns[0];
        edgeFile.mapping.toId = edgeFile.columns[0];
        edgeFile.ready = true;
      });
    });
  }
});

export default appState;
