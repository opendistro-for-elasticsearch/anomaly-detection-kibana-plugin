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

//@ts-ignore
import moment from 'moment';
import React from 'react';
import {
  EuiCallOut,
  EuiFlexGroup,
  EuiLoadingSpinner,
  EuiText,
  EuiFlexItem,
  EuiProgress,
} from '@elastic/eui';
import { Detector } from '../../../models/interfaces';
import { DETECTOR_STATE } from '../../../../server/utils/constants';

export const waitForMs = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));

export const getCallout = (detector: Detector, isStoppingDetector: boolean) => {
  if (!detector || !detector.curState) {
    return null;
  }
  const runningProgress = detector.taskProgress
    ? Math.round(detector.taskProgress * 100)
    : undefined;
  const runningProgressPctStr = runningProgress
    ? runningProgress.toString() + '%'
    : '';

  if (isStoppingDetector) {
    return (
      <EuiCallOut
        title={
          <div>
            <EuiFlexGroup direction="row" gutterSize="xs">
              <EuiLoadingSpinner size="l" style={{ marginRight: '8px' }} />
              <EuiText>
                <p>Stopping the historical detector</p>
              </EuiText>
            </EuiFlexGroup>
          </div>
        }
        color="primary"
      />
    );
  }
  switch (detector.curState) {
    case DETECTOR_STATE.DISABLED:
      return (
        <EuiCallOut
          title="The historical detector is stopped"
          color="primary"
          iconType="alert"
        />
      );
    case DETECTOR_STATE.INIT:
      return (
        <EuiCallOut
          title={
            <div>
              <EuiFlexGroup direction="row" gutterSize="xs">
                <EuiLoadingSpinner size="l" style={{ marginRight: '8px' }} />
                <EuiText>
                  <p>Initializing the historical detector</p>
                </EuiText>
              </EuiFlexGroup>
            </div>
          }
          color="primary"
        />
      );
    case DETECTOR_STATE.RUNNING:
      return (
        <EuiCallOut
          title={
            <div>
              <EuiFlexGroup direction="row" gutterSize="xs">
                <EuiLoadingSpinner size="l" style={{ marginRight: '8px' }} />
                <EuiText>
                  <p>Running the historical detector</p>
                </EuiText>
              </EuiFlexGroup>
              {runningProgress ? (
                <EuiFlexGroup
                  direction="row"
                  gutterSize="xs"
                  alignItems="center"
                  style={{ marginTop: '12px' }}
                >
                  <EuiFlexItem>
                    <EuiText>{runningProgressPctStr}</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem style={{ marginLeft: '-150px' }}>
                    <EuiProgress
                      //@ts-ignore
                      value={runningProgress}
                      max={100}
                      color="primary"
                      size="s"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              ) : null}
            </div>
          }
          color="primary"
        />
      );
    default:
      return null;
  }
};

export const getRunningHistoricalDetectorCount = (
  historicalDetectors: Detector[]
) => {
  return historicalDetectors.filter(
    (detector) =>
      detector.curState === DETECTOR_STATE.INIT ||
      detector.curState === DETECTOR_STATE.RUNNING
  ).length;
};
