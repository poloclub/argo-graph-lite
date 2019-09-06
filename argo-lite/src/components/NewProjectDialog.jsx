import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
  Spinner,
  Switch
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";

@observer
class NewProjectDialog extends React.Component {
  
  render() {
    const isNewProjectNameDuplicate = appState.project.projects.some(p => p.name === appState.project.newProjectName);
    const isNewProjectNameEmpty = appState.project.newProjectName.trim() === '';
    const isValidated = !(isNewProjectNameDuplicate || isNewProjectNameEmpty);
  
    return (
      <Dialog
        iconName="projects"
        isOpen={appState.project.isNewProjectDialogOpen}
        onClose={() => {
          appState.project.isNewProjectDialogOpen = false;
        }}
        title="Create New Project"
      >
        <div className={Classes.DIALOG_BODY}>
          <label className="pt-label .modifier">
            Project Name
            <span className="pt-text-muted"> (required){isNewProjectNameDuplicate && ' (This name has already been taken!)'}</span>
            <input
              className="pt-input"
              type="text"
              placeholder="New Project"
              dir="auto"
              value={appState.project.newProjectName}
              onChange={event => {
                appState.project.newProjectName = event.target.value;
              }}
            />
          </label>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              className={classnames({
                [Classes.DISABLED]: !isValidated
              })}
              intent={Intent.PRIMARY}
              onClick={() => {
                if (isValidated) {
                  appState.project.isNewProjectDialogOpen = false;
                  appState.import.dialogOpen = true;
                }
              }}
              text="Next"
            />
          </div>
        </div>
      </Dialog>
    );
  }
}

export default NewProjectDialog;