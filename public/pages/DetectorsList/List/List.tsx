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
//@ts-ignore
import { EuiBasicTable, EuiButton, EuiComboBoxOptionProps, EuiHorizontalRule, EuiPage, EuiPageBody } from '@elastic/eui';
import { debounce, get, isEmpty } from 'lodash';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
//@ts-ignore
import chrome from 'ui/chrome';
import { CatIndex, GetDetectorsQueryParams, IndexAlias } from '../../../../server/models/types';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../redux/reducers';
import { getDetectorList } from '../../../redux/reducers/ad';
import { getIndices, getPrioritizedIndices } from '../../../redux/reducers/elasticsearch';
import { APP_PATH, PLUGIN_NAME } from '../../../utils/constants';
import { getVisibleOptions, sanitizeSearchText } from '../../utils/helpers';
import { EmptyDetectorMessage } from '../Components/EmptyMessage/EmptyMessage';
import { ListControls } from '../Components/ListControls/ListControls';
import { ALL_DETECTOR_STATES, ALL_INDICES, MAX_DETECTORS, MAX_DISPLAY_LEN } from '../utils/constants';
import { getURLQueryParams } from '../utils/helpers';
import { staticColumn } from '../utils/tableUtils';
import { SideBar } from '../../utils/SideBar';

export interface ListRouterParams {
  from: string;
  size: string;
  search: string;
  indices: string;
  sortDirection: SORT_DIRECTION;
  sortField: string;
}
interface ListProps extends RouteComponentProps<ListRouterParams> {}
interface ListState {
  page: number;
  queryParams: GetDetectorsQueryParams;
  selectedDetectorState: string;
  selectedIndex: string;
}

export const DetectorList = (props: ListProps) => {
  const dispatch = useDispatch();
  const detectors = useSelector((state: AppState) => state.ad.detectorList);
  const totalDetectors = useSelector(
    (state: AppState) => state.ad.totalDetectors
  );
  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );


  const isLoading = useSelector((state: AppState) => state.ad.requesting);

  // Getting all initial indices
  const [indexQuery, setIndexQuery] = useState('');
  useEffect(() => {
    const getInitialIndices = async () => {
      await dispatch(getIndices(indexQuery));
    };
    getInitialIndices();
  }, []);

  // Updating displayed indices (initializing to first 20 for now)
  const visibleIndices = get(elasticsearchState, 'indices', []) as CatIndex[];
  const visibleAliases = get(elasticsearchState, 'aliases', []) as IndexAlias[];
  const indexOptions = getVisibleOptions(visibleIndices, visibleAliases, MAX_DISPLAY_LEN);

  const [state, setState] = useState<ListState>({
    page: 0,
    queryParams: getURLQueryParams(props.location),
    selectedDetectorState: ALL_DETECTOR_STATES,
    selectedIndex: ALL_INDICES
  });

  // Remove breadcrumbs on page initialization
  useEffect(() => {
    chrome.breadcrumbs.set([]);
  }, []);

  // Refresh data if user change any parameters / filter / sort
  useEffect(
    () => {
      const { history, location } = props;
      const updatedParams = {
        ...state.queryParams,
        indices: state.selectedIndex,
        from: state.page * state.queryParams.size,
      };
      dispatch(getDetectorList(updatedParams));
      history.replace({
        ...location,
        search: queryString.stringify(updatedParams),
      });

      // TODO: probably have a helper fn here to filter detectors based on detector state

    },
    [
      state.page,
      state.queryParams.search,
      state.queryParams.indices,
      state.queryParams.size,
      state.queryParams.sortDirection,
      state.queryParams.sortField,
      state.selectedDetectorState,
      state.selectedIndex
    ]
  );

  const handlePageChange = (pageNumber: number) => {
    setState({ ...state, page: pageNumber });
  };

  const handleTableChange = ({ page: tablePage = {}, sort = {} }: any) => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    setState({
      ...state,
      page,
      queryParams: {
        ...state.queryParams,
        size,
        sortField,
        sortDirection,
      },
    });
  };

  // Refresh data is user is typing in the search bar
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

  // Refresh data if user is typing in the index filter
  const handleSearchIndexChange = debounce(async (searchValue: string) => {
    if (searchValue !== indexQuery) {
      const sanitizedQuery = sanitizeSearchText(searchValue);
      setIndexQuery(sanitizedQuery);
      await dispatch(getPrioritizedIndices(sanitizedQuery));
    }
  }, 300);

  // Refresh data if user is selecting a detector state filter
  const handleDetectorStateChange = (options: EuiComboBoxOptionProps[]): void => {
    const newState = options.length > 0 ? options[0].label : ALL_DETECTOR_STATES
    setState(state => ({
      ...state,
      selectedDetectorState: newState
    }));
  }

  // Refresh data if user is selecting an index filter
  const handleIndexChange = (options: EuiComboBoxOptionProps[]): void => {
    const newIndex = options.length > 0 ? options[0].label : ALL_INDICES
    setState({
      ...state,
      selectedIndex: newIndex
    });
  }

  const handleResetFilter = () => {
    setState(state => ({
      ...state,
      queryParams: {
        ...state.queryParams,
        search: '',
        indices: ALL_INDICES,
      },
      selectedDetectorState: ALL_DETECTOR_STATES,
      selectedIndex: ALL_INDICES
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
      <SideBar />
      <EuiPageBody>
        <ContentPanel
          title={"Detectors (" + totalDetectors + ")"}
          titleSize="s"
          actions={[
            <EuiButton 
              fill
              href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}>
              Create detector
            </EuiButton>,
          ]}
        >
          <ListControls
            activePage={state.page}
            pageCount={Math.ceil(totalDetectors / state.queryParams.size) || 1}
            search={state.queryParams.search}
            selectedDetectorState={state.selectedDetectorState}
            selectedIndex={state.selectedIndex}
            indexOptions={indexOptions}
            onDetectorStateChange={handleDetectorStateChange}
            onIndexChange={handleIndexChange}
            onSearchDetectorChange={handleSearchChange}
            onSearchIndexChange={handleSearchIndexChange}
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
