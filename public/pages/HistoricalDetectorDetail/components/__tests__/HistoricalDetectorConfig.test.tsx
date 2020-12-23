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
import { render, fireEvent } from '@testing-library/react';
import { HistoricalDetectorConfig } from '../HistoricalDetectorConfig/HistoricalDetectorConfig';
import moment from 'moment';

const TITLE_TEXT = 'Historical detector configuration';
const TEST_DETECTOR = {
  id: 'test-id',
  name: 'test-name',
  detectionDateRange: {
    startTime: 0,
    endTime: 5,
  },
  description: 'test-description',
  lastUpdateTime: 0,
  indices: ['test-index'],
  detectionInterval: {
    period: {
      interval: 10,
      unit: 'Minutes',
    },
  },
};
const START_TIME_STRING = moment(0).format('MM/DD/YYYY hh:mm A');
const END_TIME_STRING = moment(5).format('MM/DD/YYYY hh:mm A');
const INTERVAL_STRING = '10 Minutes';
const mockOnEditDetector = jest.fn();

describe('<HistoricalDetectorConfig /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('detector is not stopping', () => {
    test('renders the component', () => {
      const { container, getByText } = render(
        <HistoricalDetectorConfig
          detector={TEST_DETECTOR}
          isStoppingDetector={false}
          onEditDetector={mockOnEditDetector}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText(TITLE_TEXT);
      getByText(TEST_DETECTOR.id);
      getByText(TEST_DETECTOR.name);
      getByText(TEST_DETECTOR.description);
      getByText(TEST_DETECTOR.indices[0]);
      getByText(INTERVAL_STRING);
      getByText(START_TIME_STRING);
      getByText(START_TIME_STRING + '-' + END_TIME_STRING);
    });
    test('onEditDetector() is called when clicking edit', () => {
      const { getByTestId } = render(
        <HistoricalDetectorConfig
          detector={TEST_DETECTOR}
          isStoppingDetector={false}
          onEditDetector={mockOnEditDetector}
        />
      );
      expect(mockOnEditDetector).toHaveBeenCalledTimes(0);
      fireEvent.click(getByTestId('editDetectorButton'));
      expect(mockOnEditDetector).toHaveBeenCalledTimes(1);
    });
  });
  describe('detector is stopping', () => {
    test('renders the component', () => {
      const { container, getByText } = render(
        <HistoricalDetectorConfig
          detector={TEST_DETECTOR}
          isStoppingDetector={true}
          onEditDetector={mockOnEditDetector}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText(TITLE_TEXT);
      getByText(TEST_DETECTOR.id);
      getByText(TEST_DETECTOR.name);
      getByText(TEST_DETECTOR.description);
      getByText(TEST_DETECTOR.indices[0]);
      getByText(INTERVAL_STRING);
      getByText(START_TIME_STRING);
      getByText(START_TIME_STRING + '-' + END_TIME_STRING);
    });
    test('onEditDetector() is not called when clicking edit', () => {
      const { getByTestId } = render(
        <HistoricalDetectorConfig
          detector={TEST_DETECTOR}
          isStoppingDetector={true}
          onEditDetector={mockOnEditDetector}
        />
      );
      expect(mockOnEditDetector).toHaveBeenCalledTimes(0);
      fireEvent.click(getByTestId('editDetectorButton'));
      expect(mockOnEditDetector).toHaveBeenCalledTimes(0);
    });
  });
});
