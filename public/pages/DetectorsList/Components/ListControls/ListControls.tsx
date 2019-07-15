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

import {
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPagination,
} from '@elastic/eui';
import React from 'react';

interface ListControlsProps {
  activePage: number;
  pageCount: number;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageClick: (pageNumber: number) => void;
}
export const ListControls = (props: ListControlsProps) => (
  <EuiFlexGroup>
    <EuiFlexItem>
      <EuiFieldSearch
        fullWidth={true}
        value={props.search}
        placeholder="Search"
        onChange={props.onSearchChange}
        data-test-subj="detectorListSearch"
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
