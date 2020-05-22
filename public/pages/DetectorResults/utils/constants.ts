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

import {
  SORT_DIRECTION,
  AD_DOC_FIELDS,
} from '../../../../server/utils/constants';
import { CHART_COLORS } from '../../AnomalyCharts/utils/constants';

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  search: '',
  size: 20,
  sortDirection: SORT_DIRECTION.ASC,
  sortField: AD_DOC_FIELDS.DATA_START_TIME,
};

export enum ANOMALY_HISTORY_TABS {
  FEATURE_BREAKDOWN = 'featureBreakdown',
  ANOMALY_OCCURRENCE = 'anomalyOccurrence',
}

export const LIVE_ANOMALY_CHART_THEME = [
  {
    colors: {
      vizColors: [CHART_COLORS.ANOMALY_GRADE_COLOR],
    },
  },
];

//https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/master/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L307
export const NO_FULL_SHINGLE_ERROR_MESSAGE =
  'No full shingle in current detection window';
//https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/master/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L295
export const NO_DATA_IN_WINDOW_ERROR_MESSAGE =
  'No data in current detection window';
//https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/master/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L81
export const NO_RCF_MODEL_ERROR_MESSAGE =
  'No RCF models are available either because RCF models are not ready or all nodes are unresponsive or the system might have bugs';
