import * as scale from "d3-scale";

// Argo-lite Iframe widget mode
// Build the app separately and host it on a different URL
// If set to true, the app will begin in widget mode
// hiding certain panels, logo, and minimap
// and show a minimalist Navbar.
export const IS_IFRAME_WIDGET = window.location !== window.parent.location;

export const FRONTEND_URL = "https://poloclub.github.io/argo-graph-lite";
export const LOGO_URL = "https://github.com/poloclub/argo-graph-lite";
export const GITHUB_URL = "https://github.com/poloclub/argo-graph-lite";
// Argo-lite Graph Sharing backend Strapi Server:
export const BACKEND_URL = "https://argo-share.herokuapp.com"; // for production
// export const BACKEND_URL = "https://sleepy-brushlands-57948.herokuapp.com"; // for free heroku
// export const BACKEND_URL = "http://localhost:1337"; // for local strapi development
export const SAMPLE_GRAPH_SNAPSHOTS = [
  ["Les Miserables", "3b5f746f-19a5-44d1-99ea-407ff9e47a0e"],
  ["CORD-19 Citation Graph 06-02", "4bf882d3-8966-4f41-a590-acafeb998d2a"]
];

// When resizing window or running on mobile,
// used to determine whether screen
// is considered small.
export const MOBILE_WIDTH_CUTOFF = 800;
export const MOBILE_HEIGHT_CUTOFF = 480;

export const SCALE_LINEAR = "Linear Scale";
export const SCALE_LOG = "Log Scale";

export const scales = {
  [SCALE_LINEAR]: scale.scaleLinear,
  [SCALE_LOG]: scale.scaleLog
};

export const LOAD_USER_CONFIG = "load-user-config";
export const LOADED_USER_CONFIG = "loaded-user-config";
export const SAVE_USER_CONFIG = "save-user-config";
export const SAVED_USER_CONFIG = "saved-user-config";

export const FETCH_WORKSPACE_PROJECTS = "fetch-workspace-projects";
export const FETCHED_WORKSPACE_PROJECTS = "fetched-workspace-projects";
export const MENU_NEW_PROJECT = "menu-new-project";
export const CREATE_NEW_PROJECT = "create-new-project";
export const CREATED_NEW_PROJECT = "created-new-project";

export const DELETE_FILE = "delete-file";
export const RENAME_FILE = "rename-file";

export const LOAD_GRAPH_JSON = "load-graph-json";
export const LOAD_GRAPH_SQLITE = "load-graph-sqlite";
export const LOADED_GRAPH_JSON = "loaded-graph-json";
export const LOAD_TOAST_KEY = "load-toast-key";

export const SAVE_GRAPH_JSON = "save-graph-json";
export const SAVE_GRAPH_SQLITE = "save-graph-sqlite";
export const SAVED_GRAPH_JSON = "saved-graph-json";
export const SAVE_TOAST_KEY = "save-const-key";

export const MENU_LOAD = "menu-load";
export const MENU_IMPORT_CSV = "menu-import-csv";
export const MENU_SAVE_GRAPH_STATE = "menu-save-graph-state";
export const MENU_SAVE_GRAPH_STATE_TO_PROJECT =
  "menu-save-graph-state-to-project";
export const MENU_SAVE_GRAPH_SQLITE = "menu-save-graph-sqlite";
export const SAVE_GRAPH_STATE = "save-graph-state";
export const SAVED_GRAPH_STATE = "saved-graph-state";
export const SAVE_GRAPH_STATE_TO_PROJECT = "save-graph-state-to-project";
export const SAVED_GRAPH_STATE_TO_PROJECT = "saved-graph-state-to-project";
export const LOAD_GRAPH_STATE = "load-graph-state";
export const LOADED_GRAPH_STATE = "loaded-graph-state";

export const SHOW_ITEM_IN_FOLDER = "show-item-in-folder";
export const SHOW_WORKSPACE_FOLDER = 'show-workspace-folder';
export const CHANGE_WORKSPACE_FOLDER = 'change-workspace-folder';
export const CHANGED_WORKSPACE_FOLDER = 'changed-workspace-folder';

export const CHOOSE_EDGE_FILE = "choose-edge-file";
export const CHOSEN_EDGE_FILE = "chosen-edge-file";
export const CHOOSE_NODE_FILE = "choose-node-file";
export const PEAKED_NODE_FILE = "peaked-node-file";
export const CHOSEN_NODE_FILE = "chosen-node-file";

export const CHOOSE_GRAPH_FILE = "choose-graph-file";
export const CHOSEN_GRAPH_FILE = "chosen-graph-file";
export const CHOOSE_STATE_FILE = "choose-state-file";
export const CHOSEN_STATE_FILE = "chosen-state-file";

export const NODE_AND_EDGE_FILE = "both nodes and edges file";
export const ONLY_EDGE_FILE = "only edges file";

export const GRAPH_AND_STATE_FILE = "both graph and snapshot file";
export const ONLY_GRAPH_FILE = "only graph file";
export const IMPORT_GRAPH = "import-graph";
export const IMPORTED_GRAPH = "imported-graph";
export const OPEN_GRAPH = "open-graph";
export const OPENED_GRAPH = "opened-graph";

export const SEARCH_REQUEST = "search-request";
export const SEARCH_RESPONSE = "search-response";

export const ADD_NODES = "add-nodes";
export const ADD_SELECT_NODE = "add-select-node";
export const ADD_NODE = "add-node";
export const GET_NEIGHBORS = "get-neighbors";
