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
import { EuiButton, EuiEmptyPrompt, EuiLoadingSpinner } from '@elastic/eui';
import { Fragment } from 'react';
import { Detector } from '../../../../models/interfaces';

export interface DetectorInitializingProps {
  detector: Detector;
  onSwitchToConfiguration(): void;
}

export const DetectorInitializing = (props: DetectorInitializingProps) => {
  return (
    <EuiEmptyPrompt
      style={{ maxWidth: '75%' }}
      title={
        <div>
          <EuiLoadingSpinner size="l" />
          <h2>The detector is initializing...</h2>
        </div>
      }
      body={
        <Fragment>
          <p>
            Based on your latest update to the detector configuration, the
            detector is collecting sufficient data to generate accurate
            real-time anomalies.
          </p>
          <p>
            The longer the detector interval is, the more time this will take.
          </p>
        </Fragment>
      }
      actions={
        <EuiButton
          onClick={props.onSwitchToConfiguration}
          style={{ width: '250px' }}
        >
          View detector configuration
        </EuiButton>
      }
    />
  );
};
