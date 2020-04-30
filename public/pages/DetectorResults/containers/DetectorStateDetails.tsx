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
import { Detector } from '../../../models/interfaces';
import { getInitFailureMessageAndActionItem } from '../../DetectorDetail/utils/helpers';
import { DETECTOR_STATE } from '../../../utils/constants';
import { DetectorStopped } from '../components/DetectorState/DetectorStopped';
import { DetectorInitializing } from '../components/DetectorState/DetectorInitializing';
import { DetectorInitializationFailure } from '../components/DetectorState/DetectorInitializationFailure';
import { DetectorFeatureRequired } from '../components/DetectorState/DetectorFeatureRequired';

export interface DetectorStateDetailsProp {
  detector: Detector;
  onStartDetector(): void;
  onSwitchToConfiguration(): void;
}

export const DetectorStateDetails = (props: DetectorStateDetailsProp) => {
  const currentState = props.detector.curState;

  switch (currentState) {
    case DETECTOR_STATE.DISABLED:
      return (
        <DetectorStopped
          detector={props.detector}
          onStartDetector={props.onStartDetector}
          onSwitchToConfiguration={props.onSwitchToConfiguration}
        />
      );
    case DETECTOR_STATE.INIT:
      return (
        <DetectorInitializing
          detector={props.detector}
          onSwitchToConfiguration={props.onSwitchToConfiguration}
        />
      );
    case DETECTOR_STATE.INIT_FAILURE:
      const failureDetail = getInitFailureMessageAndActionItem(
        props.detector.initializationError
      );
      return (
        <DetectorInitializationFailure
          detector={props.detector}
          onStartDetector={props.onStartDetector}
          failureDetail={failureDetail}
          onSwitchToConfiguration={props.onSwitchToConfiguration}
        />
      );
    case DETECTOR_STATE.FEATURE_REQUIRED:
      return <DetectorFeatureRequired detector={props.detector} />;
    default:
      console.log('Unknown detector state', currentState);
      return null;
  }
};
