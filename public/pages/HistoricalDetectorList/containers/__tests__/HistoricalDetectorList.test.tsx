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

import { render, wait } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { httpClientMock, coreServicesMock } from '../../../../../test/mocks';
import configureStore from '../../../../redux/configureStore';
import {
  Detectors,
  initialDetectorsState,
} from '../../../../redux/reducers/ad';
import {
  HistoricalDetectorList,
  HistoricalDetectorListRouterParams,
} from '../HistoricalDetectorList';
import { DETECTOR_STATE } from '../../../../../server/utils/constants';
import { CoreServicesContext } from '../../../../components/CoreServices/CoreServices';

const EMPTY_MESSAGE_TEXT =
  'Use historical detectors to detect anomalies on a selected time range of your historical data.';

const renderWithRouter = (
  initialAdState: Detectors = initialDetectorsState
) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            exact
            path="/historical-detectors"
            render={(
              props: RouteComponentProps<HistoricalDetectorListRouterParams>
            ) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <HistoricalDetectorList {...props} />
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to="/historical-detectors" />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('<HistoricalDetectorList /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Empty results', () => {
    test('renders in loading state if detectors are being fetched', async () => {
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: { detectorList: [], totalDetectors: 0 },
      });
      const { getByText } = renderWithRouter({
        ...initialDetectorsState,
        requesting: true,
      });
      getByText('Loading historical detectors...');
    });
    test('should display empty message when list is empty', async () => {
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: { detectorList: [], totalDetectors: 0 },
      });
      const { getByText } = renderWithRouter({
        ...initialDetectorsState,
        requesting: true,
      });
      await wait();
      getByText(EMPTY_MESSAGE_TEXT);
    });
  });
  describe('Populated results', () => {
    test('pagination functionality', async () => {
      const randomDetectors = new Array(40).fill(null).map((_, index) => {
        const hasAnomaly = Math.random() > 0.5;
        return {
          id: `detector_id_${index}`,
          name: `detector_name_${index}`,
          indices: [`index_${index}`],
          totalAnomalies: hasAnomaly ? Math.floor(Math.random() * 10) : 0,
          dataStartTime: 0,
          dataEndTime: 10,
        };
      });
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
        },
      });

      const { getByText, getAllByTestId, queryByText } = renderWithRouter({
        ...initialDetectorsState,
        requesting: true,
      });
      // Default view 20 items per page
      await wait(() => getByText('detector_name_0'));
      getByText('index_0');
      expect(queryByText('detector_name_30')).toBeNull();
      expect(queryByText('index_30')).toBeNull();

      // Navigate to next page
      userEvent.click(getAllByTestId('pagination-button-next')[0]);
      await wait();
      getByText('detector_name_30');
      getByText('index_30');
      expect(queryByText('detector_name_0')).toBeNull();
      expect(queryByText('index_0')).toBeNull();

      // Navigate to previous page
      userEvent.click(getAllByTestId('pagination-button-previous')[0]);
      await wait();
      getByText('detector_name_0');
      expect(queryByText('detector_name_30')).toBeNull();
    });
    test('sorting functionality', async () => {
      const randomDetectors = new Array(40).fill(null).map((_, index) => {
        return {
          id: `detector_id_${index}`,
          name: `detector_name_${index}`,
          indices: [`index_${index}`],
          curState: DETECTOR_STATE.DISABLED,
          featureAttributes: [`feature_${index}`],
          totalAnomalies: index,
          dataStartTime: 0,
          dataEndTime: 5,
        };
      });

      // Set the first detector to be in a running state
      randomDetectors[0].curState = DETECTOR_STATE.RUNNING;

      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
        },
      });

      const { getByText, getAllByTestId, queryByText } = renderWithRouter({
        ...initialDetectorsState,
        requesting: true,
      });
      // Default view 20 items per page
      await wait();
      getByText('detector_name_0');
      expect(queryByText('detector_name_30')).toBeNull();

      // Sort by name (string sorting)
      userEvent.click(getAllByTestId('tableHeaderSortButton')[0]);
      await wait();
      getByText('detector_name_30');
      expect(queryByText('detector_name_0')).toBeNull();

      // Sort by indices (string sorting)
      userEvent.click(getAllByTestId('tableHeaderSortButton')[2]);
      await wait();
      getByText('index_0');
      expect(queryByText('index_30')).toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[2]);
      await wait();
      getByText('index_30');
      expect(queryByText('index_0')).toBeNull();
    }, 20000);
    test('should be able to search', async () => {
      const randomDetectors = new Array(40).fill(null).map((_, index) => {
        const hasAnomaly = Math.random() > 0.5;
        return {
          id: `detector_id_${index}`,
          indices: [`index_${index}`],
          name: `detector_name_${index}`,
          totalAnomalies: hasAnomaly ? Math.floor(Math.random() * 10) : 0,
          dataStartTime: 0,
          dataEndTime: 5,
        };
      });
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
        },
      });

      const { getByText, getByPlaceholderText, queryByText } = renderWithRouter(
        {
          ...initialDetectorsState,
          requesting: true,
        }
      );
      // Initial load, only first 20 items
      await wait(() => getByText('detector_name_0'));
      getByText('index_0');
      expect(queryByText('detector_name_38')).toBeNull();
      expect(queryByText('index_38')).toBeNull();

      //Input search event
      userEvent.type(getByPlaceholderText('Search'), 'detector_name_38');
      await wait();
      getByText('detector_name_38');
      getByText('index_38');
      expect(queryByText('detector_name_39')).toBeNull();
      expect(queryByText('index_39')).toBeNull();
      expect(queryByText('detector_name_0')).toBeNull();
      expect(queryByText('index_0')).toBeNull();
    });
    test('should reset to first page when filtering', async () => {
      const randomDetectors = new Array(40).fill(null).map((_, index) => {
        const hasAnomaly = Math.random() > 0.5;
        return {
          id: `detector_id_${index}`,
          indices: [`index_${index}`],
          name: `detector_name_${index}`,
          totalAnomalies: hasAnomaly ? Math.floor(Math.random() * 10) : 0,
          dataStartTime: 0,
          dataEndTime: 5,
        };
      });
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
        },
      });

      const {
        getByText,
        getByPlaceholderText,
        queryByText,
        getAllByTestId,
      } = renderWithRouter({
        ...initialDetectorsState,
        requesting: true,
      });
      // Initial load, only first 20 items
      await wait();
      getByText('detector_name_0');

      // Go to next page
      userEvent.click(getAllByTestId('pagination-button-next')[0]);
      await wait();

      // Search for detector which is on prev page
      userEvent.type(getByPlaceholderText('Search'), 'detector_name_0');
      await wait();
      getByText('detector_name_0');
      expect(queryByText('detector_name_30')).toBeNull();
    });
  });
});
