import React from "react";
import PreferencesDialog from "./PreferencesDialog";
import ImportDialog from "./ImportDialog";
import OpenDialog from "./OpenDialog";
import NewProjectDialog from "./NewProjectDialog";
import ProjectDetailDialog from "./ProjectDetailDialog";
import SaveSnapshotDialog from "./SaveSnapshotDialog";
import OpenSnapshotDialog from "./OpenSnapshotDialog";
import ShareDialog from './ShareDialog';

export default class Dialogs extends React.Component {
  render() {
    return (
      <div style={{ display: "none" }}>
        <PreferencesDialog />
        <ImportDialog />
        <OpenDialog />
        <OpenSnapshotDialog />
        <NewProjectDialog />
        <ProjectDetailDialog />
        <SaveSnapshotDialog />
        <ShareDialog />
      </div>
    );
  }
}
