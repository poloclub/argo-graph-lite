import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
  Switch
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";

@observer
class NeighborDialog extends React.Component {

  render() {
    let filteredNodes = [];
    // When only one node is selected, show the neighbors of this selected node.
    if (appState.graph.selectedNodes.length === 1) {
        const selectedNodeId = appState.graph.selectedNodes[0].data.ref.id.toString();
        filteredNodes = appState.graph.getNeighborNodesFromRawGraph(selectedNodeId);
    }
    
    return (
        <Dialog
          iconName="graph"
          isOpen={appState.preferences.neighborDialogOpen}
          onClose={() => {
            appState.preferences.neighborDialogOpen = false;
          }}
          title='Neighbors'
        >
          <div className={classnames(Classes.DIALOG_BODY)}>
            <div className="argo-table-container">
                <table className="argo-table-container__table pt-table pt-bordered pt-striped">
                    <thead>
                        <tr>
                            <th><b>Show/Hide</b></th>
                            <th><b>Node ID</b></th>
                            {
                                appState.graph.allPropertiesKeyList.map((it, i) => {
                                    if (it !== 'id') {
                                        return <th key={`${it}-${i}`}>{it}</th>;
                                    }
                                    return null;
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredNodes.map((node) => (
                                <tr key={node.id}>
                                    <td>
                                        <Switch
                                            checked={!node.isHidden}
                                            onChange={() => {
                                                if (node.isHidden) {
                                                    appState.graph.showNodes([node.id]);
                                                } else {
                                                    appState.graph.hideNodes([node.id]);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>{node.id}</td>
                                    {
                                        appState.graph.allPropertiesKeyList.map((it, i) => {
                                            if (it !== 'id') {
                                                return <td key={`${it}-${i}`}>{node[it]}</td>
                                            }
                                        })
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent={Intent.PRIMARY}
                onClick={() => {
                  appState.preferences.neighborDialogOpen = false;
                }}
                text="Done"
              />
            </div>
          </div>
        </Dialog>
    );
  }
}

export default NeighborDialog;