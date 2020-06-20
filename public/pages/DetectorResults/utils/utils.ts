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
import { Detector } from '../../../models/interfaces';
import {
  NO_FULL_SHINGLE_ERROR_MESSAGE,
  NO_DATA_IN_WINDOW_ERROR_MESSAGE,
  NO_RCF_MODEL_ERROR_MESSAGE,
} from './constants';
import { DETECTOR_STATE, SHINGLE_SIZE } from '../../../utils/constants';
import moment, { Moment } from 'moment';
import { DETECTOR_INIT_FAILURES } from '../../../pages/DetectorDetail/utils/constants';

export const IS_INIT_OVERTIME_FIELD = 'isInitOvertime';
export const INIT_DETAILS_FIELD = 'initDetails';
export const INIT_ERROR_MESSAGE_FIELD = 'initErrorMessage';
export const INIT_ACTION_ITEM_FIELD = 'initActionItem';

export const getDetectorInitializationInfo = (detector: Detector) => {
  const currentTime = moment();

  let result = {
    [IS_INIT_OVERTIME_FIELD]: false,
    [INIT_DETAILS_FIELD]: {},
  };
  if (isDetectorInitOverTime(currentTime, detector)) {
    result[IS_INIT_OVERTIME_FIELD] = true;
    result[INIT_DETAILS_FIELD] = getInitOverTimeDetails(detector);
  }
  return result;
};

const isDetectorInitOverTime = (currentTime: Moment, detector: Detector) => {
  return (
    detector &&
    detector.curState === DETECTOR_STATE.INIT &&
    detector.stateError &&
    !detector.stateError.includes(NO_RCF_MODEL_ERROR_MESSAGE) &&
    //@ts-ignore
    currentTime
      .subtract(
        SHINGLE_SIZE * detector.detectionInterval.period.interval,
        detector.detectionInterval.period.unit.toLowerCase()
      )
      //@ts-ignore
      .valueOf() > detector.enabledTime
  );
};

const getInitOverTimeDetails = (detector: Detector) => {
  let result = {
    [INIT_ERROR_MESSAGE_FIELD]: '',
    [INIT_ACTION_ITEM_FIELD]: '',
  };
  if (!detector.stateError) {
    return result;
  }
  if (detector.stateError.includes(NO_FULL_SHINGLE_ERROR_MESSAGE)) {
    result[INIT_ERROR_MESSAGE_FIELD] = 'of insufficient data';
    result[INIT_ACTION_ITEM_FIELD] =
      DETECTOR_INIT_FAILURES.NO_TRAINING_DATA.actionItem;
  } else if (detector.stateError.includes(NO_DATA_IN_WINDOW_ERROR_MESSAGE)) {
    result[INIT_ERROR_MESSAGE_FIELD] = 'no data could be found';
    result[INIT_ACTION_ITEM_FIELD] =
      'Make sure your source index has sufficient data in the current detector interval and try again.';
  }
  return result;
};
