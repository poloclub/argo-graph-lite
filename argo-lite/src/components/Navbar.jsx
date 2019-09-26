import React from "react";
import classnames from "classnames";
import {
  Button,
  Classes,
  InputGroup,
  Intent,
  Position,
  Tooltip
} from "@blueprintjs/core";
import { observer } from "mobx-react";

import appState from "../stores/index";

@observer
class Navbar extends React.Component {
  render() {
    return (
      <nav className={classnames([Classes.NAVBAR])}>
        <div className={classnames([Classes.NAVBAR_GROUP, Classes.ALIGN_LEFT])}>
          <div className={classnames([Classes.NAVBAR_HEADING])}>ARGO <small>Lite</small></div>
          {// Show this only when a graph is opened
          appState.graph.hasGraph && appState.graph.frame && (
            <div style={{ display: "inline" }}>
              <div
                style={{
                  display: "inline",
                  float: "left",
                  marginRight: "30px"
                }}
              >
                <InputGroup
                  leftIconName="search"
                  placeholder="Available in full Argo"
                  value={appState.search.searchStr}
                  disabled
                  // onChange={e => {
                  //   appState.search.searchStr = e.target.value;
                  // }}
                />
              </div>

              <div style={{ display: "inline" }}>
                {/* <Tooltip content={'Select'} position={Position.BOTTOM}>
                    <Button
                      className={
                        !appState.graph.frame.mouseMode ||
                        appState.graph.frame.mouseMode === 'select'
                          ? classnames([
                              Classes.BUTTON,
                              Classes.MINIMAL,
                              Classes.ACTIVE,
                            ])
                          : classnames([Classes.BUTTON, Classes.MINIMAL])
                      }
                      iconName="select"
                      onClick={() => {
                        // TODO: Highlight if currently used
                        appState.graph.frame.setMouseMode('select');
                        this.forceUpdate();
                      }}
                    />
                  </Tooltip>
                  <Tooltip content={'Move'} position={Position.BOTTOM}>
                    <Button
                      className={
                        appState.graph.frame.mouseMode &&
                        appState.graph.frame.mouseMode === 'move'
                          ? classnames([
                              Classes.BUTTON,
                              Classes.MINIMAL,
                              Classes.ACTIVE,
                            ])
                          : classnames([Classes.BUTTON, Classes.MINIMAL])
                      }
                      iconName="move"
                      onClick={() => {
                        // TODO: Highlight if currently used
                        appState.graph.frame.setMouseMode('move');
                        this.forceUpdate();
                      }}
                    />
                  </Tooltip>
                  <span className={Classes.NAVBAR_DIVIDER} /> */}
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
            </div>
          )}
        </div>
        <div
          className={classnames([Classes.NAVBAR_GROUP, Classes.ALIGN_RIGHT])}
        >
          <Button
            className={classnames([Classes.BUTTON, Classes.MINIMAL])}
            iconName="import"
            onClick={() => (appState.import.dialogOpen = true)}
          >
            Import CSV
          </Button>

          {/* <Button
            className={classnames([Classes.BUTTON, Classes.MINIMAL])}
            iconName="pt-icon-document-open"
            onClick={() => (appState.preferences.openDialogOpen = true)}
          >
            Load Graph
          </Button> */}
          <span className={Classes.NAVBAR_DIVIDER} />
          <Button
            className={classnames([Classes.BUTTON, Classes.MINIMAL])}
            iconName="cog"
            onClick={() => {
              appState.preferences.dialogOpen = true;
            }}
          />
        </div>
      </nav>
    );
  }
}

export default Navbar;