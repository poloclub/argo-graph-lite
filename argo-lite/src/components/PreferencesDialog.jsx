import React from "react";
import { Button, Classes, Dialog, Intent, Switch } from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";
import { requestChangeWorkspace } from "../ipc/client";

@observer
class PreferencesDialog extends React.Component {
  render() {
    return (
      <Dialog
        iconName="cog"
        className={classnames({
          [Classes.DARK]: appState.preferences.darkMode
        })}
        isOpen={appState.preferences.dialogOpen}
        onClose={() => {
          appState.preferences.dialogOpen = false;
        }}
        title="Preferences"
      >
        <div className="pt-dialog-body">
          <Switch
            label="Dark Mode"
            checked={appState.preferences.darkMode}
            onChange={() => {
              appState.preferences.darkMode = !appState.preferences.darkMode;
              appState.preferences.saveUserConfig();
              if (appState.graph.frame) {
                appState.graph.frame.toggleDark();
              }
            }}
          />
          
          <Switch
           label="Minimap"
           checked={appState.preferences.minimapShowing}
           onChange={() => {
            appState.preferences.minimapShowing = !appState.preferences.minimapShowing;
            appState.preferences.saveUserConfig();
            if (appState.graph.frame) {
              if (appState.preferences.minimapShowing) {
                appState.graph.frame.showMiniMap();
              } else {
                appState.graph.frame.hideMiniMap();
              }
            } else {
              console.log("Frame not ready when trying to toggle minimap.");
            }
           }}
          />
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button
              intent={Intent.PRIMARY}
              onClick={() => {
                appState.preferences.dialogOpen = false;
              }}
              text="Done"
            />
          </div>
        </div>
      </Dialog>
    );
  }
}

export default PreferencesDialog;