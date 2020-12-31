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

export const customSubduedColor = '#98A2B3';
export const customSuccessColor = '#7DE2D1';
export const customWarningColor = '#FFCE7A';
export const customDangerColor = '#F66';

export enum DETECTOR_STATE_COLOR {
  DISABLED = '#98A2B3',
  INIT = 'primary',
  RUNNING = '#7DE2D1',
  FEATURE_REQUIRED = '#98A2B3',
  INIT_FAILURE = '#F66',
  UNEXPECTED_FAILURE = '#F66',
}

export const stateToColorMap = new Map<DETECTOR_STATE, DETECTOR_STATE_COLOR>()
  .set(DETECTOR_STATE.DISABLED, DETECTOR_STATE_COLOR.DISABLED)
  .set(DETECTOR_STATE.INIT, DETECTOR_STATE_COLOR.INIT)
  .set(DETECTOR_STATE.RUNNING, DETECTOR_STATE_COLOR.RUNNING)
  .set(DETECTOR_STATE.FEATURE_REQUIRED, DETECTOR_STATE_COLOR.FEATURE_REQUIRED)
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

export const GET_SAMPLE_DETECTORS_QUERY_PARAMS = {
  from: 0,
  search: 'opendistro-sample',
  indices: '',
  size: MAX_DETECTORS,
  sortDirection: SORT_DIRECTION.ASC,
  sortField: 'name',
};

export const GET_SAMPLE_INDICES_QUERY = 'opendistro-sample-*';

export const TOP_ENTITIES_FIELD = 'top_entities';

export const TOP_ENTITY_AGGS = 'top_entity_aggs';
export const TOP_ANOMALY_GRADE_SORT_AGGS = 'top_anomaly_grade_sort_aggs';
export const MAX_ANOMALY_AGGS = 'max_anomaly_aggs';
export const COUNT_ANOMALY_AGGS = 'count_anomaly_aggs';
export const MAX_ANOMALY_SORT_AGGS = 'max_anomaly_sort_aggs';
export const ENTITY_DATE_BUCKET_ANOMALY_AGGS = 'entity_date_bucket_anomaly';
