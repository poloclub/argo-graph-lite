import React from "react";
import { Button, Classes, RangeSlider } from "@blueprintjs/core";
import { SketchPicker } from "react-color";
import { Popover2, Select } from "@blueprintjs/labs";
import classnames from "classnames";
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import pluralize from "pluralize";
import appState from "../../stores";
import { scales } from "../../constants/index";
import Collapsable from "../utils/Collapsable";
import SimpleSelect from "../utils/SimpleSelect";
import CommonItemRenderer from "../utils/CommonItemRenderer";

@observer
class GlobalPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeOutRef: null,
      sizeOptionOpen: false,
      colorOptionOpen: false,
      shapeOptionOpen: false
    };
  }

  render() {
    return (
      <div>
        <Collapsable
          name="Color"
          isOpen={this.state.colorOptionOpen}
          onToggle={() =>
            this.setState({
              colorOptionOpen: !this.state.colorOptionOpen
            })
          }
        >
          <div className={classnames(Classes.CARD, "sub-option")}>
            Color by: {'      '}
            
            <SimpleSelect
              items={appState.graph.allPropertiesKeyList}
              onSelect={it => (appState.graph.nodes.colorBy = it)}
              value={appState.graph.nodes.colorBy}
            />
            <br />
            <br/>
            With scale: {'      '}
            <SimpleSelect
              items={Object.keys(scales)}
              onSelect={it => (appState.graph.nodes.color.scale = it)}
              value={appState.graph.nodes.color.scale}
            />
            <br />
            <br />
            Using Gradient from {'      '}
            <Popover2>
              <Button
                text="  "
                style={{
                  backgroundImage: "inherit",
                  backgroundColor: appState.graph.nodes.color.from
                }}
              />
              <SketchPicker
                color={appState.graph.nodes.color.from}
                onChange={it => (appState.graph.nodes.color.from = it.hex)}
              />
            </Popover2>
            {'   '} to {'   '}
            <Popover2>
              <Button
                text="  "
                style={{
                  backgroundImage: "inherit",
                  backgroundColor: appState.graph.nodes.color.to
                }}
              />
              <SketchPicker
                color={appState.graph.nodes.color.to}
                onChange={it => (appState.graph.nodes.color.to = it.hex)}
              />
            </Popover2>
            <svg width="220" height="30" className="gradient-preview">
              <defs>
                <linearGradient
                  x1="0%"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                  id="theGradient"
                >
                  <stop
                    stopColor={appState.graph.nodes.color.from}
                    stopOpacity="1"
                    offset="0%"
                  />
                  <stop
                    stopColor={appState.graph.nodes.color.to}
                    stopOpacity="1"
                    offset="100%"
                  />
                </linearGradient>
              </defs>
              <rect
                x="0"
                y="0"
                width="220"
                height="50"
                fill="url(#theGradient)"
              />
            </svg>
          </div>
        </Collapsable>

        <Collapsable
          name="Size"
          isOpen={this.state.sizeOptionOpen}
          onToggle={() =>
            this.setState({
              sizeOptionOpen: !this.state.sizeOptionOpen
            })
          }
        >
          <div className={classnames(Classes.CARD, "sub-option")}>
            Scale by:{'      '}
            <Select
              items={appState.graph.allPropertiesKeyList}
              itemRenderer={CommonItemRenderer}
              filterable={false}
              onItemSelect={it => (appState.graph.nodes.sizeBy = it)}
            >
              <Button text={appState.graph.nodes.sizeBy} />
            </Select>
            <br />
            <br/>
            With scale: {'      '}
            <Select
              items={Object.keys(scales)}
              itemRenderer={CommonItemRenderer}
              filterable={false}
              onItemSelect={it => (appState.graph.nodes.size.scale = it)}
            >
              <Button text={appState.graph.nodes.size.scale} />
            </Select>
            <br />
            <br/>
            Size Range:
            <br />
            <RangeSlider
              min={1}
              max={20}
              stepSize={0.1}
              labelStepSize={5}
              onChange={([a, b]) => {
                runInAction("update scale", () => {
                  appState.graph.nodes.size.min = a;
                  appState.graph.nodes.size.max = b;
                });
              }}
              value={[
                appState.graph.nodes.size.min,
                appState.graph.nodes.size.max
              ]}
            />
          </div>
        </Collapsable>

        <Collapsable
          name="Shape"
          isOpen={this.state.shapeOptionOpen}
          onToggle={() =>
            this.setState({
              shapeOptionOpen: !this.state.shapeOptionOpen
            })
          }
        >
          <div className={classnames(Classes.CARD, "sub-option")}>
            Node Shape: {'      '}
            <Select
              items={[
                "circle",
                "square",
                "triangle",
                "pentagon",
                "hexagon",
                "octagon"
              ]}
              itemRenderer={CommonItemRenderer}
              filterable={false}
              onItemSelect={it => (appState.graph.nodes.shape = it)}
            >
              <Button text={appState.graph.nodes.shape} />
            </Select>
          </div>
        </Collapsable>
        <small>
          <br/>
          {pluralize("node", appState.graph.overrides.size, true)}<span> </span>
          have override styles.
          <a onClick={() => (appState.graph.overrides = new Map())}>{'      '} Clear.</a>
        </small>
      </div>
    );
  }
}

export default GlobalPanel;