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
  //@ts-ignore
  EuiBasicTable,
  EuiEmptyPrompt,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiText,
} from '@elastic/eui';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
//@ts-ignore
import chrome from 'ui/chrome';
import {
  Detector,
  DetectorResultsQueryParams,
} from '../../../../server/models/types';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../redux/reducers';
import { getDetectorResults } from '../../../redux/reducers/anomalyResults';
import { BREADCRUMBS } from '../../../utils/constants';
import { ListControls } from '../components/ListControls/ListControls';
import { getURLQueryParams } from '../utils/helpers';
import { staticColumn } from '../utils/tableUtils';

export interface ListRouterParams {
  from: string;
  size: string;
  search: string;
  sortDirection: SORT_DIRECTION;
  sortField: string;
}
interface ListProps extends RouteComponentProps<ListRouterParams> {
  detectorId: string;
  detector: Detector;
}

interface ListState {
  page: number;
  queryParams: DetectorResultsQueryParams;
}
const MAX_ANOMALIES = 10000;

export const AnomaliesList = (props: ListProps) => {
  const dispatch = useDispatch();
  const anomalyResults = useSelector((state: AppState) => state.anomalyResults);
  const isLoading = useSelector(
    (state: AppState) => state.anomalyResults.requesting
  );

  const [state, setState] = useState<ListState>({
    page: 0,
    queryParams: getURLQueryParams(props.location),
  });

  // Set Breadcrumbs and initial queryParams
  useEffect(() => {
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DASHBOARD,
      { text: props.detector.name || '' },
      BREADCRUMBS.ANOMALY_RESULTS,
    ]);
  });

  // Refresh data if user change any parameters / filter / sort
  useEffect(
    () => {
      const { history, location } = props;
      const updatedParams = {
        ...state.queryParams,
        from: state.page * state.queryParams.size,
      };
      dispatch(getDetectorResults(props.detectorId, updatedParams));
      history.replace({
        ...location,
        search: queryString.stringify(updatedParams),
      });
    },
    [
      state.page,
      state.queryParams.size,
      state.queryParams.sortDirection,
      state.queryParams.sortField,
    ]
  );

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
    totalItemCount: Math.min(MAX_ANOMALIES, anomalyResults.total),
    pageSizeOptions: [5, 10, 20, 50],
  };
  return (
    <EuiPage>
      <EuiPageBody>
        <ContentPanel title="Anomaly results" titleSize="s">
          <ListControls
            activePage={state.page}
            pageCount={
              Math.ceil(anomalyResults.total / state.queryParams.size) || 1
            }
            onPageClick={handlePageChange}
          />
          <EuiHorizontalRule margin="xs" />
          <EuiBasicTable
            items={anomalyResults.anomalies}
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
                      <p>
                        There are no anomalies currently. Ensure you've created
                        monitor for detector.
                      </p>
                    </EuiText>
                  }
                />
              )
            }
          />
        </ContentPanel>
      </EuiPageBody>
    </EuiPage>
  );
};
