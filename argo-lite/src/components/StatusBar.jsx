import React from "react";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores";

@observer
class StatusBar extends React.Component {
    render() {
        return (
            <div
                className={classnames("bottom-status-bar")}
                style={{
                    backgroundColor: appState.preferences.darkMode ? '#30404D' : '#FFFFFF',
                    visibility: appState.preferences.isStatusBarShowing? "visible" : "hidden"
                }}
            >
                <div className={classnames("bottom-status-bar__left")}>Nodes ({appState.graph.metadata.fullNodes && `${appState.graph.metadata.fullNodes} total,`} {appState.graph.numHiddenNodes} hidden); {appState.graph.metadata.fullEdges && `Edges ${appState.graph.metadata.fullEdges}`}</div>
                <div className={classnames("bottom-status-bar__right")}>Color by: {appState.graph.nodes.colorBy} ({appState.graph.nodes.color.scale}), Size by: {appState.graph.nodes.sizeBy} ({appState.graph.nodes.size.scale})</div>
            </div>
        );
    }
}

export default StatusBar;