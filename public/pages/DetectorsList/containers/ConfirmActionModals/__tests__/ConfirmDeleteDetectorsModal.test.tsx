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
import userEvent from '@testing-library/user-event';
import { ConfirmDeleteDetectorsModal } from '../ConfirmDeleteDetectorsModal';
import { DetectorListItem, Monitor } from '../../../../../models/interfaces';
import { DETECTOR_STATE } from '../../../../../utils/constants';

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

const defaultDeleteProps = {
  detectors: testDetectors,
  monitors: {},
  onHide: jest.fn(),
  onConfirm: jest.fn(),
  onStopDetectors: jest.fn(),
  onDeleteDetectors: jest.fn(),
  isListLoading: false,
};

describe('<ConfirmDeleteDetectorsModal /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('ConfirmDeleteDetectorsModal', () => {
    test('renders modal with detectors and no monitors', async () => {
      const { getByText, getAllByText } = render(
        <ConfirmDeleteDetectorsModal {...defaultDeleteProps} />
      );
      getByText('Are you sure you want to delete the selected detectors?');
      getByText('Delete detectors');
    });
    test('renders modal with detectors and 1 monitor', async () => {
      console.error = jest.fn();
      const { getByText } = render(
        <ConfirmDeleteDetectorsModal
          {...defaultDeleteProps}
          monitors={testMonitor}
        />
      );
      getByText('Are you sure you want to delete the selected detectors?');
      getByText(
        'The monitors associated with these detectors will not receive any anomaly results.'
      );
      getByText('Delete detectors');
    });
    test('should have delete button disabled if delete not typed', async () => {
      const { getByTestId, getByPlaceholderText } = render(
        <ConfirmDeleteDetectorsModal {...defaultDeleteProps} />
      );
      await wait();
      userEvent.type(getByPlaceholderText('delete'), 'foo');
      await wait();
      userEvent.click(getByTestId('confirmButton'));
      await wait();
      expect(defaultDeleteProps.onStopDetectors).not.toHaveBeenCalled();
      expect(defaultDeleteProps.onDeleteDetectors).not.toHaveBeenCalled();
      expect(defaultDeleteProps.onConfirm).not.toHaveBeenCalled();
    }, 10000);
    test('should have delete button enabled if delete typed', async () => {
      const { getByTestId, getByPlaceholderText } = render(
        <ConfirmDeleteDetectorsModal {...defaultDeleteProps} />
      );
      await wait();
      userEvent.type(getByPlaceholderText('delete'), 'delete');
      await wait();
      userEvent.click(getByTestId('confirmButton'));
      await wait();
      expect(defaultDeleteProps.onConfirm).toHaveBeenCalled();
    }, 10000);
    test('should not show callout if no detectors are running', async () => {
      const { queryByText } = render(
        <ConfirmDeleteDetectorsModal {...defaultDeleteProps} />
      );
      expect(
        queryByText('Some of the selected detectors are currently running.')
      ).toBeNull();
    });
    test('should show callout if detectors are running', async () => {
      const { queryByText } = render(
        <ConfirmDeleteDetectorsModal
          {...defaultDeleteProps}
          detectors={
            [
              {
                id: 'detector-id-0',
                name: 'detector-0',
                curState: DETECTOR_STATE.INIT,
              },
              {
                id: 'detector-id-1',
                name: 'detector-1',
                curState: DETECTOR_STATE.RUNNING,
              },
              {
                id: 'detector-id-2',
                name: 'detector-2',
              },
            ] as DetectorListItem[]
          }
        />
      );
      await wait();
      expect(
        queryByText('Some of the selected detectors are currently running.')
      ).not.toBeNull();
    });
    test('should call onHide() when closing', async () => {
      const { getByTestId } = render(
        <ConfirmDeleteDetectorsModal {...defaultDeleteProps} />
      );
      await wait();
      fireEvent.click(getByTestId('cancelButton'));
      await wait();
      expect(defaultDeleteProps.onHide).toHaveBeenCalled();
    });
    test('should call onStopDetectors when deleting running detectors', async () => {
      const { getByTestId, getByPlaceholderText } = render(
        <ConfirmDeleteDetectorsModal
          {...defaultDeleteProps}
          detectors={
            [
              {
                id: 'detector-id-0',
                name: 'detector-0',
                curState: DETECTOR_STATE.INIT,
              },
            ] as DetectorListItem[]
          }
        />
      );
      // Try clicking before 'delete' has been typed
      await wait();
      userEvent.click(getByTestId('confirmButton'));
      await wait();
      expect(defaultDeleteProps.onStopDetectors).not.toHaveBeenCalled();
      userEvent.type(getByPlaceholderText('delete'), 'delete');
      await wait();
      userEvent.click(getByTestId('confirmButton'));
      await wait();
      expect(defaultDeleteProps.onStopDetectors).toHaveBeenCalled();
    });
  });
});
