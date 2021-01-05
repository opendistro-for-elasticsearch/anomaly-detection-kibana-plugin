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
import userEvent from '@testing-library/user-event';
import { DeleteHistoricalDetectorModal } from '../../ActionModals/DeleteHistoricalDetectorModal/DeleteHistoricalDetectorModal';
import { DETECTOR_STATE } from '../../../../../../server/utils/constants';

const TITLE_TEXT = 'Delete historical detector?';
const CALLOUT_TEXT =
  'The historical detector is running. Are you sure you want to proceed?';
const DELETE_BUTTON_TEXT = 'Delete';
const DELETE_AND_STOP_BUTTON_TEXT = 'Stop and delete';

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
const mockOnHide = jest.fn();
const mockOnStopDetectorForDeleting = jest.fn();

const TEST_PROPS = {
  detector: TEST_DETECTOR,
  isStoppingDetector: false,
  onHide: mockOnHide,
  onStopDetectorForDeleting: mockOnStopDetectorForDeleting,
};

describe('<DeleteHistoricalDetectorModal /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the component with detector stopped', () => {
    const { getByText, queryByText } = render(
      <DeleteHistoricalDetectorModal
        {...TEST_PROPS}
        detector={{
          ...TEST_PROPS.detector,
          curState: DETECTOR_STATE.DISABLED,
        }}
      />
    );
    getByText(TITLE_TEXT);
    getByText(DELETE_BUTTON_TEXT);
    expect(queryByText(CALLOUT_TEXT)).toBeNull();
    expect(queryByText(DELETE_AND_STOP_BUTTON_TEXT)).toBeNull();
  });
  test('renders the component with detector initializing', () => {
    const { getByText, queryByText } = render(
      <DeleteHistoricalDetectorModal
        {...TEST_PROPS}
        detector={{
          ...TEST_PROPS.detector,
          curState: DETECTOR_STATE.INIT,
        }}
      />
    );
    getByText(TITLE_TEXT);
    getByText(CALLOUT_TEXT);
    getByText(DELETE_AND_STOP_BUTTON_TEXT);
    expect(queryByText(DELETE_BUTTON_TEXT)).toBeNull();
  });
  test('renders the component with detector running', () => {
    const { getByText, queryByText } = render(
      <DeleteHistoricalDetectorModal
        {...TEST_PROPS}
        detector={{
          ...TEST_PROPS.detector,
          curState: DETECTOR_STATE.RUNNING,
        }}
      />
    );
    getByText(TITLE_TEXT);
    getByText(CALLOUT_TEXT);
    getByText(DELETE_AND_STOP_BUTTON_TEXT);
    expect(queryByText(DELETE_BUTTON_TEXT)).toBeNull();
  });
  test('delete button disabled if delete not typed', async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <DeleteHistoricalDetectorModal {...TEST_PROPS} />
    );
    userEvent.type(getByPlaceholderText('delete'), 'foo');
    userEvent.click(getByTestId('confirmButton'));
    expect(mockOnStopDetectorForDeleting).toHaveBeenCalledTimes(0);
  });
  test('delete button enabled if delete typed', async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <DeleteHistoricalDetectorModal {...TEST_PROPS} />
    );
    userEvent.type(getByPlaceholderText('delete'), 'delete');
    userEvent.click(getByTestId('confirmButton'));
    expect(mockOnStopDetectorForDeleting).toHaveBeenCalledTimes(1);
  });
  test('onHide() called if user cancels', async () => {
    const { getByText } = render(
      <DeleteHistoricalDetectorModal {...TEST_PROPS} />
    );
    userEvent.click(getByText('Cancel'));
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
