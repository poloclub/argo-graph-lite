import { autorun, runInAction } from "mobx";
import { Intent } from "@blueprintjs/core";

import PreferencesStore from "./PreferencesStore";
import GraphStore from "./GraphStore";
import ImportStore from "./ImportStore";
import ProjectStore from "./ProjectStore";
// import { peakCSV } from "../services/CSVUtils";
import parse from "csv-parse/lib/sync";
import SearchStore from "./SearchStore";
import { runSearch } from "../ipc/client";

import { BACKEND_URL } from "../constants";
import { toaster } from '../notifications/client';

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

const loadSnapshotFromURL = (url) => {
  return fetch(url, {
    method: 'GET',
    mode: 'cors'
  }).then(response => response.text()).catch(error => {
    toaster.show({
      message: 'Failed to fetch graph snapshot',
      intent: Intent.DANGER,
      timeout: -1
    });
    console.error(error);
  });
};

const loadSnapshotFromStrapi = (uuid) => {
  const url = `${BACKEND_URL}/snapshots?uuid=${uuid}`;
  return fetch(url, {
    method: 'GET',
    mode: 'cors'
  }).then(response => response.json()).then(json => json[0].body).catch(error => {
    toaster.show({
      message: 'Failed to fetch graph snapshot',
      intent: Intent.DANGER,
      timeout: -1
    });
    console.error(error);
  });
};

const loadAndDisplaySnapshotFromURL = (url) => {
  loadSnapshotFromURL(url).then(snapshotString => {
    // use filename/last segment of URL as title in Navbar
    appState.graph.metadata.snapshotName = url.split('/').pop() || url.split('/').pop().pop();
    appState.graph.loadImmediateStates(snapshotString);
  });
};

const loadAndDisplaySnapshotFromStrapi = (uuid) => {
  loadSnapshotFromStrapi(uuid).then(snapshotString => {
    // TODO: use more sensible snapshot name
    appState.graph.metadata.snapshotName = 'Shared';
    appState.graph.loadImmediateStates(snapshotString);
  });
};

window.loadAndDisplaySnapshotFromURL = loadAndDisplaySnapshotFromURL;
window.loadAndDisplaySnapshotFromStrapi = loadAndDisplaySnapshotFromStrapi;

window.loadInitialSampleGraph = async () => {
  // default fallback url
  let url = "https://argo-graph-lite.s3.amazonaws.com/lesmiserables.json";

  // check url hash
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    // If the hash component begins with http.
    if (hash.length >= 4 && hash.startsWith('http')) {
      try {
        url = decodeURIComponent(hash);
      } catch (e) {
        console.error(e);
        alert('Provided URL is not valid.');
      }
    } else {
      // If the hash component does not begin with http
      // treat it as a uuid in strapi.
      loadAndDisplaySnapshotFromStrapi(hash);
      return;
    }
    
  }
  loadAndDisplaySnapshotFromURL(url)
};

window.saveSnapshotToString = () => {
  const snapshotString = appState.graph.saveImmediateStates();
  return snapshotString;
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
    appState.graph.frame.updateGraph(appState.graph.computedGraph);
    appState.graph.frame.setAllNodesShapeWithOverride(appState.graph.nodes.shape, appState.graph.overrides);
    appState.graph.frame.setLabelRelativeSize(appState.graph.nodes.labelSize);
    appState.graph.frame.setLabelLength(appState.graph.nodes.labelLength);
  }
});

autorun(() => {
  if (appState.graph.frame && appState.graph.positions) {
    // If positions are saved in a snapshot, pause layout upon loading.
    appState.graph.frame.paused = true;
    appState.graph.frame.updatePositions(appState.graph.positions);
    appState.graph.positions = null;
    console.log('[autorun] Positions updated.');
  }
  if (appState.graph.frame && appState.graph.initialNodesShowingLabels) {
    appState.graph.frame.showLabels(appState.graph.initialNodesShowingLabels);
    appState.graph.initialNodesShowingLabels = null;
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
    try {
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
        appState.import.importConfig.edgeFile.columns = Object.keys(it[0]).map(key => `${key}`);
        appState.import.importConfig.edgeFile.mapping.fromId = appState.import.importConfig.edgeFile.columns[0];
        appState.import.importConfig.edgeFile.mapping.toId = appState.import.importConfig.edgeFile.columns[1];
        appState.import.importConfig.edgeFile.ready = true;
      });
    } catch {
      toaster.show({
        message: 'Error: Fails to parse file',
        intent: Intent.DANGER,
        timeout: -1
      });
    }
  };

  reader.onerror = () => {
    console.error(reader.error);
    toaster.show({
      message: 'Error: Fails to open file',
      intent: Intent.DANGER,
      timeout: -1
    });
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
    try {
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

      runInAction("preview top N lines of node file", () => {
        appState.import.importConfig.nodeFile.topN = it;
        appState.import.importConfig.nodeFile.columns = Object.keys(it[0]).map(key => `${key}`);
        appState.import.importConfig.nodeFile.mapping.id = appState.import.importConfig.nodeFile.columns[0];
        appState.import.importConfig.nodeFile.ready = true;
      });
    } catch {
      toaster.show({
        message: 'Error: Fails to open file',
        intent: Intent.DANGER,
        timeout: -1
      });
    }
  };

  reader.onerror = () => {
    console.error(reader.error);
    toaster.show({
      message: 'Error: Fails to open file',
      intent: Intent.DANGER,
      timeout: -1
    });
  };
});

export default appState;
