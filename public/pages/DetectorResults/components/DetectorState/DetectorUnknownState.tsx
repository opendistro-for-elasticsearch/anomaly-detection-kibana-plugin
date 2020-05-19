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
import { DETECTOR_INIT_FAILURES } from '../../../DetectorDetail/utils/constants';

export interface DetectorUnknownStateProps {
  onSwitchToConfiguration(): void;
  onStartDetector(): void;
}

export const DetectorUnknownState = (props: DetectorUnknownStateProps) => {
  return (
    <EuiEmptyPrompt
      style={{ maxWidth: '75%' }}
      title={
        <div>
          <EuiIcon type="alert" size="l" color="danger" />

          <h2>The detector is in unknown state</h2>
        </div>
      }
      body={
        <Fragment>
          <p>{`${DETECTOR_INIT_FAILURES.UNKNOWN_EXCEPTION.actionItem}`}</p>
        </Fragment>
      }
      actions={[
        <EuiButton
          color="primary"
          fill
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
