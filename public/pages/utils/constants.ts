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

export enum DETECTOR_STATE {
  DISABLED = 'Disabled',
  INIT = 'Initializing',
  RUNNING = 'Running',
  INIT_FAILURE = 'Initialization failure',
  UNKNOWN_FAILURE = 'Unknown failure',
}

export enum DETECTOR_STATE_COLORS {
  DISABLED = 'subdued',
  INIT = '#0000cc',
  RUNNING = 'success',
  INIT_FAILURE = 'danger',
  UNKNOWN_FAILURE = 'danger',
}

export const mapToColor = (state: string) => {
  switch (state) {
    case DETECTOR_STATE.DISABLED: {
      return DETECTOR_STATE_COLORS.DISABLED;
    }
    case DETECTOR_STATE.INIT: {
      return DETECTOR_STATE_COLORS.INIT;
    }
    case DETECTOR_STATE.RUNNING: {
      return DETECTOR_STATE_COLORS.RUNNING;
    }
    case DETECTOR_STATE.INIT_FAILURE: {
      return DETECTOR_STATE_COLORS.INIT_FAILURE;
    }
    case DETECTOR_STATE.UNKNOWN_FAILURE: {
      return DETECTOR_STATE_COLORS.UNKNOWN_FAILURE;
    }
  }
};

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
