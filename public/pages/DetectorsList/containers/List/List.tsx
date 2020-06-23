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
} from '../../../../../server/models/types';
import { DetectorListItem } from '../../../../models/interfaces';
import { SORT_DIRECTION } from '../../../../../server/utils/constants';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../../redux/reducers';
import {
  getDetectorList,
  startDetector,
  stopDetector,
  deleteDetector,
} from '../../../../redux/reducers/ad';
import {
  getIndices,
  getPrioritizedIndices,
} from '../../../../redux/reducers/elasticsearch';
import {
  APP_PATH,
  PLUGIN_NAME,
  DETECTOR_STATE,
} from '../../../../utils/constants';
import { getVisibleOptions, sanitizeSearchText } from '../../../utils/helpers';
import { EmptyDetectorMessage } from '../../components/EmptyMessage/EmptyMessage';
import { ListFilters } from '../../components/ListFilters/ListFilters';
import {
  MAX_DETECTORS,
  MAX_SELECTED_INDICES,
  GET_ALL_DETECTORS_QUERY_PARAMS,
  ALL_DETECTOR_STATES,
  ALL_INDICES,
} from '../../../utils/constants';
import { BREADCRUMBS } from '../../../../utils/constants';
import {
  getURLQueryParams,
  getDetectorsForAction,
  getMonitorsForAction,
} from '../../utils/helpers';
import {
  filterAndSortDetectors,
  getDetectorsToDisplay,
} from '../../../utils/helpers';
import { staticColumn } from '../../utils/tableUtils';
import { DETECTOR_ACTION } from '../../utils/constants';
import { getTitleWithCount, Listener } from '../../../../utils/utils';
import { ListActions } from '../../components/ListActions/ListActions';
import { searchMonitors } from '../../../../redux/reducers/alerting';
import { Monitor } from '../../../../models/interfaces';
import { ConfirmStartDetectorsModal } from '../ConfirmActionModals/ConfirmStartDetectorsModal';
import { ConfirmStopDetectorsModal } from '../ConfirmActionModals/ConfirmStopDetectorsModal';
import { ConfirmDeleteDetectorsModal } from '../ConfirmActionModals/ConfirmDeleteDetectorsModal';

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
interface ConfirmModalState {
  isOpen: boolean;
  action: DETECTOR_ACTION;
  isListLoading: boolean;
  isRequestingToClose: boolean;
  affectedDetectors: DetectorListItem[];
  affectedMonitors: { [key: string]: Monitor };
}
interface ListActionsState {
  isDisabled: boolean;
  isStartDisabled: boolean;
  isStopDisabled: boolean;
}

export const DetectorList = (props: ListProps) => {
  const dispatch = useDispatch();
  const allDetectors = useSelector((state: AppState) => state.ad.detectorList);
  const allMonitors = useSelector((state: AppState) => state.alerting.monitors);
  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );
  const isRequestingFromES = useSelector(
    (state: AppState) => state.ad.requesting
  );

  const [selectedDetectors, setSelectedDetectors] = useState(
    [] as DetectorListItem[]
  );
  const [detectorsToDisplay, setDetectorsToDisplay] = useState(
    [] as DetectorListItem[]
  );
  const [isLoadingFinalDetectors, setIsLoadingFinalDetectors] = useState<
    boolean
  >(true);
  const [selectedDetectorsForAction, setSelectedDetectorsForAction] = useState(
    [] as DetectorListItem[]
  );
  const isLoading = isRequestingFromES || isLoadingFinalDetectors;
  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>(
    {
      isOpen: false,
      //@ts-ignore
      action: null,
      isListLoading: false,
      isRequestingToClose: false,
      affectedDetectors: [],
      affectedMonitors: {},
    }
  );
  const [listActionsState, setListActionsState] = useState<ListActionsState>({
    isDisabled: true,
    isStartDisabled: false,
    isStopDisabled: false,
  });

  // Getting all initial indices
  const [indexQuery, setIndexQuery] = useState('');
  useEffect(() => {
    const getInitialIndices = async () => {
      await dispatch(getIndices(indexQuery));
    };
    getInitialIndices();
  }, []);

  // Getting all initial monitors
  useEffect(() => {
    const getInitialMonitors = async () => {
      dispatch(searchMonitors());
    };
    getInitialMonitors();
  }, []);

  // Updating displayed indices (initializing to first 20 for now)
  const visibleIndices = get(elasticsearchState, 'indices', []) as CatIndex[];
  const visibleAliases = get(elasticsearchState, 'aliases', []) as IndexAlias[];
  const indexOptions = getVisibleOptions(visibleIndices, visibleAliases);

  const [state, setState] = useState<ListState>({
    page: 0,
    queryParams: getURLQueryParams(props.location),
    selectedDetectorStates: ALL_DETECTOR_STATES,
    selectedIndices: ALL_INDICES,
  });

  // Set breadcrumbs on page initialization
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

    setIsLoadingFinalDetectors(true);
    getUpdatedDetectors();
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

  // Update modal state if user decides to close
  useEffect(() => {
    if (confirmModalState.isRequestingToClose) {
      if (isLoading) {
        setConfirmModalState({
          ...confirmModalState,
          isListLoading: true,
        });
      } else {
        setConfirmModalState({
          ...confirmModalState,
          isOpen: false,
          isListLoading: false,
          isRequestingToClose: false,
        });
      }
    }
  }, [confirmModalState.isRequestingToClose, isLoading]);

  const getUpdatedDetectors = async () => {
    try {
      dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
    } catch (error) {
      toastNotifications.addDanger(
        `Error is found while getting detector list: ${error}`
      );
      setIsLoadingFinalDetectors(false);
    }
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

  const handleSelectionChange = (currentSelected: DetectorListItem[]) => {
    setSelectedDetectorsForAction(currentSelected);
    setListActionsState({
      ...listActionsState,
      isDisabled: isEmpty(currentSelected),
      isStartDisabled: isEmpty(
        getDetectorsForAction(currentSelected, DETECTOR_ACTION.START)
      ),
      isStopDisabled: isEmpty(
        getDetectorsForAction(currentSelected, DETECTOR_ACTION.STOP)
      ),
    });
  };

  const handleStartDetectorsAction = () => {
    const validDetectors = getDetectorsForAction(
      selectedDetectorsForAction,
      DETECTOR_ACTION.START
    );
    if (!isEmpty(validDetectors)) {
      setConfirmModalState({
        isOpen: true,
        action: DETECTOR_ACTION.START,
        isListLoading: false,
        isRequestingToClose: false,
        affectedDetectors: validDetectors,
        affectedMonitors: {},
      });
    } else {
      toastNotifications.addWarning(
        'All selected detectors are unable to start. Make sure selected \
          detectors have features and are not already running'
      );
    }
  };

  const handleStopDetectorsAction = () => {
    const validDetectors = getDetectorsForAction(
      selectedDetectorsForAction,
      DETECTOR_ACTION.STOP
    );
    if (!isEmpty(validDetectors)) {
      const validMonitors = getMonitorsForAction(validDetectors, allMonitors);
      setConfirmModalState({
        isOpen: true,
        action: DETECTOR_ACTION.STOP,
        isListLoading: false,
        isRequestingToClose: false,
        affectedDetectors: validDetectors,
        affectedMonitors: validMonitors,
      });
    } else {
      toastNotifications.addWarning(
        'All selected detectors are unable to stop. Make sure selected \
          detectors are already running'
      );
    }
  };

  const handleDeleteDetectorsAction = async () => {
    const validDetectors = getDetectorsForAction(
      selectedDetectorsForAction,
      DETECTOR_ACTION.DELETE
    );
    if (!isEmpty(validDetectors)) {
      const validMonitors = getMonitorsForAction(validDetectors, allMonitors);
      setConfirmModalState({
        isOpen: true,
        action: DETECTOR_ACTION.DELETE,
        isListLoading: false,
        isRequestingToClose: false,
        affectedDetectors: validDetectors,
        affectedMonitors: validMonitors,
      });
    } else {
      toastNotifications.addWarning(
        'No detectors selected. Please select detectors to delete'
      );
    }
  };

  const handleStartDetectorJobs = async () => {
    setIsLoadingFinalDetectors(true);
    const validIds = getDetectorsForAction(
      selectedDetectorsForAction,
      DETECTOR_ACTION.START
    ).map(detector => detector.id);
    const promises = validIds.map(async (id: string) => {
      return dispatch(startDetector(id));
    });
    await Promise.all(promises)
      .then(() => {
        toastNotifications.addSuccess(
          'All selected detectors have been started successfully'
        );
      })
      .catch(error => {
        toastNotifications.addDanger(
          `Error starting all selected detectors: ${error}`
        );
      })
      .finally(() => {
        getUpdatedDetectors();
      });
  };

  const handleStopDetectorJobs = async (listener?: Listener) => {
    setIsLoadingFinalDetectors(true);
    const validIds = getDetectorsForAction(
      selectedDetectorsForAction,
      DETECTOR_ACTION.STOP
    ).map(detector => detector.id);
    const promises = validIds.map(async (id: string) => {
      return dispatch(stopDetector(id));
    });
    await Promise.all(promises)
      .then(() => {
        toastNotifications.addSuccess(
          'All selected detectors have been stopped successfully'
        );
        if (listener) listener.onSuccess();
      })
      .catch(error => {
        toastNotifications.addDanger(
          `Error stopping all selected detectors: ${error}`
        );
        if (listener) listener.onException();
      })
      .finally(() => {
        // only need to get updated list if we're just stopping (no need if deleting also)
        if (confirmModalState.action === DETECTOR_ACTION.STOP) {
          getUpdatedDetectors();
        }
      });
  };

  const handleDeleteDetectorJobs = async () => {
    setIsLoadingFinalDetectors(true);
    const validIds = getDetectorsForAction(
      selectedDetectorsForAction,
      DETECTOR_ACTION.DELETE
    ).map(detector => detector.id);
    const promises = validIds.map(async (id: string) => {
      return dispatch(deleteDetector(id));
    });
    await Promise.all(promises)
      .then(() => {
        toastNotifications.addSuccess(
          'All selected detectors have been deleted successfully'
        );
      })
      .catch(error => {
        toastNotifications.addDanger(
          `Error deleting all selected detectors: ${error}`
        );
      })
      .finally(() => {
        getUpdatedDetectors();
      });
  };

  const getItemId = (item: any) => {
    return `${item.id}-${item.currentTime}`;
  };

  const handleHideModal = () => {
    setConfirmModalState({
      ...confirmModalState,
      isOpen: false,
    });
  };

  const handleConfirmModal = () => {
    setConfirmModalState({
      ...confirmModalState,
      isRequestingToClose: true,
    });
  };

  const getConfirmModal = () => {
    if (confirmModalState.isOpen) {
      //@ts-ignore
      switch (confirmModalState.action) {
        case DETECTOR_ACTION.START: {
          return (
            <ConfirmStartDetectorsModal
              detectors={confirmModalState.affectedDetectors}
              onStartDetectors={handleStartDetectorJobs}
              onHide={handleHideModal}
              onConfirm={handleConfirmModal}
              isListLoading={isLoading}
            />
          );
        }
        case DETECTOR_ACTION.STOP: {
          return (
            <ConfirmStopDetectorsModal
              detectors={confirmModalState.affectedDetectors}
              monitors={confirmModalState.affectedMonitors}
              onStopDetectors={handleStopDetectorJobs}
              onHide={handleHideModal}
              onConfirm={handleConfirmModal}
              isListLoading={isLoading}
            />
          );
        }
        case DETECTOR_ACTION.DELETE: {
          return (
            <ConfirmDeleteDetectorsModal
              detectors={confirmModalState.affectedDetectors}
              monitors={confirmModalState.affectedMonitors}
              onStopDetectors={handleStopDetectorJobs}
              onDeleteDetectors={handleDeleteDetectorJobs}
              onHide={handleHideModal}
              onConfirm={handleConfirmModal}
              isListLoading={isLoading}
            />
          );
        }
        default: {
          return null;
        }
      }
    } else {
      return null;
    }
  };

  const sorting = {
    sort: {
      direction: state.queryParams.sortDirection,
      field: state.queryParams.sortField,
    },
  };

  const selection = {
    onSelectionChange: handleSelectionChange,
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

  const confirmModal = getConfirmModal();

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
            <ListActions
              onStartDetectors={handleStartDetectorsAction}
              onStopDetectors={handleStopDetectorsAction}
              onDeleteDetectors={handleDeleteDetectorsAction}
              isActionsDisabled={listActionsState.isDisabled}
              isStartDisabled={listActionsState.isStartDisabled}
              isStopDisabled={listActionsState.isStopDisabled}
            />,
            <EuiButton
              data-test-subj="addDetector"
              fill
              href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}
            >
              Create detector
            </EuiButton>,
          ]}
        >
          {confirmModal}
          <ListFilters
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
            /*
              itemId here is used to keep track of the selected detectors and render appropriately.
              Because the item id is dependent on the current time (see getItemID() above), all selected
              detectors will be deselected once new detectors are retrieved because the page will
              re-render with a new timestamp. This logic is borrowed from Alerting Kibana plugins' 
              monitors list page.
            */
            itemId={getItemId}
            columns={staticColumn}
            onChange={handleTableChange}
            isSelectable={true}
            selection={selection}
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
