import { observable } from "mobx";

export default class ImportStore {
  @observable graphFile = "";
  @observable stateFile = "";

  @observable dialogOpen = false;
  @observable gexfDialogOpen = false;

  @observable loading = false;

  // Argo-lite specific: File object selected via the file input.
  @observable selectedEdgeFileFromInput = null;
  @observable selectedNodeFileFromInput = null;

  @observable selectedGexfFileFromInput = null;

  @observable
  importConfig = {
    nodeFile: {
      path: "",
      topN: [],
      hasColumns: true,
      ready: false, // whether the topN is ready to display
      columns: [],
      mapping: {
        id: "<UNK>"
      },
      delimiter: ","
    },
    edgeFile: {
      path: "",
      ready: false,
      hasColumns: true,
      columns: [],
      topN: [],
      mapping: {
        fromId: "<UNK>",
        toId: "<UNK>"
      },
      createMissing: true,
      delimiter: ","
    }
  };

  /*
    Post Import Filtering related options.
  */

  postImportFilteringOptions = {
    "top 10 nodes with highest PageRank scores": (rawGraph) => {
      const sortedList = [...rawGraph.nodes];
      sortedList.sort((n1, n2) => {
          if (n1["pagerank"] && n2["pagerank"]) {
              return n2["pagerank"] - n1["pagerank"];
          }
          return 0;
      });
      const setIds = new Set();
      for (let i = 0; i < 10 && i < sortedList.length; i++) {
        setIds.add(sortedList[i].id);
      }
      rawGraph.nodes = rawGraph.nodes.map(n => {
        if (setIds.has(n.id)) {
          return {...n, isHidden: false};
        }
        return n;
      });
    },
    "All Nodes": (rawGraph) => {
      rawGraph.nodes = rawGraph.nodes.map(n => ({...n, isHidden: false}));
    },
  };

  defaultPostImportFilteringOption = "top 10 nodes with highest PageRank scores";
  
  @observable selectedPostImportFilteringOption = this.defaultPostImportFilteringOption;

  postImportFilter(rawGraph) {
    // Hide all nodes by default, use filtering option to show them.
    rawGraph.nodes = rawGraph.nodes.map(n => ({...n, isHidden: true}));
    // Run the selected post import filtering option.
    this.postImportFilteringOptions[this.selectedPostImportFilteringOption](rawGraph);
  }


}
