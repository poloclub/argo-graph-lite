/**
 * [Argo-lite] Open the Argo-lite JSON graph snapshot file
 */
import React from "react";
import { Button, Classes, Dialog, Intent } from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";
import SimpleSelect from "./utils/SimpleSelect";
import { toaster } from '../notifications/client';

@observer
class OpenSnapshotDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        selectedFile: null
    };
  }

  render() {
    return (
      <Dialog
        iconName="import"
        className={classnames({
          [Classes.DARK]: appState.preferences.darkMode
        })}
        isOpen={appState.preferences.openSnapshotDialogOpen}
        onClose={() => {
          appState.preferences.openSnapshotDialogOpen = false;
        }}
        title="Open File"
      >
        <div>
            <div className={classnames(Classes.DIALOG_BODY)}>
                <div className={classnames(Classes.CONTROL_GROUP)}>
                    <div className={classnames(Classes.INPUT_GROUP, Classes.FILL)}>
                        <input
                            type="file"
                            className={classnames(Classes.DISABLED)}
                            onChange={(event) => {
                                if (event.target.files.length < 1) {
                                    return;
                                }
                                this.setState({
                                    selectedFile: event.target.files[0]
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button
                  className={classnames({
                    [Classes.DISABLED]: !this.state.selectedFile
                  })}
                  intent={Intent.PRIMARY}
                  onClick={() => {
                    // This dialog is closed when user is done selecting file
                    appState.preferences.openSnapshotDialogOpen = false;

                    // Show user a notification
                    toaster.show({
                        message: 'Loading Graph Snapshot. Please wait...',
                        intent: Intent.NONE,
                        timeout: 2000
                    });
                    
                    // Read the file and load snapshot
                    const reader = new FileReader();
                    reader.readAsText(this.state.selectedFile);

                    reader.onload = () => {
                        const fileAsString = reader.result;
                        appState.graph.loadImmediateStates(fileAsString);
                    }
                  }}
                  text="Open"
                />
              </div>
            </div>
          </div>
      </Dialog>
    );
  }
}

export default OpenSnapshotDialog;