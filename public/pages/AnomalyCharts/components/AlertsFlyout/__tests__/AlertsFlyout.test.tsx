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
import { AlertsFlyout } from '../AlertsFlyout';
import { getRandomMonitor } from '../../../../../redux/reducers/__tests__/utils';

describe('<AlertsFlyout /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const detectorId = "GILVg3EBhaIh92zvX8uE";
  describe('Alerts Flyout', () => {
    test('renders component with monitor', () => {
      console.error = jest.fn();
      const { container } = render(
        <AlertsFlyout
          detectorId={detectorId}
          detectorName="test detector"
          detectorInterval={1}
          unit="Minutes"
          monitor={getRandomMonitor(detectorId, true)}
          onClose={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });

    test('renders component with undefined monitor', () => {
      console.error = jest.fn();
      const { container } = render(
        <AlertsFlyout
          detectorId={detectorId}
          detectorName="test detector"
          detectorInterval={1}
          unit="Minutes"
          onClose={jest.fn()}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
