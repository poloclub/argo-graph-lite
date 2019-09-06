import React from "react";
import PreferencesDialog from "./PreferencesDialog";
import ImportDialog from "./ImportDialog";
import OpenDialog from "./OpenDialog";
import NewProjectDialog from "./NewProjectDialog";
import ProjectDetailDialog from "./ProjectDetailDialog";
import SaveSnapshotDialog from "./SaveSnapshotDialog";

export default class Dialogs extends React.Component {
  render() {
    return (
      <div style={{ display: "none" }}>
        <PreferencesDialog />
        <ImportDialog />
        <OpenDialog />
        <NewProjectDialog />
        <ProjectDetailDialog />
        <SaveSnapshotDialog />
      </div>
    );
  }
}
