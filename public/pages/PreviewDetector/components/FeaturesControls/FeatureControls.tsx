/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { PLUGIN_NAME } from '../../../../utils/constants';
import {
  getAlertingCreateMonitorLink,
  getAlertingMonitorListLink,
} from '../../../../utils/utils';
import { EuiHorizontalRule } from '@elastic/eui';

interface FeatureControls {
  onCreateFeature(event: React.MouseEvent<HTMLButtonElement>): void;
  onDelete(): void;
  onAdjustModel(event: React.MouseEvent<HTMLButtonElement>): void;
  detectorId: string;
  detectorName: string;
}
export const FeatureControls = (props: FeatureControls) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem grow={false}>
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
              key="edit"
              data-test-subj="editDetector"
              href={`${PLUGIN_NAME}#/detectors/${props.detectorId}/edit`}
            >
              Edit detector
            </EuiContextMenuItem>
            <EuiContextMenuItem
              key="deleteDetector"
              data-test-subj="deleteDetector"
              onClick={props.onDelete}
            >
              Delete detector
            </EuiContextMenuItem>
            <EuiContextMenuItem
              key="separator"
              data-test-subj="separator"
              style={{ padding: '0px' }}
            >
              <EuiHorizontalRule margin="none" size="full" />
            </EuiContextMenuItem>
            <EuiContextMenuItem
              key="createMonitorLink"
              data-test-subj="createMonitorLink"
              href={`${getAlertingCreateMonitorLink(
                props.detectorId,
                props.detectorName
              )}`}
              target="_blank"
              icon="link"
            >
              Create monitor
            </EuiContextMenuItem>
            <EuiContextMenuItem
              key="viewMonitor"
              data-test-subj="viewMonitor"
              href={`${getAlertingMonitorListLink()}?search=${
                props.detectorName
              }`}
              target="_blank"
              icon="link"
            >
              View monitor
            </EuiContextMenuItem>
          </EuiContextMenuPanel>
        </EuiPopover>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton data-test-subj="adjustModel" onClick={props.onAdjustModel}>
          Adjust model
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton
          fill
          data-test-subj="createButton"
          onClick={props.onCreateFeature}
        >
          Add feature
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
