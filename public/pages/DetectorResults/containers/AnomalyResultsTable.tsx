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
  //@ts-ignore
  EuiBasicTable,
  EuiEmptyPrompt,
  EuiText,
} from '@elastic/eui';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
//@ts-ignore
import chrome from 'ui/chrome';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { staticColumn } from '../utils/tableUtils';
import { ListControls } from '../components/ListControls/ListControls';
import { DetectorResultsQueryParams } from 'server/models/types';
import { AnomalyData } from '../../../models/interfaces';
import { getTitleWithCount } from '../../../utils/utils';

interface AnomalyResultsTableProps {
  anomalies: AnomalyData[];
}

interface ListState {
  page: number;
  queryParams: DetectorResultsQueryParams;
}
const MAX_ANOMALIES = 10000;

export function AnomalyResultsTable(props: AnomalyResultsTableProps) {
  const [state, setState] = useState<ListState>({
    page: 0,
    queryParams: {
      from: 0,
      size: 10,
      sortDirection: SORT_DIRECTION.DESC,
      sortField: 'startTime',
    },
  });
  const [targetAnomalies, setTargetAnomalies] = useState<AnomalyData[]>([]);
  const totalAnomalies = props.anomalies
    ? props.anomalies.filter(anomaly => anomaly.anomalyGrade > 0)
    : [];

  const sortFiledCompare = (field: string, sortDirection: SORT_DIRECTION) => {
    return (a: any, b: any) => {
      if (get(a, `${field}`) > get(b, `${field}`))
        return sortDirection === SORT_DIRECTION.ASC ? 1 : -1;
      if (get(a, `${field}`) < get(b, `${field}`))
        return sortDirection === SORT_DIRECTION.ASC ? -1 : 1;
      return 0;
    };
  };

  useEffect(() => {
    const anomalies = props.anomalies
      ? props.anomalies.filter(anomaly => anomaly.anomalyGrade > 0)
      : [];

    anomalies.sort(
      sortFiledCompare(
        state.queryParams.sortField,
        state.queryParams.sortDirection
      )
    );

    setTargetAnomalies(
      anomalies.slice(
        state.page * state.queryParams.size,
        (state.page + 1) * state.queryParams.size
      )
    );
  }, [props.anomalies, state]);

  const isLoading = false;

  const handlePageChange = (pageNumber: number) => {
    setState({ ...state, page: pageNumber });
  };

  const handleTableChange = ({ page: tablePage = {}, sort = {} }: any) => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    setState({
      page,
      queryParams: {
        ...state.queryParams,
        size,
        sortField,
        sortDirection,
      },
    });
  };

  const sorting = {
    sort: {
      direction: state.queryParams.sortDirection,
      field: state.queryParams.sortField,
    },
  };
  const pagination = {
    pageIndex: state.page,
    pageSize: state.queryParams.size,
    totalItemCount: Math.min(MAX_ANOMALIES, totalAnomalies.length),
    pageSizeOptions: [10, 30, 50, 100],
  };
  return (
    <ContentPanel
      title={getTitleWithCount('Anomaly occurrences', totalAnomalies.length)}
      titleSize="xs"
      titleClassName="preview-title"
    >
      <ListControls
        activePage={state.page}
        pageCount={
          Math.ceil(totalAnomalies.length / state.queryParams.size) || 1
        }
        onPageClick={handlePageChange}
      />

      <EuiBasicTable
        items={targetAnomalies}
        columns={staticColumn}
        onChange={handleTableChange}
        sorting={sorting}
        pagination={pagination}
        noItemsMessage={
          isLoading ? (
            'Loading anomaly results...'
          ) : (
            <EuiEmptyPrompt
              style={{ maxWidth: '45em' }}
              body={
                <EuiText>
                  <p>There are no anomalies currently.</p>
                </EuiText>
              }
            />
          )
        }
      />
    </ContentPanel>
  );
}
