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
import { render } from '@testing-library/react';
import { AnomaliesChart } from '../AnomaliesChart';
import moment from 'moment';

describe('<Anomalies /> spec', () => {
  const initialStartTime = moment('2019-10-10T09:00:00');
  const initialEndTime = initialStartTime.clone().add(2, 'd');
  test('renders the component', () => {
    const { container } = render(
      <AnomaliesChart
        onDateRangeChange={jest.fn()}
        anomalies={[]}
        annotations={[]}
        startDateTime={initialStartTime}
        endDateTime={initialEndTime}
        isLoading={false}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
