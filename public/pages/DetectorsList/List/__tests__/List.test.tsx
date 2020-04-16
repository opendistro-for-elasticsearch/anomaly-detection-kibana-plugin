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

import { render, wait } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import { Provider } from 'react-redux';
import {
  MemoryRouter as Router,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { httpClientMock } from '../../../../../test/mocks';
import configureStore from '../../../../redux/configureStore';
import {
  Detectors,
  initialDetectorsState,
} from '../../../../redux/reducers/ad';
import { DetectorList, ListRouterParams } from '../List';
import { DETECTOR_STATE } from '../../../../utils/constants';

const renderWithRouter = (
  initialAdState: Detectors = initialDetectorsState
) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            exact
            path="/detectors"
            render={(props: RouteComponentProps<ListRouterParams>) => (
              <DetectorList {...props} />
            )}
          />
          <Redirect from="/" to="/detectors" />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('<ListControls /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Empty results', () => {
    test('renders in loading state if detectors are being fetched', async () => {
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: { ok: true, response: { detectorList: [], totalDetectors: 0 } },
      });
      const { getByText } = renderWithRouter({
        ...initialDetectorsState,
        requesting: true,
      });
      getByText('Loading detectors...');
    });
    test('should display empty message when list is empty', async () => {
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: { ok: true, response: { detectorList: [], totalDetectors: 0 } },
      });
      const { getByText } = renderWithRouter({
        ...initialDetectorsState,
        requesting: true,
      });
      await wait();
      getByText(
        'Anomaly detectors take an input of information and discover patterns of anomalies. Create an anomaly detector to get started.'
      );
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
          lastActiveAnomaly: hasAnomaly ? Date.now() + index : 0,
        };
      });
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            detectorList: randomDetectors,
            totalDetectors: randomDetectors.length,
          },
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
          totalAnomalies: index,
          lastActiveAnomaly: moment('2020-04-15T09:00:00')
            .add(index, 'minutes')
            .valueOf(),
          lastUpdateTime: moment('2020-04-15T07:00:00')
            .add(index, 'minutes')
            .valueOf(),
        };
      });

      // Set the first detector to be in a running state
      randomDetectors[0].curState = DETECTOR_STATE.RUNNING;

      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            detectorList: randomDetectors,
            totalDetectors: randomDetectors.length,
          },
        },
      });

      const {
        getByText,
        getAllByTestId,
        queryByText,
        getAllByText,
      } = renderWithRouter({
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
      userEvent.click(getAllByTestId('tableHeaderSortButton')[1]);
      await wait();
      getByText('index_0');
      expect(queryByText('index_30')).toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[1]);
      await wait();
      getByText('index_30');
      expect(queryByText('index_0')).toBeNull();

      // Sort by detector state (enum sorting)
      userEvent.click(getAllByTestId('tableHeaderSortButton')[2]);
      await wait();
      getAllByText(DETECTOR_STATE.DISABLED);
      expect(queryByText(DETECTOR_STATE.RUNNING)).toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[2]);
      await wait();
      expect(queryByText(DETECTOR_STATE.RUNNING)).not.toBeNull();

      // Sort by totalAnomalies (numeric sorting)
      userEvent.click(getAllByTestId('tableHeaderSortButton')[3]);
      await wait();
      getByText('0');
      getByText('19');
      expect(queryByText('30')).toBeNull();
      expect(queryByText('39')).toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[3]);
      await wait();
      getByText('30');
      getByText('39');
      expect(queryByText('0')).toBeNull();
      expect(queryByText('19')).toBeNull();

      // Sort by last anomaly occurrence (date sorting)
      userEvent.click(getAllByTestId('tableHeaderSortButton')[4]);
      await wait();
      getByText('04/15/2020 9:00 am');
      expect(queryByText('04/15/2020 9:30 am')).toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[4]);
      await wait();
      getByText('04/15/2020 9:30 am');
      expect(queryByText('04/15/2020 9:00 am')).toBeNull();

      // Sort by last updated (date sorting)
      userEvent.click(getAllByTestId('tableHeaderSortButton')[5]);
      await wait();
      getByText('04/15/2020 7:00 am');
      expect(queryByText('04/15/2020 7:30 am')).toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[5]);
      await wait();
      getByText('04/15/2020 7:30 am');
      expect(queryByText('04/15/2020 7:00 am')).toBeNull();
    });
    test('should be able to search', async () => {
      const randomDetectors = new Array(40).fill(null).map((_, index) => {
        const hasAnomaly = Math.random() > 0.5;
        return {
          id: `detector_id_${index}`,
          indices: [`index_${index}`],
          name: `detector_name_${index}`,
          totalAnomalies: hasAnomaly ? Math.floor(Math.random() * 10) : 0,
          lastActiveAnomaly: hasAnomaly ? Date.now() + index : 0,
        };
      });
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            detectorList: randomDetectors,
            totalDetectors: randomDetectors.length,
          },
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
    test('should display rows if there are data', async () => {
      const tempAnomalyTime = moment('2019-10-19T09:00:00');
      const tempLastUpdateTime = moment('2019-10-19T07:00:00');
      const randomDetectors = [
        {
          id: 1,
          name: 'Test1',
          indices: ['index_1'],
          curState: DETECTOR_STATE.INIT,
          totalAnomalies: 5,
          lastActiveAnomaly: tempAnomalyTime.valueOf(),
          lastUpdateTime: tempLastUpdateTime.valueOf(),
        },
        {
          id: 2,
          name: 'Test2',
          indices: ['index_2'],
          curState: DETECTOR_STATE.DISABLED,
          totalAnomalies: 10,
          lastActiveAnomaly: tempAnomalyTime.add(10, 'minutes').valueOf(),
          lastUpdateTime: tempLastUpdateTime.add(10, 'minutes').valueOf(),
        },
        {
          id: 3,
          name: 'Test3',
          indices: ['index_3'],
          curState: DETECTOR_STATE.RUNNING,
          totalAnomalies: 0,
          lastActiveAnomaly: tempAnomalyTime.add(20, 'minutes').valueOf(),
          lastUpdateTime: tempLastUpdateTime.add(20, 'minutes').valueOf(),
        },
      ];
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            detectorList: randomDetectors,
            totalDetectors: randomDetectors.length,
          },
        },
      });
      const { getByText } = renderWithRouter({
        ...initialDetectorsState,
        requesting: true,
      });
      await wait();
      //Assert all visible text are available
      //Test1 Detector
      getByText(randomDetectors[0].name);
      getByText(randomDetectors[0].indices[0]);
      getByText(randomDetectors[0].curState);
      getByText(randomDetectors[0].totalAnomalies.toString());
      getByText('10/19/2019 9:00 am');
      getByText('10/19/2019 7:00 am');
      //Test3 Detector
      getByText(randomDetectors[2].name);
      getByText(randomDetectors[2].indices[0]);
      getByText(randomDetectors[2].curState);
      getByText(randomDetectors[2].totalAnomalies.toString());
      getByText('10/19/2019 9:30 am');
      getByText('10/19/2019 7:30 am');
    });
  });
});
