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
import { render, fireEvent, wait } from '@testing-library/react';
import { ConfirmStopDetectorsModal } from '../ConfirmStopDetectorsModal';
import { DetectorListItem, Monitor } from '../../../../../models/interfaces';

const testDetectors = [
  {
    id: 'detector-id-0',
    name: 'detector-0',
  },
  {
    id: 'detector-id-1',
    name: 'detector-1',
  },
] as DetectorListItem[];

let testMonitor = {} as { [key: string]: Monitor };
//@ts-ignore
testMonitor['detector-id-0'] = {
  id: 'monitor-id-0',
  name: 'monitor-0',
};

const defaultStopProps = {
  detectors: testDetectors,
  monitors: {},
  onHide: jest.fn(),
  onConfirm: jest.fn(),
  onStopDetectors: jest.fn(),
  isListLoading: false,
};

describe('<ConfirmStopDetectorsModal /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('ConfirmStopDetectorsModal', () => {
    test('renders modal with detectors and no monitors', async () => {
      const { getByText, getAllByText } = render(
        <ConfirmStopDetectorsModal {...defaultStopProps} />
      );
      getByText('Are you sure you want to stop the selected detectors?');
      getByText('Stop detectors');
      getByText('detector-0');
      getByText('detector-1');
      expect(getAllByText('-')).toHaveLength(2);
    });
    test('renders modal with detectors and 1 monitor', async () => {
      console.error = jest.fn();
      const { getByText } = render(
        <ConfirmStopDetectorsModal
          {...defaultStopProps}
          monitors={testMonitor}
        />
      );
      getByText('Are you sure you want to stop the selected detectors?');
      getByText(
        'The monitors associated with these detectors will not receive any anomaly results.'
      );
      getByText('Stop detectors');
      getByText('detector-0');
      getByText('detector-1');
      getByText('monitor-0');
      getByText('-');
    });
    test('should call onStopDetectors() when confirming', async () => {
      const { getByTestId } = render(
        <ConfirmStopDetectorsModal {...defaultStopProps} />
      );
      fireEvent.click(getByTestId('confirmButton'));
      await wait();
      expect(defaultStopProps.onStopDetectors).toHaveBeenCalled();
    });
    test.skip('should call onHide() when closing', async () => {
      const { getByTestId } = render(
        <ConfirmStopDetectorsModal {...defaultStopProps} />
      );
      fireEvent.click(getByTestId('cancelButton'));
      await wait();
      expect(defaultStopProps.onHide).toHaveBeenCalled();
    });
  });
});
