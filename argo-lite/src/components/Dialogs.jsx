import React from "react";
import PreferencesDialog from "./PreferencesDialog";
import ImportDialog from "./ImportDialog";
import GEXFImportDialog from "./GEXFImportDialog"
import OpenDialog from "./OpenDialog";
import NewProjectDialog from "./NewProjectDialog";
import ProjectDetailDialog from "./ProjectDetailDialog";
import SaveSnapshotDialog from "./SaveSnapshotDialog";
import RenameSnapshotDialog from "./RenameSnapshotDialog";
import OpenSnapshotDialog from "./OpenSnapshotDialog";
import ShareDialog from './ShareDialog';
import StatisticsDialog from './StatisticsDialog';
import HelpDialog from './HelpDialog';
import NeighborDialog from './NeighborDialog';
import DataSheetDialog from './DataSheetDialog';

export default class Dialogs extends React.Component {
  render() {
    return (
      <div style={{ display: "none" }}>
        <PreferencesDialog />
        <ImportDialog />
        <GEXFImportDialog />
        <OpenDialog />
        <OpenSnapshotDialog />
        <NewProjectDialog />
        <ProjectDetailDialog />
        <SaveSnapshotDialog />
        <RenameSnapshotDialog />
        <ShareDialog />
        <StatisticsDialog />
        <HelpDialog />
        <NeighborDialog />
        <DataSheetDialog />
      </div>
    );
  }
}
