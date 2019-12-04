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


@observer
class Navbar extends React.Component {
  render() {
    return (
      <nav className={classnames([Classes.NAVBAR])}>
        <div className={classnames([Classes.NAVBAR_GROUP, Classes.ALIGN_LEFT])}>
          <div className={classnames([Classes.NAVBAR_HEADING])}>ARGO <small>Lite</small></div>
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
                <MenuItem text="Load Sample Graphs" iconName="graph">
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
                  text="Import CSV"
                  onClick={() => (appState.import.dialogOpen = true)}
                />
                <MenuItem
                  iconName="pt-icon-document-open"
                  text="Open Argo-lite Snapshot"
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
                  text="Share Link"
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
              Files
            </Button>
          </Popover>
        </div>
        <div className={classnames([Classes.NAVBAR_GROUP, Classes.ALIGN_LEFT])}>
        <span className={Classes.NAVBAR_DIVIDER} />
        {appState.graph.hasGraph && appState.graph.frame && (
            <div style={{ display: "inline" }}>
              <Tooltip
                content={appState.graph.frame.paused ? "Resume" : "Pause"}
                position={Position.BOTTOM}
              >
                <Button
                  className={classnames([Classes.BUTTON, Classes.MINIMAL])}
                  iconName={appState.graph.frame.paused ? "play" : "pause"}
                  text={appState.graph.frame.paused ? "Resume" : "Pause"}
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
          >
            Graph Snapshot: {appState.graph.metadata.snapshotName || "Untitled Graph"}
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
            href="https://poloclub.github.io/argo-graph/"
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