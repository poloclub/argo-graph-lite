import React from "react";
import { Button, Classes, Dialog, Intent, Switch } from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";
import { requestChangeWorkspace } from "../ipc/client";

@observer
export default class PreferencesDialog extends React.Component {
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
          
          <p>Choose a different workspace directory (need to relaunch Argo)</p>
          <div className={classnames(Classes.CONTROL_GROUP)}>
            <div className={classnames(Classes.INPUT_GROUP, Classes.FILL)}>
              <input
                type="text"
                className={classnames(Classes.DISABLED, Classes.INPUT)}
                placeholder="Select workspace directory"
                readOnly
                value={appState.preferences.workspacePath}
              />
            </div>
            <Button
              intent={Intent.PRIMARY}
              onClick={() => {
                requestChangeWorkspace();
              }}
            >
              Choose Directory
            </Button>
          </div>
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
