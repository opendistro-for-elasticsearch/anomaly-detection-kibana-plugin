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

import { ADApis, DefaultHeaders } from '../models/interfaces';

export const AD_API_ROUTE_PREFIX = '/_opendistro/_anomaly_detection';
export const ALERTING_API_ROUTE_PREFIX = '/_opendistro/_alerting';

export const API: ADApis = {
  DETECTOR_BASE: `${AD_API_ROUTE_PREFIX}/detectors`,
  ALERTING_BASE: `${ALERTING_API_ROUTE_PREFIX}/monitors`,
};

export const DEFAULT_HEADERS: DefaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'Kibana',
};

export const SEC_IN_MILLI_SECS = 1000;

export const MIN_IN_MILLI_SECS = 60 * SEC_IN_MILLI_SECS;

export enum CLUSTER {
  ADMIN = 'admin',
  AES_AD = 'aes_ad',
  DATA = 'data',
}

export enum SORT_DIRECTION {
  ASC = 'asc',
  DESC = 'desc',
}

export enum AD_DOC_FIELDS {
  DATA_START_TIME = 'data_start_time',
  DATA_END_TIME = 'data_end_time',
  DETECTOR_ID = 'detector_id',
  DETECTOR_NAME = 'name',
  PLOT_TIME = 'plot_time',
  ANOMALY_GRADE = 'anomaly_grade',
  ERROR = 'error',
  INDICES = 'indices',
}

export const MAX_MONITORS = 1000;

export const MAX_ALERTS = 1000;

// TODO: maybe move types/interfaces/constants/helpers shared between client and server
// side as many as possible into single place
export enum DETECTOR_STATE {
  DISABLED = 'Stopped',
  INIT = 'Initializing',
  RUNNING = 'Running',
  FEATURE_REQUIRED = 'Feature required',
  INIT_FAILURE = 'Initialization failure',
  UNEXPECTED_FAILURE = 'Unexpected failure',
}

export enum SAMPLE_TYPE {
  HTTP_RESPONSES = 'http-responses',
  HOST_HEALTH = 'host-health',
  ECOMMERCE = 'ecommerce',
}

export const ENTITY_FIELD = 'entity';
export const ENTITY_VALUE_PATH_FIELD = 'entity.value';
export const ENTITY_NAME_PATH_FIELD = 'entity.name';

export const DOC_COUNT_FIELD = 'doc_count';
export const KEY_FIELD = 'key';
