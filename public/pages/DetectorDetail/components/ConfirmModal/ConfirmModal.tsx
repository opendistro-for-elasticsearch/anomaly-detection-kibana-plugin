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
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiSpacer,
  EuiText,
  EuiButtonEmpty,
  EuiButton,
  ButtonColor,
} from '@elastic/eui';

interface ConfirmModalProps {
  title: string;
  description: string | React.ReactNode;
  callout?: any;
  confirmButtonText: string;
  confirmButtonColor: ButtonColor;
  confirmButtonDisabled?: boolean;
  onClose(): void;
  onCancel(): void;
  onConfirm(): void;
}

export const ConfirmModal = (props: ConfirmModalProps) => {
  return (
    <EuiModal onClose={props.onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>{props.title}&nbsp;</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup direction="column">
          {props.callout ? (
            <EuiFlexItem grow={false}>{props.callout}</EuiFlexItem>
          ) : null}
          <EuiFlexItem grow={false}>
            {typeof props.description === 'string' ? (
              <EuiText>
                <p>{props.description}</p>
              </EuiText>
            ) : (
              <React.Fragment>{props.description}</React.Fragment>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="cancelButton" onClick={props.onCancel}>
          Cancel
        </EuiButtonEmpty>

        <EuiButton
          data-test-subj="confirmButton"
          color={props.confirmButtonColor}
          fill
          onClick={props.onConfirm}
          disabled={!!props.confirmButtonDisabled}
        >
          {props.confirmButtonText}
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
