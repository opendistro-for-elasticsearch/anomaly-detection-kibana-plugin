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

export enum DETECTOR_DETAIL_TABS {
  RESULTS = 'results',
  CONFIGURATIONS = 'configurations',
}

const DEFAULT_ACTION_ITEM = 'Restart the detector and try again.';
// Known causes:
// https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L174-L185
export const DETECTOR_INIT_FAILURES = Object.freeze({
  NO_TRAINING_DATA: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L801
    keyword: 'Cannot get training data',
    cause: 'sufficient data is not ingested',
    actionItem:
      'Make sure your data is ingested correctly. If your data source has infrequent ingestion, increase the detector time interval and try again.',
  },
  COLD_START_ERROR: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L811
    keyword: 'Error while cold start',
    cause: 'of an error during model training',
    actionItem: DEFAULT_ACTION_ITEM,
  },
  AD_MODEL_MEMORY_REACH_LIMIT: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/ml/ModelManager.java#L272
    keyword: 'AD models memory usage exceeds our limit',
    cause: 'of lack of memory for the detector models',
    actionItem: 'Reduce the number of features and try again.',
  },
  DETECTOR_MEMORY_REACH_LIMIT: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/ml/ModelManager.java#L783
    keyword: 'Exceeded memory limit',
    cause: 'of lack of memory for the detector',
    actionItem:
      "Remove or stop other detectors that you don't actively use, increase your cluster size, reduce the number of features, or scale up with an instance type of more memory and try again.",
  },
  DATA_INDEX_NOT_FOUND: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L366
    keyword: 'Having trouble querying data: ',
    cause: 'the data index is not found',
    actionItem: 'Make sure your index exists and try again.',
  },
  ALL_FEATURES_DISABLED: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L368
    keyword:
      'Having trouble querying data because all of your features have been disabled',
    cause: 'all detector features are disabled',
    actionItem: 'Enable one or more features and try again.',
  },
  DETECTOR_UNDEFINED: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L230
    keyword: 'AnomalyDetector is not available',
    cause: 'the detector is not defined',
    actionItem: 'Define your detector and try again.',
  },
  UNKNOWN_EXCEPTION: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L438
    keyword: 'We might have bugs',
    cause: 'of unknown error',
    actionItem: DEFAULT_ACTION_ITEM,
  },
});
