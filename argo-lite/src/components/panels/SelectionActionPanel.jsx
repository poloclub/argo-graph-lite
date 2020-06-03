import React from "react";
import { Button, Classes, Tooltip, Intent, Position } from "@blueprintjs/core";
import classnames from "classnames";
import { observer } from "mobx-react";
import appState from "../../stores";

@observer
class SelectionActionPanel extends React.Component {
  render() {
      // Only relevant when there's exact 1 node selected.
      // To display number of hidden nodes if exists
      let numHiddenNeighbor = 0;
      if (appState.graph.selectedNodes.length === 1) {
        if (appState.graph.lastSelectedSingleNode) {
            const selectedNodeId = appState.graph.lastSelectedSingleNode.data.ref.id.toString();
            numHiddenNeighbor = appState.graph.getNeighborNodesFromRawGraph(selectedNodeId).filter(n => n.isHidden).length;
        }
      }

      return (
        <div
            className="argo-selection-action-panel"
            style={{
                backgroundColor: appState.preferences.darkMode ? '#30404D' : '#FFFFFF',
            }}
        >
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
                content="Hide Selected Nodes"
                position={Position.BOTTOM}
            >
                <Button
                    className={classnames([
                    Classes.BUTTON,
                    Classes.MINIMAL
                    ])}
                    iconName="delete"
                    text="Hide"
                    intent={Intent.DANGER}
                    onClick={() => {
                    appState.graph.hideNodes(
                        appState.graph.frame.getSelectedIds()
                    );
                    this.forceUpdate();
                    }}
                />
            </Tooltip>
            {// This menu only shows when there's exactly 1 node selected
              appState.graph.selectedNodes.length === 1 && (
                <div style={{ display: "inline" }}>
                  <Tooltip
                    content="Open Neighbor Dialog"
                    position={Position.BOTTOM}
                  >
                    <Button
                      className={classnames([
                        Classes.BUTTON,
                        Classes.MINIMAL
                      ])}
                      iconName="graph"
                      text={`Neighbors (${numHiddenNeighbor} hidden)`}
                      intent={Intent.PRIMARY}
                      onClick={() => {
                        appState.graph.frame.pauseLayout();
                        appState.preferences.neighborDialogOpen = true;
                        this.forceUpdate();
                      }}
                    />
                  </Tooltip>
                </div>
            )}
        </div>
      );
  }
}

export default SelectionActionPanel;