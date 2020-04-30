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

const DEFAULT_ACTION_ITEM = 'Please restart this detector to retry.';
// Known causes:
// https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L174-L185
export const DETECTOR_INIT_FAILURES = Object.freeze({
  NO_TRAINING_DATA: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L801
    keyword: 'Cannot get training data',
    cause: 'lack of data ingestion',
    actionItem:
      'Please make sure your data ingestion is working. Or increase your detector time interval if data source has infrequent ingestion.',
  },
  COLD_START_ERROR: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L811
    keyword: 'Error while cold start',
    cause: 'error is found while model initialization',
    actionItem: DEFAULT_ACTION_ITEM,
  },
  AD_MODEL_MEMORY_REACH_LIMIT: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/ml/ModelManager.java#L272
    keyword: 'AD models memory usage exceeds our limit',
    cause: 'lack of memory for detector models',
    actionItem:
      'Model of this detector is too large, please reduce the number of features in this detector.',
  },
  DETECTOR_MEMORY_REACH_LIMIT: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/ml/ModelManager.java#L783
    keyword: 'Exceeded memory limit',
    cause: 'lack of memory',
    actionItem:
      "Try deleting or stop other detectors that you don't actively use, increase your cluster size, reduce the number of features in this detector, or scale up with an instance type of more memory.",
  },
  DATA_INDEX_NOT_FOUND: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L366
    keyword: 'Having trouble querying data: ',
    cause: 'data index not found',
    actionItem: 'Please make sure your data index does exist.',
  },
  ALL_FEATURES_DISABLED: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L368
    keyword:
      'Having trouble querying data because all of your features have been disabled',
    cause: 'all features in this detector are disabled',
    actionItem:
      'Please enable some of your features and re-start your detector.',
  },
  DETECTOR_UNDEFINED: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L230
    keyword: 'AnomalyDetector is not available',
    cause: 'your detector is not defined',
    actionItem: 'Please make sure your detector is defined.',
  },
  UNKNOWN_EXCEPTION: {
    //https://github.com/opendistro-for-elasticsearch/anomaly-detection/blob/development/src/main/java/com/amazon/opendistroforelasticsearch/ad/transport/AnomalyResultTransportAction.java#L438
    keyword: 'We might have bug',
    cause: 'unknown error',
    actionItem: DEFAULT_ACTION_ITEM,
  },
});
