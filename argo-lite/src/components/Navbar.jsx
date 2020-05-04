import React from "react";
import classnames from "classnames";
import {
  Button,
  Classes,
  InputGroup,
  Intent,
  Position,
  Tooltip,
  Popover,
  Menu,
  MenuItem,
  MenuDivider
} from "@blueprintjs/core";
import { observer } from "mobx-react";

import appState from "../stores/index";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import argologo from '../images/argologo.png';

@observer
class Navbar extends React.Component {
  render() {
    return (
      <nav className={classnames([Classes.NAVBAR])}>
        <div className={classnames([Classes.NAVBAR_GROUP, Classes.ALIGN_LEFT])}>
          <a href = "https://github.com/poloclub/argo-graph-lite" target="_blank">
            <img id= "Argo logo" src= {argologo} width = "35" height = "35"></img>
          </a>
          <br></br>
    <div className={classnames([Classes.NAVBAR_HEADING])}> &nbsp; Argo <small>Lite</small></div>
          {/* <a
            href="https://poloclub.github.io/argo-graph/"
            target='_blank'
            style={{
              padding: '6px 10px 6px 10px',
              backgroundColor: 'pink',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none'
            }}
          >
            Learn more about Argo
          </a> */}
          <Popover
            content={
              <Menu>
                <MenuItem text="Load Sample" iconName="graph">
                  <MenuItem
                    iconName="graph"
                    text="Les Miserables"
                    onClick={() => {
                      window.loadAndDisplaySnapshotFromURL("https://argo-graph-lite.s3.amazonaws.com/lesmiserables.json");
                    }}
                  />
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  iconName="import"
                  text="Import from CSV..."
                  onClick={() => (appState.import.dialogOpen = true)}
                />
                <MenuItem
                  iconName="pt-icon-document-open"
                  text="Open Snapshot"
                  onClick={() => {appState.preferences.openSnapshotDialogOpen = true}}
                />
                <MenuDivider />
                <MenuItem
                  iconName="download"
                  text="Save Snapshot"
                  onClick={() => {
                    appState.project.stringCopyOfSnapshot = appState.graph.saveImmediateStates();
                    appState.project.isSaveSnapshotDialogOpen = true
                  }}
                />
                <MenuItem
                  iconName="pt-icon-document-share"
                  text="Publish and Share Snapshot"
                  onClick={() => {appState.preferences.shareDialogOpen = true}}
                />
              </Menu>
            }
            position={Position.BOTTOM}
          >
            <Button
              className={classnames([Classes.BUTTON, Classes.MINIMAL])}
              iconName="document"
            >
              Graph
            </Button>
          </Popover>
          <Popover
            content={
              <Menu>
                <MenuItem
                  text="Statistics"
                  iconName="pt-icon-timeline-bar-chart"
                  onClick={() => {appState.preferences.statisticsDialogOpen = true}}
                />
              </Menu>
            }
            position={Position.BOTTOM}
          >
            <Button
              className={classnames([Classes.BUTTON, Classes.MINIMAL])}
              iconName="pt-icon-wrench"
            >
              Tools
            </Button>
          </Popover>
        </div>
        <div className={classnames([Classes.NAVBAR_GROUP, Classes.ALIGN_LEFT])}>
        <span className={Classes.NAVBAR_DIVIDER} />
        {appState.graph.hasGraph && appState.graph.frame && (
            <div style={{ display: "inline" }}>
              <Tooltip
                content={appState.graph.frame.paused ? "Resume Layout Algorithm" : "Pause Layout Algorithm"}
                position={Position.BOTTOM}
              >
                <Button
                  className={classnames([Classes.BUTTON, Classes.MINIMAL])}
                  iconName={appState.graph.frame.paused ? "play" : "pause"}
                  text={appState.graph.frame.paused ? "Resume Layout" : "Pause Layout"}
                  onClick={() => {
                    if (appState.graph.frame.paused) {
                      appState.graph.frame.resumeLayout();
                      this.forceUpdate();
                    } else {
                      appState.graph.frame.pauseLayout();
                      this.forceUpdate();
                    }
                  }}
                />
              </Tooltip>

              {// This menu only shows when there are nodes selected
              appState.graph.selectedNodes.length > 0 && (
                <div style={{ display: "inline" }}>
                  {/* <span className={Classes.NAVBAR_DIVIDER} /> */}
                  <Tooltip
                    content="Pin Selected Nodes"
                    position={Position.BOTTOM}
                  >
                    <Button
                      className={classnames([
                        Classes.BUTTON,
                        Classes.MINIMAL
                      ])}
                      iconName="pin"
                      text="Pin"
                      intent={Intent.PRIMARY}
                      onClick={() => {
                        appState.graph.frame.pinSelectedNodes();
                        this.forceUpdate();
                      }}
                    />
                  </Tooltip>
                  <Tooltip
                    content="Unpin Selected Nodes"
                    position={Position.BOTTOM}
                  >
                    <Button
                      className={classnames([
                        Classes.BUTTON,
                        Classes.MINIMAL
                      ])}
                      iconName="unpin"
                      text="Unpin"
                      intent={Intent.WARNING}
                      onClick={() => {
                        appState.graph.frame.unpinSelectedNodes();
                        this.forceUpdate();
                      }}
                    />
                  </Tooltip>
                  <Tooltip
                    content="Delete Selected Nodes"
                    position={Position.BOTTOM}
                  >
                    <Button
                      className={classnames([
                        Classes.BUTTON,
                        Classes.MINIMAL
                      ])}
                      iconName="delete"
                      text="Delete"
                      intent={Intent.DANGER}
                      onClick={() => {
                        appState.graph.removeNodes(
                          appState.graph.frame.getSelectedIds()
                        );
                        this.forceUpdate();
                      }}
                    />
                  </Tooltip>
                </div>
              )}
            </div>
          )}
        </div>
        <div
          className={classnames([Classes.NAVBAR_GROUP, Classes.ALIGN_RIGHT])}
        >
          <Button
            className={classnames([Classes.BUTTON, Classes.MINIMAL])}
            iconName="graph"
            onClick={() => {
              appState.project.isRenameSnapshotDialogOpen = true;
            }}
          >
            {appState.graph.metadata.snapshotName || "Untitled Graph"}
            {
              (appState.graph.metadata.fullNodes && appState.graph.metadata.fullEdges) ? (
                ` (Nodes: ${appState.graph.metadata.fullNodes} Edges: ${appState.graph.metadata.fullEdges} )`
              ) : null
            }
          </Button>
          <span className={Classes.NAVBAR_DIVIDER} />
          <Button
            className={classnames([Classes.BUTTON, Classes.MINIMAL])}
            iconName="cog"
            onClick={() => {
              appState.preferences.dialogOpen = true;
            }}
          />
          <span className={Classes.NAVBAR_DIVIDER} />
          <a
            href="https://github.com/poloclub/argo-graph-lite"
            target='_blank'
            style={{
              color: appState.preferences.darkMode ? 'white' : 'black',
              fontSize: '120%',
              textDecoration: 'none'
            }}
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </nav>
    );
  }
}

export default Navbar;