import React from "react";
import { Classes, Tab2, Tabs2 } from "@blueprintjs/core";
import classnames from "classnames";
import { observer } from "mobx-react";
import appState from "../stores";
import SimpleSelect from "./utils/SimpleSelect";
import { addNode } from "../ipc/client";
import NodesPanel from "./panels/NodesPanel";
import LabelsPanel from "./panels/LabelsPanel";
import NodeDetail from "./panels/NodeDetailPanel";
import Legends from "./Legends";
import StatusBar from './StatusBar';

@observer
class FloatingCards extends React.Component {
  render() {
    return (
      <div className="floating-overlay">
        {appState.graph.selectedNodes.length === 1 && (
          <NodeDetail node={appState.graph.selectedNodes[0].data.ref} />
        )}
        <Legends />
        <StatusBar />
      </div>
    );
  }
}


export default FloatingCards;