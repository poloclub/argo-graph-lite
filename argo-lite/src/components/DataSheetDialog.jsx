import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
  Switch,
  ButtonGroup
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";
import NodeTable from './NodeTable';

@observer
class DataSheetDialog extends React.Component {

  render() {
    // Compare function for nodes used for sorting descendingly.
    const compareByPageRank = (n1, n2) => {
        if (n1["pagerank"] && n2["pagerank"]) {
            return n2["pagerank"] - n1["pagerank"];
        }
        return 0;
    };
    const compareByDegree = (n1, n2) => {
        if (n1["degree"] && n2["degree"]) {
            return n2["degree"] - n1["degree"];
        }
        return 0;
    };

    let filteredNodes = [...appState.graph.rawGraph.nodes];

    // Show numberToShow more hidden nodes with top pagerank.
    const showNMoreByPageRank = (numberToShow) => {
        const hiddenNodes = filteredNodes.filter(n => n.isHidden);
        hiddenNodes.sort(compareByPageRank);
        const ids = [];
        for (let i = 0; i < numberToShow && i < hiddenNodes.length; i++) {
            ids.push(hiddenNodes[i].id);
        }
        appState.graph.showNodes(ids);
    };

    // Show numberToShow more hidden nodes with top degree.
    const showNMoreByDegree = (numberToShow) => {
        const hiddenNodes = filteredNodes.filter(n => n.isHidden);
        hiddenNodes.sort(compareByDegree);
        const ids = [];
        for (let i = 0; i < numberToShow && i < hiddenNodes.length; i++) {
            ids.push(hiddenNodes[i].id);
        }
        appState.graph.showNodes(ids);
    };
    
    return (
        <Dialog
          iconName="database"
          isOpen={appState.preferences.dataSheetDialogOpen}
          onClose={() => {
            appState.preferences.dataSheetDialogOpen = false;
          }}
          title='Data Sheet'
        >
          <div className={classnames(Classes.DIALOG_BODY)}>

            <ButtonGroup vertical={true}>
                <Button onClick={() => {appState.graph.showNodes(filteredNodes.map(n => n.id))}}>Show All</Button>
                <Button onClick={() => {showNMoreByPageRank(5)}}>Show 5 More By PageRank</Button>
                <Button onClick={() => {showNMoreByPageRank(10)}}>Show 10 More By PageRank</Button>
                <Button onClick={() => {showNMoreByDegree(5)}}>Show 5 More By Degree</Button>
                <Button onClick={() => {showNMoreByDegree(10)}}>Show 10 More By Degree</Button>
                <Button onClick={() => {appState.graph.hideNodes(filteredNodes.map(n => n.id))}}>Hide All</Button>
            </ButtonGroup>

            <hr />

            <NodeTable nodes={filteredNodes} />
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent={Intent.PRIMARY}
                onClick={() => {
                  appState.preferences.dataSheetDialogOpen = false;
                }}
                text="Done"
              />
            </div>
          </div>
        </Dialog>
    );
  }
}

export default DataSheetDialog;