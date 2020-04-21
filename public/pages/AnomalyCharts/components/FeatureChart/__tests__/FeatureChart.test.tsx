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
import { FeatureChart } from '../FeatureChart';
import moment from 'moment';
import { FEATURE_TYPE } from '../../../../../models/interfaces';

const feature = {
  featureId: 'feature-id',
  featureName: 'feature-name',
  featureEnabled: true,
  importance: 1,
  aggregationQuery: {
    F1: {
      avg: {
        field: 'value',
      },
    },
  },
};

const featureData = [
  { data: 0.8, endTime: 1587453273000, startTime: 1587446073000 },
];
const dateRange = {
  startDate: moment(1587431968000),
  endDate: moment(1587453568000),
};

describe('<FeatureChart /> spec', () => {
  describe('Feature Chart', () => {
    test('renders component with simple aggregation', () => {
      const { container } = render(
        <FeatureChart
          feature={feature}
          featureData={featureData}
          annotations={[]}
          isLoading={false}
          dateRange={dateRange}
          featureType={FEATURE_TYPE.SIMPLE}
          field="value"
          aggregationMethod="sum"
          featureDataSeriesName="anomaly grade"
        />
      );
      expect(container).toMatchSnapshot();
    });

    test('renders component with custom expression', () => {
      const { container } = render(
        <FeatureChart
          feature={feature}
          featureData={featureData}
          annotations={[]}
          isLoading={false}
          dateRange={dateRange}
          featureType={FEATURE_TYPE.CUSTOM}
          aggregationQuery={JSON.stringify(feature.aggregationQuery)}
          featureDataSeriesName="anomaly grade"
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
