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

import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiText,
  EuiRadioGroup,
} from '@elastic/eui';
import React from 'react';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { ConfirmModal } from '../../../DetectorDetail/components/ConfirmModal/ConfirmModal';
import { SAVE_FEATURE_OPTIONS } from '../../utils/constants';

interface SaveFeaturesConfirmModalProps {
  readyToStartAdJob: boolean;
  saveFeatureOption: SAVE_FEATURE_OPTIONS;
  onClose(): void;
  onCancel(): void;
  onConfirm(): void;
  onOptionChange(id: string): void;
}

export function SaveFeaturesConfirmModal(props: SaveFeaturesConfirmModalProps) {
  const startAdJobOptions = (disableStartAdJob: boolean) => {
    return [
      {
        id: SAVE_FEATURE_OPTIONS.START_AD_JOB,
        label: 'Automatically start detector (Recommended)',
        disabled: disableStartAdJob,
      },
      {
        id: SAVE_FEATURE_OPTIONS.KEEP_AD_JOB_STOPPED,
        label: 'Manually start the detector at a later time',
      },
    ];
  };

  const confirmModalDescription = () => (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiText>
          <p>
            The detector is currently stopped. To find accurate and real-time
            anomalies, the detector needs to collect sufficient data to include
            your latest change. The earlier you start the detector, the sooner
            the anomalies will be available.
          </p>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiRadioGroup
          name="start ad radio group"
          options={startAdJobOptions(!props.readyToStartAdJob)}
          idSelected={props.saveFeatureOption}
          onChange={props.onOptionChange}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  return (
    <ConfirmModal
      title="Automatically start the detector?"
      description={confirmModalDescription()}
      confirmButtonText="Confirm"
      confirmButtonColor="primary"
      onClose={props.onClose}
      onCancel={props.onCancel}
      onConfirm={props.onConfirm}
    />
  );
}
