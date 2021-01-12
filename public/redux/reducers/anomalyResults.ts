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

import { APIAction, APIResponseAction, HttpSetup } from '../middleware/types';
import handleActions from '../utils/handleActions';
import { AD_NODE_API } from '../../../utils/constants';
import { AnomalyData } from '../../models/interfaces';
import { get } from 'lodash';

const DETECTOR_RESULTS = 'ad/DETECTOR_RESULTS';
const SEARCH_ANOMALY_RESULTS = 'ad/SEARCH_ANOMALY_RESULTS';

export interface Anomalies {
  requesting: boolean;
  total: number;
  anomalies: AnomalyData[];
  errorMessage: string;
  featureData: any;
}
export const initialDetectorsState: Anomalies = {
  requesting: false,
  total: 0,
  anomalies: [],
  errorMessage: '',
  featureData: {},
};

const reducer = handleActions<Anomalies>(
  {
    [DETECTOR_RESULTS]: {
      REQUEST: (state: Anomalies): Anomalies => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Anomalies, action: APIResponseAction): Anomalies => ({
        ...state,
        requesting: false,
        total: action.result.response.totalAnomalies,
        anomalies: action.result.response.results,
        featureData: action.result.response.featureResults,
      }),
      FAILURE: (state: Anomalies, action: APIResponseAction): Anomalies => ({
        ...state,
        requesting: false,
        errorMessage: get(action, 'error.error', action.error),
      }),
    },

    //TODO: add requesting and errorMessage
    [SEARCH_ANOMALY_RESULTS]: {
      REQUEST: (state: Anomalies): Anomalies => ({
        ...state,
      }),
      SUCCESS: (state: Anomalies, action: APIResponseAction): Anomalies => ({
        ...state,
      }),
      FAILURE: (state: Anomalies): Anomalies => ({
        ...state,
      }),
    },
  },
  initialDetectorsState
);

export const getDetectorResults = (
  detectorId: string,
  queryParams: any
): APIAction => ({
  type: DETECTOR_RESULTS,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API.DETECTOR}/${detectorId}/results`, {
      query: queryParams,
    }),
});

export const searchResults = (requestBody: any): APIAction => ({
  type: SEARCH_ANOMALY_RESULTS,
  request: (client: HttpSetup) =>
    client.post(`..${AD_NODE_API.DETECTOR}/results/_search`, {
      body: JSON.stringify(requestBody),
    }),
});

export default reducer;
