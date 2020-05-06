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
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
//@ts-ignore
import chrome from 'ui/chrome';
import { AppState } from '../../../redux/reducers';
import { BREADCRUMBS, DETECTOR_STATE } from '../../../utils/constants';
import { AnomalyResultsLiveChart } from './AnomalyResultsLiveChart';
import { AnomalyHistory } from './AnomalyHistory';
import { DetectorStateDetails } from './DetectorStateDetails';

interface AnomalyResultsProps extends RouteComponentProps {
  detectorId: string;
  onStartDetector(): void;
  onSwitchToConfiguration(): void;
}

export function AnomalyResults(props: AnomalyResultsProps) {
  const detectorId = get(props, 'match.params.detectorId', '') as string;
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

  const monitors = useSelector((state: AppState) => state.alerting.monitors);
  const monitor = get(monitors, `${detectorId}.0`);
  return (
    <Fragment>
      <EuiPage style={{ marginTop: '16px', paddingTop: '0px' }}>
        <EuiPageBody>
          <EuiSpacer size="l" />
          {
            <Fragment>
              {detector && detector.curState === DETECTOR_STATE.RUNNING ? (
                <Fragment>
                  {!detector.enabled &&
                  detector.disabledTime &&
                  detector.lastUpdateTime > detector.disabledTime ? (
                    <EuiCallOut
                      title="There are change(s) to the detector configuration after the detector is stopped."
                      color="warning"
                      iconType="alert"
                    >
                      <p>
                        Restart the detector to see accurate anomalies based on
                        your latest configuration.
                      </p>
                      <EuiButton
                        onClick={props.onSwitchToConfiguration}
                        color="warning"
                      >
                        View detector configuration
                      </EuiButton>
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
              ) : detector && detector.curState !== DETECTOR_STATE.RUNNING ? (
                <Fragment>
                  <DetectorStateDetails
                    detectorId={detector.id}
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
