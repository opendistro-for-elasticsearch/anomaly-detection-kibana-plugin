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

export interface DetectorFeatureRequiredProps {
  detector: Detector;
  onSwitchToConfiguration(): void;
}

export const DetectorFeatureRequired = (
  props: DetectorFeatureRequiredProps
) => {
  return (
    <EuiEmptyPrompt
      style={{ maxWidth: '75%' }}
      title={<h2>Features are required to run a detector</h2>}
      body={
        <Fragment>
          <p>
            Specify index fields that you want to find anomalies for by defining
            features. Once you define the features, you can preview your
            anomalies from a sample feature output.
          </p>
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
      ]}
    />
  );
};
