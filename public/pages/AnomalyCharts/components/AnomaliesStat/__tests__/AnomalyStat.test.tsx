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
import {
  AnomalyStat,
  AnomalyStatWithTooltip,
  AlertsStat,
} from '../AnomalyStat';
import { getRandomMonitor } from '../../../../../redux/reducers/__tests__/utils';

describe('<AnomalyStat /> spec', () => {
  describe('Anomaly Stat', () => {
    test('renders component without tooltip', () => {
      const { container } = render(
        <AnomalyStat title="test title" description="test description" />
      );
      expect(container).toMatchSnapshot();
    });
  });
});

describe('<AnomalyStatWithTooltip /> spec', () => {
  describe('Anomaly Stat with tooltip', () => {
    test('renders component with tooltip and not loading', () => {
      const { container } = render(
        <AnomalyStatWithTooltip
          isLoading={false}
          minValue={0.5}
          maxValue={0.9}
          description="test description"
          tooltip="test tooltip"
        />
      );
      expect(container).toMatchSnapshot();
    });

    test('renders component with tooltip and loading', () => {
      const { container } = render(
        <AnomalyStatWithTooltip
          isLoading={true}
          minValue={0.5}
          maxValue={0.9}
          description="test description"
          tooltip="test tooltip"
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});

describe('<AlertsStat /> spec', () => {
  describe('Alert Stat', () => {
    test('renders component with undefined monitor and loading', () => {
      const { container } = render(
        <AlertsStat
          monitor={undefined}
          showAlertsFlyout={jest.fn()}
          totalAlerts={9}
          isLoading={true}
        />
      );
      expect(container).toMatchSnapshot();
    });

    test('renders component with undefined monitor and not loading', () => {
      const { container } = render(
        <AlertsStat
          monitor={undefined}
          showAlertsFlyout={jest.fn()}
          totalAlerts={9}
          isLoading={false}
        />
      );
      expect(container).toMatchSnapshot();
    });

    test('renders component with monitor and not loading', () => {
      const { container } = render(
        <AlertsStat
          monitor={getRandomMonitor('test-detector-id', true)}
          showAlertsFlyout={jest.fn()}
          totalAlerts={9}
          isLoading={false}
        />
      );
      expect(container).toMatchSnapshot();
    });

    test('renders component with monitor and loading', () => {
      const { container } = render(
        <AlertsStat
          monitor={getRandomMonitor('test-detector-id', true)}
          showAlertsFlyout={jest.fn()}
          totalAlerts={9}
          isLoading={true}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
