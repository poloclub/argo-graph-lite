import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";

@observer
class HelpDialog extends React.Component {

  render() {
    return (
        <Dialog
          iconName="help"
          isOpen={appState.preferences.helpDialogOpen}
          onClose={() => {
            appState.preferences.helpDialogOpen = false;
          }}
          title={`Help`}
        >
          <div className={classnames(Classes.DIALOG_BODY)}>
            Argo supports both mouse/trackpad and touchscreen.
            <div className="argo-table-container">
              <table className="argo-table-container__table pt-table pt-bordered pt-striped">
                <thead>
                  <tr>
                    <th>Basic Operation</th>
                    <th>Mouse</th>
                    <th>Touchscreen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Zoom</td>
                    <td>Mouse wheel</td>
                    <td>2 finger zoom gesture</td>
                  </tr>
                  <tr>
                    <td>Pan</td>
                    <td>Drag with right mouse button down OR Move mouse with space key pressed</td>
                    <td>Drag with 3 finger</td>
                  </tr>
                  <tr>
                    <td>Select single node (view details)</td>
                    <td>Single Click</td>
                    <td>Tap with 1 finger</td>
                  </tr>
                  <tr>
                    <td>Select multiple nodes</td>
                    <td>Drag left mouse button from empty area</td>
                    <td>Drag 1 finger from empty area</td>
                  </tr>
                  <tr>
                    <td>Drag nodes</td>
                    <td>Drag with left mouse button down</td>
                    <td>Drag with 1 finger</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent={Intent.PRIMARY}
                onClick={() => {
                  appState.preferences.helpDialogOpen = false;
                }}
                text="Done"
              />
            </div>
          </div>
        </Dialog>
    );
  }
}

export default HelpDialog;