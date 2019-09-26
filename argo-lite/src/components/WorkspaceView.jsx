import React from "react";
import { observer } from "mobx-react";
import classnames from "classnames";
import {
  Button,
  Icon,
  Card,
  Classes,
  Spinner,
  NonIdealState,
  FocusStyleManager
} from "@blueprintjs/core";
import appState from "../stores/index";
import { requestOpenWorkspaceFolder } from "../ipc/client";

@observer
class WorkspaceView extends React.Component {
  render() {
    return (
      <div className="workspace">
        <Card
          interactive={true}
          elevation={Card.ELEVATION_TWO}
          onClick={() => {
            appState.project.isNewProjectDialogOpen = true;
          }}
        >
          <Icon iconName="plus" /> Create New Project
        </Card>
        <Card
          interactive={true}
          elevation={Card.ELEVATION_TWO}
          onClick={() => {
            requestOpenWorkspaceFolder();
          }}
        >
          <Icon iconName="cog" /> Manage Workspace
        </Card>
        <hr />
        <div className="argo-menu-list-header">My Projects</div>
        <div style={{ paddingBottom: '100px' }}>
          {appState.project.isFetching ? (
            <div style={{ textAlign: "center" }}>
              <Spinner />
            </div>
          ) : appState.project.projects.length > 0 ? (
            appState.project.projects.map(project => {
              return (
                <div key={project.name}>
                  <Card
                    interactive={true}
                    elevation={Card.ELEVATION_TWO}
                    onClick={() => {
                      appState.project.currentProject = project;
                      appState.project.isProjectDetailDialogOpen = true;
                    }}
                  >
                    <h5>{project.name}</h5>
                    <p>Created: {project.createdDate || 'Unknown'}</p>
                  </Card>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center" }}>
              Workspace is empty. Start by creating a new project.
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default WorkspaceView;