import React from "react";
import appState from "../stores";

export default class ThreeJSVis extends React.Component {
  componentDidMount() {
    appState.graph.setUpFrame();
  }

  render() {
    return (
      <div
        id="graph-container"
        style={{
          width: "100vw",
          height: "90vh",
          flex: "1",
          position: "absolute"
        }}
      />
    );
  }
}
