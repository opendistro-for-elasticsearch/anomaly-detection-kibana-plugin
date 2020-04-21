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

import { SORT_DIRECTION } from '../../../server/utils/constants';
import { DETECTOR_STATE } from '../../utils/constants';

export enum DETECTOR_STATE_COLOR {
  DISABLED = 'subdued',
  INIT = '#0000cc',
  RUNNING = 'success',
  INIT_FAILURE = 'danger',
  UNEXPECTED_FAILURE = 'danger',
}

export const stateToColorMap = new Map<DETECTOR_STATE, DETECTOR_STATE_COLOR>()
  .set(DETECTOR_STATE.DISABLED, DETECTOR_STATE_COLOR.DISABLED)
  .set(DETECTOR_STATE.INIT, DETECTOR_STATE_COLOR.INIT)
  .set(DETECTOR_STATE.RUNNING, DETECTOR_STATE_COLOR.RUNNING)
  .set(DETECTOR_STATE.INIT_FAILURE, DETECTOR_STATE_COLOR.INIT_FAILURE)
  .set(
    DETECTOR_STATE.UNEXPECTED_FAILURE,
    DETECTOR_STATE_COLOR.UNEXPECTED_FAILURE
  );

export const ALL_DETECTOR_STATES = [];
export const ALL_INDICES = [];
export const MAX_DETECTORS = 1000;
export const MAX_SELECTED_INDICES = 10;

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  search: '',
  indices: '',
  size: 20,
  sortDirection: SORT_DIRECTION.ASC,
  sortField: 'name',
};

export const GET_ALL_DETECTORS_QUERY_PARAMS = {
  from: 0,
  search: '',
  indices: '',
  size: MAX_DETECTORS,
  sortDirection: SORT_DIRECTION.ASC,
  sortField: 'name',
};

export enum AD_RESULT_DATE_RANGES {
  LAST_1_HOUR = 'last_1_hour',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
}
