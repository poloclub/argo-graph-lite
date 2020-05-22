/* eslint-disable jsx-a11y/label-has-for */
import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
  Spinner,
  Switch,
  FileInput
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";
import SimpleSelect from "./utils/SimpleSelect";

@observer
class PostImportOptions extends React.Component {
  render() {
    return (
      <div>
            After import, show:
            <SimpleSelect
                items={Object.keys(appState.import.postImportFilteringOptions)}
                value={appState.import.selectedPostImportFilteringOption}
                onSelect={(selected) => {
                    appState.import.selectedPostImportFilteringOption = selected;
                }}
            />
      </div>
    );
  }
}

export default PostImportOptions;