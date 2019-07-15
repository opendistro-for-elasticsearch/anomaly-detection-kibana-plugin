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
  APIAction,
  APIResponseAction,
  IHttpService,
} from '../middleware/types';
import handleActions from '../utils/handleActions';
import { AD_NODE_API } from '../../../utils/constants';
import { DetectorResultsQueryParams } from '../../../server/models/types';

const DETECTOR_RESULTS = 'ad/DETECTOR_RESULTS';

export interface Anomalies {
  requesting: boolean;
  total: number;
  anomalies: Anomalies[];
  errorMessage: string;
}
export const initialDetectorsState: Anomalies = {
  requesting: false,
  total: 0,
  anomalies: [],
  errorMessage: '',
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
        total: action.result.data.response.totalAnomalies,
        anomalies: action.result.data.response.results,
      }),
      FAILURE: (state: Anomalies, action: APIResponseAction): Anomalies => ({
        ...state,
        requesting: false,
        errorMessage: action.error.data.error,
      }),
    },
  },
  initialDetectorsState
);

export const getDetectorResults = (
  detectorId: string,
  queryParams: DetectorResultsQueryParams
): APIAction => ({
  type: DETECTOR_RESULTS,
  request: (client: IHttpService) =>
    client.get(`..${AD_NODE_API.DETECTOR}/${detectorId}/results`, {
      params: queryParams,
    }),
});

export default reducer;
