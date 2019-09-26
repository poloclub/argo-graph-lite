import { observable } from "mobx";

export default class ImportStore {
  @observable graphFile = "";
  @observable stateFile = "";

  @observable dialogOpen = false;

  @observable loading = false;

  // Argo-lite specific: File object selected via the file input.
  @observable selectedEdgeFileFromInput = null;
  @observable selectedNodeFileFromInput = null;

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
}
