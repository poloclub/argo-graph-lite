import React from "react";
import {
  Button,
  Classes,
  Card,
  Icon,
  Dialog,
  Intent,
  Spinner
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";

@observer
class StatisticsDialog extends React.Component {
//   constructor(props) {
//     super(props);
//   }

  render() {
    return (
        <Dialog
          iconName="projects"
          isOpen={appState.preferences.statisticsDialogOpen}
          onClose={() => {
            appState.preferences.statisticsDialogOpen = false;
          }}
          title={`Statistics`}
        >
          <div className={classnames(Classes.DIALOG_BODY)}>
            <table className={Classes.TABLE} style={{width: '100%'}}>
                <thead>
                    <tr>
                        <th>Statistics</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td># Nodes</td>
                        <td>{appState.graph.metadata.fullNodes}</td>
                    </tr>
                    <tr>
                        <td># Edges</td>
                        <td>{appState.graph.metadata.fullEdges}</td>
                    </tr>
                    <tr>
                        <td>Average Degree</td>
                        <td>Under Construction</td>
                    </tr>
                    <tr>
                        <td>Graph Density</td>
                        <td>Under Construction</td>
                    </tr>
                    <tr>
                        <td>Graph Diameter</td>
                        <td>Under Construction</td>
                    </tr>
                    <tr>
                        <td>Clustering Coefficient</td>
                        <td>Under Construction</td>
                    </tr>
                </tbody>
            </table>
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent={Intent.PRIMARY}
                onClick={() => {
                  appState.preferences.statisticsDialogOpen = false;
                }}
                text="Done"
              />
            </div>
          </div>
        </Dialog>
    );
  }
}

export default StatisticsDialog;