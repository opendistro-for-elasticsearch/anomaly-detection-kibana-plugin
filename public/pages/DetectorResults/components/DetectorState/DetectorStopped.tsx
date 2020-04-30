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

import React from 'react';
import { EuiButton, EuiEmptyPrompt } from '@elastic/eui';
import { Fragment } from 'react';
import { Detector } from '../../../../models/interfaces';

export interface DetectorStoppedProps {
  detector: Detector;
  onStartDetector(): void;
  onSwitchToConfiguration(): void;
}

export const DetectorStopped = (props: DetectorStoppedProps) => {
  return (
    <EuiEmptyPrompt
      style={{ maxWidth: '75%' }}
      title={<h2>The detector is stopped</h2>}
      body={
        <Fragment>
          {props.detector.enabledTime ? (
            <p>
              The detector is stopped due to your latest update to the detector
              configuration. Run the detector to see anomalies.
            </p>
          ) : (
            <p>
              The detector is never started. Please start the detector to see
              anomalies.
            </p>
          )}
        </Fragment>
      }
      actions={[
        <EuiButton
          onClick={props.onSwitchToConfiguration}
          style={{ width: '250px' }}
        >
          View detector configuration
        </EuiButton>,
        <EuiButton
          fill={!props.detector.enabledTime}
          onClick={props.onStartDetector}
          iconType={'play'}
          style={{ width: '250px' }}
        >
          {props.detector.enabledTime ? 'Restart detector' : 'Start detector'}
        </EuiButton>,
      ]}
    />
  );
};
