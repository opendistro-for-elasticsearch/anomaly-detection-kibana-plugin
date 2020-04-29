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

import React, { useState } from 'react';
import {
  EuiButton,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
} from '@elastic/eui';
import { Detector } from '../../../../models/interfaces';

interface DetectorControls {
  onEditDetector(): void;
  onEditFeatures(): void;
  onDelete(): void;
  onStartDetector(): void;
  onStopDetector(): void;
  detector: Detector;
}
export const DetectorControls = (props: DetectorControls) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem grow={false} style={{ marginRight: '16px' }}>
        <EuiPopover
          id="actionsPopover"
          button={
            <EuiButton
              iconType="arrowDown"
              iconSide="right"
              data-test-subj="actionsButton"
              onClick={() => setIsOpen(!isOpen)}
            >
              Actions
            </EuiButton>
          }
          panelPaddingSize="none"
          anchorPosition="downLeft"
          isOpen={isOpen}
          closePopover={() => setIsOpen(false)}
        >
          <EuiContextMenuPanel>
            <EuiContextMenuItem
              key="editDetector"
              data-test-subj="editDetector"
              onClick={props.onEditDetector}
            >
              Edit detector
            </EuiContextMenuItem>

            <EuiContextMenuItem
              key="editFeatures"
              data-test-subj="editFeature"
              onClick={props.onEditFeatures}
            >
              Edit features
            </EuiContextMenuItem>

            <EuiContextMenuItem
              key="deleteDetector"
              data-test-subj="deleteDetector"
              onClick={props.onDelete}
            >
              Delete detector
            </EuiContextMenuItem>
          </EuiContextMenuPanel>
        </EuiPopover>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ marginLeft: '0px' }}>
        <EuiButton
          data-test-subj="stopDetectorButton"
          onClick={
            props.detector.enabled
              ? props.onStopDetector
              : props.onStartDetector
          }
          iconType={props.detector.enabled ? 'stop' : 'play'}
          disabled={
            !props.detector.featureAttributes ||
            props.detector.featureAttributes.length === 0
          }
        >
          {props.detector.enabled ? 'Stop detector' : 'Start detector'}
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
