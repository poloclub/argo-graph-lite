import React from "react";
import classnames from "classnames";
import uniq from "lodash/uniq";
import { Classes } from "@blueprintjs/core";
import appState from "../../stores";
import { observer } from "mobx-react/index";

@observer
class NodeDetail extends React.Component {
  render() {
    // If input is number,
    // currently format number between 0-1 (eg. pagerank)
    // to show no more than 3 significant digits.
    const formatLongFloat = (nodeAttributeValue) => {
      const num = Number(nodeAttributeValue);
      if (Number.isNaN(num) || num > 1 || num < 0) {
        // Do not format just return original
        return nodeAttributeValue;
      }
      // Format to no more than 3 significant digit.
      return Number.parseFloat(num).toPrecision(3);
    };

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
            style={{
              width: "100%",
              padding: '0',
            }}
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
                  <td style={{ padding: '5px 10px' }}>{it}</td>
                  <td style={{ padding: '5px 10px', whiteSpace: 'normal' }}>{formatLongFloat(this.props.node[it])}</td>
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