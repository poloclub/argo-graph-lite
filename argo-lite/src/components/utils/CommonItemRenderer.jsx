import React from "react";
import { Classes, MenuItem } from "@blueprintjs/core";

export default ({ handleClick, item, isActive }) => (
  <MenuItem
    className={isActive ? Classes.ACTIVE : ""}
    key={item}
    onClick={handleClick}
    text={item}
  />
);
