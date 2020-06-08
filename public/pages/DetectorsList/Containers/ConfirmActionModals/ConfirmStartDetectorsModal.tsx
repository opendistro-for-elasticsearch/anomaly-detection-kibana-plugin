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
  EuiOverlayMask,
  EuiCallOut,
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalHeader,
  EuiModalFooter,
  EuiModalBody,
  EuiModalHeaderTitle,
  EuiLoadingSpinner,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { DetectorListItem } from '../../../../models/interfaces';
import { EuiSpacer } from '@elastic/eui';
import { getNamesGrid } from './utils/helpers';

interface ConfirmStartDetectorsModalProps {
  detectors: DetectorListItem[];
  hideModal(): void;
  onStartDetectors(): void;
  isListLoading: boolean;
}

export const ConfirmStartDetectorsModal = (
  props: ConfirmStartDetectorsModalProps
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.hideModal}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            {'Are you sure you want to start the selected detectors?'}&nbsp;
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiCallOut
            title="The following detectors will begin initializing:"
            color="success"
            iconType="play"
          ></EuiCallOut>
          <EuiSpacer size="m" />
          <div>
            {props.isListLoading ? (
              <EuiLoadingSpinner size="xl" />
            ) : (
              getNamesGrid(props.detectors)
            )}
          </div>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButtonEmpty
            data-test-subj="cancelButton"
            onClick={props.hideModal}
          >
            Cancel
          </EuiButtonEmpty>
          <EuiButton
            data-test-subj="confirmButton"
            color="primary"
            fill
            isLoading={isLoading || props.isListLoading}
            onClick={async () => {
              setIsLoading(true);
              props.onStartDetectors();
              props.hideModal();
            }}
          >
            {'Start detectors'}
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};
