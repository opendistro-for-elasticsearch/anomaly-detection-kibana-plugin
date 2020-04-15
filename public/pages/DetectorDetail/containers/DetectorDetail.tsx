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

import React, { useState, useEffect, useCallback } from 'react';
import {
  EuiTabs,
  EuiTab,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiHealth,
  EuiOverlayMask,
} from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import { get } from 'lodash';
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
import { BREADCRUMBS } from '../../../utils/constants';
import { DetectorControls } from '../components/DetectorControls';
import moment from 'moment';
import { ConfirmModal } from '../components/ConfirmModal/ConfirmModal';
import { useFetchMonitorInfo } from '../hooks/useFetchMonitorInfo';
import { MonitorCallout } from '../components/MonitorCallout/MonitorCallout';
import { DETECTOR_DETAIL_TABS } from '../utils/constants';

export interface DetectorRouterProps {
  detectorId?: string;
}
interface DetectorDetailProps
  extends RouteComponentProps<DetectorRouterProps> {}

const tabs = [
  {
    id: DETECTOR_DETAIL_TABS.RESULTS,
    name: 'Anomaly Results',
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
}

export const DetectorDetail = (props: DetectorDetailProps) => {
  const dispatch = useDispatch();
  const detectorId = get(props, 'match.params.detectorId', '') as string;
  const { monitor, fetchMonitorError } = useFetchMonitorInfo(detectorId);
  const { detector, hasError } = useFetchDetectorInfo(detectorId);
  //TODO: test dark mode once detector configuration and AD result page merged
  const isDark = darkModeEnabled();

  const [detecorDetailModel, setDetecorDetailModel] = useState<
    DetectorDetailModel
  >({
    selectedTab: getSelectedTabId(
      props.location.pathname
    ) as DETECTOR_DETAIL_TABS,
    showDeleteDetectorModal: false,
    showStopDetectorModalFor: undefined,
    showMonitorCalloutModal: false,
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

  const handleTabChange = (route: DETECTOR_DETAIL_TABS) => {
    setDetecorDetailModel({
      ...detecorDetailModel,
      selectedTab: route,
    });
    props.history.push(route);
  };

  const hideMonitorCalloutModal = () => {
    setDetecorDetailModel({
      ...detecorDetailModel,
      showMonitorCalloutModal: false,
    });
  };

  const hideStopDetectorModal = () => {
    setDetecorDetailModel({
      ...detecorDetailModel,
      showStopDetectorModalFor: undefined,
    });
  };

  const hideDeleteDetectorModal = () => {
    setDetecorDetailModel({
      ...detecorDetailModel,
      showDeleteDetectorModal: false,
    });
  };

  const handleStopDetectorForEditing = (detectorId: string) => {
    const listener: Listener = {
      onSuccess: () => {
        if (detecorDetailModel.showStopDetectorModalFor === 'detector') {
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
        'Detector job has been stoped successfully'
      );
      if (listener) listener.onSuccess();
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem stoping detector job')
      );
      if (listener) listener.onException();
    }
  };

  const handleDelete = useCallback(async () => {
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

  const lightStyles = {
    backgroundColor: '#FFF',
  };
  const monitorCallout = monitor ? (
    <MonitorCallout monitorId={monitor.id} monitorName={monitor.name} />
  ) : null;

  return (
    <React.Fragment>
      <EuiFlexGroup
        direction="column"
        style={{
          ...(isDark
            ? { flexGrow: 'unset' }
            : { ...lightStyles, flexGrow: 'unset' }),
        }}
      >
        <EuiFlexGroup justifyContent="spaceBetween" style={{ padding: '10px' }}>
          <EuiFlexItem grow={false}>
            <EuiTitle size="l">
              <h1>
                {detector && detector.name}{' '}
                {detector && detector.enabled ? (
                  <EuiHealth color="success">
                    Running since{' '}
                    {detector.enabledTime
                      ? moment(detector.enabledTime).format('MM/DD/YY h:mm a')
                      : '?'}
                  </EuiHealth>
                ) : (
                  <EuiHealth color="subdued">
                    {detector.featureAttributes &&
                    detector.featureAttributes.length
                      ? detector.disabledTime
                        ? `Stopped at ${moment(detector.disabledTime).format(
                            'MM/DD/YY h:mm a'
                          )}`
                        : 'Detector is not started'
                      : 'Feature required to start the detector'}
                  </EuiHealth>
                )}
              </h1>
            </EuiTitle>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <DetectorControls
              onEditDetector={() => {
                detector.enabled
                  ? setDetecorDetailModel({
                      ...detecorDetailModel,
                      showStopDetectorModalFor: 'detector',
                    })
                  : props.history.push(`/detectors/${detectorId}/edit`);
              }}
              onDelete={() =>
                setDetecorDetailModel({
                  ...detecorDetailModel,
                  showDeleteDetectorModal: true,
                })
              }
              onStartDetector={() => handleStartAdJob(detectorId)}
              onStopDetector={() =>
                monitor
                  ? setDetecorDetailModel({
                      ...detecorDetailModel,
                      showMonitorCalloutModal: true,
                    })
                  : handleStopAdJob(detectorId)
              }
              onEditFeatures={() => {
                detector.enabled
                  ? setDetecorDetailModel({
                      ...detecorDetailModel,
                      showStopDetectorModalFor: 'features',
                    })
                  : props.history.push(`/detectors/${detectorId}/features`);
              }}
              detector={detector}
            />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTabs>
              {tabs.map(tab => (
                <EuiTab
                  onClick={() => {
                    handleTabChange(tab.route);
                  }}
                  isSelected={tab.id === detecorDetailModel.selectedTab}
                  key={tab.id}
                >
                  {tab.name}
                </EuiTab>
              ))}
            </EuiTabs>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexGroup>
      {detecorDetailModel.showDeleteDetectorModal ? (
        <EuiOverlayMask>
          <ConfirmModal
            title="Delete detector?"
            description="Detector and feature configuration will be removed and the deletion is irreversible and you can’t review anomaly result of this detector on Kibana. To confirm deletion, click the delete button."
            callout={monitorCallout}
            confirmButtonText="Delete"
            confirmButtonColor="danger"
            onClose={hideDeleteDetectorModal}
            onCancel={hideDeleteDetectorModal}
            onConfirm={handleDelete}
          />
        </EuiOverlayMask>
      ) : null}

      {detecorDetailModel.showStopDetectorModalFor ? (
        <EuiOverlayMask>
          <ConfirmModal
            title="Stop detector to proceed?"
            description="Stop the detector before you can edit any detector
                      configuration. Reconfiguration requires a restart and
                      reinitialization."
            callout={monitorCallout}
            confirmButtonText="Stop and proceed to edit"
            confirmButtonColor="primary"
            onClose={hideStopDetectorModal}
            onCancel={hideStopDetectorModal}
            onConfirm={() => handleStopDetectorForEditing(detectorId)}
          />
        </EuiOverlayMask>
      ) : null}

      {detecorDetailModel.showMonitorCalloutModal ? (
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
          render={props => (
            // placeholder for AnomalyResults page, will change to
            // <AnomalyResults
            //   {...props}
            //   detectorId={detectorId}
            //   onSwitchToConfiguration={handleSwitchToConfigurationTab}
            // />
            <div style={{ paddingTop: '20px' }}>AnomalyResults page</div>
          )}
        />
        <Route
          exact
          path="/detectors/:detectorId/configurations"
          render={props => (
            // placeholder for DetectorConfig page, will change to
            // <DetectorConfig
            //   {...props}
            //   detectorId={detectorId}
            //   detector={detector}
            // />
            <div style={{ paddingTop: '20px' }}>DetectorConfig page</div>
          )}
        />
        <Redirect to="/detectors/:detectorId/results" />
      </Switch>
    </React.Fragment>
  );
};
