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
class DataSheetDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMoreBy: 'pagerank',
      showMoreNum: 5,
    };
  }

  render() {
    let filteredNodes = [...appState.graph.rawGraph.nodes];

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
          iconName="database"
          isOpen={appState.preferences.dataSheetDialogOpen}
          onClose={() => {
            appState.preferences.dataSheetDialogOpen = false;
          }}
          title='Data Sheet'
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