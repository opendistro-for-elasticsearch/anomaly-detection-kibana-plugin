/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { SORT_DIRECTION } from '../../../../server/utils/constants';

export const ALL_DETECTOR_STATES = '';
export const ALL_INDICES = '';
export const MAX_DETECTORS = 1000;
export const MAX_DISPLAY_LEN = 20;

// TODO: finish when we know all possible detector states
export enum DETECTOR_STATES {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  INITIALIZING = 'Initializing',
}

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  search: '',
  indices: '',
  size: 20,
  sortDirection: SORT_DIRECTION.ASC,
  sortField: 'name',
};
