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
import { MonitorsCallout } from '../MonitorsCallout';
import { Monitor } from '../../../../../models/interfaces';

describe('<MonitorsCallout /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Monitors callout', () => {
    console.error = jest.fn();
    const singleMonitor = [
      {
        id: 'dnexZXEBemUf2kpaW2CK',
        name: 'test-monitor',
      },
    ] as Monitor[];
    const multipleMonitors = [
      {
        id: 'dnexZXEBemUf2kpaW2CK',
        name: 'test-monitor',
      },
      {
        id: 'pjejULE5fmbf2t8aw5Ck',
        name: 'test-monitor-2',
      },
    ] as Monitor[];
    test('renders component with single monitor', () => {
      const { container } = render(
        <MonitorsCallout monitors={singleMonitor} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
    test('renders component with multiple monitors', () => {
      const { container } = render(
        <MonitorsCallout monitors={multipleMonitors} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
