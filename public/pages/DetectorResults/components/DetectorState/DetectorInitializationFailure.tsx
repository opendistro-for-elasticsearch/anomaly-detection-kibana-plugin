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
import { EuiButton, EuiEmptyPrompt, EuiIcon } from '@elastic/eui';
import { Fragment } from 'react';
import { Detector } from '../../../../models/interfaces';

export interface DetectorInitializationFailureProps {
  detector: Detector;
  onStartDetector(): void;
  failureDetail: any;
  onSwitchToConfiguration(): void;
}

export const DetectorInitializationFailure = (
  props: DetectorInitializationFailureProps
) => {
  return (
    <EuiEmptyPrompt
      style={{ maxWidth: '75%' }}
      title={
        <div>
          <EuiIcon type="alert" size="l" color="danger" />

          <h2>
            {`The detector cannot be initialized due to ${props.failureDetail.cause}`}
          </h2>
        </div>
      }
      body={
        <Fragment>
          <p>{`${props.failureDetail.actionItem}`}</p>
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
          onClick={props.onStartDetector}
          iconType={'play'}
          style={{ width: '250px' }}
        >
          Restart detector
        </EuiButton>,
      ]}
    />
  );
};
