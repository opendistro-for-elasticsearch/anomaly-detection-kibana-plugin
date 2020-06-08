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

import { EuiButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';
import React from 'react';
import { APP_PATH, PLUGIN_NAME } from '../../../../utils/constants';

const filterText =
  'There are no detectors matching your applied filters. Reset your filters to view all detectors.';
const emptyText =
  'Anomaly detectors take an input of information and discover patterns of anomalies. Create an anomaly detector to get started.';

interface EmptyDetectorProps {
  isFilterApplied: boolean;
  onResetFilters: () => void;
}

export const EmptyDetectorMessage = (props: EmptyDetectorProps) => (
  <EuiEmptyPrompt
    style={{ maxWidth: '45em' }}
    body={
      <EuiText>
        <p>{props.isFilterApplied ? filterText : emptyText}</p>
      </EuiText>
    }
    actions={
      props.isFilterApplied ? (
        <EuiButton
          fill
          onClick={props.onResetFilters}
          data-test-subj="reset_list_filters"
        >
          Reset filters
        </EuiButton>
      ) : (
        <EuiButton
          fill
          href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}
          data-test-subj="add_detector"
        >
          Create detector
        </EuiButton>
      )
    }
  />
);
