import React from "react";
import { observer } from "mobx-react";
import appState from "../../stores";
import GlobalPanel from "./GlobalPanel";
import SelectionPanel from "./SelectionPanel";
import { Button, Classes, RangeSlider } from "@blueprintjs/core";
import { SketchPicker } from "react-color";
import { Popover2, Select } from "@blueprintjs/labs";
import classnames from "classnames";
import { scales } from "../../constants/index";
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
                            <p style={{display: "inline"}}>Select Edge Color: </p>
                            <div style={{display: "inline", float: "right"}}>
                                <Popover2>
                                    <Button
                                    text="  "
                                    style={{
                                        backgroundImage: "inherit",
                                        backgroundColor: appState.graph.edges.color
                                    }}
                                    />
                                    <SketchPicker
                                    color={appState.graph.edges.color}
                                    onChange={it => {
                                        (appState.graph.edges.color = it.hex)
                                    }}
                                    />
                                </Popover2>
                            </div>
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