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

import { APIAction, APIResponseAction, HttpSetup } from '../middleware/types';
import handleActions from '../utils/handleActions';
import { AD_NODE_API } from '../../../utils/constants';
import { DetectorResultsQueryParams } from '../../../server/models/types';
import { Anomaly } from '../../../server/models/interfaces';
import { get } from 'lodash';

const DETECTOR_LIVE_RESULTS = 'ad/DETECTOR_LIVE_RESULTS';

export interface Anomalies {
  requesting: boolean;
  totalLiveAnomalies: number;
  liveAnomalies: Anomaly[];
  errorMessage: string;
}
export const initialDetectorLiveResults: Anomalies = {
  requesting: false,
  errorMessage: '',
  totalLiveAnomalies: 0,
  liveAnomalies: [],
};

const reducer = handleActions<Anomalies>(
  {
    [DETECTOR_LIVE_RESULTS]: {
      REQUEST: (state: Anomalies): Anomalies => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Anomalies, action: APIResponseAction): Anomalies => ({
        ...state,
        requesting: false,
        totalLiveAnomalies: action.result.response.totalAnomalies,
        liveAnomalies: action.result.response.results,
      }),
      FAILURE: (state: Anomalies, action: APIResponseAction): Anomalies => ({
        ...state,
        requesting: false,
        errorMessage: get(action, 'error.error', action.error),
      }),
    },
  },
  initialDetectorLiveResults
);

export const getDetectorLiveResults = (
  detectorId: string,
  queryParams: DetectorResultsQueryParams,
  isHistorical: boolean
): APIAction => ({
  type: DETECTOR_LIVE_RESULTS,
  request: (client: HttpSetup) =>
    client.get(
      `..${AD_NODE_API.DETECTOR}/${detectorId}/results/${isHistorical}`,
      {
        query: queryParams,
      }
    ),
});

export default reducer;
