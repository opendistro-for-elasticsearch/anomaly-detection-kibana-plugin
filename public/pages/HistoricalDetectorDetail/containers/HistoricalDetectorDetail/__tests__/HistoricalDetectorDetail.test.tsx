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
import { Provider } from 'react-redux';
import {
  HashRouter as Router,
  RouteComponentProps,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { render, fireEvent, wait } from '@testing-library/react';
import { HistoricalDetectorDetail } from '../HistoricalDetectorDetail';
import configureStore from '../../../../../redux/configureStore';
import { httpClientMock, coreServicesMock } from '../../../../../../test/mocks';
import { CoreServicesContext } from '../../../../../components/CoreServices/CoreServices';
import { DETECTOR_STATE } from '../../../../../../server/utils/constants';

const CONFIGURATION_TITLE = 'Historical detector configuration';
const ANOMALY_HISTORY_TITLE = 'Anomaly history';
const ACTIONS_BUTTON_TEXT = 'Actions';
const STOPPED_CALLOUT_TEXT = 'The historical detector is stopped';
const INIT_CALLOUT_TEXT = 'Initializing the historical detector';
const RUNNING_CALLOUT_TEXT = 'Running the historical detector';
const START_DETECTOR_BUTTON_TEXT = 'Start historical detector';
const STOP_DETECTOR_BUTTON_TEXT = 'Stop historical detector';

const TEST_DETECTOR = {
  id: 'test-id',
  name: 'test-name',
  detectionDateRange: {
    startTime: 0,
    endTime: 5,
  },
  description: 'test-description',
  lastUpdated: 0,
  indices: ['test-index'],
  detectionInterval: {
    period: {
      interval: 10,
      unit: 'Minutes',
    },
  },
  curState: DETECTOR_STATE.DISABLED,
};

const renderWithRouter = () => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            path={`/historical-detectors/${TEST_DETECTOR.id}/details`}
            render={(props: RouteComponentProps) => {
              const testProps = {
                ...props,
                match: {
                  params: { detectorId: TEST_DETECTOR.id },
                  isExact: false,
                  path: '',
                  url: '',
                },
              };
              return (
                <CoreServicesContext.Provider value={coreServicesMock}>
                  <HistoricalDetectorDetail {...testProps} />
                </CoreServicesContext.Provider>
              );
            }}
          />
          <Redirect
            from="/"
            to={`/historical-detectors/${TEST_DETECTOR.id}/details`}
          />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('<HistoricalDetectorDetail /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    console.warn = jest.fn();
  });
  test('renders the component', async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        ...TEST_DETECTOR,
      },
    });
    const { container, getByText, getAllByText } = renderWithRouter();
    await wait();
    expect(container.firstChild).toMatchSnapshot();
    await wait();
    getByText(CONFIGURATION_TITLE);
    getByText(ANOMALY_HISTORY_TITLE);
    getByText(ACTIONS_BUTTON_TEXT);
    getByText(TEST_DETECTOR.id);
    getByText(TEST_DETECTOR.description);
    // Name should be displayed in the header and in the configuration
    expect(getAllByText(TEST_DETECTOR.name)).toHaveLength(2);
  });
  test('shows correct callout when detector is stopped', async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        ...TEST_DETECTOR,
        curState: DETECTOR_STATE.DISABLED,
      },
    });
    const { getByText } = renderWithRouter();
    await wait();
    getByText(STOPPED_CALLOUT_TEXT);
    getByText(START_DETECTOR_BUTTON_TEXT);
  });
  test('shows correct callout when detector is initializing', async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        ...TEST_DETECTOR,
        curState: DETECTOR_STATE.INIT,
      },
    });
    const { getByText } = renderWithRouter();
    await wait();
    getByText(INIT_CALLOUT_TEXT);
    getByText(STOP_DETECTOR_BUTTON_TEXT);
  });
  test('shows correct callout when detector is running', async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        ...TEST_DETECTOR,
        curState: DETECTOR_STATE.RUNNING,
      },
    });
    const { getByText } = renderWithRouter();
    await wait();
    getByText(RUNNING_CALLOUT_TEXT);
    getByText(STOP_DETECTOR_BUTTON_TEXT);
  });
  test('shows correct callout when detector is finished', async () => {
    httpClientMock.get = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        ...TEST_DETECTOR,
        curState: DETECTOR_STATE.FINISHED,
      },
    });
    const { getByText } = renderWithRouter();
    await wait();
    getByText('Finished');
    getByText(START_DETECTOR_BUTTON_TEXT);
  });
});
