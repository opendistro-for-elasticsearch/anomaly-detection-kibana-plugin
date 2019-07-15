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
    test('should sort / pagination the table', async () => {
      const randomDetectors = new Array(40).fill(null).map((_, index) => {
        const hasAnomaly = Math.random() > 0.5;
        return {
          id: `detector_id_${index}`,
          name: `detector_name_${index}`,
          totalAnomalies: hasAnomaly ? Math.floor(Math.random() * 10) : 0,
          lastActiveAnomaly: hasAnomaly ? Date.now() + index : 0,
        };
      });
      httpClientMock.get = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            ok: true,
            response: {
              detectorList: randomDetectors.slice(0, 20),
              totalDetectors: randomDetectors.length,
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            ok: true,
            response: {
              detectorList: randomDetectors.slice(20),
              totalDetectors: randomDetectors.length,
            },
          },
        })
        .mockResolvedValue({
          data: {
            ok: true,
            response: {
              detectorList: randomDetectors
                .slice()
                .sort((a, b) =>
                  a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                )
                .slice(0, 20),
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
      expect(queryByText('detector_name_30')).toBeNull();

      // Navigate to next page
      userEvent.click(getAllByTestId('pagination-button-next')[0]);
      await wait(() => getByText('detector_name_30'));
      expect(queryByText('detector_name_0')).toBeNull();
      // Sort the detector name (String sorting)
      userEvent.click(getAllByTestId('tableHeaderSortButton')[0]);
      await wait(() => getByText('detector_name_22'));
      getByText('detector_name_2');
      expect(queryByText('detector_name_30')).toBeNull();
      expect(queryByText('detector_name_4')).toBeNull();
    });
    test('should able to search', async () => {
      const randomDetectors = new Array(40).fill(null).map((_, index) => {
        const hasAnomaly = Math.random() > 0.5;
        return {
          id: `detector_id_${index}`,
          name: `detector_name_${index}`,
          totalAnomalies: hasAnomaly ? Math.floor(Math.random() * 10) : 0,
          lastActiveAnomaly: hasAnomaly ? Date.now() + index : 0,
        };
      });
      httpClientMock.get = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            ok: true,
            response: {
              detectorList: randomDetectors.slice(0, 20),
              totalDetectors: randomDetectors.length,
            },
          },
        })
        .mockResolvedValue({
          data: {
            ok: true,
            response: {
              detectorList: randomDetectors.slice(38, 39),
              totalDetectors: 1,
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
      expect(queryByText('detector_name_38')).toBeNull();

      //Input search event
      userEvent.type(getByPlaceholderText('Search'), 'detector_name_38');
      await wait(() => getByText('detector_name_38'));
      expect(queryByText('detector_name_39')).toBeNull();
      expect(queryByText('detector_name_0')).toBeNull();
    });
    test('should display rows if there are data', async () => {
      const tempAnomalyTime = moment('2019-10-19T09:00:00');
      const randomDetectors = [
        {
          id: 1,
          name: 'Test1',
          totalAnomalies: 5,
          lastActiveAnomaly: tempAnomalyTime.valueOf(),
        },
        {
          id: 2,
          name: 'Test2',
          totalAnomalies: 10,
          lastActiveAnomaly: tempAnomalyTime.add(10, 'minutes').valueOf(),
        },
        {
          id: 3,
          name: 'Test3',
          totalAnomalies: 0,
          lastActiveAnomaly: tempAnomalyTime.add(20, 'minutes').valueOf(),
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
      getByText(randomDetectors[0].totalAnomalies.toString());
      getByText('10/19/19 9:00 am');
      //Test3 Detector
      getByText(randomDetectors[2].name);
      getByText(randomDetectors[2].totalAnomalies.toString());
      getByText('10/19/19 9:30 am');
    });
  });
});
