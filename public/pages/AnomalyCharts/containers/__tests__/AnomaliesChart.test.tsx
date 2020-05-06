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
import { AnomaliesChart } from '../AnomaliesChart';
import moment from 'moment';
import { initialState, mockedStore } from '../../../../redux/utils/testUtils';
import { Provider } from 'react-redux';

const initialStartTime = moment('2019-10-10T09:00:00');
const initialEndTime = initialStartTime.clone().add(2, 'd');
const dateRange = {
  startDate: initialStartTime.valueOf(),
  endDate: initialEndTime.valueOf(),
};
const anomalies = [
  {
    anomalyGrade: 0.3,
    confidence: 0.8,
    startTime: initialStartTime.add(1, 'minutes').valueOf(),
    endTime: initialStartTime.add(2, 'minutes').valueOf(),
    plotTime: initialStartTime.add(90, 'seconds').valueOf(),
  },
];

const renderDataFilter = () => ({
  ...render(
    <Provider
      store={mockedStore({
        ...initialState,
        elasticsearch: {
          ...initialState.elasticsearch,
          dataTypes: {
            keyword: ['cityName.keyword'],
            integer: ['age'],
            text: ['cityName'], 
          },
        },
      })}
    >
      <AnomaliesChart
        onDateRangeChange={jest.fn()}
        onZoomRangeChange={jest.fn()}
        title="test"
        anomalies={anomalies}
        atomicAnomalies={true}
        anomalySummary={undefined}
        dateRange={dateRange}
        isLoading={false}
        anomalyGradeSeriesName="anoaly grade"
        confidenceSeriesName="confidence"
        detectorId="testDetectorId"
        detectorName="testDetectorName"
        annotations={[]}
      />
    </Provider>
  ),
});

describe('<AnomaliesChart /> spec', () => {
  test('renders the component', () => {
    const { getByText } = renderDataFilter();
    expect(getByText('anoaly grade')).not.toBeNull();
  });
});
