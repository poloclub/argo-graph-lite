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
        {/* Collapsable Option: Color */}
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
            <section>
              <p style={{textAlign:"left"}}>Color By:
                <span style={{float:"right"}}>
                  <SimpleSelect  
                    items={appState.graph.allPropertiesKeyList}
                    onSelect={it => (appState.graph.nodes.colorBy = it)}
                    value={appState.graph.nodes.colorBy}
                  />
                </span>
              </p>
            </section>
           
            <section> 
              <p style={{textAlign:"left"}}>Scale Type:
                <span style={{float:"right"}}>
                  <SimpleSelect
                    items={Object.keys(scales)}
                    onSelect={it => (appState.graph.nodes.color.scale = it)}
                    value={appState.graph.nodes.color.scale}
                  />
                </span>
              </p>
            </section>
           
            <section >
              <p style={{textAlign:"left"}}>Gradient: &nbsp;  
                <span style={{float:"right"}}>
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
                    &nbsp; &#8594; &nbsp;
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
                </span>
              </p>
            </section>
            <section style={{marginTop:"-1em"}}>
              <svg width="100%" height="10" className="gradient-preview">
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
                width="100%"
                height="50"
                fill="url(#theGradient)"
              />
            </svg>
            </section>
          </div>
        </Collapsable>
        
        {/* Collapsable Option: Size */}
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
            <section> 
              <p style={{textAlign:"left"}}>Scale By:
                <span style={{float:"right"}}>
                  <Select
                    items={appState.graph.allPropertiesKeyList}
                    itemRenderer={CommonItemRenderer}
                    filterable={false}
                    onItemSelect={it => (appState.graph.nodes.sizeBy = it)}
                  >
                    <Button text={appState.graph.nodes.sizeBy} />
                  </Select>
                </span>
              </p>
            </section>
            <section> 
              <p style={{textAlign:"left"}}>Scale Type:
                <span style={{float:"right"}}>
                  <Select
                  items={Object.keys(scales)}
                  itemRenderer={CommonItemRenderer}
                  filterable={false}
                  onItemSelect={it => (appState.graph.nodes.size.scale = it)}
                  >
                    <Button text={appState.graph.nodes.size.scale} />
                  </Select>
                </span>
              </p>
            </section>
         
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
        
        {/* Collapsable Option: Shape */}
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
          <section> <p style={{textAlign:"left"}}> Node Shape:
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
                onItemSelect={it => (appState.graph.nodes.shape = it)}
              >
                <Button  text={appState.graph.nodes.shape} />
              </Select>
              </span>
            </p></section>          
          </div>
        </Collapsable>
        <br/>
        <small>
          
          {pluralize("node", appState.graph.overrides.size, true)}<span> </span>
          have override styles.  &nbsp;  
          <Button className={"pt-small"} text="Clear" onClick={() => (appState.graph.overrides = new Map())} />
        </small>
      </div>
    );
  }
}

export default GlobalPanel;