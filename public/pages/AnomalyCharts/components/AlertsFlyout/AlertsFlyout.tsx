/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiText,
  EuiLink,
  EuiSteps,
} from '@elastic/eui';
import React from 'react';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import { EuiIcon } from '@elastic/eui';
import { Monitor } from '../../../../models/interfaces';
import { AlertsButton } from '../AlertsButton/AlertsButton';

type AlertsFlyoutProps = {
  detectorId: string;
  detectorName: string;
  detectorInterval: number;
  unit: string;
  monitor?: Monitor;
  onClose(): void;
};

const alertSteps = [
  {
    title: 'Create a monitor',
    children: (
      <p className="alerts_flyout_p">
        A monitor queries a detector on a specific schedule. In Alerting, choose
        "Define using anomaly detector".
      </p>
    ),
  },
  {
    title: 'Define triggers and actions',
    children: (
      <p className="alerts_flyout_p">
        Triggers specify the thresholds for anomalies to generate alerts.
        Actions specify the alert message and destination.
      </p>
    ),
  },
  {
    title: 'View alerts from detector and monitor',
    children: (
      <p className="alerts_flyout_p">
        View anomaly detector alerts on the anomaly history graph. See details
        of all alerts over time from the monitor.
      </p>
    ),
  },
];

export const AlertsFlyout = (props: AlertsFlyoutProps) => {
  return (
    <EuiFlyout size="s" onClose={props.onClose}>
      <EuiFlyoutHeader hasBorder className="flyout">
        <EuiText className="preview-title" grow={false}>
          <h2> Alerts </h2>
        </EuiText>
      </EuiFlyoutHeader>
      <EuiFlyoutBody
        // @ts-ignore
        style={{ overflowY: 'auto' }}
      >
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiText>
              <p className="alerts_flyout_p">
                Anomaly detector alerts are powered by the
                <EuiLink href="https://opendistro.github.io/for-elasticsearch-docs/docs/alerting">
                  {' '}
                  Alerting plugin
                </EuiLink>
                . If you don't see <EuiIcon type="bell" />
                Alerting in your navigation panel,
                <EuiLink href="https://opendistro.github.io/for-elasticsearch-docs/docs/install/plugins/#alerting">
                  {' '}
                  install it first
                </EuiLink>{' '}
                and follow the instructions below to set up alerts.
              </p>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSteps steps={alertSteps} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={true}>
            <EuiButton
              href={
                'https://opendistro.github.io/for-elasticsearch-docs/docs/alerting'
              }
              target="_blank"
              data-test-subj="setUpAlerts"
            >
              Explore Alerting <EuiIcon size="s" type="popout" />
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={true}>
            <AlertsButton
              monitor={props.monitor}
              detectorId={props.detectorId}
              detectorName={props.detectorName}
              detectorInterval={props.detectorInterval}
              unit={props.unit}
              fill
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
