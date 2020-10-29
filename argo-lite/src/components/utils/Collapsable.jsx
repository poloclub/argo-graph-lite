import React from "react";
import { Button, Classes, Collapse } from "@blueprintjs/core";
import classnames from "classnames";

export default ({ name, isOpen, onToggle, children }) => (
  <div>
    <Button
      className={classnames(Classes.LARGE, Classes.FILL, Classes.MINIMAL, "text-align-left")}
      rightIconName={isOpen ? "chevron-up" : "chevron-down"}
      onClick={onToggle}
    >
      {name}
    </Button>
    <Collapse isOpen={isOpen}>{children}</Collapse>
  </div>
);
