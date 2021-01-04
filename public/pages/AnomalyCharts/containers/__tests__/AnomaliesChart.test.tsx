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
import { initialState, mockedStore } from '../../../../redux/utils/testUtils';
import { Provider } from 'react-redux';
import { INITIAL_ANOMALY_SUMMARY } from '../../utils/constants';
import { getRandomDetector } from '../../../../redux/reducers/__tests__/utils';
import {
  FAKE_ANOMALIES_RESULT,
  FAKE_DATE_RANGE,
} from '../../../../pages/utils/__tests__/constants';

const renderDataFilter = () => ({
  ...render(
    <Provider store={mockedStore()}>
      <AnomaliesChart
        onDateRangeChange={jest.fn()}
        onZoomRangeChange={jest.fn()}
        title="test"
        bucketizedAnomalies={true}
        anomalySummary={INITIAL_ANOMALY_SUMMARY}
        dateRange={FAKE_DATE_RANGE}
        isLoading={false}
        anomaliesResult={FAKE_ANOMALIES_RESULT}
        detector={getRandomDetector(true)}
      />
    </Provider>
  ),
});

describe('<AnomaliesChart /> spec', () => {
  test('renders the component', () => {
    console.error = jest.fn();
    const { getByText } = renderDataFilter();
    expect(getByText('Sample anomaly grade')).not.toBeNull();
  });
});
