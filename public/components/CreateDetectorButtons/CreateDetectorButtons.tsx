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

import { EuiFlexGroup, EuiFlexItem, EuiButton } from '@elastic/eui';
import React from 'react';
import { APP_PATH, PLUGIN_NAME } from '../../utils/constants';

export const CreateDetectorButtons = () => {
  return (
    <EuiFlexGroup direction="row" gutterSize="m" justifyContent="center">
      <EuiFlexItem grow={false}>
        <EuiButton
          style={{ width: '200px' }}
          href={`${PLUGIN_NAME}#${APP_PATH.SAMPLE_DETECTORS}`}
          data-test-subj="sampleDetectorButton"
        >
          Try a sample detector
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton
          style={{ width: '200px' }}
          fill
          href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}
          data-test-subj="createDetectorButton"
        >
          Create detector
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
