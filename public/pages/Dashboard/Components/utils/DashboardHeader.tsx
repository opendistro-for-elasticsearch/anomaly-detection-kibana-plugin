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
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageHeader,
  EuiTitle,
} from '@elastic/eui';
import { PLUGIN_NAME, APP_PATH } from '../../../../utils/constants';
export interface DashboardHeaderProps {
  hasDetectors: boolean;
}

export const DashboardHeader = (props: DashboardHeaderProps) => {
  return (
    <EuiPageHeader>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiTitle size="l">
            <h1>Dashboard</h1>
          </EuiTitle>
        </EuiFlexItem>
        {props.hasDetectors ? (
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}
              data-test-subj="add_detector"
            >
              Create detector
            </EuiButton>
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    </EuiPageHeader>
  );
};
