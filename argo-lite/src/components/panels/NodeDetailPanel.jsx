import React from "react";
import classnames from "classnames";
import uniq from "lodash/uniq";
import { Classes } from "@blueprintjs/core";
import appState from "../../stores";
import { observer } from "mobx-react/index";

@observer
class NodeDetail extends React.Component {
  render() {
    return (
      <div
        className={classnames(
          // 'overlay-card',
          "right-overlay-card",
          "transparent-frame"
        )}
      >
        <div className={classnames(Classes.CARD, "node-details-table")}>
          <table
            className={classnames(Classes.TABLE, Classes.TABLE_STRIPED)}
            style={{ width: "100%" }}
          >
            
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {appState.graph.allPropertiesKeyList.map((it, i) => (
                <tr key={`${it}-${i}`}>
                  <td>{it}</td>
                  <td>{this.props.node[it]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default NodeDetail;