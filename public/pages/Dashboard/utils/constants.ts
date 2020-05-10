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

import {
  AD_DOC_FIELDS,
  SORT_DIRECTION,
} from '../../../../server/utils/constants';
import { ANOMALY_RESULT_INDEX, MAX_DETECTORS } from '../../../utils/constants';

export const TIME_RANGE_OPTIONS = [
  { value: '24h', text: 'Last 24 hours' },
  { value: '7d', text: 'Last 7 days' },
];

export const GET_RECENT_ANOMALOUS_DETECTORS_QUERY = {
  index: ANOMALY_RESULT_INDEX,
  size: 10,
  query: {
    bool: {
      must: [
        {
          range: {
            [AD_DOC_FIELDS.ANOMALY_GRADE]: {
              gt: 0.0,
            },
          },
        },
      ],
      must_not: [
        {
          exists: {
            field: AD_DOC_FIELDS.ERROR,
          },
        },
      ],
    },
  },
  sort: {
    [AD_DOC_FIELDS.DATA_START_TIME]: SORT_DIRECTION.DESC,
  },
  collapse: {
    field: AD_DOC_FIELDS.DETECTOR_ID,
  },
};

export const GET_RECENT_ANOMALY_RESULT_QUERY = {
  range: {
    [AD_DOC_FIELDS.DATA_START_TIME]: {
      gte: 'now-30m',
    },
  },
  size: 30,
  sortField: AD_DOC_FIELDS.DATA_START_TIME,
  from: 0,
  sortDirection: SORT_DIRECTION.DESC,
};

export const TIME_NOW_LINE_STYLE = {
  line: {
    strokeWidth: 1,
    stroke: '#3F3F3F',
    dash: [1, 2],
    opacity: 0.8,
  },
};

export const GET_ALL_DETECTORS_QUERY_PARAMS = {
  from: 0,
  search: '',
  indices: '',
  size: MAX_DETECTORS,
  sortDirection: SORT_DIRECTION.ASC,
  sortField: 'name',
};

export const ALL_DETECTORS_MESSAGE = 'All detectors';
export const ALL_DETECTOR_STATES_MESSAGE = 'All detector states';
export const ALL_INDICES_MESSAGE = 'All indices';

export const SHOW_DECIMAL_NUMBER_THRESHOLD = 0.01;
