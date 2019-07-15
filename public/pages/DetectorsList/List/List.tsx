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
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
} from '@elastic/eui';
import { isEmpty } from 'lodash';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
//@ts-ignore
import chrome from 'ui/chrome';
import { GetDetectorsQueryParams } from '../../../../server/models/types';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../redux/reducers';
import { getDetectorList } from '../../../redux/reducers/ad';
import { APP_PATH, BREADCRUMBS, PLUGIN_NAME } from '../../../utils/constants';
import { EmptyDetectorMessage } from '../Components/EmptyMessage/EmptyMessage';
import { ListControls } from '../Components/ListControls/ListControls';
import { getURLQueryParams } from '../utils/helpers';
import { staticColumn } from '../utils/tableUtils';

export interface ListRouterParams {
  from: string;
  size: string;
  search: string;
  sortDirection: SORT_DIRECTION;
  sortField: string;
}
interface ListProps extends RouteComponentProps<ListRouterParams> {}
interface ListState {
  page: number;
  queryParams: GetDetectorsQueryParams;
}
const MAX_DETECTORS = 1000;

export const DetectorList = (props: ListProps) => {
  const dispatch = useDispatch();
  const detectors = useSelector((state: AppState) => state.ad.detectorList);
  const totalDetectors = useSelector(
    (state: AppState) => state.ad.totalDetectors
  );
  const isLoading = useSelector((state: AppState) => state.ad.requesting);

  const [state, setState] = useState<ListState>({
    page: 0,
    queryParams: getURLQueryParams(props.location),
  });

  // Set Breadcrumbs and initial queryParams
  useEffect(() => {
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DASHBOARD,
    ]);
  }, []);

  // Refresh data if user change any parameters / filter / sort
  useEffect(
    () => {
      const { history, location } = props;
      const updatedParams = {
        ...state.queryParams,
        from: state.page * state.queryParams.size,
      };
      dispatch(getDetectorList(updatedParams));
      history.replace({
        ...location,
        search: queryString.stringify(updatedParams),
      });
    },
    [
      state.page,
      state.queryParams.search,
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const searchText = e.target.value;
    setState({
      ...state,
      queryParams: {
        ...state.queryParams,
        search: searchText,
      },
    });
  };
  const handleResetFilter = () => {
    setState(state => ({
      ...state,
      queryParams: {
        ...state.queryParams,
        search: '',
      },
    }));
  };

  const sorting = {
    sort: {
      direction: state.queryParams.sortDirection,
      field: state.queryParams.sortField,
    },
  };

  const isFilterApplied = !isEmpty(state.queryParams.search);
  const pagination = {
    pageIndex: state.page,
    pageSize: state.queryParams.size,
    totalItemCount: Math.min(MAX_DETECTORS, totalDetectors),
    pageSizeOptions: [5, 10, 20, 50],
  };
  return (
    <EuiPage>
      <EuiPageBody>
        <ContentPanel
          title="Detectors"
          titleSize="s"
          actions={[
            <EuiButton href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}>
              Create detector
            </EuiButton>,
          ]}
        >
          <ListControls
            activePage={state.page}
            pageCount={Math.ceil(totalDetectors / state.queryParams.size) || 1}
            search={state.queryParams.search}
            onSearchChange={handleSearchChange}
            onPageClick={handlePageChange}
          />
          <EuiHorizontalRule margin="xs" />
          <EuiBasicTable
            items={Object.values(detectors)}
            columns={staticColumn}
            onChange={handleTableChange}
            sorting={sorting}
            pagination={pagination}
            noItemsMessage={
              isLoading ? (
                'Loading detectors...'
              ) : (
                <EmptyDetectorMessage
                  isFilterApplied={isFilterApplied}
                  onResetFilters={handleResetFilter}
                />
              )
            }
          />
        </ContentPanel>
      </EuiPageBody>
    </EuiPage>
  );
};
