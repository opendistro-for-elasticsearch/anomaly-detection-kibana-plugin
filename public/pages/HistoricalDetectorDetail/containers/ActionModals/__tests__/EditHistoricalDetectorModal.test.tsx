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
import { EditHistoricalDetectorModal } from '../../ActionModals/EditHistoricalDetectorModal/EditHistoricalDetectorModal';

const TITLE_TEXT = 'Stop historical detector to proceed?';
const MODAL_TEXT =
  'You must stop the detector to change its configuration. After you reconfigure the detector, be sure to restart it.';
const STOP_BUTTON_TEXT = 'Stop and proceed to edit';

const mockOnHide = jest.fn();
const mockOnStopDetectorForEditing = jest.fn();

const TEST_PROPS = {
  isStoppingDetector: false,
  onHide: mockOnHide,
  onStopDetectorForEditing: mockOnStopDetectorForEditing,
};

describe('<EditHistoricalDetectorModal /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the component', () => {
    const { getByText } = render(
      <EditHistoricalDetectorModal {...TEST_PROPS} />
    );
    getByText(TITLE_TEXT);
    getByText(MODAL_TEXT);
    getByText(STOP_BUTTON_TEXT);
  });
  test('onStopDetectorForEditing() is called when user confirms', () => {
    const { getByTestId } = render(
      <EditHistoricalDetectorModal {...TEST_PROPS} />
    );
    expect(mockOnStopDetectorForEditing).toHaveBeenCalledTimes(0);
    userEvent.click(getByTestId('confirmButton'));
    expect(mockOnStopDetectorForEditing).toHaveBeenCalledTimes(1);
  });
  test('onHide() is called when user cancels', () => {
    const { getByText } = render(
      <EditHistoricalDetectorModal {...TEST_PROPS} />
    );
    expect(mockOnHide).toHaveBeenCalledTimes(0);
    userEvent.click(getByText('Cancel'));
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
