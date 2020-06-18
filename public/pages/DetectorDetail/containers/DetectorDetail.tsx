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

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import {
  EuiTabs,
  EuiTab,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiHealth,
  EuiOverlayMask,
  EuiCallOut,
  EuiSpacer,
  EuiText,
  EuiFieldText,
  EuiLoadingSpinner,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import { get, isEmpty } from 'lodash';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFetchDetectorInfo } from '../../createDetector/hooks/useFetchDetectorInfo';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import {
  deleteDetector,
  startDetector,
  stopDetector,
} from '../../../redux/reducers/ad';
import { getErrorMessage, Listener } from '../../../utils/utils';
//@ts-ignore
import chrome from 'ui/chrome';
import { darkModeEnabled } from '../../../utils/kibanaUtils';
import { BREADCRUMBS, DETECTOR_STATE } from '../../../utils/constants';
import { DetectorControls } from '../components/DetectorControls';
import moment from 'moment';
import { ConfirmModal } from '../components/ConfirmModal/ConfirmModal';
import { useFetchMonitorInfo } from '../hooks/useFetchMonitorInfo';
import { MonitorCallout } from '../components/MonitorCallout/MonitorCallout';
import { DETECTOR_DETAIL_TABS } from '../utils/constants';
import { DetectorConfig } from '../../DetectorConfig/containers/DetectorConfig';
import { AnomalyResults } from '../../DetectorResults/containers/AnomalyResults';
import { DETECTOR_STATE_COLOR } from '../../utils/constants';

export interface DetectorRouterProps {
  detectorId?: string;
}
interface DetectorDetailProps
  extends RouteComponentProps<DetectorRouterProps> {}

const tabs = [
  {
    id: DETECTOR_DETAIL_TABS.RESULTS,
    name: 'Anomaly results',
    route: DETECTOR_DETAIL_TABS.RESULTS,
  },
  {
    id: DETECTOR_DETAIL_TABS.CONFIGURATIONS,
    name: 'Detector configuration',
    route: DETECTOR_DETAIL_TABS.CONFIGURATIONS,
  },
];

const getSelectedTabId = (pathname: string) => {
  return pathname.includes(DETECTOR_DETAIL_TABS.CONFIGURATIONS)
    ? DETECTOR_DETAIL_TABS.CONFIGURATIONS
    : DETECTOR_DETAIL_TABS.RESULTS;
};

interface DetectorDetailModel {
  selectedTab: DETECTOR_DETAIL_TABS;
  showDeleteDetectorModal: boolean;
  showStopDetectorModalFor: string | undefined;
  showMonitorCalloutModal: boolean;
  deleteTyped: boolean;
}

export const DetectorDetail = (props: DetectorDetailProps) => {
  const dispatch = useDispatch();
  const detectorId = get(props, 'match.params.detectorId', '') as string;
  const { detector, hasError, isLoadingDetector } = useFetchDetectorInfo(
    detectorId
  );
  const { monitor, fetchMonitorError, isLoadingMonitor } = useFetchMonitorInfo(
    detectorId
  );

  //TODO: test dark mode once detector configuration and AD result page merged
  const isDark = darkModeEnabled();

  const [detectorDetailModel, setDetectorDetailModel] = useState<
    DetectorDetailModel
  >({
    selectedTab: getSelectedTabId(
      props.location.pathname
    ) as DETECTOR_DETAIL_TABS,
    showDeleteDetectorModal: false,
    showStopDetectorModalFor: undefined,
    showMonitorCalloutModal: false,
    deleteTyped: false,
  });

  useHideSideNavBar(true, false);

  useEffect(() => {
    if (hasError) {
      toastNotifications.addDanger('Unable to find detector');
      props.history.push('/detectors');
    }
  }, [hasError]);

  useEffect(() => {
    if (detector) {
      chrome.breadcrumbs.set([
        BREADCRUMBS.ANOMALY_DETECTOR,
        BREADCRUMBS.DETECTORS,
        { text: detector ? detector.name : '' },
      ]);
    }
  }, [detector]);

  const handleSwitchToConfigurationTab = useCallback(() => {
    setDetectorDetailModel({
      ...detectorDetailModel,
      selectedTab: DETECTOR_DETAIL_TABS.CONFIGURATIONS,
    });
    props.history.push(`/detectors/${detectorId}/configurations`);
  }, []);

  const handleTabChange = (route: DETECTOR_DETAIL_TABS) => {
    setDetectorDetailModel({
      ...detectorDetailModel,
      selectedTab: route,
    });
    props.history.push(route);
  };

  const hideMonitorCalloutModal = () => {
    setDetectorDetailModel({
      ...detectorDetailModel,
      showMonitorCalloutModal: false,
    });
  };

  const hideStopDetectorModal = () => {
    setDetectorDetailModel({
      ...detectorDetailModel,
      showStopDetectorModalFor: undefined,
    });
  };

  const hideDeleteDetectorModal = () => {
    setDetectorDetailModel({
      ...detectorDetailModel,
      showDeleteDetectorModal: false,
    });
  };

  const handleStopDetectorForEditing = (detectorId: string) => {
    const listener: Listener = {
      onSuccess: () => {
        if (detectorDetailModel.showStopDetectorModalFor === 'detector') {
          props.history.push(`/detectors/${detectorId}/edit`);
        } else {
          props.history.push(`/detectors/${detectorId}/features`);
        }
        hideStopDetectorModal();
      },
      onException: hideStopDetectorModal,
    };
    handleStopAdJob(detectorId, listener);
  };

  const handleStartAdJob = async (detectorId: string) => {
    try {
      await dispatch(startDetector(detectorId));
      toastNotifications.addSuccess(
        `Detector job has been started successfully`
      );
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem starting detector job')
      );
    }
  };

  const handleStopAdJob = async (detectorId: string, listener?: Listener) => {
    try {
      await dispatch(stopDetector(detectorId));
      toastNotifications.addSuccess(
        'Detector job has been stopped successfully'
      );
      if (listener) listener.onSuccess();
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem stopping detector job')
      );
      if (listener) listener.onException();
    }
  };

  const handleDelete = useCallback(async (detectorId: string) => {
    try {
      await dispatch(deleteDetector(detectorId));
      toastNotifications.addSuccess(`Detector has been deleted successfully`);
      hideDeleteDetectorModal();
      props.history.push('/detectors');
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem deleting detector')
      );
      hideDeleteDetectorModal();
    }
  }, []);

  const handleEditDetector = () => {
    detector.enabled
      ? setDetectorDetailModel({
          ...detectorDetailModel,
          showStopDetectorModalFor: 'detector',
        })
      : props.history.push(`/detectors/${detectorId}/edit`);
  };

  const handleEditFeature = () => {
    detector.enabled
      ? setDetectorDetailModel({
          ...detectorDetailModel,
          showStopDetectorModalFor: 'features',
        })
      : props.history.push(`/detectors/${detectorId}/features`);
  };

  const lightStyles = {
    backgroundColor: '#FFF',
  };
  const monitorCallout = monitor ? (
    <MonitorCallout monitorId={monitor.id} monitorName={monitor.name} />
  ) : null;

  const deleteDetectorCallout = detector.enabled ? (
    <EuiCallOut
      title="The detector is running. Are you sure you want to proceed?"
      color="warning"
      iconType="alert"
    ></EuiCallOut>
  ) : null;

  return (
    <React.Fragment>
      {!isEmpty(detector) && !hasError ? (
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
            style={{ padding: '10px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiTitle size="l">
                <h1>
                  {detector && detector.name}{' '}
                  {detector &&
                  detector.enabled &&
                  detector.curState === DETECTOR_STATE.RUNNING ? (
                    <EuiHealth color={DETECTOR_STATE_COLOR.RUNNING}>
                      Running since{' '}
                      {detector.enabledTime
                        ? moment(detector.enabledTime).format('MM/DD/YY h:mm A')
                        : '?'}
                    </EuiHealth>
                  ) : detector.enabled &&
                    detector.curState === DETECTOR_STATE.INIT ? (
                    <EuiHealth color={DETECTOR_STATE_COLOR.INIT}>
                      {detector.initProgress
                        ? //@ts-ignore
                          `Initializing (${detector.initProgress.percentageStr} complete)`
                        : 'Initializing'}
                    </EuiHealth>
                  ) : detector.curState === DETECTOR_STATE.INIT_FAILURE ||
                    detector.curState === DETECTOR_STATE.UNEXPECTED_FAILURE ? (
                    <EuiHealth color={DETECTOR_STATE_COLOR.INIT_FAILURE}>
                      Initialization failure
                    </EuiHealth>
                  ) : detector.curState === DETECTOR_STATE.DISABLED ? (
                    <EuiHealth color={DETECTOR_STATE_COLOR.DISABLED}>
                      {detector.disabledTime
                        ? `Stopped at ${moment(detector.disabledTime).format(
                            'MM/DD/YY h:mm A'
                          )}`
                        : 'Detector is stopped'}
                    </EuiHealth>
                  ) : detector.curState === DETECTOR_STATE.FEATURE_REQUIRED ? (
                    <EuiHealth color={DETECTOR_STATE_COLOR.FEATURE_REQUIRED}>
                      Feature required to start the detector
                    </EuiHealth>
                  ) : (
                    ''
                  )}
                </h1>
              </EuiTitle>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <DetectorControls
                onEditDetector={handleEditDetector}
                onDelete={() =>
                  setDetectorDetailModel({
                    ...detectorDetailModel,
                    showDeleteDetectorModal: true,
                  })
                }
                onStartDetector={() => handleStartAdJob(detectorId)}
                onStopDetector={() =>
                  monitor
                    ? setDetectorDetailModel({
                        ...detectorDetailModel,
                        showMonitorCalloutModal: true,
                      })
                    : handleStopAdJob(detectorId)
                }
                onEditFeatures={handleEditFeature}
                detector={detector}
              />
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiTabs>
                {tabs.map((tab) => (
                  <EuiTab
                    onClick={() => {
                      handleTabChange(tab.route);
                    }}
                    isSelected={tab.id === detectorDetailModel.selectedTab}
                    key={tab.id}
                  >
                    {tab.name}
                  </EuiTab>
                ))}
              </EuiTabs>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      ) : (
        <div>
          <EuiLoadingSpinner size="s" />
          &nbsp;&nbsp;
          <EuiLoadingSpinner size="m" />
          &nbsp;&nbsp;
          <EuiLoadingSpinner size="l" />
          &nbsp;&nbsp;
          <EuiLoadingSpinner size="xl" />
        </div>
      )}
      {detectorDetailModel.showDeleteDetectorModal ? (
        <EuiOverlayMask>
          <ConfirmModal
            title="Delete detector?"
            description={
              <EuiFlexGroup direction="column">
                <EuiFlexItem>
                  <EuiText>
                    <p>
                      Detector and feature configuration will be permanently
                      removed. This action is irreversible. To confirm deletion,
                      type <i>delete</i> in the field.
                    </p>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={true}>
                  <EuiFieldText
                    fullWidth={true}
                    placeholder="delete"
                    onChange={(e) => {
                      if (e.target.value === 'delete') {
                        setDetectorDetailModel({
                          ...detectorDetailModel,
                          deleteTyped: true,
                        });
                      } else {
                        setDetectorDetailModel({
                          ...detectorDetailModel,
                          deleteTyped: false,
                        });
                      }
                    }}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            }
            callout={
              <Fragment>
                {deleteDetectorCallout}
                {monitorCallout ? <EuiSpacer size="s" /> : null}
                {monitorCallout}
              </Fragment>
            }
            confirmButtonText="Delete"
            confirmButtonColor="danger"
            confirmButtonDisabled={!detectorDetailModel.deleteTyped}
            onClose={hideDeleteDetectorModal}
            onCancel={hideDeleteDetectorModal}
            onConfirm={() => {
              if (detector.enabled) {
                const listener: Listener = {
                  onSuccess: () => {
                    handleDelete(detectorId);
                  },
                  onException: hideDeleteDetectorModal,
                };
                handleStopAdJob(detectorId, listener);
              } else {
                handleDelete(detectorId);
              }
            }}
          />
        </EuiOverlayMask>
      ) : null}

      {detectorDetailModel.showStopDetectorModalFor ? (
        <EuiOverlayMask>
          <ConfirmModal
            title="Stop detector to proceed?"
            description="Stop the detector before you can edit any detector
                      configuration. After you change the detector, make sure to restart and reinitialize the detector."
            callout={monitorCallout}
            confirmButtonText="Stop and proceed to edit"
            confirmButtonColor="primary"
            onClose={hideStopDetectorModal}
            onCancel={hideStopDetectorModal}
            onConfirm={() => handleStopDetectorForEditing(detectorId)}
          />
        </EuiOverlayMask>
      ) : null}

      {detectorDetailModel.showMonitorCalloutModal ? (
        <EuiOverlayMask>
          <ConfirmModal
            title="Stop detector will impact associated monitor"
            description=""
            callout={monitorCallout}
            confirmButtonText="Stop detector"
            confirmButtonColor="primary"
            onClose={hideMonitorCalloutModal}
            onCancel={hideMonitorCalloutModal}
            onConfirm={() => {
              handleStopAdJob(detectorId);
              hideMonitorCalloutModal();
            }}
          />
        </EuiOverlayMask>
      ) : null}

      <Switch>
        <Route
          exact
          path="/detectors/:detectorId/results"
          render={(props) => (
            <AnomalyResults
              {...props}
              detectorId={detectorId}
              onStartDetector={() => handleStartAdJob(detectorId)}
              onSwitchToConfiguration={handleSwitchToConfigurationTab}
            />
          )}
        />
        <Route
          exact
          path="/detectors/:detectorId/configurations"
          render={(props) => (
            <DetectorConfig
              {...props}
              detectorId={detectorId}
              onEditFeatures={handleEditFeature}
              onEditDetector={handleEditDetector}
            />
          )}
        />
        <Redirect to="/detectors/:detectorId/results" />
      </Switch>
    </React.Fragment>
  );
};
