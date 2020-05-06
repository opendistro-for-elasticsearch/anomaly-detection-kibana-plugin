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

import React from 'react';
import { render } from '@testing-library/react';
import { DetectorDetail, DetectorRouterProps } from '../DetectorDetail';
import { Provider } from 'react-redux';
import {
  HashRouter as Router,
  RouteComponentProps,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
// @ts-ignore
import configureStore from '../../../../redux/configureStore';
import { httpClientMock } from '../../../../../test/mocks';
jest.mock('../../hooks/useFetchMonitorInfo');
jest.mock('../../../createDetector/hooks/useFetchDetectorInfo');

const detectorId = '4QY4YHEB5W9C7vlb3Mou';

const renderWithRouter = (detectorId: string) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            path={`/detectors/${detectorId}/results`}
            render={(props: RouteComponentProps<DetectorRouterProps>) => {
              const testProps = {
                ...props,
                match: {
                  params: { detectorId: detectorId },
                  isExact: false,
                  path: '',
                  url: '',
                },
              };
              return <DetectorDetail {...testProps} />;
            }}
          />
          <Redirect from="/" to={`/detectors/${detectorId}/results`} />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('<DetectorDetail /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('detector detail', () => {
    test.skip('renders detector detail component', () => {
      const { container } = renderWithRouter(detectorId);
      expect(container).toMatchSnapshot();
    });
  });
});
