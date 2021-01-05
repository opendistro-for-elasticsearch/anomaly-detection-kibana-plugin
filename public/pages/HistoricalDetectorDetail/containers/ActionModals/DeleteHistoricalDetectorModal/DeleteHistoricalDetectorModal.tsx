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

import React, { useState, Fragment } from 'react';
import {
  EuiText,
  EuiOverlayMask,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiCallOut,
} from '@elastic/eui';
import { Detector } from '../../../../../models/interfaces';
import { ConfirmModal } from '../../../../DetectorDetail/components/ConfirmModal/ConfirmModal';
import { DETECTOR_STATE } from '../../../../../../server/utils/constants';

interface DeleteHistoricalDetectorModalProps {
  detector: Detector;
  isStoppingDetector: boolean;
  onHide(): void;
  onStopDetectorForDeleting(): void;
}

export const DeleteHistoricalDetectorModal = (
  props: DeleteHistoricalDetectorModalProps
) => {
  const [deleteTyped, setDeleteTyped] = useState<boolean>(false);

  const detectorIsRunningCallout =
    props.detector?.curState === DETECTOR_STATE.INIT ||
    props.detector?.curState === DETECTOR_STATE.RUNNING ? (
      <EuiCallOut
        title="The historical detector is running. Are you sure you want to proceed?"
        color="warning"
        iconType="alert"
      ></EuiCallOut>
    ) : null;

  return (
    <EuiOverlayMask>
      <ConfirmModal
        title="Delete historical detector?"
        description={
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiText>
                <p>
                  The historical detector and its configuration will be
                  permanently removed. This action is irreversible. To confirm
                  deletion, type <i>delete</i> in the field.
                </p>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={true}>
              <EuiFieldText
                fullWidth={true}
                placeholder="delete"
                onChange={(e) => {
                  if (e.target.value === 'delete') {
                    setDeleteTyped(true);
                  } else {
                    setDeleteTyped(false);
                  }
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        callout={<Fragment>{detectorIsRunningCallout}</Fragment>}
        confirmButtonText={
          props.detector?.curState === DETECTOR_STATE.INIT ||
          props.detector?.curState === DETECTOR_STATE.RUNNING
            ? 'Stop and delete'
            : props.isStoppingDetector
            ? 'Stopping the detector first'
            : 'Delete'
        }
        confirmButtonColor="danger"
        confirmButtonDisabled={!deleteTyped}
        confirmButtonIsLoading={props.isStoppingDetector}
        onClose={props.onHide}
        onCancel={props.onHide}
        onConfirm={() => props.onStopDetectorForDeleting()}
      />
    </EuiOverlayMask>
  );
};
