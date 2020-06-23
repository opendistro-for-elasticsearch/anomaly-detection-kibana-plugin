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
import { getDetectorStateOptions } from '../../utils/helpers';
import { DETECTOR_STATE } from '../../../../utils/constants';

interface ListFiltersProps {
  activePage: number;
  pageCount: number;
  search: string;
  selectedDetectorStates: DETECTOR_STATE[];
  selectedIndices: string[];
  indexOptions: EuiComboBoxOptionProps[];
  onDetectorStateChange: (options: EuiComboBoxOptionProps[]) => void;
  onIndexChange: (options: EuiComboBoxOptionProps[]) => void;
  onSearchDetectorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchIndexChange: (searchValue: string) => void;
  onPageClick: (pageNumber: number) => void;
}
export const ListFilters = (props: ListFiltersProps) => (
  <EuiFlexGroup gutterSize="s">
    <EuiFlexItem grow={false} style={{ width: '40%' }}>
      <EuiFieldSearch
        fullWidth={true}
        value={props.search}
        placeholder="Search"
        onChange={props.onSearchDetectorChange}
        data-test-subj="detectorListSearch"
      />
    </EuiFlexItem>
    <EuiFlexItem>
      <EuiComboBox
        id="selectedDetectorStates"
        data-test-subj="detectorStateFilter"
        placeholder="All detector states"
        isClearable={true}
        singleSelection={false}
        options={getDetectorStateOptions()}
        onChange={props.onDetectorStateChange}
        selectedOptions={
          props.selectedDetectorStates.length > 0
            ? props.selectedDetectorStates.map(index => ({ label: index }))
            : []
        }
        fullWidth={true}
      />
    </EuiFlexItem>
    <EuiFlexItem>
      <EuiComboBox
        id="selectedIndices"
        data-test-subj="indicesFilter"
        placeholder="All indices"
        isClearable={true}
        singleSelection={false}
        options={props.indexOptions}
        onChange={props.onIndexChange}
        onSearchChange={props.onSearchIndexChange}
        selectedOptions={
          props.selectedIndices.length > 0
            ? props.selectedIndices.map(index => ({ label: index }))
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
          data-test-subj="detectorPageControls"
        />
      </EuiFlexItem>
    ) : null}
  </EuiFlexGroup>
);
