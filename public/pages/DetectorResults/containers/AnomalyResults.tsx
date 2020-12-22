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
  EuiProgress,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { get, isEmpty } from 'lodash';
import React, { useEffect, Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { AppState } from '../../../redux/reducers';
import {
  BREADCRUMBS,
  FEATURE_DATA_POINTS_WINDOW,
  MISSING_FEATURE_DATA_SEVERITY,
} from '../../../utils/constants';
import { DETECTOR_STATE } from '../../../../server/utils/constants';
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
import moment from 'moment';
import { DateRange } from '../../../models/interfaces';
import {
  getFeatureDataPointsForDetector,
  buildParamsForGetAnomalyResultsWithDateRange,
  getFeatureMissingSeverities,
  getFeatureDataMissingMessageAndActionItem,
  FEATURE_DATA_CHECK_WINDOW_OFFSET,
} from '../../utils/anomalyResultUtils';
import { getDetectorResults } from '../../../redux/reducers/anomalyResults';
import {
  detectorIsSample,
  getAssociatedIndex,
} from '../../SampleData/utils/helpers';
import { SampleIndexDetailsCallout } from '../../SampleData/components/SampleIndexDetailsCallout/SampleIndexDetailsCallout';
import { CoreStart } from '../../../../../../src/core/public';
import { CoreServicesContext } from '../../../components/CoreServices/CoreServices';

interface AnomalyResultsProps extends RouteComponentProps {
  detectorId: string;
  onStartDetector(): void;
  onSwitchToConfiguration(): void;
}

export function AnomalyResults(props: AnomalyResultsProps) {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  const dispatch = useDispatch();
  const detectorId = props.detectorId;
  const detector = useSelector(
    (state: AppState) => state.ad.detectors[detectorId]
  );

  useEffect(() => {
    core.chrome.setBreadcrumbs([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
      { text: detector ? detector.name : '' },
    ]);
    dispatch(getDetector(detectorId));
  }, []);

  const fetchDetector = async () => {
    dispatch(getDetector(detectorId));
  };

  useEffect(() => {
    if (detector && detector.curState === DETECTOR_STATE.INIT) {
      const id = setInterval(fetchDetector, MIN_IN_MILLI_SECS);
      return () => {
        clearInterval(id);
      };
    }
  }, [detector]);

  useEffect(() => {
    if (
      detector &&
      (detector.curState === DETECTOR_STATE.INIT ||
        detector.curState === DETECTOR_STATE.RUNNING)
    ) {
      checkLatestFeatureDataPoints();
      const id = setInterval(checkLatestFeatureDataPoints, MIN_IN_MILLI_SECS);
      return () => {
        clearInterval(id);
      };
    }
  }, [detector]);

  useEffect(() => {
    if (detector && detectorIsSample(detector)) {
      setIsSampleDetector(true);
      setSampleIndexName(getAssociatedIndex(detector));
    } else {
      setIsSampleDetector(false);
    }
  }, [detector]);

  const monitors = useSelector((state: AppState) => state.alerting.monitors);
  const monitor = get(monitors, `${detectorId}.0`);

  const [featureMissingSeverity, setFeatureMissingSeverity] = useState<
    MISSING_FEATURE_DATA_SEVERITY
  >();

  const [isSampleDetector, setIsSampleDetector] = useState<boolean>(false);

  const [sampleIndexName, setSampleIndexName] = useState<string>('');

  const [featureNamesAtHighSev, setFeatureNamesAtHighSev] = useState(
    [] as string[]
  );

  // If the detector is returning undefined estimated minutes left, then it
  // is still performing the cold start.
  const isPerformingColdStart =
    detector &&
    detector.curState === DETECTOR_STATE.INIT &&
    detector.initProgress &&
    detector.initProgress.estimatedMinutesLeft === undefined;

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

  const isDetectorMissingData = featureMissingSeverity
    ? (isDetectorInitializing || isDetectorRunning) &&
      featureMissingSeverity > MISSING_FEATURE_DATA_SEVERITY.GREEN
    : undefined;

  const initializationInfo = featureMissingSeverity
    ? getDetectorInitializationInfo(detector)
    : undefined;

  const isInitOvertime = get(initializationInfo, IS_INIT_OVERTIME_FIELD);
  const initDetails = get(initializationInfo, INIT_DETAILS_FIELD, {});
  const initErrorMessage = get(initDetails, INIT_ERROR_MESSAGE_FIELD, '');
  const initActionItem = get(initDetails, INIT_ACTION_ITEM_FIELD, '');

  const isDetectorFailed =
    detector &&
    (detector.curState === DETECTOR_STATE.INIT_FAILURE ||
      detector.curState === DETECTOR_STATE.UNEXPECTED_FAILURE);

  const detectorIntervalInMin = get(
    detector,
    'detectionInterval.period.interval',
    1
  );

  const isInitializingNormally =
    isDetectorInitializing &&
    isInitOvertime != undefined &&
    !isInitOvertime &&
    isDetectorMissingData != undefined &&
    !isDetectorMissingData;

  const isHCDetector = !isEmpty(get(detector, 'categoryField', []));

  const checkLatestFeatureDataPoints = async () => {
    const featureDataPointsRange = {
      startDate: Math.max(
        moment()
          .subtract(
            (FEATURE_DATA_POINTS_WINDOW + FEATURE_DATA_CHECK_WINDOW_OFFSET) *
              detectorIntervalInMin,
            'minutes'
          )
          .valueOf(),
        //@ts-ignore
        detector.enabledTime
      ),
      endDate: moment().valueOf(),
    } as DateRange;

    const params = buildParamsForGetAnomalyResultsWithDateRange(
      featureDataPointsRange.startDate,
      featureDataPointsRange.endDate
    );

    try {
      const detectorResultResponse = await dispatch(
        getDetectorResults(detectorId, params, false)
      );
      const featuresData = get(
        detectorResultResponse,
        'response.featureResults',
        []
      );
      const featureDataPoints = getFeatureDataPointsForDetector(
        detector,
        featuresData,
        detectorIntervalInMin,
        featureDataPointsRange
      );

      const featureMissingSeveritiesMap = getFeatureMissingSeverities(
        featureDataPoints
      );
      let highestSeverity = MISSING_FEATURE_DATA_SEVERITY.GREEN;
      let featuresAtHighestSev = [] as string[];
      featureMissingSeveritiesMap.forEach((featureNames, severity, map) => {
        if (severity > highestSeverity) {
          highestSeverity = severity;
          featuresAtHighestSev = featureNames;
        }
      });

      setFeatureMissingSeverity(highestSeverity);
      setFeatureNamesAtHighSev(featuresAtHighestSev);
    } catch (err) {
      console.error(
        `Failed to get anomaly results for ${detectorId} during getting latest feature data points`,
        err
      );
    }
  };

  const getCalloutTitle = () => {
    if (isDetectorUpdated) {
      return 'The detector configuration has changed since it was last stopped.';
    }
    if (isDetectorMissingData) {
      return get(
        getFeatureDataMissingMessageAndActionItem(
          featureMissingSeverity,
          featureNamesAtHighSev,
          isHCDetector
        ),
        'message',
        ''
      );
    }
    if (isPerformingColdStart) {
      return (
        <div>
          <EuiFlexGroup direction="row" gutterSize="s">
            <EuiLoadingSpinner
              size="l"
              style={{
                marginLeft: '4px',
                marginRight: '8px',
                marginBottom: '8px',
              }}
            />
            <EuiText>
              <p>
                Attempting to initialize the detector with historical data. This
                will take approximately{' '}
                {detector.detectionInterval.period.interval} minutes.
              </p>
            </EuiText>
          </EuiFlexGroup>
        </div>
      );
    }
    if (isInitializingNormally) {
      return 'The detector is being initialized based on the latest configuration changes.';
    }
    if (isInitOvertime) {
      return `Detector initialization is not complete because ${initErrorMessage}.`;
    }
    if (isDetectorFailed) {
      return `The detector is not initialized because ${get(
        getInitFailureMessageAndActionItem(
          //@ts-ignore
          detector.stateError
        ),
        'cause',
        ''
      )}.`;
    }
  };
  const getCalloutColor = () => {
    if (
      isDetectorFailed ||
      featureMissingSeverity === MISSING_FEATURE_DATA_SEVERITY.RED
    ) {
      return 'danger';
    }
    if (
      isInitOvertime ||
      isDetectorUpdated ||
      featureMissingSeverity === MISSING_FEATURE_DATA_SEVERITY.YELLOW
    ) {
      return 'warning';
    }
    if (isInitializingNormally) {
      return 'primary';
    }
  };

  const getInitProgressMessage = () => {
    return detector &&
      isDetectorInitializing &&
      !isHCDetector &&
      get(detector, 'initProgress.estimatedMinutesLeft')
      ? `The detector needs ${get(
          detector,
          'initProgress.estimatedMinutesLeft'
        )} minutes for initializing. If your data stream is not continuous, it may take even longer. `
      : '';
  };

  const getCalloutContent = () => {
    return isDetectorUpdated ? (
      <p>
        Restart the detector to see accurate anomalies based on configuration
        changes.
      </p>
    ) : isDetectorMissingData ? (
      <p>
        {getInitProgressMessage()}
        {get(
          getFeatureDataMissingMessageAndActionItem(
            featureMissingSeverity,
            featureNamesAtHighSev,
            isHCDetector
          ),
          'actionItem',
          ''
        )}
      </p>
    ) : isPerformingColdStart ? null : isInitializingNormally ? (
      <p>
        {getInitProgressMessage()}After the initialization is complete, you will
        see the anomaly results based on your latest configuration changes.
      </p>
    ) : isInitOvertime ? (
      <p>{`${getInitProgressMessage()}${initActionItem}`}</p>
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
    );
  };
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
                  {isSampleDetector ? (
                    <Fragment>
                      {' '}
                      <SampleIndexDetailsCallout
                        indexName={sampleIndexName}
                      />{' '}
                      <EuiSpacer size="l" />{' '}
                    </Fragment>
                  ) : null}
                  {isDetectorUpdated ||
                  // don't show miss feature callout for HC detector
                  (isDetectorMissingData && !isHCDetector) ||
                  isInitializingNormally ||
                  (isInitOvertime && !isHCDetector) ||
                  isDetectorFailed ? (
                    <EuiCallOut
                      title={getCalloutTitle()}
                      color={getCalloutColor()}
                      iconType={
                        isPerformingColdStart
                          ? ''
                          : isInitializingNormally
                          ? 'iInCircle'
                          : 'alert'
                      }
                      style={{ marginBottom: '20px' }}
                    >
                      {getCalloutContent()}
                      {isPerformingColdStart ? null : isDetectorInitializing &&
                        detector.initProgress &&
                        !isHCDetector ? (
                        <div>
                          <EuiFlexGroup alignItems="center">
                            <EuiFlexItem
                              style={{ maxWidth: '20px', marginRight: '5px' }}
                            >
                              <EuiText>
                                {
                                  //@ts-ignore
                                  detector.initProgress.percentageStr
                                }
                              </EuiText>
                            </EuiFlexItem>
                            <EuiFlexItem>
                              <EuiProgress
                                //@ts-ignore
                                value={detector.initProgress.percentageStr.replace(
                                  '%',
                                  ''
                                )}
                                max={100}
                                color="primary"
                                size="xs"
                              />
                            </EuiFlexItem>
                          </EuiFlexGroup>
                          <EuiSpacer size="l" />
                        </div>
                      ) : null}
                      <EuiButton
                        onClick={props.onSwitchToConfiguration}
                        color={
                          featureMissingSeverity ===
                            MISSING_FEATURE_DATA_SEVERITY.RED ||
                          isDetectorFailed
                            ? 'danger'
                            : isInitOvertime ||
                              isDetectorUpdated ||
                              featureMissingSeverity ===
                                MISSING_FEATURE_DATA_SEVERITY.YELLOW
                            ? 'warning'
                            : 'primary'
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
                    isFeatureDataMissing={isDetectorMissingData}
                    isNotSample={true}
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
