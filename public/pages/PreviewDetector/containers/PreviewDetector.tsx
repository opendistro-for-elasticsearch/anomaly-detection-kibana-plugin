/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { useState, useEffect } from 'react';
import {
  EuiTabs,
  EuiTab,
  EuiFlexGroup,
  EuiFlexItem,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
} from '@elastic/eui';
import { get } from 'lodash';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import { ModelDefinition } from './ModelDefinition';
import { useFetchDetectorInfo } from '../../createDetector/hooks/useFetchDetectorInfo';
//@ts-ignore
import chrome from 'ui/chrome';
import { darkModeEnabled } from '../../../utils/kibanaUtils';
import { AnomaliesList } from '../../DetectorResults/List/List';

interface FeaturesRouterProps {
  detectorId?: string;
}
interface FeaturesProps extends RouteComponentProps<FeaturesRouterProps> {}

const tabs = [
  {
    id: 'definitions',
    name: 'Model definitions',
    route: 'definitions',
  },
  {
    id: 'results',
    name: 'Anomalies',
    route: 'results',
  },
];

const getSelectedTabId = (pathname: string) => {
  if (pathname.includes('results')) return 'results';
  return 'definitions';
};

export const PreviewDetector = (props: FeaturesProps) => {
  const [selectedTab, setSelectedTab] = useState(
    getSelectedTabId(props.location.pathname)
  );
  const detectorId = get(props, 'match.params.detectorId', '');
  const { detector, hasError } = useFetchDetectorInfo(detectorId);
  const isDark = darkModeEnabled();

  useEffect(
    () => {
      if (hasError) {
        props.history.push('/detectors');
      }
    },
    [hasError]
  );

  const handleTabChange = (route: string) => {
    setSelectedTab(route);
    props.history.push(route);
  };
  const lightStyles = {
    backgroundColor: '#FFF',
  };
  return (
    <React.Fragment>
      <EuiFlexGroup
        direction="column"
        style={
          isDark ? { flexGrow: 'unset' } : { ...lightStyles, flexGrow: 'unset' }
        }
      >
        <EuiFlexItem grow={false} style={{ marginBottom: 0 }}>
          <EuiDescriptionList style={{ padding: '10px 20px' }}>
            <EuiDescriptionListTitle>
              <h2>{detector && detector.name} </h2>
            </EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              Anomaly detection takes features and output anomalies. Learn more
            </EuiDescriptionListDescription>
          </EuiDescriptionList>
        </EuiFlexItem>
        <EuiFlexItem style={{ marginTop: 0 }}>
          <EuiTabs className={isDark ? '' : 'feature-class'}>
            {tabs.map(tab => (
              <EuiTab
                onClick={() => {
                  handleTabChange(tab.route);
                }}
                isSelected={tab.id === selectedTab}
                key={tab.id}
              >
                {tab.name}
              </EuiTab>
            ))}
          </EuiTabs>
        </EuiFlexItem>
      </EuiFlexGroup>
      <Switch>
        <Route
          exact
          path="/detectors/:detectorId/features/definitions"
          render={props => (
            <ModelDefinition
              {...props}
              detectorId={detectorId}
              detector={detector}
            />
          )}
        />
        <Route
          exact
          path="/detectors/:detectorId/features/results"
          render={props => (
            <AnomaliesList
              {...props}
              detectorId={detectorId}
              detector={detector}
            />
          )}
        />
        <Redirect to="/detectors/:detectorId/features/definitions" />
      </Switch>
    </React.Fragment>
  );
};
