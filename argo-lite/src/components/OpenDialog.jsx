/* eslint-disable jsx-a11y/label-has-for */
import React from "react";
import { Button, Classes, Dialog, Intent, Spinner } from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";
import {
  requestChooseGraphFile,
  requestChooseStateFile,
  requestOpen
} from "../ipc/client";
import SimpleSelect from "./utils/SimpleSelect";
import {
  GRAPH_AND_STATE_FILE,
  ONLY_EDGE_FILE,
  ONLY_GRAPH_FILE
} from "../constants";

@observer
export default class OpenDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      available: ONLY_GRAPH_FILE,
      selectedGraph: null,
      selectedState: null
    };
  }

  canImport = () => {
    if (this.state.available === GRAPH_AND_STATE_FILE) {
      return appState.import.stateFile && appState.import.graphFile;
    } else {
      return appState.import.graphFile;
    }
    return false;
  };

  changeAvailable = targetValue => {
    if (targetValue === ONLY_EDGE_FILE) {
      appState.import.importConfig.edgeFile.createMissing = true;
    }
    this.setState({ available: targetValue });
  };

  renderSelectGraph = () => {
    return (
      <div className={classnames(Classes.CONTROL_GROUP)}>
        <div className={classnames(Classes.INPUT_GROUP, Classes.FILL)}>
          <input
            type="text"
            className={classnames(Classes.DISABLED, Classes.INPUT)}
            placeholder="Select graph file"
            readOnly
            value={appState.import.graphFile}
          />
        </div>
        <Button intent={Intent.PRIMARY} onClick={requestChooseGraphFile}>
          Choose File
        </Button>
      </div>
    );
  };

  renderSelectState = () => {
    return (
      <div className={classnames(Classes.CONTROL_GROUP)}>
        <div className={classnames(Classes.INPUT_GROUP, Classes.FILL)}>
          <input
            type="text"
            className={classnames(Classes.DISABLED, Classes.INPUT)}
            placeholder="Select snapshot file"
            readOnly
            value={appState.import.stateFile}
          />
        </div>
        <Button intent={Intent.PRIMARY} onClick={requestChooseStateFile}>
          Choose File
        </Button>
      </div>
    );
  };

  render() {
    return (
      <Dialog
        iconName="import"
        className={classnames({
          [Classes.DARK]: appState.preferences.darkMode
        })}
        isOpen={appState.preferences.openDialogOpen}
        onClose={() => {
          appState.preferences.openDialogOpen = false;
        }}
        title="Open File"
      >
        {appState.import.loading ? (
          <Spinner />
        ) : (
          <div>
            <div className={classnames(Classes.DIALOG_BODY, "import-dialog")}>
              I have:
              <SimpleSelect
                items={[GRAPH_AND_STATE_FILE, ONLY_GRAPH_FILE]}
                value={this.state.available}
                onSelect={this.changeAvailable}
              />
              {this.renderSelectGraph()}
              {this.state.available === GRAPH_AND_STATE_FILE &&
                this.renderSelectState()}
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button
                  className={classnames({
                    [Classes.DISABLED]: !this.canImport()
                  })}
                  intent={Intent.PRIMARY}
                  onClick={() => {
                    appState.preferences.openDialogOpen = false;
                    requestOpen();
                  }}
                  text="Open"
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    );
  }
}
