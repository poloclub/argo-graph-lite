import React from "react";
import { observer } from "mobx-react";
import appState from "../../stores";
import { Button, Classes, RangeSlider } from "@blueprintjs/core";
import { SketchPicker } from "react-color";
import { Popover2, Select } from "@blueprintjs/labs";
import classnames from "classnames";
import Collapsable from "../utils/Collapsable";
import SimpleSelect from "../utils/SimpleSelect";
import mouse from "../../graph-frontend/src/select";

@observer
class EdgesPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          timeOutRef: null,
          sizeOptionOpen: false,
          thicknessOptionOpen: false,
        };
      }

    render() {
        let graph = appState.graph.graph;
        return (
            <div>
                <p>{`Modifying All Edges`}</p>


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
                            <p style={{textAlign:"left"}}>Select Edge Color: 
                            <span style={{float:"right"}}>
                                <Popover2 
                                placement="bottom"
                                modifiers={{
                                    preventOverflow: {
                                      enabled: false,
                                    },
                                  }}>
                                    <Button
                                    text="  "
                                    style={{
                                        backgroundImage: "inherit",
                                        backgroundColor: appState.graph.edges.color
                                    }}
                                    />
                                    <SketchPicker
                                    color={appState.graph.edges.color}
                                    onChange={(it) => {
                                        appState.graph.process.graph.forEachNode(n => {
                                             
                                             let red = new THREE.Color(appState.graph.edges.color).r;
                                             let blue = new THREE.Color(appState.graph.edges.color).g;
                                             let green = new THREE.Color(appState.graph.edges.color).b;
                                             n.renderData.linecolor.r = red;
                                             n.renderData.linecolor.g = blue;
                                             n.renderData.linecolor.b = green;
                                           });
                                        (appState.graph.edges.color = it.hex);
                                        /**update edge color in real time*/
                                        appState.graph.process.onHover(); 
                                    }}
                                    />
                                </Popover2>
                            </span>
                            </p>
                        </section>
                    </div>
                </Collapsable>

                {/* Collapsable Option: Thickness */}
                {/* <Collapsable
                    name="Thickness"
                    isOpen={this.state.thicknessOptionOpen}
                    onToggle={() =>
                        this.setState({
                            thicknessOptionOpen: !this.state.thicknessOptionOpen
                        })
                    }
                    >
                    <div className={classnames(Classes.CARD, "sub-option")}>
                        <section>
                            <p>Select Edge Thickness: </p>
                            <div style={{display: "inline", float: "right"}}>
                               
                            </div>
                        </section>
                    </div>
                </Collapsable> */}
            </div>
        );
    }
}

export default EdgesPanel;