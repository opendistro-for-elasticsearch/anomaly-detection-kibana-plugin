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
import { EuiIcon } from '@elastic/eui';
import { SampleDataBox } from '../SampleDataBox';

const defaultProps = {
  title: 'Sample title',
  icon: <EuiIcon type="alert" />,
  description: 'Sample description',
  loadDataButtonDescription: 'Sample button description',
  onLoadData: jest.fn(),
  isLoadingData: false,
  isDataLoaded: false,
  detectorId: 'sample-detector-id',
};

describe('<SampleDataBox /> spec', () => {
  describe('Data not loaded', () => {
    test('renders component', () => {
      const { container, getByText } = render(
        <SampleDataBox {...defaultProps} />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText('Sample title');
      getByText('Sample description');
      getByText('Sample button description');
    });
  });
  describe('Data is loading', () => {
    test('renders component', () => {
      const { container, getByText } = render(
        <SampleDataBox {...defaultProps} isLoadingData={true} />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText('Sample title');
      getByText('Sample description');
      getByText('Creating detector');
    });
  });
  describe('Data is loaded', () => {
    test('renders component', () => {
      const { container, getByText } = render(
        <SampleDataBox {...defaultProps} isDataLoaded={true} />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText('Sample title');
      getByText('Sample description');
      getByText('Detector created');
    });
  });
});
