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
  EuiComboBox,
  EuiComboBoxOptionProps,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPagination,
} from '@elastic/eui';
import React from 'react';
import { getHistoricalDetectorStateOptions } from '../../utils/helpers';
import { DETECTOR_STATE } from '../../../../../server/utils/constants';

interface HistoricalDetectorFiltersProps {
  activePage: number;
  pageCount: number;
  search: string;
  selectedDetectorStates: DETECTOR_STATE[];
  onSearchDetectorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDetectorStateChange: (options: EuiComboBoxOptionProps[]) => void;
  onPageClick: (pageNumber: number) => void;
}
export function HistoricalDetectorFilters(
  props: HistoricalDetectorFiltersProps
) {
  return (
    <EuiFlexGroup gutterSize="s">
      <EuiFlexItem grow={false} style={{ width: '70%' }}>
        <EuiFieldSearch
          fullWidth={true}
          value={props.search}
          placeholder="Search"
          onChange={props.onSearchDetectorChange}
          data-test-subj="historicalDetectorListSearch"
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ width: '30%' }}>
        <EuiComboBox
          id="selectedDetectorStates"
          data-test-subj="historicalDetectorStateFilter"
          placeholder="All historical detector states"
          isClearable={true}
          singleSelection={false}
          options={getHistoricalDetectorStateOptions()}
          onChange={props.onDetectorStateChange}
          selectedOptions={
            props.selectedDetectorStates.length > 0
              ? props.selectedDetectorStates.map((state) => ({ label: state }))
              : []
          }
          fullWidth={true}
        />
      </EuiFlexItem>
      {props.pageCount > 1 ? (
        <EuiFlexItem grow={false} style={{ justifyContent: 'center' }}>
          <EuiPagination
            pageCount={props.pageCount}
            activePage={props.activePage}
            onPageClick={props.onPageClick}
            data-test-subj="historicalDetectorListPageControls"
          />
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>
  );
}
