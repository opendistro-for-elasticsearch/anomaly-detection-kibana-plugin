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

import React from 'react';
import { render, waitForElement, wait } from '@testing-library/react';
import { AnomaliesList, ListRouterParams } from '../List';
import { Provider } from 'react-redux';
import {
  MemoryRouter as Router,
  RouteComponentProps,
  Route,
  Switch,
} from 'react-router-dom';
import configureStore from '../../../../redux/configureStore';
import { httpClientMock } from '../../../../../test/mocks';
import { Detector } from '../../../../models/interfaces';
import { getRandomDetector } from '../../../../redux/reducers/__tests__/utils';
import moment from 'moment';

const renderWithRouter = (detector: Detector) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            render={(props: RouteComponentProps<ListRouterParams>) => (
              <AnomaliesList
                detector={detector}
                detectorId={detector.id}
                {...props}
              />
            )}
          />
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
        data: { ok: true, response: { results: [], totalResults: 0 } },
      });
      const detector = getRandomDetector();
      const { getByText } = renderWithRouter(detector);
      const elm = await waitForElement(() =>
        getByText('Loading anomaly results...')
      );
      expect(elm).not.toBeNull();
    });
    // There are some trouble fixing dynamic import will fix this later
    test('should display empty message when list is empty', async () => {
      const randomDetector = getRandomDetector();
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: { ok: true, response: { results: [], totalResults: 0 } },
      });
      const { getByText } = renderWithRouter(randomDetector);
      await wait();
      getByText(
        "There are no anomalies currently. Ensure you've created monitor for detector."
      );
    });
    // There are some trouble fixing dynamic import will fix this later
    test('should display rows if there are data', async () => {
      const initialStartTime = moment('2019-10-19T09:00:00');
      const endTime = moment('2019-10-19T09:10:00');
      const randomDetector = getRandomDetector();
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            results: [
              {
                detectorId: 'temp',
                anomalyScore: 1,
                anomalyGrade: 0.5,
                confidence: 1,
                startTime: initialStartTime.valueOf(),
                endTime: endTime.valueOf(),
              },
            ],
            totalResults: 0,
          },
        },
      });
      const { getByText } = renderWithRouter(randomDetector);
      await wait();
      getByText('10/19/19 9:00 am');
      getByText('10/19/19 9:10 am');
      getByText('1');
      getByText('0.5');
    });
  });
});
