import React from "react";
import { Button, Classes } from "@blueprintjs/core";
import { observer } from "mobx-react";
import appState from "../../stores";

@observer
export default class LayoutPanel extends React.Component {
  render() {
    return (
      <div>
        {/* <div className={Classes.BUTTON_GROUP}>
          <Button
            iconName="pause"
            onClick={() => appState.graph.frame.pauseLayout()}
          >
            Pause Layout
          </Button>
          <Button
            iconName="play"
            onClick={() => appState.graph.frame.resumeLayout()}
          >
            Resume Layout
          </Button>
        </div>
        <br />
        <br />
        <div className={Classes.BUTTON_GROUP}>
          <Button
            iconName="pin"
            onClick={() => appState.graph.frame.pinSelectedNodes()}
          >
            Pin Selected
          </Button>
          <Button
            iconName="unpin"
            onClick={() => appState.graph.frame.unpinSelectedNodes()}
          >
            Unpin Selected
          </Button>
        </div>
        <br />
        <br /> */}
        <div className={Classes.BUTTON_GROUP}>
          <Button onClick={() => appState.graph.frame.toggleAlias()}>
            AntiAlias
          </Button>
          <Button onMouseDown={() => appState.graph.frame.dragLastNode()}>
            Drag Last Node
          </Button>
        </div>
        <div className={Classes.BUTTON_GROUP}>
          <Button onClick={() => appState.graph.frame.lowerRes()}>
            Lower Resolution
          </Button>
          <Button
            onClick={() => appState.graph.frame.toggleNeighborHighlight()}
          >
            Neighbor Highlight
          </Button>
        </div>
        {/* <div className={Classes.BUTTON_GROUP}>
          <Button onClick={() => appState.graph.frame.removeSelected()}>
            Delete Selected
          </Button>
        </div> */}
      </div>
    );
  }
}
