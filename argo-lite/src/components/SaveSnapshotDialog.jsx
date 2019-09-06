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
  constructor(props) {
    super(props);
    this.state = {
      name: "Quick Save"
    };
  }

  render() {
    return (
      appState.project.currentProject && (
        <Dialog
          iconName="projects"
          isOpen={appState.project.isSaveSnapshotDialogOpen}
          onClose={() => {
            appState.project.isSaveSnapshotDialogOpen = false;
          }}
          title={`Save Snapshot`}
        >
          <div className={classnames(Classes.DIALOG_BODY)}>
            <label className="pt-label .modifier">
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
            </label>
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                className={classnames({
                  [Classes.DISABLED]: !this.state.name
                })}
                intent={Intent.PRIMARY}
                onClick={() => {
                  // TODO: Better form validation here
                  if (this.state.name) {
                    appState.project.isSaveSnapshotDialogOpen = false;
                    requestSaveSnapshot(this.state.name);
                  }
                }}
                text="Save"
              />
            </div>
          </div>
        </Dialog>
      )
    );
  }
}

export default SaveSnapshotDialog;