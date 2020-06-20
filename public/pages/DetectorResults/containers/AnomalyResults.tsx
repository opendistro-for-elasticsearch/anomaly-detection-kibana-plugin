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
  EuiPage,
  EuiPageBody,
  EuiSpacer,
  EuiCallOut,
  EuiButton,
} from '@elastic/eui';
import { get } from 'lodash';
import React, { useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router';
//@ts-ignore
import chrome from 'ui/chrome';
import { AppState } from '../../../redux/reducers';
import { BREADCRUMBS, DETECTOR_STATE } from '../../../utils/constants';
import { AnomalyResultsLiveChart } from './AnomalyResultsLiveChart';
import { AnomalyHistory } from './AnomalyHistory';
import { DetectorStateDetails } from './DetectorStateDetails';
import {
  getDetectorInitializationInfo,
  IS_INIT_OVERTIME_FIELD,
  INIT_DETAILS_FIELD,
  INIT_ERROR_MESSAGE_FIELD,
  INIT_ACTION_ITEM_FIELD,
} from '../utils/utils';
import { getDetector } from '../../../redux/reducers/ad';
import { MIN_IN_MILLI_SECS } from '../../../../server/utils/constants';
import { getInitFailureMessageAndActionItem } from '../../DetectorDetail/utils/helpers';

interface AnomalyResultsProps extends RouteComponentProps {
  detectorId: string;
  onStartDetector(): void;
  onSwitchToConfiguration(): void;
}

export function AnomalyResults(props: AnomalyResultsProps) {
  const dispatch = useDispatch();
  const detectorId = props.detectorId;
  const detector = useSelector(
    (state: AppState) => state.ad.detectors[detectorId]
  );

  useEffect(() => {
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
      { text: detector ? detector.name : '' },
    ]);
  }, []);

  const fetchDetector = async () => {
    await dispatch(getDetector(detectorId));
  };

  useEffect(() => {
    if (detector && detector.curState === DETECTOR_STATE.INIT) {
      const id = setInterval(fetchDetector, MIN_IN_MILLI_SECS);
      return () => {
        clearInterval(id);
      };
    }
  }, [detector]);

  const monitors = useSelector((state: AppState) => state.alerting.monitors);
  const monitor = get(monitors, `${detectorId}.0`);

  const isDetectorRunning =
    detector && detector.curState === DETECTOR_STATE.RUNNING;

  const isDetectorPaused =
    detector &&
    detector.curState === DETECTOR_STATE.DISABLED &&
    !detector.enabled &&
    detector.enabledTime &&
    detector.disabledTime;

  const isDetectorUpdated =
    // @ts-ignore
    isDetectorPaused && detector.lastUpdateTime > detector.disabledTime;

  const isDetectorInitializing =
    detector && detector.curState === DETECTOR_STATE.INIT;

  const initializationInfo = getDetectorInitializationInfo(detector);

  const isInitOvertime = get(initializationInfo, IS_INIT_OVERTIME_FIELD, false);
  const initDetails = get(initializationInfo, INIT_DETAILS_FIELD, {});
  const initErrorMessage = get(initDetails, INIT_ERROR_MESSAGE_FIELD, '');
  const initActionItem = get(initDetails, INIT_ACTION_ITEM_FIELD, '');

  const isInitializingNormally = isDetectorInitializing && !isInitOvertime;

  const isDetectorFailed =
    detector &&
    (detector.curState === DETECTOR_STATE.INIT_FAILURE ||
      detector.curState === DETECTOR_STATE.UNEXPECTED_FAILURE);

  return (
    <Fragment>
      <EuiPage style={{ marginTop: '16px', paddingTop: '0px' }}>
        <EuiPageBody>
          <EuiSpacer size="l" />
          {
            <Fragment>
              {isDetectorRunning ||
              isDetectorPaused ||
              isDetectorInitializing ||
              isDetectorFailed ? (
                <Fragment>
                  {isDetectorUpdated ||
                  isDetectorInitializing ||
                  isDetectorFailed ? (
                    <EuiCallOut
                      title={
                        isDetectorUpdated
                          ? 'The detector configuration has changed since it was last stopped.'
                          : isInitializingNormally
                          ? 'The detector is being initialized based on the latest configuration changes.'
                          : isInitOvertime
                          ? `Detector initialization is not complete because ${initErrorMessage}.`
                          : // detector has failure
                            `The detector is not initialized because ${get(
                              getInitFailureMessageAndActionItem(
                                //@ts-ignore
                                detector.stateError
                              ),
                              'cause',
                              ''
                            )}.`
                      }
                      color={
                        isInitializingNormally
                          ? 'primary'
                          : isInitOvertime || isDetectorUpdated
                          ? 'warning'
                          : // detector has failure
                            'danger'
                      }
                      iconType={isInitializingNormally ? 'iInCircle' : 'alert'}
                      style={{ marginBottom: '20px' }}
                    >
                      {isDetectorUpdated ? (
                        <p>
                          Restart the detector to see accurate anomalies based
                          on configuration changes.
                        </p>
                      ) : isInitializingNormally ? (
                        <p>
                          After the initialization is complete, you will see the
                          anomaly results based on your latest configuration
                          changes.
                        </p>
                      ) : isInitOvertime ? (
                        <p>{`${initActionItem}`}</p>
                      ) : (
                        // detector has failure
                        <p>{`${get(
                          getInitFailureMessageAndActionItem(
                            //@ts-ignore
                            detector.stateError
                          ),
                          'actionItem',
                          ''
                        )}`}</p>
                      )}
                      <EuiButton
                        onClick={props.onSwitchToConfiguration}
                        color={
                          isInitializingNormally
                            ? 'primary'
                            : isInitOvertime || isDetectorUpdated
                            ? 'warning'
                            : // detector has failure
                              'danger'
                        }
                        style={{ marginRight: '8px' }}
                      >
                        View detector configuration
                      </EuiButton>
                      {isDetectorUpdated || isDetectorFailed ? (
                        <EuiButton
                          color={isDetectorFailed ? 'danger' : 'warning'}
                          onClick={props.onStartDetector}
                          iconType={'play'}
                          style={{ marginLeft: '8px' }}
                        >
                          Restart detector
                        </EuiButton>
                      ) : null}
                    </EuiCallOut>
                  ) : null}
                  <AnomalyResultsLiveChart detector={detector} />
                  <EuiSpacer size="l" />
                  <AnomalyHistory
                    detector={detector}
                    monitor={monitor}
                    createFeature={() =>
                      props.history.push(`/detectors/${detectorId}/features`)
                    }
                  />
                </Fragment>
              ) : detector ? (
                <Fragment>
                  <DetectorStateDetails
                    detectorId={detectorId}
                    onStartDetector={props.onStartDetector}
                    onSwitchToConfiguration={props.onSwitchToConfiguration}
                  />
                </Fragment>
              ) : null}
            </Fragment>
          }
        </EuiPageBody>
      </EuiPage>
    </Fragment>
  );
}
