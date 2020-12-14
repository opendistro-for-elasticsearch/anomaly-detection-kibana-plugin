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
  EuiButton,
  EuiComboBoxOptionProps,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiSpacer,
} from '@elastic/eui';
import { isEmpty } from 'lodash';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { HistoricalDetectorListItem } from '../../../models/interfaces';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../redux/reducers';
import { getHistoricalDetectorList } from '../../../redux/reducers/ad';
import {
  BREADCRUMBS,
  APP_PATH,
  PLUGIN_NAME,
  MAX_DETECTORS,
} from '../../../utils/constants';
import { DETECTOR_STATE } from '../../../../server/utils/constants';
import { getTitleWithCount } from '../../../utils/utils';
import { ALL_DETECTOR_STATES } from '../../utils/constants';
import { getURLQueryParams } from '../utils/helpers';
import {
  filterAndSortHistoricalDetectors,
  getHistoricalDetectorsToDisplay,
} from '../../utils/helpers';
import { EmptyHistoricalDetectorMessage } from '../components/EmptyHistoricalDetectorMessage/EmptyHistoricalDetectorMessage';
import { historicalDetectorListColumns } from '../utils/constants';
import { HistoricalDetectorFilters } from '../components/HistoricalDetectorFilters/HistoricalDetectorFilters';
import { GET_ALL_DETECTORS_QUERY_PARAMS } from '../../utils/constants';
import { CoreStart } from '../../../../../../src/core/public';
import { CoreServicesContext } from '../../../components/CoreServices/CoreServices';
import {
  NO_PERMISSIONS_KEY_WORD,
  prettifyErrorMessage,
} from '../../../../server/utils/helpers';

export interface HistoricalDetectorListRouterParams {
  from: string;
  size: string;
  search: string;
  sortDirection: SORT_DIRECTION;
  sortField: string;
}
interface HistoricalDetectorListProps
  extends RouteComponentProps<HistoricalDetectorListRouterParams> {}
interface HistoricalDetectorListState {
  page: number;
  queryParams: any;
  selectedDetectorStates: DETECTOR_STATE[];
}

export function HistoricalDetectorList(props: HistoricalDetectorListProps) {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  const dispatch = useDispatch();

  // get historical detector store
  const adState = useSelector((state: AppState) => state.ad);
  const allDetectors = adState.historicalDetectorList;
  const errorGettingDetectors = adState.errorMessage;
  const isRequestingDetectors = adState.requesting;

  const [selectedDetectors, setSelectedDetectors] = useState(
    [] as HistoricalDetectorListItem[]
  );
  const [detectorsToDisplay, setDetectorsToDisplay] = useState(
    [] as HistoricalDetectorListItem[]
  );
  const [isLoadingFinalDetectors, setIsLoadingFinalDetectors] = useState<
    boolean
  >(true);

  // if loading detectors or sorting/filtering: set whole page in loading state
  const isLoading = isRequestingDetectors || isLoadingFinalDetectors;

  const [state, setState] = useState<HistoricalDetectorListState>({
    page: 0,
    queryParams: getURLQueryParams(props.location),
    selectedDetectorStates: ALL_DETECTOR_STATES,
  });

  // Set breadcrumbs on page initialization
  useEffect(() => {
    core.chrome.setBreadcrumbs([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.HISTORICAL_DETECTORS,
    ]);
  }, []);

  useEffect(() => {
    if (errorGettingDetectors) {
      console.error(errorGettingDetectors);
      core.notifications.toasts.addDanger(
        typeof errorGettingDetectors === 'string' &&
          errorGettingDetectors.includes(NO_PERMISSIONS_KEY_WORD)
          ? prettifyErrorMessage(errorGettingDetectors)
          : 'Unable to get all detectors'
      );
      setIsLoadingFinalDetectors(false);
    }
  }, [errorGettingDetectors]);

  // Refresh data if user change any parameters / filter / sort
  useEffect(() => {
    const { history, location } = props;
    const updatedParams = {
      ...state.queryParams,
      from: state.page * state.queryParams.size,
    };

    history.replace({
      ...location,
      search: queryString.stringify(updatedParams),
    });

    setIsLoadingFinalDetectors(true);
    getUpdatedDetectors();
  }, [state.page, state.queryParams, state.selectedDetectorStates]);

  // Handle all filtering / sorting of historical detectors
  useEffect(() => {
    const curSelectedDetectors = filterAndSortHistoricalDetectors(
      Object.values(allDetectors),
      state.queryParams.search,
      state.selectedDetectorStates,
      state.queryParams.sortField,
      state.queryParams.sortDirection
    );
    setSelectedDetectors(curSelectedDetectors);

    const detectorsToDisplay = getHistoricalDetectorsToDisplay(
      curSelectedDetectors,
      state.page,
      state.queryParams.size
    );

    setDetectorsToDisplay(detectorsToDisplay);

    if (!isRequestingDetectors) {
      setIsLoadingFinalDetectors(false);
    }
  }, [allDetectors]);

  const getUpdatedDetectors = async () => {
    dispatch(getHistoricalDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
  };

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

  // Refresh data if user is selecting a historical detector state filter
  const handleDetectorStateChange = (
    options: EuiComboBoxOptionProps[]
  ): void => {
    let states: DETECTOR_STATE[];
    states =
      options.length == 0
        ? ALL_DETECTOR_STATES
        : options.map((option) => option.label as DETECTOR_STATE);
    setState((state) => ({
      ...state,
      page: 0,
      selectedDetectorStates: states,
    }));
  };

  const handleResetFilter = () => {
    setState((state) => ({
      ...state,
      queryParams: {
        ...state.queryParams,
        search: '',
      },
      selectedDetectorStates: ALL_DETECTOR_STATES,
    }));
  };

  const getItemId = (item: any) => {
    return `${item.id}-${item.currentTime}`;
  };

  const sorting = {
    sort: {
      direction: state.queryParams.sortDirection,
      field: state.queryParams.sortField,
    },
  };

  const isFilterApplied =
    !isEmpty(state.queryParams.search) ||
    !isEmpty(state.selectedDetectorStates);

  const pagination = {
    pageIndex: state.page,
    pageSize: state.queryParams.size,
    totalItemCount: Math.min(MAX_DETECTORS, selectedDetectors.length),
    pageSizeOptions: [5, 10, 20, 50],
  };

  return (
    <EuiPage>
      <EuiPageBody>
        <ContentPanel
          title={
            isLoading
              ? getTitleWithCount('Historical detectors', '...')
              : getTitleWithCount(
                  'Historical detectors',
                  selectedDetectors.length
                )
          }
          actions={[
            <EuiButton
              style={{ width: '225px' }}
              data-test-subj="createDetectorButton"
              fill
              href={`${PLUGIN_NAME}#${APP_PATH.CREATE_HISTORICAL_DETECTOR}`}
            >
              Create historical detector
            </EuiButton>,
          ]}
        >
          {/* {getActionModal()} */}
          <HistoricalDetectorFilters
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
            onDetectorStateChange={handleDetectorStateChange}
            onSearchDetectorChange={handleSearchDetectorChange}
            onPageClick={handlePageChange}
          />
          <EuiSpacer size="s" />
          <EuiHorizontalRule margin="s" style={{ marginBottom: '0px' }} />
          <EuiBasicTable<any>
            items={isLoading ? [] : detectorsToDisplay}
            /*
                itemId here is used to keep track of the selected detectors and render appropriately.
                Because the item id is dependent on the current time (see getItemID() above), all selected
                detectors will be deselected once new detectors are retrieved because the page will
                re-render with a new timestamp. This logic is borrowed from Alerting Kibana plugins'
                monitors list page.
              */
            itemId={getItemId}
            columns={historicalDetectorListColumns}
            onChange={handleTableChange}
            isSelectable={true}
            //selection={selection}
            sorting={sorting}
            pagination={pagination}
            noItemsMessage={
              isLoading ? (
                'Loading historical detectors...'
              ) : (
                <EmptyHistoricalDetectorMessage
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
}
