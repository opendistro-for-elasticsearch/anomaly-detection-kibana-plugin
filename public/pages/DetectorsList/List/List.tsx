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
  EuiComboBoxOptionProps,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
} from '@elastic/eui';
import { debounce, get, isEmpty } from 'lodash';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
//@ts-ignore
import chrome from 'ui/chrome';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import {
  CatIndex,
  GetDetectorsQueryParams,
  IndexAlias,
} from '../../../../server/models/types';
import { DetectorListItem } from '../../../models/interfaces';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../redux/reducers';
import { getDetectorList } from '../../../redux/reducers/ad';
import {
  getIndices,
  getPrioritizedIndices,
} from '../../../redux/reducers/elasticsearch';
import {
  APP_PATH,
  PLUGIN_NAME,
  DETECTOR_STATE,
} from '../../../utils/constants';
import { getVisibleOptions, sanitizeSearchText } from '../../utils/helpers';
import { EmptyDetectorMessage } from '../Components/EmptyMessage/EmptyMessage';
import { ListControls } from '../Components/ListControls/ListControls';
import {
  MAX_DETECTORS,
  MAX_SELECTED_INDICES,
  GET_ALL_DETECTORS_QUERY_PARAMS,
  ALL_DETECTOR_STATES,
  ALL_INDICES,
} from '../../utils/constants';
import { BREADCRUMBS } from '../../../utils/constants';
import { getURLQueryParams } from '../utils/helpers';
import {
  filterAndSortDetectors,
  getDetectorsToDisplay,
} from '../../utils/helpers';
import { staticColumn } from '../utils/tableUtils';
import { getTitleWithCount } from '../../../utils/utils';

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
  selectedDetectorStates: DETECTOR_STATE[];
  selectedIndices: string[];
}

export const DetectorList = (props: ListProps) => {
  const dispatch = useDispatch();
  const allDetectors = useSelector((state: AppState) => state.ad.detectorList);
  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );
  const isRequestingFromES = useSelector(
    (state: AppState) => state.ad.requesting
  );
  const visibleIndices = get(elasticsearchState, 'indices', []) as CatIndex[];
  const visibleAliases = get(elasticsearchState, 'aliases', []) as IndexAlias[];
  const indexOptions = getVisibleOptions(visibleIndices, visibleAliases);
  const fetchDetectorsError = useSelector(
    (state: AppState) => state.ad.errorMessages.getDetectorList
  );

  const [indexQuery, setIndexQuery] = useState('');
  const [selectedDetectors, setSelectedDetectors] = useState(
    [] as DetectorListItem[]
  );
  const [detectorsToDisplay, setDetectorsToDisplay] = useState(
    [] as DetectorListItem[]
  );
  const [isLoadingFinalDetectors, setIsLoadingFinalDetectors] = useState<
    boolean
  >(true);
  const [state, setState] = useState<ListState>({
    page: 0,
    queryParams: getURLQueryParams(props.location),
    selectedDetectorStates: ALL_DETECTOR_STATES,
    selectedIndices: ALL_INDICES,
  });

  // Getting all initial indices
  useEffect(() => {
    const getInitialIndices = async () => {
      await dispatch(getIndices(indexQuery));
    };
    getInitialIndices();
  }, []);

  // Getting all initial detectors
  useEffect(() => {
    const getInitialDetectors = async () => {
      dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
      setIsLoadingFinalDetectors(true);
    };
    getInitialDetectors();
  }, []);

  // Setting initial breadcrumbs
  useEffect(() => {
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
    ]);
  }, []);

  // Refresh data if user change any parameters / filter / sort
  useEffect(() => {
    const { history, location } = props;
    const updatedParams = {
      ...state.queryParams,
      indices: state.selectedIndices.join(' '),
      from: state.page * state.queryParams.size,
    };

    history.replace({
      ...location,
      search: queryString.stringify(updatedParams),
    });

    dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
    setIsLoadingFinalDetectors(true);
  }, [
    state.page,
    state.queryParams,
    state.selectedDetectorStates,
    state.selectedIndices,
  ]);

  // Handle all filtering / sorting of detectors
  useEffect(() => {
    const curSelectedDetectors = filterAndSortDetectors(
      Object.values(allDetectors),
      state.queryParams.search,
      state.selectedIndices,
      state.selectedDetectorStates,
      state.queryParams.sortField,
      state.queryParams.sortDirection
    );
    setSelectedDetectors(curSelectedDetectors);

    const curDetectorsToDisplay = getDetectorsToDisplay(
      curSelectedDetectors,
      state.page,
      state.queryParams.size
    );
    setDetectorsToDisplay(curDetectorsToDisplay);

    setIsLoadingFinalDetectors(false);
  }, [allDetectors]);

  // Notify user if error retrieving list of detectors
  useEffect(() => {
    if (fetchDetectorsError) {
      toastNotifications.addDanger(
        `Unable to retrieve all detectors: ${fetchDetectorsError}`
      );
      setIsLoadingFinalDetectors(false);
    }
  }, [fetchDetectorsError]);

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
  const handleSearchDetectorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const searchText = e.target.value;
    setState({
      ...state,
      page: 0,
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
      setState(state => ({
        ...state,
        page: 0,
      }));
    }
  }, 300);

  // Refresh data if user is selecting a detector state filter
  const handleDetectorStateChange = (
    options: EuiComboBoxOptionProps[]
  ): void => {
    let states: DETECTOR_STATE[];
    states =
      options.length == 0
        ? ALL_DETECTOR_STATES
        : options.map(option => option.label as DETECTOR_STATE);
    setState(state => ({
      ...state,
      page: 0,
      selectedDetectorStates: states,
    }));
  };

  // Refresh data if user is selecting an index filter
  const handleIndexChange = (options: EuiComboBoxOptionProps[]): void => {
    let indices: string[];
    indices =
      options.length == 0
        ? ALL_INDICES
        : options.map(option => option.label).slice(0, MAX_SELECTED_INDICES);

    setState({
      ...state,
      page: 0,
      selectedIndices: indices,
    });
  };

  const handleResetFilter = () => {
    setState(state => ({
      ...state,
      queryParams: {
        ...state.queryParams,
        search: '',
        indices: '',
      },
      selectedDetectorStates: ALL_DETECTOR_STATES,
      selectedIndices: ALL_INDICES,
    }));
  };

  const sorting = {
    sort: {
      direction: state.queryParams.sortDirection,
      field: state.queryParams.sortField,
    },
  };

  const isFilterApplied =
    !isEmpty(state.queryParams.search) ||
    !isEmpty(state.selectedDetectorStates) ||
    !isEmpty(state.selectedIndices);

  const pagination = {
    pageIndex: state.page,
    pageSize: state.queryParams.size,
    totalItemCount: Math.min(MAX_DETECTORS, selectedDetectors.length),
    pageSizeOptions: [5, 10, 20, 50],
  };

  const isLoading = isRequestingFromES || isLoadingFinalDetectors;

  return (
    <EuiPage>
      <EuiPageBody>
        <ContentPanel
          title={
            isLoading
              ? getTitleWithCount('Detectors', '...')
              : getTitleWithCount('Detectors', selectedDetectors.length)
          }
          actions={[
            <EuiButton fill href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}>
              Create detector
            </EuiButton>,
          ]}
        >
          <ListControls
            activePage={state.page}
            pageCount={
              isLoading
                ? 0
                : Math.ceil(
                    selectedDetectors.length / state.queryParams.size
                  ) || 1
            }
            search={state.queryParams.search}
            selectedDetectorStates={state.selectedDetectorStates}
            selectedIndices={state.selectedIndices}
            indexOptions={indexOptions}
            onDetectorStateChange={handleDetectorStateChange}
            onIndexChange={handleIndexChange}
            onSearchDetectorChange={handleSearchDetectorChange}
            onSearchIndexChange={handleSearchIndexChange}
            onPageClick={handlePageChange}
          />
          <EuiHorizontalRule margin="xs" />
          <EuiBasicTable<any>
            items={isLoading ? [] : detectorsToDisplay}
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
