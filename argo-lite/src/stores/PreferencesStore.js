import { observable, action } from "mobx";
import { requestLoadUserConfig, requestSaveUserConfig } from "../ipc/client";

export default class PreferencesStore {
  @observable dialogOpen = false;
  @observable graphOptionsOpen = true;
  @observable openSnapshotDialogOpen = false;
  @observable shareDialogOpen = false;
  @observable isRenderOptionsCardHidden = false;


  // The following fields are asynchronously loaded.
  // Any writes to these fields through saveUserConfig
  // won't be active until the app exits and starts
  // next time.

  @observable darkMode = true;

  @observable workspacePath = '';

  // This is called at the beginning of the app.
  loadUserConfig() {
    requestLoadUserConfig();
  }

  saveUserConfig() {
    const userConfig = {
      darkMode: this.darkMode,
      workspace: this.workspacePath,
    }

    requestSaveUserConfig(userConfig);
  }
}
