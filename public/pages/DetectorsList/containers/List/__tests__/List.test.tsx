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
import { httpClientMock, coreServicesMock } from '../../../../../../test/mocks';
import configureStore from '../../../../../redux/configureStore';
import {
  Detectors,
  initialDetectorsState,
} from '../../../../../redux/reducers/ad';
import { DetectorList, ListRouterParams } from '../List';
import { DETECTOR_STATE } from '../../../../../utils/constants';
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
            path="/detectors"
            render={(props: RouteComponentProps<ListRouterParams>) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <DetectorList {...props} />
              </CoreServicesContext.Provider>
            )}
          />
          <Redirect from="/" to="/detectors" />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('<DetectorList /> spec', () => {
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
      getByText('Loading detectors...');
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
          lastActiveAnomaly: moment('2020-04-15T09:00:00')
            .add(index, 'minutes')
            .valueOf(),
          enabledTime: moment('2020-04-15T07:00:00')
            .add(index, 'minutes')
            .valueOf(),
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
      userEvent.click(getAllByTestId('tableHeaderSortButton')[1]);
      await wait();
      getByText('index_0');
      expect(queryByText('index_30')).toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[1]);
      await wait();
      getByText('index_30');
      expect(queryByText('index_0')).toBeNull();

      // Sort by detector state (enum sorting)
      // NOTE: this is assuming DETECTOR_STATE.RUNNING is higher alphabetically ('running')
      // than DETECTOR_STATE.DISABLED ('stopped')
      userEvent.click(getAllByTestId('tableHeaderSortButton')[2]);
      await wait();
      expect(queryByText(DETECTOR_STATE.RUNNING)).not.toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[2]);
      await wait();
      expect(queryByText(DETECTOR_STATE.RUNNING)).toBeNull();

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
      getByText('04/15/2020 9:00 AM');
      expect(queryByText('04/15/2020 9:30 AM')).toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[4]);
      await wait();
      getByText('04/15/2020 9:30 AM');
      expect(queryByText('04/15/2020 9:00 AM')).toBeNull();

      // Sort by last updated (date sorting)
      userEvent.click(getAllByTestId('tableHeaderSortButton')[5]);
      await wait();
      getByText('04/15/2020 7:00 AM');
      expect(queryByText('04/15/2020 7:30 AM')).toBeNull();
      userEvent.click(getAllByTestId('tableHeaderSortButton')[5]);
      await wait();
      getByText('04/15/2020 7:30 AM');
      expect(queryByText('04/15/2020 7:00 AM')).toBeNull();
    }, 20000);
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
          lastActiveAnomaly: hasAnomaly ? Date.now() + index : 0,
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
    test('should display rows if there are data', async () => {
      const tempAnomalyTime = moment('2019-10-19T09:00:00');
      const tempEnabledTime = moment('2019-10-19T07:00:00');
      const randomDetectors = [
        {
          id: 1,
          name: 'Test1',
          indices: ['index_1'],
          curState: DETECTOR_STATE.INIT,
          totalAnomalies: 5,
          lastActiveAnomaly: tempAnomalyTime.valueOf(),
          enabledTime: tempEnabledTime.valueOf(),
        },
        {
          id: 2,
          name: 'Test2',
          indices: ['index_2'],
          curState: DETECTOR_STATE.DISABLED,
          totalAnomalies: 10,
          lastActiveAnomaly: tempAnomalyTime.add(10, 'minutes').valueOf(),
          enabledTime: tempEnabledTime.add(10, 'minutes').valueOf(),
        },
        {
          id: 3,
          name: 'Test3',
          indices: ['index_3'],
          curState: DETECTOR_STATE.RUNNING,
          totalAnomalies: 0,
          lastActiveAnomaly: tempAnomalyTime.add(20, 'minutes').valueOf(),
          enabledTime: tempEnabledTime.add(20, 'minutes').valueOf(),
        },
      ];
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
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
      getByText('10/19/2019 9:00 AM');
      getByText('10/19/2019 7:00 AM');
      //Test3 Detector
      getByText(randomDetectors[2].name);
      getByText(randomDetectors[2].indices[0]);
      getByText(randomDetectors[2].curState);
      getByText(randomDetectors[2].totalAnomalies.toString());
      getByText('10/19/2019 9:30 AM');
      getByText('10/19/2019 7:30 AM');
    });
    test('start action disabled if selected detector is running', async () => {
      const randomDetectors = [
        {
          id: 1,
          name: 'Test1',
          indices: ['index_1'],
          curState: DETECTOR_STATE.RUNNING,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
      ];
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
        },
      });
      const {
        getByText,
        getByTestId,
        getAllByRole,
        queryByText,
      } = renderWithRouter();
      await wait();
      userEvent.click(getAllByRole('checkbox')[0]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Start'));
      expect(
        queryByText('Are you sure you want to start the selected detectors?')
      ).toBeNull();
    });
    test('start action enabled if selected detector is not running', async () => {
      const randomDetectors = [
        {
          id: 1,
          name: 'Test1',
          indices: ['index_1'],
          curState: DETECTOR_STATE.DISABLED,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
      ];
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
        },
      });
      const { getByText, getByTestId, getAllByRole } = renderWithRouter();
      await wait();
      userEvent.click(getAllByRole('checkbox')[0]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Start'));
      getByText('Are you sure you want to start the selected detectors?');
      getByText('Start detectors');
    });
    test('stop action disabled if selected detector is stopped', async () => {
      const randomDetectors = [
        {
          id: 1,
          name: 'Test1',
          indices: ['index_1'],
          curState: DETECTOR_STATE.DISABLED,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
      ];
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
        },
      });
      const {
        getByText,
        getByTestId,
        getAllByRole,
        queryByText,
      } = renderWithRouter();
      await wait();
      userEvent.click(getAllByRole('checkbox')[0]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Stop'));
      expect(
        queryByText('Are you sure you want to stop the selected detectors?')
      ).toBeNull();
    });
    test('stop action enabled if selected detector is running', async () => {
      const randomDetectors = [
        {
          id: 1,
          name: 'Test1',
          indices: ['index_1'],
          curState: DETECTOR_STATE.RUNNING,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
      ];
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
        },
      });
      const { getByText, getByTestId, getAllByRole } = renderWithRouter();
      await wait();
      userEvent.click(getAllByRole('checkbox')[0]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Stop'));
      getByText('Are you sure you want to stop the selected detectors?');
      getByText('Stop detectors');
    });
    //TODO: fix this failed UT
    test.skip('delete action always enabled', async () => {
      const randomDetectors = [
        {
          id: 1,
          name: 'Test1',
          indices: ['index_1'],
          curState: DETECTOR_STATE.DISABLED,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
        {
          id: 2,
          name: 'Test2',
          indices: ['index_2'],
          curState: DETECTOR_STATE.INIT,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
        {
          id: 3,
          name: 'Test3',
          indices: ['index_3'],
          curState: DETECTOR_STATE.RUNNING,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
        {
          id: 4,
          name: 'Test4',
          indices: ['index_4'],
          curState: DETECTOR_STATE.FEATURE_REQUIRED,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
        {
          id: 5,
          name: 'Test5',
          indices: ['index_5'],
          curState: DETECTOR_STATE.INIT_FAILURE,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
        {
          id: 6,
          name: 'Test6',
          indices: ['index_6'],
          curState: DETECTOR_STATE.UNEXPECTED_FAILURE,
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
          enabledTime: 0,
        },
      ];
      httpClientMock.get = jest.fn().mockResolvedValue({
        ok: true,
        response: {
          detectorList: randomDetectors,
          totalDetectors: randomDetectors.length,
        },
      });
      const { getByText, getByTestId, getAllByRole } = renderWithRouter();
      await wait();
      // Try to delete disabled detector
      userEvent.click(getAllByRole('checkbox')[1]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Delete'));
      getByText('Are you sure you want to delete the selected detectors?');
      getByText('Delete detectors');
      userEvent.click(getAllByRole('button')[0]);
      userEvent.click(getAllByRole('checkbox')[1]);

      // Try to delete initializing detector
      userEvent.click(getAllByRole('checkbox')[2]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Delete'));
      getByText('Are you sure you want to delete the selected detectors?');
      getByText('Delete detectors');
      userEvent.click(getAllByRole('button')[0]);
      userEvent.click(getAllByRole('checkbox')[2]);

      // Try to delete running detector
      userEvent.click(getAllByRole('checkbox')[3]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Delete'));
      getByText('Are you sure you want to delete the selected detectors?');
      getByText('Delete detectors');
      userEvent.click(getAllByRole('button')[0]);
      userEvent.click(getAllByRole('checkbox')[3]);

      // Try to delete feature required detector
      userEvent.click(getAllByRole('checkbox')[4]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Delete'));
      getByText('Are you sure you want to delete the selected detectors?');
      getByText('Delete detectors');
      userEvent.click(getAllByRole('button')[0]);
      userEvent.click(getAllByRole('checkbox')[4]);

      // Try to delete init failure detector
      userEvent.click(getAllByRole('checkbox')[5]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Delete'));
      getByText('Are you sure you want to delete the selected detectors?');
      getByText('Delete detectors');
      userEvent.click(getAllByRole('button')[0]);
      userEvent.click(getAllByRole('checkbox')[5]);

      // Try to delete unexpected failure detector
      userEvent.click(getAllByRole('checkbox')[6]);
      userEvent.click(getByTestId('listActionsButton'));
      userEvent.click(getByText('Delete'));
      getByText('Are you sure you want to delete the selected detectors?');
      getByText('Delete detectors');
      userEvent.click(getAllByRole('button')[0]);
      userEvent.click(getAllByRole('checkbox')[6]);
    });
  });
});
