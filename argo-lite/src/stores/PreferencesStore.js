import { observable, action } from "mobx";
import { requestLoadUserConfig, requestSaveUserConfig } from "../ipc/client";
import { IS_IFRAME_WIDGET } from "../constants";

export default class PreferencesStore {
  @observable dialogOpen = false;

  @observable openDialogOpen = false;
  @observable openSnapshotDialogOpen = false;
  @observable shareDialogOpen = false;
  @observable statisticsDialogOpen = false;
  @observable helpDialogOpen = false;
  @observable neighborDialogOpen = false;
  @observable dataSheetDialogOpen = false;
  @observable isRenderOptionsCardHidden = IS_IFRAME_WIDGET;

  // The following fields are asynchronously loaded.
  // Any writes to these fields through saveUserConfig
  // won't be active until the app exits and starts
  // next time.

  @observable darkMode = true;
  @observable minimapShowing = !IS_IFRAME_WIDGET;
  @observable isStatusBarShowing = !IS_IFRAME_WIDGET;
  @observable isNavbarInMinimalMode = IS_IFRAME_WIDGET;
  @observable isLegendShowing = !IS_IFRAME_WIDGET;

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

  turnOnMinimalMode() {
    this.isRenderOptionsCardHidden = true;
    this.minimapShowing = false;
    this.isStatusBarShowing = false;
    this.isNavbarInMinimalMode = true;
    this.isLegendShowing = false;
    if (appState.graph.frame) {
      appState.graph.frame.hideMiniMap();
    } else {
      console.log("Frame not ready when trying to toggle minimap.");
    }
    
  }

  turnOffMinimalMode() {
    this.isRenderOptionsCardHidden = false;
    this.minimapShowing = true;
    this.isStatusBarShowing = true;
    this.isNavbarInMinimalMode = false;
    this.isLegendShowing = true;
    if (appState.graph.frame) {
      appState.graph.frame.showMiniMap();
    } else {
      console.log("Frame not ready when trying to toggle minimap.");
    }
  }
}