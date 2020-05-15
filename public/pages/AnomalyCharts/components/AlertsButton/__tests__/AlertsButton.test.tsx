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
import { AlertsButton } from '../AlertsButton';
import { getRandomMonitor } from '../../../../../redux/reducers/__tests__/utils';

describe('<AlertsButton /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Alerts Button', () => {
    test('renders component without monitor', () => {
      console.error = jest.fn();
      const { container } = render(
        <AlertsButton
          detectorId="test-detector-id"
          detectorName="test-detector-name"
          detectorInterval={1}
          unit="Minutes"
        />
      );
      expect(container).toMatchSnapshot();
    });

    test('renders component with monitor', () => {
      const { container } = render(
        <AlertsButton
          monitor={getRandomMonitor('test-detector-id', true)}
          detectorId="test-detector-id"
          detectorName="test-detector-name"
          detectorInterval={1}
          unit="Minutes"
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
