/**
 * [Argo-lite Modified]
 * In electron Argo, snapshots are saved to the active project folder.
 * In Argo-lite, snapshots are saved as a file download.
 * Sometimes, it's tricky to let browser download something without a backend
 * hosting the file. Thus we also allow user to copy paste from
 * a text area containing our snapshot JSON.
 * 
 * Remember to change appState.project.stringCopyOfSnapshot
 * before showing the dialog.
 */
import React from "react";
import {
  Button,
  Classes,
  Card,
  Icon,
  Dialog,
  Intent,
  Spinner
} from "@blueprintjs/core";
import { requestSaveSnapshot } from "../ipc/client";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";

@observer
class SaveSnapshotDialog extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     name: "Quick Save",
  //   };
  // }

  render() {
    return (
        <Dialog
          iconName="projects"
          isOpen={appState.project.isSaveSnapshotDialogOpen}
          onClose={() => {
            appState.project.isSaveSnapshotDialogOpen = false;
          }}
          title={`Save Snapshot`}
        >
          <div className={classnames(Classes.DIALOG_BODY)}>
            {/* <label className="pt-label .modifier">
              Snapshot Name
              <span className="pt-text-muted"> (required)</span>
              <input
                className="pt-input"
                type="text"
                placeholder="My Snapshot"
                dir="auto"
                value={this.state.name}
                onChange={event => this.setState({ name: event.target.value })}
              />
            </label> */}
            <p>If your browser doesn't start downloading the file, you can manually copy the content below and save to a plain text file.</p>
            <input id="snapshot-textarea" type="textarea" value={appState.project.stringCopyOfSnapshot} readOnly />
            <button
              onClick={() => {
                document.getElementById('snapshot-textarea').select();
                document.execCommand("copy");
              }}
            >
              Copy to Clipboard
            </button>
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                // className={classnames({
                //   [Classes.DISABLED]: !this.state.name
                // })}
                intent={Intent.PRIMARY}
                onClick={() => {
                  appState.project.isSaveSnapshotDialogOpen = false;
                }}
                text="Done"
              />
            </div>
          </div>
        </Dialog>
    );
  }
}

export default SaveSnapshotDialog;