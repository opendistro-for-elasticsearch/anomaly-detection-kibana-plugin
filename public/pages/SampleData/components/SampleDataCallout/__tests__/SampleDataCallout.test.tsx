/*
 * Copyright 2020 Amazon.com, Inc. or its /*
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
import { SampleDataCallout } from '../SampleDataCallout';

describe('<SampleDataCallout /> spec', () => {
  describe('Data not loaded', () => {
    test('renders component', () => {
      const { container, getByText } = render(<SampleDataCallout />);
      expect(container.firstChild).toMatchSnapshot();
      getByText('Looking to get more familiar with anomaly detection?');
    });
  });
});
