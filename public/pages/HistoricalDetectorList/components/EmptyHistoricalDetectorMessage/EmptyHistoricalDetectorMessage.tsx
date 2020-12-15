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

import { EuiButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';
import React from 'react';
import { APP_PATH, PLUGIN_NAME } from '../../../../utils/constants';

const FILTER_TEXT =
  'There are no historical detectors matching your applied filters. Reset your filters to view all historical detectors.';
const EMPTY_TEXT =
  'Use historical detectors to detect anomalies on a selected time range of your historic data.';

interface EmptyHistoricalDetectorMessageProps {
  isFilterApplied: boolean;
  onResetFilters: () => void;
}

export const EmptyHistoricalDetectorMessage = (
  props: EmptyHistoricalDetectorMessageProps
) => (
  <EuiEmptyPrompt
    style={{ maxWidth: '45em' }}
    body={
      <EuiText>
        <p>{props.isFilterApplied ? FILTER_TEXT : EMPTY_TEXT}</p>
      </EuiText>
    }
    actions={
      props.isFilterApplied ? (
        <EuiButton
          fill
          onClick={props.onResetFilters}
          data-test-subj="resetHistoricalDetectorListFilters"
        >
          Reset filters
        </EuiButton>
      ) : (
        <EuiButton
          style={{ width: '225px' }}
          fill
          href={`${PLUGIN_NAME}#${APP_PATH.CREATE_HISTORICAL_DETECTOR}`}
          data-test-subj="createHistoricalDetectorButton"
        >
          Create historical detector
        </EuiButton>
      )
    }
  />
);
