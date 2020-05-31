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
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";

@observer
class SaveSnapshotDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
    };
  }

  render() {
    return (
        <Dialog
          iconName="projects"
          isOpen={appState.project.isRenameSnapshotDialogOpen}
          onClose={() => {
            appState.project.isRenameSnapshotDialogOpen = false;
          }}
          title={`Rename Snapshot`}
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
                  //gets pixel width of text
                  function getTextWidth(text) {
                    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
                    var context = canvas.getContext("2d");
                    context.font = "14px arial"; //TODO: put correct font
                    var metrics = context.measureText(text);
                    return metrics.width;
                }
                  //maximum width of snapshot name                
                  const MAX_SNAPSHOT__NAME_WIDTH = 110;
                  let maxChars = 0;
                  if (getTextWidth(this.state.name) > MAX_SNAPSHOT__NAME_WIDTH) {
                    for(let i = this.state.name.length; i >= 0; i--) {
                      let str = this.state.name;
                      if (getTextWidth(str.substr(0, i)) < MAX_SNAPSHOT__NAME_WIDTH) {
                        maxChars = i;
                        break;
                      }
                    }
                    appState.graph.metadata.snapshotName = this.state.name.substr(0, maxChars) + "...";
                  } else {
                    appState.graph.metadata.snapshotName = this.state.name;
                  }
                  appState.project.isRenameSnapshotDialogOpen = false;
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