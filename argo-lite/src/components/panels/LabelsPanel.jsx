import React from "react";
import { Button, Classes, Slider } from "@blueprintjs/core";
import { Select } from "@blueprintjs/labs";
import { observer } from "mobx-react";
import appState from "../../stores";
import CommonItemRenderer from "../utils/CommonItemRenderer";

@observer
class LabelsPanel extends React.Component {
  render() {
    return (
      <div>
        <Button
          id="hideAll"
          iconName="eye-off"
          className={Classes.FILL}
          onClick={() => appState.graph.frame.hideAllLabels()}
        >
          Hide All Labels
        </Button>
        <Button
          style={{display:"none"}}
          id="showAll"
          iconName="eye-on"
          className={Classes.FILL}
          onClick={() => appState.graph.frame.showAllLabels()}
        >
          Show All Labels
        </Button>
        <Button
          style={{marginTop:"1em"}}
          id="hideSelected"
          iconName="eye-off"
          className={Classes.FILL}
          onClick={() => appState.graph.frame.hideSelectedLabels()}
        >
          Hide Labels of Selected Nodes
        </Button>
        <Button
          style={{marginTop:"1em",display:"none"}}
          id="showSelected"
          iconName="eye-on"
          className={Classes.FILL}
          onClick={() => appState.graph.frame.showSelectedLabels()}
        >
          Show Labels of Selected Nodes
        </Button>
        <div style={{height: '30px'}} />
        <h6>Label Size</h6>
        <Slider
          min={0.5}
          max={3}
          stepSize={0.1}
          onChange={value => {
            appState.graph.nodes.labelSize = value;
          }}
          value={appState.graph.nodes.labelSize}
        />
        <div style={{height: '30px'}} />
        <h6>Label Length</h6>
        <Slider
          min={1}
          max={32}
          stepSize={0.1}
          labelStepSize={5}
          onChange={value => {
            appState.graph.nodes.labelLength = value;
          }}
          value={appState.graph.nodes.labelLength}
        />
        <div style={{height: '30px'}} />
        <h6>Label By</h6> 
        <Select
          items={appState.graph.allPropertiesKeyList}
          itemRenderer={CommonItemRenderer}
          filterable={false}
          onItemSelect={it => (appState.graph.nodes.labelBy = it)}
        >
          <Button text={appState.graph.nodes.labelBy} />
        </Select>
      </div>
    );
  }
}

export default LabelsPanel;