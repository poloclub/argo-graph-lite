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

import { LOGO_URL, GITHUB_URL, SAMPLE_GRAPH_SNAPSHOTS } from '../constants';

@observer
class RegularNavbar extends React.Component {
  render() {
    return (
      <nav className={classnames([Classes.NAVBAR])}>
        <div className={classnames([Classes.NAVBAR_GROUP, Classes.ALIGN_LEFT])}>
          <a href={LOGO_URL} target="_blank">
            <img title="Argo Lite" id="Argo logo" src={argologo} width="35" height="35"></img>
          </a>
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
                  {
                    SAMPLE_GRAPH_SNAPSHOTS.map((sample) => {
                      const sampleSnapshotTitle = sample[0];
                      const sampleSnapshotStrapiUuid = sample[1];

                      return (
                        <MenuItem
                          iconName="graph"
                          text={sampleSnapshotTitle}
                          onClick={() => {
                            window.loadAndDisplaySnapshotFromStrapi(sampleSnapshotStrapiUuid);
                          }}
                        />
                      );
                    })
                  }

                </MenuItem>
                <MenuDivider />
                <MenuItem
                  iconName="import"
                  text="Import from CSV..."
                  onClick={() => (appState.import.dialogOpen = true)}
                />
                <MenuItem
                  iconName="import"
                  text="Import from GEXF..."
                  onClick={() => (appState.import.gexfDialogOpen = true)}
                />
                <MenuItem
                  iconName="pt-icon-document-open"
                  text="Open Snapshot"
                  onClick={() => { appState.preferences.openSnapshotDialogOpen = true }}
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
                  onClick={() => { appState.preferences.shareDialogOpen = true }}
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
                  text="Data Sheet"
                  iconName="pt-icon-database"
                  onClick={() => {
                    appState.graph.frame.pauseLayout();
                    appState.preferences.dataSheetDialogOpen = true;
                    this.forceUpdate();
                  }}
                />
                <MenuItem
                  text="Statistics"
                  iconName="pt-icon-timeline-bar-chart"
                  onClick={() => { appState.preferences.statisticsDialogOpen = true }}
                />
                <MenuItem text="Filters" iconName="graph">
                  <MenuItem
                    text="Show All Nodes"
                    onClick={() => {
                      appState.graph.showNodes(appState.graph.rawGraph.nodes.map(n => n.id));
                    }}
                  />
                  <MenuItem
                    text="Show only nodes with top 5 PageRank"
                    onClick={() => {
                      appState.graph.hideNodes(appState.graph.rawGraph.nodes.map(n => n.id));
                      const sortedNodeList = [...appState.graph.rawGraph.nodes];
                      sortedNodeList.sort((n1, n2) => {
                        if (n1["pagerank"] && n2["pagerank"]) {
                          return n2["pagerank"] - n1["pagerank"];
                        }
                        return 0;
                      });
                      const ids = [];
                      for (let i = 0; i < 5 && i < sortedNodeList.length; i++) {
                        ids.push(sortedNodeList[i].id);
                      }
                      appState.graph.showNodes(ids);
                    }}
                  />
                  <MenuItem
                    text="Show only nodes with top 5 Degree"
                    onClick={() => {
                      appState.graph.hideNodes(appState.graph.rawGraph.nodes.map(n => n.id));
                      const sortedNodeList = [...appState.graph.rawGraph.nodes];
                      sortedNodeList.sort((n1, n2) => {
                        if (n1["degree"] && n2["degree"]) {
                          return n2["degree"] - n1["degree"];
                        }
                        return 0;
                      });
                      const ids = [];
                      for (let i = 0; i < 5 && i < sortedNodeList.length; i++) {
                        ids.push(sortedNodeList[i].id);
                      }
                      appState.graph.showNodes(ids);
                    }}
                  />
                  <MenuItem
                    text="Hide All Nodes"
                    onClick={() => {
                      appState.graph.hideNodes(appState.graph.rawGraph.nodes.map(n => n.id));
                    }}
                  />
                </MenuItem>
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
          </Button>
          <span className={Classes.NAVBAR_DIVIDER} />
          <Button
            className={classnames([Classes.BUTTON, Classes.MINIMAL])}
            iconName="cog"
            onClick={() => {
              appState.preferences.dialogOpen = true;
            }}
          />
          <Button
            className={classnames([Classes.BUTTON, Classes.MINIMAL])}
            iconName="help"
            onClick={() => {
              appState.preferences.helpDialogOpen = true;
            }}
          />
          <Button
            className={classnames([Classes.BUTTON, Classes.MINIMAL])}
            iconName="minimize"
            onClick={() => {
              appState.preferences.turnOnMinimalMode()
            }}
          />
          <span className={Classes.NAVBAR_DIVIDER} />
          <a
            href={GITHUB_URL}
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

@observer
class MinimalNavbar extends React.Component {
  render() {
    return appState.graph.frame && (
      <div>
        <div
          className={classnames("minimal-navbar-left")}
          style={{
            backgroundColor: appState.preferences.darkMode ? '#30404D' : '#FFFFFF',
          }}
        >
          <div className="pt-button-group">
            <a
              className={classnames("pt-button pt-icon-maximize", appState.graph.frame.paused ? "pt-icon-play" : "pt-icon-pause")}
              role="button"
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
          </div>
        </div>
        <div
          className={classnames("minimal-navbar-right")}
          style={{
            backgroundColor: appState.preferences.darkMode ? '#30404D' : '#FFFFFF',
          }}
        >
          <div className="pt-button-group">
            <a className="pt-button pt-icon-maximize" role="button" onClick={() => appState.preferences.turnOffMinimalMode()}></a>
            <a className="pt-button pt-icon-help" role="button" onClick={() => appState.preferences.helpDialogOpen = true}></a>
            <a className="pt-button pt-icon-document-open" role="button" href={window.location} target="_blank"></a>
          </div>
        </div>
      </div>
    );
  }
}

@observer
class Navbar extends React.Component {
  render() {
    return appState.preferences.isNavbarInMinimalMode ? <MinimalNavbar /> : <RegularNavbar />;
  }
}

export default Navbar;