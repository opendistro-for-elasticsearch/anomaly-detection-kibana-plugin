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
import { HistoricalDetectorControls } from '../HistoricalDetectorControls/HistoricalDetectorControls';
import { DETECTOR_STATE } from '../../../../../server/utils/constants';

const ACTIONS_TEXT = 'Actions';
const START_BUTTON_TEXT = 'Start historical detector';
const STOP_BUTTON_TEXT = 'Stop historical detector';
const STOPPING_BUTTON_TEXT = 'Stopping';

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
  curState: DETECTOR_STATE.DISABLED,
};
const mockOnEditDetector = jest.fn();
const mockOnStartDetector = jest.fn();
const mockOnStopDetector = jest.fn();
const mockOnDeleteDetector = jest.fn();

const TEST_PROPS = {
  detector: TEST_DETECTOR,
  isStoppingDetector: false,
  onEditDetector: mockOnEditDetector,
  onStartDetector: mockOnStartDetector,
  onStopDetector: mockOnStopDetector,
  onDeleteDetector: mockOnDeleteDetector,
};

describe('<HistoricalDetectorControls /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('detector is not stopping', () => {
    test('renders the component with detector stopped', () => {
      const { container, getByText, queryByText } = render(
        <HistoricalDetectorControls
          {...TEST_PROPS}
          detector={{
            ...TEST_PROPS.detector,
            curState: DETECTOR_STATE.DISABLED,
          }}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText(ACTIONS_TEXT);
      getByText(START_BUTTON_TEXT);
      expect(queryByText(STOP_BUTTON_TEXT)).toBeNull();
      expect(queryByText(STOPPING_BUTTON_TEXT)).toBeNull();
    });
    test('renders the component with detector initializing', () => {
      const { container, getByText, queryByText } = render(
        <HistoricalDetectorControls
          {...TEST_PROPS}
          detector={{ ...TEST_PROPS.detector, curState: DETECTOR_STATE.INIT }}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText(ACTIONS_TEXT);
      getByText(STOP_BUTTON_TEXT);
      expect(queryByText(START_BUTTON_TEXT)).toBeNull();
      expect(queryByText(STOPPING_BUTTON_TEXT)).toBeNull();
    });
    test('renders the component with detector running', () => {
      const { container, getByText, queryByText } = render(
        <HistoricalDetectorControls
          {...TEST_PROPS}
          detector={{
            ...TEST_PROPS.detector,
            curState: DETECTOR_STATE.RUNNING,
          }}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText(ACTIONS_TEXT);
      getByText(STOP_BUTTON_TEXT);
      expect(queryByText(START_BUTTON_TEXT)).toBeNull();
      expect(queryByText(STOPPING_BUTTON_TEXT)).toBeNull();
    });
    test('onEditDetector() is called when clicking edit action', () => {
      const { getByTestId } = render(
        <HistoricalDetectorControls {...TEST_PROPS} />
      );
      expect(mockOnEditDetector).toHaveBeenCalledTimes(0);
      fireEvent.click(getByTestId('actionsButton'));
      getByTestId('editDetectorItem');
      getByTestId('deleteDetectorItem');
      fireEvent.click(getByTestId('editDetectorItem'));
      expect(mockOnEditDetector).toHaveBeenCalledTimes(1);
      expect(mockOnDeleteDetector).toHaveBeenCalledTimes(0);
    });
    test('onDeleteDetector() is called when clicking delete action', () => {
      const { getByTestId } = render(
        <HistoricalDetectorControls {...TEST_PROPS} />
      );
      expect(mockOnDeleteDetector).toHaveBeenCalledTimes(0);
      fireEvent.click(getByTestId('actionsButton'));
      getByTestId('editDetectorItem');
      getByTestId('deleteDetectorItem');
      fireEvent.click(getByTestId('deleteDetectorItem'));
      expect(mockOnEditDetector).toHaveBeenCalledTimes(0);
      expect(mockOnDeleteDetector).toHaveBeenCalledTimes(1);
    });
  });
  describe('detector is stopping', () => {
    test('renders the component', () => {
      const { container, getByText, getByTestId } = render(
        <HistoricalDetectorControls {...TEST_PROPS} isStoppingDetector={true} />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText(ACTIONS_TEXT);
      getByText(STOPPING_BUTTON_TEXT);
      fireEvent.click(getByTestId('stopDetectorButton'));
      expect(mockOnStartDetector).toHaveBeenCalledTimes(0);
      expect(mockOnStopDetector).toHaveBeenCalledTimes(0);
    });
    test('actions are disabled', () => {
      const { queryByTestId, getByTestId } = render(
        <HistoricalDetectorControls {...TEST_PROPS} isStoppingDetector={true} />
      );
      fireEvent.click(getByTestId('actionsButton'));
      expect(queryByTestId('editDetectorItem')).toBeNull();
      expect(queryByTestId('deleteDetectorItem')).toBeNull();
    });
  });
});
