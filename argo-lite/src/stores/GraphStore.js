import { observable, computed, action, autorun } from "mobx";
import createGraph from "ngraph.graph";
import { scales } from "../constants/index";
import appState from ".";
import uniq from "lodash/uniq";
import { averageClusteringCoefficient, connectedComponents} from "../services/AlgorithmUtils";

export default class GraphStore {

  initialGlobalConfig = {
    nodes: {
      colorBy: "pagerank",
      color: {
        scale: "Linear Scale",
        from: "#448AFF",
        to: "#E91E63"
      },
      sizeBy: "pagerank",
      size: {
        min: 2,
        max: 10,
        scale: "Linear Scale"
      },
      labelBy: "node_id",
      shape: "circle",
      labelSize: 1,
      labelLength: 10
    },
  }

  @observable
  nodes = this.initialGlobalConfig.nodes;

  // Updated by frame event
  @observable selectedNodes = [];
  // Updated by frame event. Not being listened, only used to save label visibility.
  nodesShowingLabels = [];
  // Used by autorun during snapshot loading.
  @observable initialNodesShowingLabels = [];

  @observable
  overrideConfig = {
    color: "#000",
    size: 5,
    label: "",
    shape: "circle"
  };

  @observable
  rawGraph = {
    nodes: [],
    edges: []
  };

  @observable
  metadata = {
    fullNodes: 0,
    fullEdges: 0,
    nodeProperties: [],
    nodeComputed: ["pagerank", "degree"],
    edgeProperties: [],
    snapshotName: "loading..." // Optional: for display in Argo-lite only
  };

  // used for listing all the properties, either original or computed
  @computed
  get allPropertiesKeyList() {
    return uniq([
      ...this.metadata.nodeProperties,
      ...this.metadata.nodeComputed
    ]).filter(k => k !== 'id'); // since node_id is already present
  }

  @observable.ref frame = null;
  @observable.ref positions = null;

  @observable overrides = new Map();
  @observable searchOrder = "degree";

  hasGraphLoaded = false;

  @computed
  get hasGraph() {
    if (this.rawGraph.nodes.length > 0) {
      this.hasGraphLoaded = true;
    }
    return this.hasGraphLoaded;
  }

  @computed
  get minMax() {
    const ret = {};
    for (const p of [
      ...this.metadata.nodeProperties,
      ...this.metadata.nodeComputed
    ]) {
      let min = Number.MAX_VALUE;
      let max = Number.MIN_VALUE;

      for (const n of this.rawGraph.nodes) {
        min = Math.max(Math.min(min, n[p]), 0.0000001);
        max = Math.max(max, n[p]);
      }

      ret[p] = [min, max];
    }
    return ret;
  }

  @computed
  get nodeSizeScale() {
    return scales[this.nodes.size.scale]()
      .domain(this.minMax[this.nodes.sizeBy])
      .range([this.nodes.size.min, this.nodes.size.max]);
  }

  @computed
  get nodeColorScale() {
    return scales[this.nodes.color.scale]()
      .domain(this.minMax[this.nodes.colorBy])
      .range([this.nodes.color.from, this.nodes.color.to]);
  }

  @computed
  get computedGraph() {
    const graph = createGraph();
    this.rawGraph.nodes.forEach(n => {
      const override = this.overrides.get(n.id.toString());
      graph.addNode(n.id.toString(), {
        label: (override && override.get("label")) || n[this.nodes.labelBy],
        size:
          (override && override.get("size")) ||
          this.nodeSizeScale(n[this.nodes.sizeBy]),
        color:
          (override && override.get("color")) ||
          this.nodeColorScale(n[this.nodes.colorBy]),
        shape: (override && override.get("shape")) || n[this.nodes.shape],
        ref: n
      });
    });

    this.rawGraph.edges.forEach(e => {
      graph.addLink(e.source_id.toString(), e.target_id.toString());
    });

    return graph;
  }

  removeNodes(nodeids) {
    this.rawGraph.nodes = this.rawGraph.nodes.filter(
      n => !nodeids.includes(n.id)
    );
    this.rawGraph.edges = this.rawGraph.edges.filter(
      e => !nodeids.includes(e.source_id) && !nodeids.includes(e.target_id)
    );
    appState.graph.frame.removeSelected();
  }

  getSnapshot() {
    const snapshot = {
      rawGraph: this.rawGraph,
      overrides: this.overrides,
      nodesShowingLabels: this.nodesShowingLabels,
      positions: this.frame.getPositions(),
      metadata: this.metadata,
      global: {
        nodes: this.nodes,
      },
    };
    return snapshot;
  }

  /**
   * [Argo-lite] Saves graph snapshot as String
   * 
   * Note that Argo-lite snapshot contains all graph data
   * and metadata except nodes/edges deleted by users.
   * This is different from Argo-electron snapshot.
   */
  saveImmediateStates(optionalConfig) {
    const snapshot = this.getSnapshot();
    // TODO: add corresponding options on frontend
    // The optional options allows users to leave out
    // certain app state when saving snapshot
    if (optionalConfig) {
      if (optionalConfig.noPosition) {
        snapshot.positions = undefined;
      }
      if (optionalConfig.noGlobal) {
        snapshot.global = undefined;
      }
      if (optionalConfig.noOverride) {
        snapshot.overrides = undefined;
      }
    }
    return JSON.stringify(snapshot);
  }

  @action
  loadImmediateStates(savedStatesStr) {
    const savedStates = JSON.parse(savedStatesStr);
    if (!savedStates) {
      return;
    }
    const savedOverrides = new Map(
      Object.entries(savedStates.overrides).map(([k, v]) => [
        k,
        new Map(Object.entries(v))
      ])
    );
    this.overrides.clear();
    this.overrides.merge(savedOverrides);

    if (savedStates.metadata) {
      this.metadata = savedStates.metadata;
    }
    if (savedStates.global) {
      this.nodes = savedStates.global.nodes;
    }

    // The following lines trigger autoruns.
    this.rawGraph = savedStates.rawGraph;
    if (savedStates.positions) {
      this.positions = savedStates.positions;
    }
    if (savedStates.nodesShowingLabels) {
      this.initialNodesShowingLabels = savedStates.nodesShowingLabels;
      this.nodesShowingLabels = savedStates.nodesShowingLabels;
    }
  }

  @computed
  get averageClustering() {
    const snapshot = {
      rawGraph: this.rawGraph,
    };
    return averageClusteringCoefficient(snapshot);
  }

  @computed
  get components() {
    const snapshot = {
      rawGraph: this.rawGraph,
    };
    return connectedComponents(snapshot);
  }
}

