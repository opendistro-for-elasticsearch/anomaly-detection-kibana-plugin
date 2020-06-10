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
  EuiText,
  EuiFieldText,
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
import { Monitor } from '../../../../models/interfaces';
import { DetectorListItem } from '../../../../models/interfaces';
import { Listener } from '../../../../utils/utils';
import { EuiSpacer } from '@elastic/eui';
import {
  getNamesAndMonitorsAndStatesGrid,
  containsEnabledDetectors,
} from './utils/helpers';

interface ConfirmDeleteDetectorsModalProps {
  detectors: DetectorListItem[];
  monitors: { [key: string]: Monitor };
  onHide(): void;
  onConfirm(): void;
  onStopDetectors(listener?: Listener): void;
  onDeleteDetectors(): void;
  isListLoading: boolean;
}

export const ConfirmDeleteDetectorsModal = (
  props: ConfirmDeleteDetectorsModalProps
) => {
  const containsEnabled = containsEnabledDetectors(props.detectors);
  const [deleteTyped, setDeleteTyped] = useState<boolean>(false);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const isLoading = isModalLoading || props.isListLoading;
  return (
    <EuiOverlayMask>
      <EuiModal onClose={props.onHide}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            {'Are you sure you want to delete the selected detectors?'}&nbsp;
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiCallOut
            title="The following detectors and feature configurations will be permanently removed. Any associated monitors will
              not be able to receive any anomaly results to generate alerts."
            color="warning"
            iconType="alert"
          ></EuiCallOut>
          {containsEnabled ? (
            <div>
              <EuiSpacer size="s" />
              <EuiCallOut
                title="Some of the selected detectors are currently running."
                color="warning"
                iconType="alert"
              ></EuiCallOut>
            </div>
          ) : null}

          <EuiSpacer size="s" />
          <EuiText>
            <p>
              To confirm deletion, type <i>delete</i> in the field.
            </p>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiFieldText
            fullWidth={true}
            placeholder="delete"
            onChange={e => {
              if (e.target.value === 'delete') {
                setDeleteTyped(true);
              } else {
                setDeleteTyped(false);
              }
            }}
          />
          <EuiSpacer size="m" />
          <div>
            {isLoading ? (
              <EuiLoadingSpinner size="xl" />
            ) : (
              getNamesAndMonitorsAndStatesGrid(props.detectors, props.monitors)
            )}
          </div>
        </EuiModalBody>
        <EuiModalFooter>
          {isLoading ? null : (
          <EuiButtonEmpty
            data-test-subj="cancelButton"
            onClick={props.onHide}
          >
            Cancel
          </EuiButtonEmpty>
          )}
          <EuiButton
            data-test-subj="confirmButton"
            color="danger"
            disabled={!deleteTyped}
            fill
            isLoading={isLoading}
            onClick={async () => {
              setIsModalLoading(true);
              if (containsEnabled) {
                const listener: Listener = {
                  onSuccess: () => {
                    props.onDeleteDetectors();
                    props.onConfirm();
                  },
                  onException: props.onConfirm,
                };
                props.onStopDetectors(listener);
              } else {
                props.onDeleteDetectors();
                props.onConfirm();
              }
            }}
          >
            {'Delete detectors'}
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};
