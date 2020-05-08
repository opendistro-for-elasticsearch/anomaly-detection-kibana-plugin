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
import { DetectorListItem } from '../../../models/interfaces';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import {
  //@ts-ignore
  EuiBasicTable,
} from '@elastic/eui';
import React, { useState, useEffect } from 'react';
import { anomalousDetectorsStaticColumn } from '../utils/utils';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import { MAX_DETECTORS } from '../../../utils/constants';
import { get, orderBy } from 'lodash';

export interface AnomalousDetectorsListProps {
  selectedDetectors: DetectorListItem[];
}

export const AnomalousDetectorsList = (props: AnomalousDetectorsListProps) => {
  const [fieldForSort, setFieldForSort] = useState('name');
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTION.ASC);
  const [indexOfPage, setIndexOfPage] = useState(0);
  const [sizeOfPage, setSizeOfPage] = useState(10);

  const sorting = {
    sort: {
      direction: sortDirection,
      field: fieldForSort,
    },
  };
  const pagination = {
    pageIndex: indexOfPage,
    pageSize: sizeOfPage,
    totalItemCount: Math.min(MAX_DETECTORS, props.selectedDetectors.length),
    pageSizeOptions: [5, 10, 20, 50],
  };

  useEffect(() => {
    setIndexOfPage(0);
  }, [props.selectedDetectors]);

  const handleTableChange = ({ page: tablePage = {}, sort = {} }: any) => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: direction } = sort;
    setIndexOfPage(page);
    setSizeOfPage(size);
    setSortDirection(direction);
    setFieldForSort(sortField);
  };

  const getOrderedDetectorsForPage = (
    selectedDetectors: DetectorListItem[],
    pageIdx: number,
    sizePerPage: number,
    directionForSort: SORT_DIRECTION,
    fieldForSort: string
  ) => {
    const orderedDetectors = orderBy(
      selectedDetectors,
      detector => get(detector, fieldForSort, ''),
      directionForSort
    );
    return orderedDetectors.slice(
      pageIdx * sizePerPage,
      (pageIdx + 1) * sizePerPage
    );
  };

  return (
    <div style={{ height: 'auto' }}>
      <ContentPanel title="Detectors and features" titleSize="s">
        <EuiBasicTable<any>
          items={getOrderedDetectorsForPage(
            props.selectedDetectors,
            indexOfPage,
            sizeOfPage,
            sortDirection,
            fieldForSort
          )}
          columns={anomalousDetectorsStaticColumn}
          tableLayout={'auto'}
          onChange={handleTableChange}
          sorting={sorting}
          pagination={pagination}
          compressed
        />
      </ContentPanel>
    </div>
  );
};
