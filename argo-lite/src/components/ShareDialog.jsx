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
      sharedURL: 'Error: Sharing failed'
    };

    this.handleRequest = this.handleRequest.bind(this);
  }

  async handleRequest(uuid) {
    // return await new Promise(resolve => setTimeout(resolve, 2000));
    const backendURL = `${BACKEND_URL}/snapshot`;
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
            body: 'Test'
        }),
    });
  }

  render() {
    return (
        <Dialog
            iconName="projects"
            isOpen={appState.preferences.shareDialogOpen}
            onClose={() => {
            appState.preferences.shareDialogOpen = false;
            }}
            title={`Share Graph`}
        >
            <div className={classnames(Classes.DIALOG_BODY)}>
            {
                !this.state.isShared && (
                    <p>You can share the current state of your graph to a public URL that you can share with your friends! (*this will make your graph public)</p>
                )
            }
            {
                this.state.isFetching && (
                    <p><b>Sharing in progress. Please wait...</b></p>
                )
            }
            {
                this.state.isShared && (
                    <div>
                        Your graph has been shared to <code>{this.state.sharedURL}</code>
                    </div>
                )
            }
            </div>

            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button
                    className={classnames({
                        [Classes.DISABLED]: this.state.isFetching || this.state.isShared
                    })}
                    intent={Intent.PRIMARY}
                    onClick={async () => {
                        this.setState({ isFetching: true })
                        // Generate a random UUID
                        const uuid = uuidv4();
                        // Generate URL corresponding to the UUID
                        const sharedURL = `https://poloclub.github.io/argo-graph-lite/#${uuid}`;

                        // Wait for backend response
                        await this.handleRequest(uuid);
                        // Update local state
                        this.setState({ isFetching: false, isShared: true, sharedURL });
                    }}
                    text="Share"
                    />
                </div>
            </div>
        </Dialog>
    );
  }
}

export default ShareDialog;