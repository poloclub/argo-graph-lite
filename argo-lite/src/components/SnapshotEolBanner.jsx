import React from "react";
import { Button, Callout, Collapse, Intent } from "@blueprintjs/core";

class SnapshotEolBanner extends React.Component {
  state = {
    isOpen: false,
    dismissed: false
  };

  toggleOpen = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  };

  dismiss = () => {
    this.setState({ dismissed: true });
  };

  render() {
    const { isOpen, dismissed } = this.state;

    if (dismissed) {
      return null;
    }

    return (
      <div className="announcement-banner">
        <Callout
          iconName="warning-sign"
          intent={Intent.WARNING}
          title="Snapshot Publishing and Sharing Feature — End-of-Life Service Notice"
          className="announcement-banner__callout"
          style={{ opacity: 0.9 }}
        >
          <div className="announcement-banner__summary">
            <div className="announcement-banner__lead">
              Snapshot publishing and sharing services will retire after March 31, 2026.
            </div>
            <div className="announcement-banner__actions">
              <Button
                minimal
                small
                iconName={isOpen ? "chevron-up" : "chevron-down"}
                onClick={this.toggleOpen}
              >
                {isOpen ? "Hide details" : "Show details"}
              </Button>
              <Button
                minimal
                small
                iconName="cross"
                onClick={this.dismiss}
                title="Dismiss"
              />
            </div>
          </div>
          <Collapse isOpen={isOpen}>
            <ul className="announcement-banner__list">
              <li>The snapshot publishing and sharing feature for Argo Scholar and Argo Lite will reach end-of-life on March 31, 2026.</li>
              <li>The applications will remain accessible until this date.</li>
              <li>Publishing, saving, or loading shared (server-hosted) snapshots may be unavailable or unreliable during this period.</li>
              <li>After March 31, 2026, backend services supporting snapshot publishing and sharing will be fully shut down. Users will still be able to save and load snapshots locally, but shared or server-hosted snapshots will no longer be supported.</li>
              <li>If you rely on snapshot publishing or sharing for active projects or teaching, please export any important shared snapshots before the end-of-life date.</li>
              <li>For questions or concerns, please contact the Argo maintainers.</li>
            </ul>
          </Collapse>
        </Callout>
      </div>
    );
  }
}

export default SnapshotEolBanner;
