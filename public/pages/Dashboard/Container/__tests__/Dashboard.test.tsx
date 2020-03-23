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
import { render, wait } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { Provider } from 'react-redux';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import configureStore from '../../../../redux/configureStore';
import { httpClientMock } from '../../../../../test/mocks';
import moment from 'moment';

const renderWithRouter = () => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route render={() => <Dashboard />} />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('Dashboard test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Empty results', () => {
    test('should display empty dashboard when there is no detector', async () => {
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: { ok: true, response: { detectorList: [], totalDetectors: 0 } },
      });
      const { getByText } = renderWithRouter();
      await wait();
      getByText('Create detector first to detect anomalies in your data.');
    });
    // There are some trouble fixing dynamic import will fix this later
    test('should not display empty dashboard if there are detector', async () => {
      const randomDetectors = new Array(40).fill(null).map((_, index) => {
        const hasAnomaly = Math.random() > 0.5;
        return {
          id: `detector_id_${index}`,
          name: `detector_name_${index}`,
          totalAnomalies: hasAnomaly ? Math.floor(Math.random() * 10) : 0,
          lastActiveAnomaly: hasAnomaly ? Date.now() + index : 0,
        };
      });
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            detectorList: randomDetectors.slice(0, 20),
            totalDetectors: randomDetectors.length,
          },
        },
      });
      const { getByText } = renderWithRouter();
      await wait();
      getByText('Page under construction');
    });
  });
});
