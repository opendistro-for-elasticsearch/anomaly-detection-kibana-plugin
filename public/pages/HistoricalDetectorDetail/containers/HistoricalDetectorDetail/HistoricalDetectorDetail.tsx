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

import React, { useState, useEffect } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiHealth,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { get, isEmpty } from 'lodash';
import { RouteComponentProps } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useHideSideNavBar } from '../../../main/hooks/useHideSideNavBar';
import { Listener } from '../../../../utils/utils';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';
import { AppState } from '../../../../redux/reducers';
import {
  startDetector,
  stopDetector,
  deleteDetector,
  getDetector,
  getHistoricalDetectorList,
} from '../../../../redux/reducers/ad';
import { BREADCRUMBS } from '../../../../utils/constants';
import { DETECTOR_STATE } from '../../../../../server/utils/constants';
import { HistoricalDetectorConfig } from '../../components/HistoricalDetectorConfig/HistoricalDetectorConfig';
import { HistoricalDetectorControls } from '../../components/HistoricalDetectorControls/HistoricalDetectorControls';
import { EditHistoricalDetectorModal } from '../ActionModals/EditHistoricalDetectorModal/EditHistoricalDetectorModal';
import { DeleteHistoricalDetectorModal } from '../ActionModals/DeleteHistoricalDetectorModal/DeleteHistoricalDetectorModal';
import { AnomalyHistory } from '../../../DetectorResults/containers/AnomalyHistory';
import { stateToColorMap } from '../../../utils/constants';
import {
  HISTORICAL_DETECTOR_RESULT_REFRESH_RATE,
  HISTORICAL_DETECTOR_ACTION,
  HISTORICAL_DETECTOR_STOP_THRESHOLD,
} from '../../utils/constants';
import {
  getCallout,
  waitForMs,
  getRunningHistoricalDetectorCount,
} from '../../utils/helpers';
import { CoreStart } from '../../../../../../../src/core/public';
import { CoreServicesContext } from '../../../../components/CoreServices/CoreServices';
import { getClusterStats } from '../../../../redux/reducers/elasticsearch';
import { GET_ALL_DETECTORS_QUERY_PARAMS } from '../../../utils/constants';

export interface HistoricalDetectorRouterProps {
  detectorId?: string;
}
interface HistoricalDetectorDetailProps
  extends RouteComponentProps<HistoricalDetectorRouterProps> {}

interface HistoricalDetectorDetailModalState {
  isOpen: boolean;
  action: HISTORICAL_DETECTOR_ACTION | undefined;
}

export const HistoricalDetectorDetail = (
  props: HistoricalDetectorDetailProps
) => {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  const isDark = darkModeEnabled();
  useHideSideNavBar(true, false);
  const dispatch = useDispatch();
  const detectorId: string = get(props, 'match.params.detectorId', '');

  const adState = useSelector((state: AppState) => state.ad);
  const allDetectors = adState.detectors;
  const errorGettingDetectors = adState.errorMessage;
  const detector = allDetectors[detectorId];
  const monitors = useSelector((state: AppState) => state.alerting.monitors);
  const monitor = get(monitors, `${detectorId}.0`);

  // TODO: look further into whether or not we need to check for missing data or not
  const isDetectorMissingData = false;

  const [isLoadingDetector, setIsLoadingDetector] = useState<boolean>(true);
  const [isStoppingDetector, setIsStoppingDetector] = useState<boolean>(false);
  const [
    historicalDetectorDetailModalState,
    setHistoricalDetectorDetailModalState,
  ] = useState<HistoricalDetectorDetailModalState>({
    isOpen: false,
    action: undefined,
  });
  const callout = getCallout(detector, isStoppingDetector);

  useEffect(() => {
    if (errorGettingDetectors) {
      core.notifications.toasts.addDanger(
        'Unable to get the historical detector'
      );
      props.history.push('/historical-detectors');
    }
  }, [errorGettingDetectors]);

  useEffect(() => {
    if (detector) {
      core.chrome.setBreadcrumbs([
        BREADCRUMBS.ANOMALY_DETECTOR,
        BREADCRUMBS.HISTORICAL_DETECTORS,
        { text: detector ? detector.name : '' },
      ]);
    }
  }, [detector]);

  const fetchDetector = async () => {
    try {
      await dispatch(getDetector(detectorId));
      setIsLoadingDetector(false);
    } catch {
      core.notifications.toasts.addDanger(
        'Error retrieving the historical detector'
      );
    }
  };

  // Try to get the detector initially
  useEffect(() => {
    if (detectorId) {
      setIsLoadingDetector(true);
      fetchDetector();
    }
  }, []);

  // If detector is initialiazing or running: keep fetching every second to quickly update state/results/percentage bar, etc.
  useEffect(() => {
    if (
      detector?.curState === DETECTOR_STATE.RUNNING ||
      detector?.curState === DETECTOR_STATE.INIT
    ) {
      const intervalId = setInterval(
        fetchDetector,
        HISTORICAL_DETECTOR_RESULT_REFRESH_RATE
      );
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [detector]);

  const handleDeleteAction = () => {
    setHistoricalDetectorDetailModalState({
      ...historicalDetectorDetailModalState,
      isOpen: true,
      action: HISTORICAL_DETECTOR_ACTION.DELETE,
    });
  };

  const handleEditAction = () => {
    detector?.curState === DETECTOR_STATE.RUNNING ||
    detector?.curState === DETECTOR_STATE.INIT
      ? setHistoricalDetectorDetailModalState({
          ...historicalDetectorDetailModalState,
          isOpen: true,
          action: HISTORICAL_DETECTOR_ACTION.EDIT,
        })
      : props.history.push(`/historical-detectors/${detectorId}/edit`);
  };

  const onStartDetector = async () => {
    try {
      // Check to make sure we can start. Current historical detector limit: 2 running per node
      const clusterStatsResponse = await dispatch(getClusterStats());
      const nodeCount = get(
        clusterStatsResponse,
        'response.nodes.count.data',
        1
      );
      const historicalDetectorsResponse = await dispatch(
        getHistoricalDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS)
      );
      const runningCount = getRunningHistoricalDetectorCount(
        get(historicalDetectorsResponse, 'response.detectorList')
      );

      if (nodeCount * 2 <= runningCount) {
        throw 'only 2 historical detectors can be running per data node in the cluster';
      }

      await dispatch(startDetector(detectorId));
      fetchDetector();
      core.notifications.toasts.addSuccess(
        `Successfully started the historical detector`
      );
    } catch (err) {
      core.notifications.toasts.addDanger(
        `There was a problem starting the historical detector: ${err}`
      );
    }
  };

  // We query the task state 5s after making the stop detector call. If the task is still running,
  // then it is assumed there was an error stopping this task / historical detector.
  const onStopDetector = async (isDelete: boolean, listener?: Listener) => {
    try {
      setIsStoppingDetector(true);
      await dispatch(stopDetector(detectorId));
      await waitForMs(HISTORICAL_DETECTOR_STOP_THRESHOLD);
      setIsStoppingDetector(false);
      const resp = await dispatch(getDetector(detectorId));
      if (get(resp, 'response.curState') !== DETECTOR_STATE.DISABLED) {
        throw 'please try again.';
      }
      if (!isDelete) {
        core.notifications.toasts.addSuccess(
          'Successfully stopped the historical detector'
        );
      }
      if (listener) listener.onSuccess();
    } catch (err) {
      core.notifications.toasts.addDanger(
        `There was a problem stopping the historical detector: ${err}`
      );
      if (listener) listener.onException();
    }
  };

  const onDeleteDetector = async () => {
    try {
      await dispatch(deleteDetector(detectorId));
      core.notifications.toasts.addSuccess(
        `Successfully deleted the historical detector`
      );
      handleHideModal();
      props.history.push('/historical-detectors');
    } catch (err) {
      core.notifications.toasts.addDanger(
        `There was a problem deleting the historical detector: ${err}`
      );
      handleHideModal();
    }
  };

  const onStopDetectorForEditing = async () => {
    const listener: Listener = {
      onSuccess: () => {
        props.history.push(`/historical-detectors/${detectorId}/edit`);
        handleHideModal();
      },
      onException: handleHideModal,
    };
    onStopDetector(false, listener);
  };

  const onStopDetectorForDeleting = async () => {
    if (
      detector?.curState === DETECTOR_STATE.RUNNING ||
      detector?.curState === DETECTOR_STATE.INIT
    ) {
      const listener: Listener = {
        onSuccess: onDeleteDetector,
        onException: handleHideModal,
      };
      onStopDetector(true, listener);
    } else {
      onDeleteDetector();
    }
  };

  const handleHideModal = () => {
    setHistoricalDetectorDetailModalState({
      ...historicalDetectorDetailModalState,
      isOpen: false,
      action: undefined,
    });
  };

  const getHistoricalDetectorDetailModal = () => {
    if (historicalDetectorDetailModalState.isOpen) {
      switch (historicalDetectorDetailModalState.action) {
        case HISTORICAL_DETECTOR_ACTION.EDIT: {
          return (
            <EditHistoricalDetectorModal
              isStoppingDetector={isStoppingDetector}
              onHide={handleHideModal}
              onStopDetectorForEditing={onStopDetectorForEditing}
            />
          );
        }
        case HISTORICAL_DETECTOR_ACTION.DELETE: {
          return (
            <DeleteHistoricalDetectorModal
              detector={detector}
              isStoppingDetector={isStoppingDetector}
              onHide={handleHideModal}
              onStopDetectorForDeleting={onStopDetectorForDeleting}
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

  const lightStyles = {
    backgroundColor: '#FFF',
  };

  const isLoading = adState.requesting || isLoadingDetector;
  return (
    <React.Fragment>
      {!isEmpty(detector) && !errorGettingDetectors
        ? getHistoricalDetectorDetailModal()
        : null}
      {!isEmpty(detector) && !errorGettingDetectors ? (
        <EuiFlexGroup
          direction="column"
          style={{
            ...(isDark
              ? { flexGrow: 'unset' }
              : { ...lightStyles, flexGrow: 'unset' }),
          }}
        >
          <EuiFlexGroup
            justifyContent="spaceBetween"
            style={{
              marginLeft: '12px',
              marginTop: '4px',
              marginRight: '12px',
            }}
          >
            <EuiFlexItem grow={false}>
              <EuiTitle size="l">
                <h1>
                  {detector && detector.name}{' '}
                  {isStoppingDetector ? (
                    <EuiHealth color={'#00'}>{'Stopping...'}</EuiHealth>
                  ) : detector?.curState ? (
                    <EuiHealth color={stateToColorMap.get(detector.curState)}>
                      {detector.curState}
                    </EuiHealth>
                  ) : null}
                </h1>
              </EuiTitle>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <HistoricalDetectorControls
                detector={detector}
                isStoppingDetector={isStoppingDetector}
                onEditDetector={handleEditAction}
                onStartDetector={onStartDetector}
                onStopDetector={onStopDetector}
                onDeleteDetector={handleDeleteAction}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup
            direction="column"
            justifyContent="spaceBetween"
            style={{
              marginLeft: '12px',
              marginTop: '4px',
              marginRight: '12px',
            }}
          >
            {callout ? (
              <EuiFlexItem
                grow={false}
                style={{ marginLeft: '12px', marginRight: '12px' }}
              >
                {callout}
              </EuiFlexItem>
            ) : null}
            <EuiFlexItem>
              <HistoricalDetectorConfig
                detector={detector}
                isStoppingDetector={isStoppingDetector}
                onEditDetector={handleEditAction}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <AnomalyHistory
                detector={detector}
                monitor={monitor}
                isFeatureDataMissing={isDetectorMissingData}
                isHistorical={true}
                taskId={detector?.taskId}
                isNotSample={true}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      ) : (
        <div>
          <EuiLoadingSpinner size="xl" />
        </div>
      )}
    </React.Fragment>
  );
};
