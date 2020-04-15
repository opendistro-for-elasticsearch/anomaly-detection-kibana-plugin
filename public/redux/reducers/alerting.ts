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
  APIAction,
  APIResponseAction,
  IHttpService,
} from '../middleware/types';
import handleActions from '../utils/handleActions';
import { ALERTING_NODE_API } from '../../../utils/constants';
import { Monitor } from '../../../server/models/types';
import { get } from 'lodash';

const SEARCH_MONITORS = 'alerting/SEARCH_MONITORS';

export interface Monitors {
  requesting: boolean;
  totalMonitors: number;
  totalAdMonitors: number;
  monitors: { [key: string]: Monitor };
  errorMessage: string;
}

export const initialDetectorsState: Monitors = {
  requesting: false,
  errorMessage: '',
  totalMonitors: 0,
  totalAdMonitors: 0,
  monitors: {},
};

const MONITOR_DETECTOR_ID_PATH =
  'inputs.0.search.query.query.bool.filter.1.term.detector_id.value';

const reducer = handleActions<Monitors>(
  {
    [SEARCH_MONITORS]: {
      REQUEST: (state: Monitors): Monitors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Monitors, action: APIResponseAction): Monitors => {
        let totalAdMonitors = 0;
        const monitors = get(
          action,
          'result.data.response.monitors',
          []
          // @ts-ignore
        ).reduce((map, obj) => {
          const detectorId = get(obj, MONITOR_DETECTOR_ID_PATH);
          if (detectorId) {
            if (!map[detectorId]) {
              map[detectorId] = [];
            }
            totalAdMonitors++;
            map[detectorId].push(obj);
          }
          return map;
        }, {});
        return {
          ...state,
          requesting: false,
          totalMonitors: get(action, 'result.data.response.totalMonitors', 0),
          totalAdMonitors: totalAdMonitors,
          monitors: monitors,
        };
      },
      FAILURE: (state: Monitors, action: APIResponseAction): Monitors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
  },
  initialDetectorsState
);

export const searchMonitors = (): APIAction => ({
  type: SEARCH_MONITORS,
  request: (client: IHttpService) =>
    client.post(`..${ALERTING_NODE_API._SEARCH}`, {}),
});

export default reducer;
