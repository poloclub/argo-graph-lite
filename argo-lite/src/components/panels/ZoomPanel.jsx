import React from "react";
import { observer } from "mobx-react";
import classnames from "classnames";
import {
  Button,
  Classes,
  InputGroup,
  Intent,
  Position,
  Tooltip,
  Popover,
  Menu,
  MenuItem,
  MenuDivider
} from "@blueprintjs/core";
import pluralize from "pluralize";
import appState from "../../stores";
import GlobalPanel from "./GlobalPanel";
import SelectionPanel from "./SelectionPanel";
import uniq from "lodash/uniq";
import { averageClusteringCoefficient } from "../../services/AlgorithmUtils";


@observer
class ZoomPanel extends React.Component {
  render() {
    return (
      <div className={classnames(
        "zoom-buttons"
      )}>
          <Button
            style={{marginBottom: "5px"}}
            className={classnames([Classes.BUTTON])} 
            iconName="plus"
            onClick={() => {
              let controls = appState.controls
              controls.dollyIn(1.5)
            }}
            ></Button>
            
            
            <br></br>
            
            
            <Button 
            style={{marginBottom: "5px"}}
            className={classnames([Classes.BUTTON])} 
            iconName="minus"
            onClick={() => {
              let controls = appState.controls
              controls.dollyIn(0.5)
            }}></Button>


            <br></br>
            
            
            <Button
            style={{marginBottom: "5px"}} 
            className={classnames([Classes.BUTTON])} 
            iconName="home"
            onClick={() => {
              let controls = appState.controls
              controls.reset()

              //reset to center of graph code:
              // let xVal = 0
              // let yVal = 0
              // let pos = appState.graph.frame.getPositions();
              // for(let n in pos) {
              //   xVal = pos[n][0]
              //   yVal = pos[n][1]
              // }
              // let len = Object.keys(pos).length
              // appState.panToMousePosition(xVal,yVal);
            }}></Button>
      </div>
    );
  }
}

export default ZoomPanel;