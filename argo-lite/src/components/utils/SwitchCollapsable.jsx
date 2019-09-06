import React from "react";
import { Classes, Collapse, Switch } from "@blueprintjs/core";

export default ({ name, isOpen, onToggle, children }) => (
  <div>
    <Switch
      label={name}
      checked={isOpen}
      onChange={onToggle}
      className={Classes.ALIGN_RIGHT}
    />
    <Collapse isOpen={isOpen}>{children}</Collapse>
  </div>
);
