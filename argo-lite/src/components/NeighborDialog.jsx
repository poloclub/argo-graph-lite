import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
  ButtonGroup,
  NumericInput,
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";
import NodeTable from './NodeTable';
import SimpleSelect from "./utils/SimpleSelect";

@observer
class NeighborDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMoreBy: 'pagerank',
      showMoreNum: 5,
    };
  }

  render() {
    // Compare function for nodes used for sorting descendingly.
    const compareByPageRank = (n1, n2) => {
        if (n1["pagerank"] && n2["pagerank"]) {
            return n2["pagerank"] - n1["pagerank"];
        }
        return 0;
    };

    let filteredNodes = [];
    // When only one node is selected, show the neighbors of this selected node.
    if (appState.graph.lastSelectedSingleNode) {
        const selectedNodeId = appState.graph.lastSelectedSingleNode.data.ref.id.toString();
        filteredNodes = appState.graph.getNeighborNodesFromRawGraph(selectedNodeId);

        // Sort by pagerank if available.
        filteredNodes.sort(compareByPageRank);
    }

    const showNMoreByAttribute = (numberToShow, attributeName) => {
      const hiddenNodes = filteredNodes.filter(n => n.isHidden);
      hiddenNodes.sort((n1, n2) => {
        if (n1[attributeName] && n2[attributeName]) {
            return n2[attributeName] - n1[attributeName];
        }
        return 0;
      });
      const ids = [];
      for (let i = 0; i < numberToShow && i < hiddenNodes.length; i++) {
          ids.push(hiddenNodes[i].id);
      }
      appState.graph.showNodes(ids);
    };
    
    return (
        <Dialog
          iconName="graph"
          isOpen={appState.preferences.neighborDialogOpen}
          onClose={() => {
            appState.preferences.neighborDialogOpen = false;
          }}
          title='Neighbors'
          style={{minWidth: '80vw'}}
        >
          <div className={classnames(Classes.DIALOG_BODY)}>

            <ButtonGroup>
                <Button onClick={() => {appState.graph.showNodes(filteredNodes.map(n => n.id))}}>Show All</Button>
                <Button onClick={() => {appState.graph.hideNodes(filteredNodes.map(n => n.id))}}>Hide All</Button>
            </ButtonGroup>

            <hr />

            <div>
              <Button
              style={{display: 'inline'}}
              intent={Intent.PRIMARY}
              text='Show'
              onClick={() => {
                showNMoreByAttribute(this.state.showMoreNum, this.state.showMoreBy);
              }} /> <NumericInput onValueChange={(valAsNumber, valAsString) => {this.setState({showMoreNum: Number(valAsString)})}} value={this.state.showMoreNum} style={{display: 'inline-flex', width: '30px'}} /> {' '}
              more nodes with highest <SimpleSelect items={['pagerank', 'degree']} value={this.state.showMoreBy} onSelect={(selected) => {this.setState({showMoreBy: selected})}} />
            </div>

            <hr />

            <NodeTable nodes={filteredNodes} />
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