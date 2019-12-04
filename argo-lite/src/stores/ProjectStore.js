import { observable } from "mobx";

export default class ProjectStore {
 
  @observable projects = [];

  /*
   * Active project and snapshot
   */
  @observable currentProject = null;
  // @observable currentProjectName = null;
  // @observable currentProjectPath = null;
  @observable currentSnapshotName = "Quick Save"; // TODO: If not loaded from snapshot, use this, otherwise use the name of the loaded snapshot

  // [Argo-lite] for displaying snapshot file in textarea to be copied
  @observable stringCopyOfSnapshot = 'Loading';
  
  /*
   * Dialogs and UI
   */
  @observable isNewProjectDialogOpen = false;
  @observable isProjectDetailDialogOpen = false;
  @observable isSaveSnapshotDialogOpen = false;
  // when the ipc returns the projects data for the first time
  // turn off `isFetching` so that the spinner of WorkspaceView will be turned off
  // Also used when refreshing WorkspaceView
  @observable isFetching = true;

  /*
   * New project creation and import
   */
  @observable newProjectName = '';
}
