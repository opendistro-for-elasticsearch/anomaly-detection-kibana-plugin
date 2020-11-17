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
import { SampleData } from '../SampleData';
import { Provider } from 'react-redux';
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { httpClientMock, coreServicesMock } from '../../../../../../test/mocks';
import configureStore from '../../../../../redux/configureStore';
import {
  Detectors,
  initialDetectorsState,
} from '../../../../../redux/reducers/ad';
import { sampleHttpResponses } from '../../../utils/constants';
import { CoreServicesContext } from '../../../../../components/CoreServices/CoreServices';

const renderWithRouter = (
  initialAdState: Detectors = initialDetectorsState
) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            exact
            path="/sample-detectors"
            render={() => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <SampleData />{' '}
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to="/sample-detectors" />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('<SampleData /> spec', () => {
  jest.clearAllMocks();
  describe('No sample detectors created', () => {
    test('renders component', async () => {
      httpClientMock.get = jest
        .fn()
        .mockResolvedValue({
          ok: true,
          response: { detectorList: [], totalDetectors: 0 },
        });
      const { container, getByText, queryByText } = renderWithRouter();
      expect(container).toMatchSnapshot();
      getByText('Sample detectors');
      getByText('Monitor HTTP responses');
      getByText('Monitor eCommerce orders');
      getByText('Monitor host health');
      expect(queryByText('INSTALLED')).toBeNull();
      expect(queryByText('Detector created')).toBeNull();
      expect(queryByText('View detector and sample data')).toBeNull();
    });
  });

  describe('Some detectors created', () => {
    jest.clearAllMocks();
    test('renders component with sample detector', async () => {
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: [
            {
              id: 'sample-detector-id',
              name: sampleHttpResponses.detectorName,
              indices: sampleHttpResponses.indexName,
              totalAnomalies: 0,
              lastActiveAnomaly: 0,
            },
          ],
          totalDetectors: 1,
        },
      });
      const { container, getByText, getAllByText } = renderWithRouter();
      await wait();
      expect(container).toMatchSnapshot();
      getByText('Sample detectors');
      getByText('Monitor HTTP responses');
      getByText('Monitor eCommerce orders');
      getByText('Monitor host health');
      expect(getAllByText('Detector created')).toHaveLength(1);
      expect(getAllByText('View detector and sample data')).toHaveLength(1);
      expect(getAllByText('INSTALLED')).toHaveLength(1);
    });
    test('renders component with non-sample detector', async () => {
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: [
            {
              id: 'non-sample-detector-id',
              name: 'non-sample-detector',
              indices: 'non-sample-index',
              totalAnomalies: 0,
              lastActiveAnomaly: 0,
            },
          ],
          totalDetectors: 1,
        },
      });
      const { container, getByText, queryByText } = renderWithRouter();
      await wait();
      expect(container).toMatchSnapshot();
      getByText('Sample detectors');
      getByText('Monitor HTTP responses');
      getByText('Monitor eCommerce orders');
      getByText('Monitor host health');
      expect(queryByText('INSTALLED')).toBeNull();
      expect(queryByText('Detector created')).toBeNull();
    });
  });
});
