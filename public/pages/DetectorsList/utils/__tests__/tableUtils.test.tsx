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

import { staticColumn } from '../../utils/tableUtils';
import { render } from '@testing-library/react';

describe('tableUtils spec', () => {
  describe('should render the column titles', () => {
    test('detector name column', () => {
      const result = staticColumn;
      const { getByText } = render(result[0].name);
      getByText('Detector');
    });
    test('indices column', () => {
      const result = staticColumn;
      const { getByText } = render(result[1].name);
      getByText('Indices');
    });
    test('detector state column', () => {
      const result = staticColumn;
      const { getByText } = render(result[2].name);
      getByText('Detector state');
    });
    test('total anomalies column', () => {
      const result = staticColumn;
      const { getByText } = render(result[3].name);
      getByText('Anomalies last 24 hours');
    });
    test('last active anomaly column', () => {
      const result = staticColumn;
      const { getByText } = render(result[4].name);
      getByText('Last anomaly occurrence');
    });
    test('last enabled time column', () => {
      const result = staticColumn;
      const { getByText } = render(result[5].name);
      getByText('Last enabled time');
    });
  });
});
