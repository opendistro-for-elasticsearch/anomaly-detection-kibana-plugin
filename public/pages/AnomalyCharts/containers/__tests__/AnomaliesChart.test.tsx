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

describe('<AnomaliesChart /> spec', () => {
  const initialStartTime = moment('2019-10-10T09:00:00');
  const initialEndTime = initialStartTime.clone().add(2, 'd');
  const dateRange = {
    startDate: initialStartTime,
    endDate: initialEndTime,
  };
  test('renders the component', () => {
    const { container } = render(
      <AnomaliesChart
        title="test"
        detectorId="testDetectorId"
        detectorName="testDetectorName"
        anomalyGradeSeriesName="anoaly grade"
        confidenceSeriesName="confidence"
        dateRangeOption="last_24_hours"
        onDateRangeChange={jest.fn()}
        anomalies={[]}
        annotations={[]}
        dateRange={dateRange}
        isLoading={false}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
