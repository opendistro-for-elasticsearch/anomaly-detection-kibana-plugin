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
import {
  ConfirmStartDetectorsModal,
  ConfirmStopDetectorsModal,
  ConfirmDeleteDetectorsModal,
} from '../ConfirmActionModals';
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
testMonitor['detector-id-0'] = [
  {
    id: 'monitor-id-0',
    name: 'monitor-0',
  },
];

const defaultStartProps = {
  detectors: testDetectors,
  hideModal: jest.fn(),
  onStartDetectors: jest.fn(),
  isListLoading: false,
};

const defaultStopProps = {
  detectors: testDetectors,
  monitors: {},
  hideModal: jest.fn(),
  onStopDetectors: jest.fn(),
  isListLoading: false,
};

const defaultDeleteProps = {
  detectors: testDetectors,
  monitors: {},
  hideModal: jest.fn(),
  onStopDetectors: jest.fn(),
  onDeleteDetectors: jest.fn(),
  isListLoading: false,
};

describe('<ConfirmStartDetectorsModal /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('ConfirmStartDetectorsModal', () => {
    test('renders modal with detectors', async () => {
      const { getByText } = render(
        <ConfirmStartDetectorsModal {...defaultStartProps} />
      );
      getByText('Are you sure you want to start the selected detectors?');
      getByText('Start detectors');
      getByText('detector-0');
      getByText('detector-1');
    });
    test('should call onStartDetectors() when confirming', async () => {
      const { getByTestId } = render(
        <ConfirmStartDetectorsModal {...defaultStartProps} />
      );
      fireEvent.click(getByTestId('confirmButton'));
      await wait();
      expect(defaultStartProps.onStartDetectors).toHaveBeenCalled();
    });
    test('should call hideModal() when closing', async () => {
      const { getByTestId } = render(
        <ConfirmStartDetectorsModal {...defaultStartProps} />
      );
      fireEvent.click(getByTestId('cancelButton'));
      await wait();
      expect(defaultStartProps.hideModal).toHaveBeenCalled();
    });
  });
});

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
    test('should call hideModal() when closing', async () => {
      const { getByTestId } = render(
        <ConfirmStopDetectorsModal {...defaultStopProps} />
      );
      fireEvent.click(getByTestId('cancelButton'));
      await wait();
      expect(defaultStopProps.hideModal).toHaveBeenCalled();
    });
  });
});

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
      getByText('detector-0');
      getByText('detector-1');
      expect(getAllByText('-')).toHaveLength(2);
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
      getByText('Delete detectors');
      getByText('detector-0');
      getByText('detector-1');
      getByText('monitor-0');
      getByText('-');
    });
    test('should have delete button disabled if delete not typed', async () => {
      const { getByTestId, getByPlaceholderText } = render(
        <ConfirmDeleteDetectorsModal {...defaultDeleteProps} />
      );
      userEvent.type(getByPlaceholderText('delete'), 'foo');
      await wait();
      userEvent.click(getByTestId('confirmButton'));
      await wait();
      expect(defaultDeleteProps.onStopDetectors).not.toHaveBeenCalled();
      expect(defaultDeleteProps.onDeleteDetectors).not.toHaveBeenCalled();
      expect(defaultDeleteProps.hideModal).not.toHaveBeenCalled();
    });
    test('should have delete button enabled if delete typed', async () => {
      const { getByTestId, getByPlaceholderText } = render(
        <ConfirmDeleteDetectorsModal {...defaultDeleteProps} />
      );
      userEvent.type(getByPlaceholderText('delete'), 'delete');
      await wait();
      userEvent.click(getByTestId('confirmButton'));
      await wait();
      expect(defaultDeleteProps.hideModal).toHaveBeenCalled();
    });
    test('should not show running callout if no detectors are running', async () => {
      const { queryByText } = render(
        <ConfirmDeleteDetectorsModal {...defaultDeleteProps} />
      );
      expect(
        queryByText('Some of the selected detectors are currently running')
      ).toBeNull();
    });
    test('should show callout if any detectors are running', async () => {
      const { queryByText } = render(
        <ConfirmDeleteDetectorsModal
          {...defaultDeleteProps}
          detectors={
            [
              {
                id: 'detector-id-0',
                name: 'detector-0',
                curState: DETECTOR_STATE.RUNNING,
              },
              {
                id: 'detector-id-1',
                name: 'detector-1',
              },
            ] as DetectorListItem[]
          }
        />
      );
      expect(
        queryByText('Some of the selected detectors are currently running')
      ).not.toBeNull();
    });
    test('should call hideModal() when closing', async () => {
      const { getByTestId } = render(
        <ConfirmDeleteDetectorsModal {...defaultDeleteProps} />
      );
      fireEvent.click(getByTestId('cancelButton'));
      await wait();
      expect(defaultDeleteProps.hideModal).toHaveBeenCalled();
    });
  });
});
