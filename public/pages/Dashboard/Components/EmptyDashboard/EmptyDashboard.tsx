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
  EuiEmptyPrompt,
  EuiLink,
  EuiIcon,
  EuiPage,
  EuiTitle,
  EuiPageSideBar,
  EuiPageBody,
  EuiPageHeader,
  EuiSideNav,
} from '@elastic/eui';
import React, { Component, Fragment } from 'react';
import { APP_PATH, PLUGIN_NAME } from '../../../../utils/constants';

type EmptyDashboardState = {
  selectedItemName: string;
};

export class EmptyDashboard extends Component<{}, EmptyDashboardState> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedItemName: 'Lion stuff',
    };
  }

  selectItem = (name: string) => {
    this.setState({
      selectedItemName: name,
    });
  };

  createItem = (name: string, id: number, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      ...data,
      id: name,
      name,
      isSelected: this.state.selectedItemName === name,
      onClick: () => this.selectItem(name),
    };
  };

  render() {
    const sideNav = [
      {
        name: 'Anomaly detection',
        id: 0,
        items: [
          this.createItem('Dashboard', 1, { href: `#${APP_PATH.DASHBOARD}` }),
          this.createItem('Detectors', 2, {
            href: `#${APP_PATH.LIST_DETECTORS}`,
          }),
        ],
      },
    ];

    return (
      <EuiPage style={{ flex: 1 }}>
        <EuiPageSideBar
          style={{
            flex: 1,
            backgroundColor: '#F5F7FA',
          }}
        >
          <EuiSideNav style={{ width: 150 }} items={sideNav} />
        </EuiPageSideBar>
        <EuiPageBody>
          <EuiPageHeader>
            <EuiTitle size="l">
              <h1>Dashboard</h1>
            </EuiTitle>
          </EuiPageHeader>
          <EuiEmptyPrompt
            title={<h2>You have no detectors</h2>}
            // style={{ maxWidth: '45em' }}
            body={
              <Fragment>
                <p>Create detector first to detect anomalies in your data.</p>
                <p>
                  Dashboard will generate insights on the anomalies across all
                  of your detectors
                </p>
                <p>
                  Read about{' '}
                  <EuiLink
                    href="https://github.com/opendistro-for-elasticsearch/anomaly-detection"
                    target="_blank"
                  >
                    Get started with Anomaly detection &nbsp;
                    <EuiIcon size="s" type="popout" />
                  </EuiLink>{' '}
                </p>
              </Fragment>
            }
            actions={
              <EuiButton
                fill
                href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}
                data-test-subj="add_detector"
              >
                Create detector
              </EuiButton>
            }
          />
        </EuiPageBody>
      </EuiPage>
    );
  }
}
