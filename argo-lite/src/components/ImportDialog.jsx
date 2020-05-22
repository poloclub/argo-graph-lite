/* eslint-disable jsx-a11y/label-has-for */
import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
  Spinner,
  Switch
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
import PostImportOptions from './PostImportOptions';

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
class ImportDialog extends React.Component {
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

  renderNodesSelection = () => {
    const nodeFile = appState.import.importConfig.nodeFile;
    if (this.state.available === ONLY_EDGE_FILE) {
      return null;
    }
    return (
      <Collapsable
        name="Nodes"
        isOpen={this.state.nodesOpen}
        onToggle={() => this.setState({ nodesOpen: !this.state.nodesOpen })}
      >
        <div className={classnames(Classes.CONTROL_GROUP)}>
          <div className={classnames(Classes.INPUT_GROUP, Classes.FILL)}>
            <input
              type="file"
              className={classnames(Classes.DISABLED)}
              onChange={(event) => {
                if (event.target.files.length < 1) {
                  return;
                }
                appState.import.selectedNodeFileFromInput = event.target.files[0];
              }}
            />
          </div>
        </div>
        <Switch
          label="Has Headers"
          checked={nodeFile.hasColumns}
          onChange={() => (nodeFile.hasColumns = !nodeFile.hasColumns)}
        />
        {nodeFile.ready && (
          <div className="column-selection">
            <PreviewTable file={nodeFile} />
            Column for Node ID:
            <SimpleSelect
              items={nodeFile.columns}
              value={nodeFile.mapping.id}
              onSelect={it => (nodeFile.mapping.id = it)}
            />
          </div>
        )}
      </Collapsable>
    );
  };

  renderEdgesSelection = () => {
    const edgeFile = appState.import.importConfig.edgeFile;
    return (
      <Collapsable
        name="Edges"
        isOpen={this.state.edgesOpen}
        onToggle={() => this.setState({ edgesOpen: !this.state.edgesOpen })}
      >
        <div className={classnames(Classes.CONTROL_GROUP)}>
          <div className={classnames(Classes.INPUT_GROUP, Classes.FILL)}>
            <input
              type="file"
              className={classnames(Classes.DISABLED)}
              onChange={(event) => {
                if (event.target.files.length < 1) {
                  return;
                }
                appState.import.selectedEdgeFileFromInput = event.target.files[0];
              }}
            />
          </div>
        </div>
        <Switch
          label="Has Headers"
          checked={edgeFile.hasColumns}
          onChange={() => (edgeFile.hasColumns = !edgeFile.hasColumns)}
        />
        <Switch
          label="Create Missing Nodes"
          checked={edgeFile.createMissing}
          disabled={this.state.available === ONLY_EDGE_FILE}
          onChange={() => (edgeFile.createMissing = !edgeFile.createMissing)}
        />
        {edgeFile.ready && (
          <div className="column-selection">
            <PreviewTable file={edgeFile} />
            Column for Source ID:
            <SimpleSelect
              items={edgeFile.columns}
              value={edgeFile.mapping.fromId}
              onSelect={it => (edgeFile.mapping.fromId = it)}
            />{" "}
            <br />
            Column for Target ID:
            <SimpleSelect
              items={edgeFile.columns}
              value={edgeFile.mapping.toId}
              onSelect={it => (edgeFile.mapping.toId = it)}
            />
          </div>
        )}
      </Collapsable>
    );
  };

  updateDelimiter (newDelimiter) {
    this.setState({delimiter: newDelimiter});

    if (newDelimiter == "\\t") {
      newDelimiter = "\t"
    }

    appState.import.importConfig.edgeFile.delimiter = newDelimiter
    appState.import.importConfig.nodeFile.delimiter = newDelimiter
  }

  renderDelimiterSelection() {
    return (
      <div className="column-selection">
        Selected Delimiter
        <SimpleSelect
          items={[",", "\\t", ";"]}
          value={this.state.delimiter}
          onSelect={it => { this.updateDelimiter(it) }}
        />{" "}
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
        isOpen={appState.import.dialogOpen}
        onClose={() => {
          appState.import.dialogOpen = false;
        }}
        title="Import CSV"
      >
        {appState.import.loading ? (
          <Spinner />
        ) : (
          <div>
            <div className={classnames(Classes.DIALOG_BODY, "import-dialog")}>
              I have:
              <SimpleSelect
                items={[ONLY_EDGE_FILE, NODE_AND_EDGE_FILE]}
                value={this.state.available}
                onSelect={this.changeAvailable}
              />
              {this.renderNodesSelection()}
              {this.renderEdgesSelection()}
              {this.renderDelimiterSelection()}
              <hr />
              <PostImportOptions />
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button
                  className={classnames({
                    [Classes.DISABLED]: !this.canImport()
                  })}
                  intent={Intent.PRIMARY}
                  onClick={() => {
                    // TODO: this might be unsafe, check if there's racing condition
                    requestCreateNewProject({
                      name: appState.project.newProjectName,
                      createdDate: new Date().toLocaleString(),
                    });
                    requestImportGraphFromCSV( //edgefile.delimiter and nodefile.delimiter are the same
                      this.state.available === NODE_AND_EDGE_FILE, appState.import.importConfig.edgeFile.delimiter, appState.project.newProjectName
                    );

                    // Importing a graph means no label would be shown by default,
                    // thus turn off label CSSRenderer for better performance.
                    appState.graph.frame.turnOffLabelCSSRenderer();
                  }}
                  text="Import"
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    );
  }
}

export default ImportDialog;