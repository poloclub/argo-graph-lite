import React from "react";

import { format } from "d3-format";
import { LegendLinear, LegendSize } from "@vx/vx";
import appState from "../stores";
import { observer } from "mobx-react";

function Legends() {
  return (
    <div className="legends" style={{visibility: appState.preferences.isLegendShowing ? 'visible' : 'hidden'}}>
      <LegendSize
        className="scale-legend"
        direction="row"
        itemDirection="column"
        itemMargin="0"
        shapeMargin="5px 0"
        labelFormat={format(".4f")}
        scale={appState.graph.nodeSizeScale}
        shape={props => {
          const { size } = props;
          return (
            <svg width={size} height={size}>
              <circle {...props} r={size / 2} cx={size / 2} cy={size / 2} />
            </svg>
          );
        }}
      />
      <LegendLinear
        direction="row"
        itemDirection="column"
        shape="circle"
        scale={appState.graph.nodeColorScale}
        labelFormat={format(".4f")}
      />
    </div>
  );
}

export default observer(Legends);
