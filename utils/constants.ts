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

export const BASE_NODE_API_PATH = '/api/anomaly_detectors';

export const AD_NODE_API = Object.freeze({
  _SEARCH: `${BASE_NODE_API_PATH}/_search`,
  _INDICES: `${BASE_NODE_API_PATH}/_indices`,
  _ALIASES: `${BASE_NODE_API_PATH}/_aliases`,
  _MAPPINGS: `${BASE_NODE_API_PATH}/_mappings`,
  DETECTOR: `${BASE_NODE_API_PATH}/detectors`,
  CREATE_INDEX: `${BASE_NODE_API_PATH}/create_index`,
  BULK: `${BASE_NODE_API_PATH}/bulk`,
  DELETE_INDEX: `${BASE_NODE_API_PATH}/delete_index`,
  CREATE_SAMPLE_DATA: `${BASE_NODE_API_PATH}/create_sample_data`,
});
export const ALERTING_NODE_API = Object.freeze({
  _SEARCH: `${BASE_NODE_API_PATH}/monitors/_search`,
  ALERTS: `${BASE_NODE_API_PATH}/monitors/alerts`,
  MONITORS: `${BASE_NODE_API_PATH}/monitors`,
});
