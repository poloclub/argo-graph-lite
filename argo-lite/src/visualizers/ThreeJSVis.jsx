import React from "react";
import { Frame } from "../graph-frontend";
import { ContextMenu, MenuFactory, MenuItemFactory } from "@blueprintjs/core";
import appState from "../stores";
import { requestNeighbors } from "../ipc/client";

export default class ThreeJSVis extends React.Component {
  componentDidMount() {
    console.log("!!!!!");
    const graphFrame = new Frame(appState.graph.computedGraph);
    graphFrame.init();
    graphFrame.display();
    appState.graph.frame = graphFrame;
    graphFrame.ee.on("select-nodes", nodes => {
      appState.graph.selectedNodes = nodes;
    });
    graphFrame.ee.on("right-click", data => {
      const menu = MenuFactory({
        children: [
          MenuItemFactory({
            onClick: () => {
              appState.graph.frame.toggleSelectedLabels();
            },
            text: `Toggle Labels`
          }),
          MenuItemFactory({
            onClick: () => {
              appState.graph.frame.unpinSelectedNodes();
            },
            text: `Unpin Selected`
          }),
          MenuItemFactory({
            onClick: () => {
              requestNeighbors(
                appState.graph.frame.rightClickedNode.id,
                "degree",
                "10"
              );
            },
            text: `Add 10 Neighbors by Degree`
          }),
          MenuItemFactory({
            onClick: () => {
              requestNeighbors(
                appState.graph.frame.rightClickedNode.id,
                "pagerank",
                "10"
              );
            },
            text: `Add 10 Neighbors by Pagerank`
          })
        ]
      });
      ContextMenu.show(menu, { left: data.pageX, top: data.pageY }, () => {
        // onMenuClose
        console.log("ContextMenu closed");
      });
    });
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
