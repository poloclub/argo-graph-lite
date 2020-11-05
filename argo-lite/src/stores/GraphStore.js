import { observable, computed, action, runInAction } from "mobx";
import createGraph from "ngraph.graph";
import { scales } from "../constants/index";
import uniq from "lodash/uniq";
import { averageClusteringCoefficient, connectedComponents, graphDensity, averageDegree, exactGraphDiameter} from "../services/AlgorithmUtils";
import { ContextMenu, MenuFactory, MenuItemFactory } from "@blueprintjs/core";
import { Frame } from "../graph-frontend";

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
    edges: {
      color: "#7f7f7f"
    }
  }

  @observable nodes = this.initialGlobalConfig.nodes;
  @observable edges = this.initialGlobalConfig.edges

  @observable enableDegree = true;
  @observable enableDensity = true;
  @observable enableDiameter = false;
  @observable enableCoefficient = true;
  @observable enableComponent = true;

  // Updated by frame event
  @observable selectedNodes = [];

  // Currently hovered node
  @observable currentlyHovered = undefined;


  // Cache the single node that's been selected last time
  // and will not update unless exactly one node is selected again
  // useful for NeighborDialog
  _lastSelectedSingleNode = null;
  @computed 
  get lastSelectedSingleNode() {
    if (this.selectedNodes.length === 1) {
      this._lastSelectedSingleNode = this.selectedNodes[0];
    }
    return this._lastSelectedSingleNode;
  }
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

  // Return raw graph nodes that is neighbor with the selected node,
  // excluding the node itself.
  getNeighborNodesFromRawGraph(selectedNodeId) {
    const setOfNeighborIds = new Set();
    this.rawGraph.edges.forEach(e => {
        const source = e.source_id.toString();
        const target = e.target_id.toString();
        if (source === selectedNodeId && target !== selectedNodeId) {
            setOfNeighborIds.add(target);
        }
        if (target === selectedNodeId && source !== selectedNodeId) {
            setOfNeighborIds.add(source);
        }
    });
    return this.rawGraph.nodes.filter(node => setOfNeighborIds.has(node.id.toString()));
  }

  // Triggers autorun in stores/index.js to sent computedGraph to graph-frontend.
  @computed
  get computedGraph() {
    const graph = createGraph();
    this.rawGraph.nodes.forEach(n => {
      // If isHidden flag is defined and true, ignore the node in graph-frontend.
      if (n.isHidden) {
        return;
      }
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
      // If isHidden flag is defined and true on an associated node,
      // leave out its related edges.
      if (graph.hasNode(e.source_id.toString()) && graph.hasNode(e.target_id.toString())) {
        graph.addLink(e.source_id.toString(), e.target_id.toString());
      }
    });

    return graph;
  }

  @computed
  get numHiddenNodes() {
    return this.rawGraph.nodes.filter(n => n.isHidden).length;
  }

  showNodes(nodeids) {
    runInAction('show hidden nodes by ids', () => {
      this.rawGraph.nodes = this.rawGraph.nodes.map(n => {
        if (nodeids.includes(n.id)) {
          return {...n, isHidden: false};
        }
        return n;
      });
    });
  }

  hideNodes(nodeids) {
    runInAction('hide nodes by ids', () => {
      this.frame.removeNodesByIds(nodeids);
      this.rawGraph.nodes = this.rawGraph.nodes.map(n => {
        if (nodeids.includes(n.id)) {
          return {...n, isHidden: true};
        }
        return n;
      });
    });
  }

  removeNodes(nodeids) {
    runInAction('remove nodes by ids', () => {
      this.frame.removeNodesByIds(nodeids);
      this.rawGraph.nodes = this.rawGraph.nodes.filter(
        n => !nodeids.includes(n.id)
      );
      this.rawGraph.edges = this.rawGraph.edges.filter(
        e => !nodeids.includes(e.source_id) && !nodeids.includes(e.target_id)
      );
    });
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

  setUpFrame() {
    const graphFrame = new Frame(this.computedGraph);
    graphFrame.init();
    graphFrame.display();
    this.frame = graphFrame;
    graphFrame.ee.on("select-nodes", nodes => {
      this.selectedNodes = nodes;
    });
    graphFrame.ee.on("show-node-label", nodes => {
      this.nodesShowingLabels = nodes;
    });
    graphFrame.ee.on("right-click", data => {
      const menu = MenuFactory({
        children: [
          MenuItemFactory({
            onClick: () => {
              this.frame.toggleSelectedLabels();
            },
            text: 'Toggle Labels',
            key: 'Toggle Labels'
          }),
          MenuItemFactory({
            onClick: () => {
              this.frame.unpinSelectedNodes();
            },
            text: 'Unpin Selected',
            key: 'Unpin Selected'
          }),
          MenuItemFactory({
            onClick: () => {
              this.frame.pinSelectedNodes();
            },
            text: 'Pin Selected',
            key: 'Pin Selected'
          }),
          this.frame.rightClickedNode && MenuItemFactory({
            onClick: () => {
              if (this.frame.rightClickedNode) {
                const rightClickedNodeId = this.frame.rightClickedNode.data.ref.id.toString();
                const neighbors = this.getNeighborNodesFromRawGraph(rightClickedNodeId);
                neighbors.sort((n1, n2) => {
                  if (n1["pagerank"] && n2["pagerank"]) {
                      return n2["pagerank"] - n1["pagerank"];
                  }
                  return 0;
                });
                const ids = [];
                for (let i = 0; i < 5 && i < neighbors.length; i++) {
                  ids.push(neighbors[i].id);
                }
                this.showNodes(ids);
              }
            },
            text: 'Show 5 Neighbors with Highest PageRank',
            key: 'Show 5 Neighbors with Highest PageRank'
          }),
        ]
      });
      ContextMenu.show(menu, { left: data.pageX, top: data.pageY }, () => {
        // onMenuClose
        console.log("ContextMenu closed");
      });
    });
  }

 /*
  * Graph algorithms used in StatisticsDialog.
  */
 
  get averageClustering() {
    const snapshot = {
      rawGraph: this.rawGraph,
    };
    return averageClusteringCoefficient(snapshot);
  }

 
  get components() {
    const snapshot = {
      rawGraph: this.rawGraph,
    };
    return connectedComponents(snapshot);
  }

  @computed
  get density() {
    const snapshot = {
      rawGraph: this.rawGraph,
    };
    return graphDensity(snapshot);
  }

  @computed
  get degree() {
    const snapshot = {
      rawGraph: this.rawGraph,
    };
    return averageDegree(snapshot);
  }

  @computed
  get diameter() {
    const snapshot = {
      rawGraph: this.rawGraph,
    };
    return exactGraphDiameter(snapshot);
  }
}

