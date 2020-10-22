import React from "react";
import {
    Button,
    Classes,
    Card,
    Icon,
    Dialog,
    Intent,
    Spinner
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import { toaster } from '../notifications/client';
import * as Blueprint from "@blueprintjs/core";
import classnames from "classnames";
import appState from "../stores/index";
import { BACKEND_URL } from "../constants";

const uuidv4 = require('uuid/v4');

@observer
class ShareDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isShared: false,
            isFetching: false,
            sharedURL: 'Error: Sharing failed',
            selectedContinue: false,
        };

        this.handleRequest = this.handleRequest.bind(this);
    }




    async handleRequest(uuid) {
        // return await new Promise(resolve => setTimeout(resolve, 2000));
        const backendURL = `${BACKEND_URL}/snapshots`;
        // TODO: add better error handling
        return await fetch(backendURL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            referrer: 'no-referrer',
            body: JSON.stringify({
                uuid,
                body: window.saveSnapshotToString()
            }),
        }).then(response => response.ok).catch(error => {
            toaster.show({
                message: 'Failed to publish to sharing server. Unexpected error.',
                intent: Intent.DANGER,
                timeout: -1
            });
        });
    }

    render() {



        return (
            <Dialog
                iconName="projects"
                isOpen={appState.preferences.shareDialogOpen}
                onClose={() => {
                    appState.preferences.shareDialogOpen = false;
                    this.setState({
                        ...this.state,
                        selectedContinue: false,
                    });
                }}
                title={`Share Graph Snapshot`}
                style={{ width: !this.state.selectedContinue ? 735 : 580 }}
            >
                <div className={classnames(Classes.DIALOG_BODY)}>
                    {
                        !this.state.selectedContinue && (
                            <div>
                                <p style={{ display: "inline", marginRight: "20px" }}>You can share your snapshot as
                        <b> a public URL</b>, an <b> HTML iframe</b>, or a <b>Jupyter Notebook IFrame</b></p>
                                {
                                    !this.state.selectedContinue && (
                                        <Button
                                            className={classnames({
                                                [Classes.DISABLED]: this.state.isFetching
                                            })}
                                            intent={Intent.PRIMARY}
                                            onClick={async () => {
                                                this.setState({ isFetching: true });
                                                // Generate a random UUID
                                                const uuid = uuidv4();
                                                // Generate URL corresponding to the UUID
                                                const sharedURL = `https://poloclub.github.io/argo-graph-lite/#${uuid}`;

                                                // Wait for backend response
                                                const requestSuccess = await this.handleRequest(uuid);
                                                // Update local state
                                                if (requestSuccess) {
                                                    this.setState({ isFetching: false, isShared: true, sharedURL });
                                                } else {
                                                    // request fails, toast fires
                                                    this.setState({ isFetching: false, isShared: false });
                                                    toaster.show({
                                                        message: 'Failed to publish to sharing server. Please try again later.',
                                                        intent: Intent.DANGER,
                                                        timeout: -1
                                                    });
                                                }
                                                this.setState({
                                                    ...this.state,
                                                    selectedContinue: true,
                                                });
                                            }}
                                            text="Continue"
                                        />
                                    )
                                }
                                <hr />
                                {/**pt-callout pt-intent-primary .modifier */}
                                <div className="pt-callout pt-intent-warning" style={{marginBottom: "20px",}}>
                                    <p className="pt-callout-title">This snapshot is “static”, like taking a photo of your visualization. This means that if your graph is changed in any ways (e.g., move nodes around) after creating a URL and you want to re-share those updates, you will need to create a new URL by selecting <b>Share Again to a new URL</b> in the next window.</p>
                                </div>
                                <div className="pt-callout pt-intent-danger">
                                    <p className="pt-callout-title "><b>IMPORTANT!</b> This will make your graph snapshot public. If you are working with sensitive data (with custom access control), or large data (>400MB), please follow our guide on Github to easily deploy your own sharing server.</p>
                                </div>
                            </div>
                        )
                    }
                    {
                        this.state.isFetching && (
                            <p style={{marginTop: "10px"}}><b>Sharing in progress. Please wait...</b></p>
                        )
                    }
                    {
                        this.state.selectedContinue && (
                            <div>
                                {/** graph URL */}
                        Your current snapshot has been shared to
                                <br />
                                <input
                                    id="snapshot-textarea"
                                    type="textarea"
                                    value={this.state.sharedURL}
                                    readOnly
                                    style={{
                                        width: '400px',
                                        marginTop: "5px"
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        document.getElementById('snapshot-textarea').select();
                                        document.execCommand("copy");
                                    }}
                                    className="copy-to-clipboard"
                                >
                                    Copy to Clipboard
                        </button>
                                <br />
                                <hr />

                                {/** Embedding as HTML iframe */}
                        Embed as an <b>HTML iframe</b>:
                                <br />
                                <input
                                    id="iframe-html-textarea"
                                    type="textarea"
                                    value={`<iframe src="${this.state.sharedURL}" width="850" height="500"></iframe>`}
                                    style={{
                                        width: '400px',
                                        marginTop: "5px"
                                    }}
                                    readOnly
                                />
                                <button
                                    onClick={() => {
                                        document.getElementById('iframe-html-textarea').select();
                                        document.execCommand("copy");
                                    }}
                                    className="copy-to-clipboard"
                                >
                                    Copy to Clipboard
                        </button>
                                <br />
                                <hr />

                                {/** Embedding as Jupyter Notebook IFrame */}
                        Embed as a <b>Jupyter Notebook IFrame</b>:
                                <br />
                                <textarea
                                    id="iframe-jupyter-textarea"
                                    rows="2"
                                    cols="60"
                                    style={{
                                        overflow: "hidden",
                                        marginTop: "5px",
                                        width: "400px",
                                        resize: "none"
                                    }}
                                    readonly="true"
                                    value={`from IPython.display import IFrame` + "\n" + `IFrame("${this.state.sharedURL}", width=700, height=350)`} />
                                <button
                                    onClick={() => {
                                        document.getElementById('iframe-jupyter-textarea').select();
                                        document.execCommand("copy");
                                    }}
                                    className="copy-to-clipboard"
                                    style={{
                                        position: "absolute",
                                        marginTop: "20px",
                                    }}
                                >
                                    Copy to Clipboard
                        </button>
                            </div>
                        )
                    }
                </div>

                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        {
                            this.state.selectedContinue && (


                                <Button
                                    className={classnames({
                                        [Classes.DISABLED]: this.state.isFetching
                                    })}
                                    intent={Intent.PRIMARY}
                                    onClick={async () => {
                                        this.setState({ isFetching: true, isShared: false });
                                        // Generate a random UUID
                                        const uuid = uuidv4();
                                        // Generate URL corresponding to the UUID
                                        const sharedURL = `https://poloclub.github.io/argo-graph-lite/#${uuid}`;

                                        // Wait for backend response
                                        const requestSuccess = await this.handleRequest(uuid);
                                        // Update local state
                                        if (requestSuccess) {
                                            this.setState({ isFetching: false, isShared: true, sharedURL });
                                        } else {
                                            // request fails, toast fires
                                            this.setState({ isFetching: false, isShared: false });
                                            toaster.show({
                                                message: 'Failed to publish to sharing server. Please try again later.',
                                                intent: Intent.DANGER,
                                                timeout: -1
                                            });
                                        }

                                    }}
                                    text="Share Snapshot as New URL"
                                />
                            )
                        }

                    </div>
                </div>


                <style dangerouslySetInnerHTML={{
                    __html:
                        `
                    .copy-to-clipboard{
                        margin-top: 5px;
                        margin-left: 5px;
                        border-style: solid;
                    }
                    
            `}} />
            </Dialog>
        );
    }
}

export default ShareDialog;