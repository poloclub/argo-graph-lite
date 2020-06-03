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
import SimpleSelect from "./utils/SimpleSelect";

@observer
class NodeTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sortBy: 'pagerank',
            sortOrder: 'descending', // or 'ascending'
        };
    }

  render() {
    let filteredNodes = this.props.nodes;
    
    filteredNodes.sort((n1, n2) => {
        const n1val = n1[this.state.sortBy];
        const n2val = n2[this.state.sortBy];
        if (n1val && n2val) {
            // Check if these are numerical fields, if so sort by number.
            const n1valAsNum = Number(n1val);
            const n2valAsNum = Number(n2val);
            if (!Number.isNaN(n1valAsNum) && !Number.isNaN(n2valAsNum)) {
                // both values are numeric, compare by their value.
                if (this.state.sortOrder === 'descending') {
                    return n2valAsNum - n1valAsNum;
                }
                return n1valAsNum - n2valAsNum;
            } else {
                // not all values are numeric, sort by string order.
                const n1valAsString = n1val.toString();
                const n2valAsString = n2val.toString();
                return (this.state.sortOrder === 'descending' ? -1 : 1) * n1valAsString.localeCompare(n2valAsString);
            }
        }
        return 0;
    });

    const nodeAttributesOrig = appState.graph.allPropertiesKeyList.filter((k) => k !== 'pagerank' && k !== 'degree');
    
    return (
            <div className="argo-table-container">
                Sort By {' '}
                <SimpleSelect
                    items={['pagerank', 'degree', ...nodeAttributesOrig]}
                    value={this.state.sortBy}
                    onSelect={(selected) => {
                        this.setState({sortBy: selected});
                    }}
                />
                <SimpleSelect
                    items={['descending', 'ascending']}
                    value={this.state.sortOrder}
                    onSelect={(selected) => {
                        this.setState({sortOrder: selected});
                    }}
                />
                <table className="argo-table-container__table pt-table pt-bordered pt-striped">
                    <thead>
                        <tr>
                            <th><b>Show</b></th>
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