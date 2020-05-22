/* eslint-disable jsx-a11y/label-has-for */
import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
  Spinner,
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";
import {
  requestImportGraphFromGexf
} from "../ipc/client";
import PostImportOptions from './PostImportOptions';

@observer
class GEXFImportDialog extends React.Component {

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
              appState.import.loading = true;
              requestImportGraphFromGexf();
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
          appState.import.loading = false;
        }}
        title="Import GEXF"
      >
        {appState.import.loading ? (
          <Spinner />
        ) : (
          <div className={classnames(Classes.DIALOG_BODY, "import-dialog")}>
            <div>
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
            <hr />
            <PostImportOptions />
          </div>
            {this.renderImportButton()}
          </div>
        )}
      </Dialog>
    );
  }
}

export default GEXFImportDialog;