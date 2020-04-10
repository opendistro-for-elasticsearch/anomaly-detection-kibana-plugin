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

export enum CLUSTER {
  ADMIN = 'admin',
  AES_AD = 'aes_ad',
  DATA = 'data',
}

export enum SORT_DIRECTION {
  ASC = 'asc',
  DESC = 'desc',
}
