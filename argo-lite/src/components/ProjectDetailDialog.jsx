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
import { requestOpen, requestDelete } from "../ipc/client";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";

@observer
class ProjectDetailDialog extends React.Component {
  render() {
    return (
      appState.project.currentProject && (
        <Dialog
          iconName="projects"
          isOpen={appState.project.isProjectDetailDialogOpen}
          onClose={() => {
            appState.project.isProjectDetailDialogOpen = false;
          }}
          title={`Load ${appState.project.currentProject.name} Project`}
        >
          {appState.project.currentProject.hasGraphData ? (
            <div className={Classes.DIALOG_BODY}>
              <Card
                interactive={true}
                elevation={Card.ELEVATION_TWO}
                onClick={() => {
                  appState.import.graphFile =
                    appState.project.currentProject.graphDataPath;
                  appState.project.isProjectDetailDialogOpen = false;
                  requestOpen();
                }}
              >
                <Icon iconName="graph" /> Start fresh from original graph
              </Card>
              <hr />
              <div className="argo-menu-list-header">Load recent snapshots</div>
              <div>
                {appState.project.currentProject.snapshotPaths.map(
                  snapshotPath => {
                    return (
                      <div key={snapshotPath}>
                        <Card
                          interactive={false}
                          elevation={Card.ELEVATION_TWO}
                        >
                          {/* <Icon iconName="layout" /> */}
                          <h5>
                            {snapshotPath
                              .replace(/^.*[\\\/]/, "")
                              .replace(/\.[^/.]+$/, "")}
                          </h5>
                          <Button
                            className={classnames([
                              Classes.BUTTON,
                              Classes.INTENT_PRIMARY
                            ])}
                            onClick={() => {
                              appState.import.graphFile =
                                appState.project.currentProject.graphDataPath;
                              appState.import.stateFile = snapshotPath;
                              appState.project.currentSnapshotName = snapshotPath
                                .replace(/^.*[\\\/]/, "")
                                .replace(/\.[^/.]+$/, "");
                              appState.project.isProjectDetailDialogOpen = false;
                              requestOpen();
                            }}
                          >
                            Load Snapshot
                          </Button>
                          <Button
                            className={classnames([Classes.BUTTON])}
                            onClick={() => {
                                requestDelete(snapshotPath);
                                appState.project.currentProject.snapshotPaths = appState.project.currentProject.snapshotPaths.filter(
                                  path => path !== snapshotPath
                                );
                            }}
                          >
                            Delete
                          </Button>
                        </Card>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          ) : (
            <div>
              Error: Cannot find .argograph file in this project directory.
            </div>
          )}
        </Dialog>
      )
    );
  }
}

export default ProjectDetailDialog;