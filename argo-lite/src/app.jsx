import React from "react";
import { observer } from "mobx-react";
import classnames from "classnames";
import {
  Button,
  Classes,
  FocusStyleManager,
  NonIdealState
} from "@blueprintjs/core";
import Dialogs from "./components/Dialogs";
import Navbar from "./components/Navbar";
import WorkspaceView from "./components/WorkspaceView";
import appState from "./stores/index";
import ThreeJSVis from "./visualizers/ThreeJSVis";
import FloatingCards from "./components/FloatingCards";
import registerIPC from "./ipc/client";
import { fetchWorkspaceProjects } from "./ipc/client";
import { MOBILE_WIDTH_CUTOFF, MOBILE_HEIGHT_CUTOFF } from "./constants";

import keydown, { Keys } from "react-keydown";

registerIPC();
FocusStyleManager.onlyShowFocusOnTabs();

fetchWorkspaceProjects();

appState.preferences.loadUserConfig();

const { DELETE, BACKSPACE, P, U } = Keys;

// Respond to window resize, also triggered after frame is loaded.
function respondToResize() {
  if (!appState.graph.frame) {
    window.setTimeout(respondToResize, 1000);
    return;
  }
  if (window.innerWidth < MOBILE_WIDTH_CUTOFF || window.innerHeight < MOBILE_HEIGHT_CUTOFF) {
    appState.preferences.turnOnMinimalMode();
  }
}

respondToResize();

window.addEventListener('resize', respondToResize);

@keydown
@observer
class App extends React.Component {
  componentWillReceiveProps({ keydown }) {
    if (keydown.event) {
      if (keydown.event.which === DELETE || keydown.event.which === BACKSPACE) {
        if (appState && appState.graph && appState.graph.frame) {
          appState.graph.hideNodes(appState.graph.frame.getSelectedIds());
          this.forceUpdate();
        }
      } else if (keydown.event.which === P) {
        if (appState && appState.graph && appState.graph.frame) {
          appState.graph.frame.pinSelectedNodes();
        }
      } else if (keydown.event.which === U) {
        if (appState && appState.graph && appState.graph.frame) {
          appState.graph.frame.unpinSelectedNodes();
        }
      }
    }
  }
  render() {
    return (
      <div
        className={classnames({
          "app-wrapper": true,
          [Classes.DARK]: appState.preferences.darkMode
        })}
      >
        <Navbar />
        <main className="main">
          {appState.graph.hasGraph ? (
            <ThreeJSVis />
          ) : (
            <WorkspaceView />
          )}
        </main>
        {appState.graph.hasGraph && <FloatingCards />}
        <Dialogs />
      </div>
    );
  }
}

export default App;