import React from "react";
import { Button, Classes, Slider } from "@blueprintjs/core";
import { SketchPicker } from "react-color";
import { Popover2, Select } from "@blueprintjs/labs";
import classnames from "classnames";
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import appState from "../../stores";
import SwitchCollapsable from "../utils/SwitchCollapsable";
import CommonItemRenderer from "../utils/CommonItemRenderer";

@observer
class SelectionPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shapeOptionOpen: false,
      sizeOptionOpen: false,
      colorOptionOpen: false,
      labelOptionOpen: false
    };
  }

  twoLayerUpdate = (nodeId, key, value) => {
    if (!appState.graph.overrides.has(nodeId)) {
      appState.graph.overrides.set(nodeId, new Map());
    }
    const nodeAttrs = appState.graph.overrides.get(nodeId);
    if (value !== null) {
      nodeAttrs.set(key, value);
    } else {
      nodeAttrs.delete(key);
      if (nodeAttrs.size === 0) {
        appState.graph.overrides.delete(nodeId);
      }
    }
  };

  batchTwoLayerUpdate = (nodes, key, value) => {
    runInAction("update entire selection", () => {
      nodes.forEach(n => this.twoLayerUpdate(n.data.ref.id, key, value));
    });
  };

  render() {
    return (
      <div>
        <br/>
        <SwitchCollapsable
          name="Override Size"
          isOpen={this.state.sizeOptionOpen}
          onToggle={() => {
            if (this.state.sizeOptionOpen) {
              this.setState(
                {
                  sizeOptionOpen: false
                },
                () =>
                  this.batchTwoLayerUpdate(
                    appState.graph.selectedNodes,
                    "size",
                    null
                  )
              );
            } else {
              this.setState(
                {
                  sizeOptionOpen: true
                },
                () =>
                  this.batchTwoLayerUpdate(
                    appState.graph.selectedNodes,
                    "size",
                    appState.graph.overrideConfig.size
                  )
              );
            }
          }}
        >
          <div className={classnames(Classes.CARD, "sub-option")}>
            <Slider
              min={1}
              max={20}
              stepSize={0.1}
              labelStepSize={5}
              onChange={it => {
                appState.graph.overrideConfig.size = it;
                this.batchTwoLayerUpdate(
                  appState.graph.selectedNodes,
                  "size",
                  it
                );
              }}
              value={appState.graph.overrideConfig.size}
            />
          </div>
        </SwitchCollapsable>
        <br/>
        <SwitchCollapsable
          name="Override Color"
          isOpen={this.state.colorOptionOpen}
          onToggle={() => {
            if (this.state.colorOptionOpen) {
              this.setState(
                {
                  colorOptionOpen: false
                },
                () =>
                  this.batchTwoLayerUpdate(
                    appState.graph.selectedNodes,
                    "color",
                    null
                  )
              );
            } else {
              this.setState(
                {
                  colorOptionOpen: true
                },
                () =>
                  this.batchTwoLayerUpdate(
                    appState.graph.selectedNodes,
                    "color",
                    appState.graph.overrideConfig.color
                  )
              );
            }
          }}
        >
          <div className={classnames(Classes.CARD, "sub-option")}>
          <section> <p style={{textAlign:"left"}}>
            Choose Color:
            <span style={{float:"right"}}>
            <Popover2>
              <Button
                text="  "
                style={{
                  backgroundImage: "inherit",
                  backgroundColor: appState.graph.overrideConfig.color
                }}
              />
              <SketchPicker
                color={appState.graph.overrideConfig.color}
                onChange={it => {
                  appState.graph.overrideConfig.color = it.hex;
                  this.batchTwoLayerUpdate(
                    appState.graph.selectedNodes,
                    "color",
                    it.hex
                  );
                }}
              />
            </Popover2>
            </span>
            </p>
            </section>
          </div>
        </SwitchCollapsable>
        <br/>
        <SwitchCollapsable
          name="Override Label"
          isOpen={this.state.labelOptionOpen}
          onToggle={() => {
            if (this.state.labelOptionOpen) {
              this.setState(
                {
                  labelOptionOpen: false
                },
                () =>
                  this.batchTwoLayerUpdate(
                    appState.graph.selectedNodes,
                    "label",
                    null
                  )
              );
            } else {
              this.setState(
                {
                  labelOptionOpen: true
                },
                () =>
                  this.batchTwoLayerUpdate(
                    appState.graph.selectedNodes,
                    "label",
                    appState.graph.overrideConfig.label
                  )
              );
            }
          }}
        >
          <div className={classnames(Classes.CARD, "sub-option")}>
            Custom Label:
            <input
              value={appState.graph.overrideConfig.label}
              onChange={it => {
                appState.graph.overrideConfig.label = it.target.value;
                this.batchTwoLayerUpdate(
                  appState.graph.selectedNodes,
                  "label",
                  it.target.value
                );
              }}
            />
          </div>
        </SwitchCollapsable>
        <br/>
        <SwitchCollapsable
          name="Override Shape"
          isOpen={this.state.shapeOptionOpen}
          onToggle={() => {
            if (this.state.shapeOptionOpen) {
              this.setState(
                {
                  shapeOptionOpen: false
                },
                () =>
                  this.batchTwoLayerUpdate(
                    appState.graph.selectedNodes,
                    "shape",
                    null
                  )
              );
            } else {
              this.setState(
                {
                  shapeOptionOpen: true
                },
                () =>
                  this.batchTwoLayerUpdate(
                    appState.graph.selectedNodes,
                    "shape",
                    appState.graph.overrideConfig.shape
                  )
              );
            }
          }}
        >
          <div className={classnames(Classes.CARD, "sub-option")}>
          <section> <p style={{textAlign:"left"}}>
            Node Shape:
            <span style={{float:"right"}}>
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
              onItemSelect={it => {
                appState.graph.overrideConfig.shape = it;
                this.batchTwoLayerUpdate(
                  appState.graph.selectedNodes,
                  "shape",
                  it
                );
              }}
            >
              <Button text={appState.graph.overrideConfig.shape} />
            </Select>
            </span>
            </p>
            </section>
          </div>
        </SwitchCollapsable>
      </div>
    );
  }
}

export default SelectionPanel;