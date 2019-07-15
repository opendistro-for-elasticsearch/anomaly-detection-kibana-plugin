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

import { EuiButton } from '@elastic/eui';
import React from 'react';
import { EMPTY_UI_FILTER } from '../../containers/utils/constant';

interface AddFilterButtonProps {
  unshift: ({}) => void;
}
export function AddFilterButton(props: AddFilterButtonProps) {
  return (
    <EuiButton onClick={() => props.unshift(EMPTY_UI_FILTER)}>
      Add filter
    </EuiButton>
  );
}
