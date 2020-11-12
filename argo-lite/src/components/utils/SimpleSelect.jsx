import React from "react";
import { Button, Classes } from "@blueprintjs/core";
import { Select } from "@blueprintjs/labs";
import CommonItemRenderer from "./CommonItemRenderer";

export default ({ items, onSelect, value, fill = false }) => (
  <Select
    items={items}
    itemRenderer={CommonItemRenderer}
    filterable={false}
    onItemSelect={onSelect}
  >
    <Button iconName="filter-list" className={fill ? Classes.FILL : null} text={value} />
  </Select>
);
