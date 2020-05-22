import React from "react";
import {
  Button,
  Classes,
  Dialog,
  Intent,
  Switch,
  ButtonGroup
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import classnames from "classnames";
import appState from "../stores/index";

@observer
class NodeTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sortBy: 'pagerank'
        };
    }

  render() {
    let filteredNodes = this.props.nodes;
    
    filteredNodes.sort((n1, n2) => {
        if (n1[this.state.sortBy] && n2[this.state.sortBy]) {
            return n2[this.state.sortBy] - n1[this.state.sortBy];
        }
        return 0;
    });
    
    return (
            <div className="argo-table-container">
                Sort By:
                <ButtonGroup>
                    <Button onClick={() => {this.setState({sortBy: 'pagerank'})}}>PageRank</Button>
                    <Button onClick={() => {this.setState({sortBy: 'degree'})}}>Degree</Button>
                </ButtonGroup>
                <table className="argo-table-container__table pt-table pt-bordered pt-striped">
                    <thead>
                        <tr>
                            <th><b>Show/Hide</b></th>
                            <th><b>Node ID</b></th>
                            {
                                appState.graph.allPropertiesKeyList.map((it, i) => {
                                    if (it !== 'id') {
                                        return <th key={`${it}-${i}`}>{it}</th>;
                                    }
                                    return null;
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredNodes.map((node) => (
                                <tr key={node.id}>
                                    <td>
                                        <Switch
                                            checked={!node.isHidden}
                                            onChange={() => {
                                                if (node.isHidden) {
                                                    appState.graph.showNodes([node.id]);
                                                } else {
                                                    appState.graph.hideNodes([node.id]);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>{node.id}</td>
                                    {
                                        appState.graph.allPropertiesKeyList.map((it, i) => {
                                            if (it !== 'id') {
                                                return <td key={`${it}-${i}`}>{node[it]}</td>
                                            }
                                        })
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
    );
  }
}

export default NodeTable;