/* eslint-disable jsx-a11y/label-has-for */
import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
  Spinner,
  Switch,
  FileInput
} from "@blueprintjs/core";
import { Cell, Column, Table } from "@blueprintjs/table";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";
import {
  requestChooseEdgeFile,
  requestChooseNodeFile,
  requestImportGraphFromCSV,
  requestCreateNewProject
} from "../ipc/client";
import Collapsable from "./utils/Collapsable";
import SimpleSelect from "./utils/SimpleSelect";
import { NODE_AND_EDGE_FILE, ONLY_EDGE_FILE } from "../constants/index";

@observer
class PreviewTable extends React.Component {
  render() {
    const file = this.props.file;
    return (
      <Table
        className="import-preview-table"
        numRows={file.topN.length}
        selectedRegions={Object.values(file.mapping)
          .map(it => file.columns.indexOf(it))
          .map(it => ({ rows: null, cols: [it, it] }))}
      >
        {file.columns.map(it => (
          <Column
            key={it}
            name={it}
            renderCell={i => <Cell>{file.topN[i][it]}</Cell>}
          />
        ))}
      </Table>
    );
  }
}

@observer
class GEXFImportDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      available: ONLY_EDGE_FILE,
      nodesOpen: true,
      edgesOpen: true,
      delimiter: ','
    };
  }

  changeAvailable = targetValue => {
    if (targetValue === ONLY_EDGE_FILE) {
      appState.import.importConfig.edgeFile.createMissing = true;
    }
    this.setState({ available: targetValue });
  };

  canImport = () => {
    if (this.state.available === NODE_AND_EDGE_FILE) {
      return (
        appState.import.importConfig.edgeFile.ready &&
        appState.import.importConfig.nodeFile.ready
      );
    } else if (this.state.available === ONLY_EDGE_FILE) {
      return appState.import.importConfig.edgeFile.ready;
    }
    return false;
  };

  renderFileSelection() {
    return (
      <div className={classnames(Classes.DIALOG_BODY, "import-dialog")}>
        <div className={classnames(Classes.CONTROL_GROUP)}>
          <div className={classnames(Classes.INPUT_GROUP, Classes.FILL)}>
           <input
             type="file"
             className={classnames(Classes.DISABLED)}
             onChange={(event) => {
               if (event.target.files.length < 1) {
                 return;
               }
               appState.import.selectedGexfFileFromInput = event.target.files[0];
             }}
           />
         </div>
       </div>
      </div>
    )
  }

  renderImportButton() {
    return (
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button
            className={classnames({
              [Classes.DISABLED]: appState.import.selectedGexfFileFromInput == null
            })}
            intent={Intent.PRIMARY}
            onClick={() => {
              // Temp
              appState.import.gexfDialogOpen = false;
              // appState.import.selectedGexfFileFromInput = null;
            }}
            text="Import"
          />
        </div>
      </div>
    )
  }

  render() {
    return (
      <Dialog
        iconName="import"
        className={classnames({
          [Classes.DARK]: appState.preferences.darkMode
        })}
        isOpen={appState.import.gexfDialogOpen}
        onClose={() => {
          appState.import.gexfDialogOpen = false;
        }}
        title="Import GEXF"
      >
        {appState.import.loading ? (
          <Spinner />
        ) : (
          <div>
            {this.renderFileSelection()}
            {this.renderImportButton()}
          </div>
        )}
      </Dialog>
    );
  }
}

export default GEXFImportDialog;