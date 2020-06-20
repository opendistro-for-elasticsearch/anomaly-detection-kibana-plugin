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
import React, { useEffect } from 'react';
import { DETECTOR_STATE } from '../../../utils/constants';
import { DetectorStopped } from '../components/DetectorState/DetectorStopped';
import { DetectorFeatureRequired } from '../components/DetectorState/DetectorFeatureRequired';
import { DetectorUnknownState } from '../components/DetectorState/DetectorUnknownState';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducers';
import { getDetector } from '../../../redux/reducers/ad';

export interface DetectorStateDetailsProp {
  detectorId: string;
  onStartDetector(): void;
  onSwitchToConfiguration(): void;
}

export const DetectorStateDetails = (props: DetectorStateDetailsProp) => {
  const dispatch = useDispatch();
  const detector = useSelector(
    (state: AppState) => state.ad.detectors[props.detectorId]
  );
  const currentState = detector.curState;

  useEffect(() => {
    dispatch(getDetector(props.detectorId));
  }, []);

  switch (currentState) {
    case DETECTOR_STATE.DISABLED:
      return (
        <DetectorStopped
          onStartDetector={props.onStartDetector}
          onSwitchToConfiguration={props.onSwitchToConfiguration}
        />
      );
    case DETECTOR_STATE.FEATURE_REQUIRED:
      return (
        <DetectorFeatureRequired
          detector={detector}
          onSwitchToConfiguration={props.onSwitchToConfiguration}
        />
      );
    default:
      // ideally we shoul not reach here
      console.log('Unknown detector state', currentState);
      return (
        <DetectorUnknownState
          onStartDetector={props.onStartDetector}
          onSwitchToConfiguration={props.onSwitchToConfiguration}
        />
      );
  }
};
