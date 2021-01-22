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
  HttpSetup,
  APIErrorAction,
} from '../middleware/types';
import handleActions from '../utils/handleActions';
import {
  Detector,
  DetectorListItem,
  HistoricalDetectorListItem,
} from '../../models/interfaces';
import { AD_NODE_API } from '../../../utils/constants';
import { GetDetectorsQueryParams } from '../../../server/models/types';
import { cloneDeep, get } from 'lodash';
import moment from 'moment';
import { DETECTOR_STATE } from '../../../server/utils/constants';

const CREATE_DETECTOR = 'ad/CREATE_DETECTOR';
const GET_DETECTOR = 'ad/GET_DETECTOR';
const GET_DETECTOR_LIST = 'ad/GET_DETECTOR_LIST';
const UPDATE_DETECTOR = 'ad/UPDATE_DETECTOR';
const SEARCH_DETECTOR = 'ad/SEARCH_DETECTOR';
const DELETE_DETECTOR = 'ad/DELETE_DETECTOR';
const START_DETECTOR = 'ad/START_DETECTOR';
const STOP_DETECTOR = 'ad/STOP_DETECTOR';
const GET_DETECTOR_PROFILE = 'ad/GET_DETECTOR_PROFILE';
const MATCH_DETECTOR = 'ad/MATCH_DETECTOR';
const GET_DETECTOR_COUNT = 'ad/GET_DETECTOR_COUNT';
const GET_HISTORICAL_DETECTOR_LIST = 'ad/GET_HISTORICAL_DETECTOR_LIST';

export interface Detectors {
  requesting: boolean;
  detectors: { [key: string]: Detector };
  detectorList: { [key: string]: DetectorListItem };
  historicalDetectorList: { [key: string]: HistoricalDetectorListItem };
  totalDetectors: number;
  errorMessage: string;
}
export const initialDetectorsState: Detectors = {
  requesting: false,
  detectors: {},
  detectorList: {},
  historicalDetectorList: {},
  errorMessage: '',
  totalDetectors: 0,
};

const reducer = handleActions<Detectors>(
  {
    [CREATE_DETECTOR]: {
      REQUEST: (state: Detectors): Detectors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        errorMessage: '',
        requesting: false,
        detectors: {
          ...state.detectors,
          [action.result.response.id]: action.result.response,
        },
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [GET_DETECTOR]: {
      REQUEST: (state: Detectors): Detectors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        detectors: {
          ...state.detectors,
          [action.detectorId]: {
            ...cloneDeep(action.result.response),
          },
        },
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [START_DETECTOR]: {
      REQUEST: (state: Detectors): Detectors => {
        const newState = { ...state, requesting: true, errorMessage: '' };
        return newState;
      },
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        detectors: {
          ...state.detectors,
          [action.detectorId]: {
            ...state.detectors[action.detectorId],
            enabled: true,
            enabledTime: moment().valueOf(),
            curState: DETECTOR_STATE.INIT,
            stateError: '',
          },
        },
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },

    [STOP_DETECTOR]: {
      REQUEST: (state: Detectors): Detectors => {
        const newState = { ...state, requesting: true, errorMessage: '' };
        return newState;
      },
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        detectors: {
          ...state.detectors,
          [action.detectorId]: {
            ...state.detectors[action.detectorId],
            enabled: false,
            disabledTime: moment().valueOf(),
            curState: DETECTOR_STATE.DISABLED,
            stateError: '',
            initProgress: undefined,
          },
        },
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [SEARCH_DETECTOR]: {
      REQUEST: (state: Detectors): Detectors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        detectors: {
          ...state.detectors,
          ...action.result.response.detectors.reduce(
            (acc: any, detector: Detector) => ({
              ...acc,
              [detector.id]: detector,
            }),
            {}
          ),
        },
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [GET_DETECTOR_LIST]: {
      REQUEST: (state: Detectors): Detectors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        detectorList: action.result.response.detectorList.reduce(
          (acc: any, detector: DetectorListItem) => ({
            ...acc,
            [detector.id]: detector,
          }),
          {}
        ),
        totalDetectors: action.result.response.totalDetectors,
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [UPDATE_DETECTOR]: {
      REQUEST: (state: Detectors): Detectors => {
        const newState = { ...state, requesting: true, errorMessage: '' };
        return newState;
      },
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        detectors: {
          ...state.detectors,
          [action.detectorId]: {
            ...state.detectors[action.detectorId],
            ...action.result.response,
            lastUpdateTime: moment().valueOf(),
          },
        },
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },

    [DELETE_DETECTOR]: {
      REQUEST: (state: Detectors): Detectors => {
        const newState = { ...state, requesting: true, errorMessage: '' };
        return newState;
      },
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        detectors: {
          ...state.detectors,
          [action.detectorId]: undefined,
        },
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },

    [GET_DETECTOR_PROFILE]: {
      REQUEST: (state: Detectors): Detectors => {
        const newState = { ...state, requesting: true, errorMessage: '' };
        return newState;
      },
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        detectorList: {
          ...state.detectorList,
          [action.detectorId]: {
            ...state.detectorList[action.detectorId],
            curState: action.result.response.state,
          },
        },
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [MATCH_DETECTOR]: {
      REQUEST: (state: Detectors): Detectors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Detectors): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: '',
      }),
      FAILURE: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [GET_DETECTOR_COUNT]: {
      REQUEST: (state: Detectors): Detectors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Detectors): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: '',
      }),
      FAILURE: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
    [GET_HISTORICAL_DETECTOR_LIST]: {
      REQUEST: (state: Detectors): Detectors => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (state: Detectors, action: APIResponseAction): Detectors => ({
        ...state,
        requesting: false,
        historicalDetectorList: action.result.response.detectorList.reduce(
          (acc: any, detector: Detector) => ({
            ...acc,
            [detector.id]: {
              ...detector,
              dataStartTime: get(detector, 'detectionDateRange.startTime', 0),
              dataEndTime: get(detector, 'detectionDateRange.endTime', 0),
            },
          }),
          {}
        ),
        totalDetectors: action.result.response.totalDetectors,
      }),
      FAILURE: (state: Detectors, action: APIErrorAction): Detectors => ({
        ...state,
        requesting: false,
        errorMessage: action.error,
      }),
    },
  },
  initialDetectorsState
);

export const createDetector = (requestBody: Detector): APIAction => ({
  type: CREATE_DETECTOR,
  request: (client: HttpSetup) =>
    client.post(`..${AD_NODE_API.DETECTOR}`, {
      body: JSON.stringify(requestBody),
    }),
});

export const getDetector = (detectorId: string): APIAction => ({
  type: GET_DETECTOR,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API.DETECTOR}/${detectorId}`),
  detectorId,
});

export const getDetectorList = (
  queryParams: GetDetectorsQueryParams
): APIAction => ({
  type: GET_DETECTOR_LIST,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API.DETECTOR}`, { query: queryParams }),
});

export const searchDetector = (requestBody: any): APIAction => ({
  type: SEARCH_DETECTOR,
  request: (client: HttpSetup) =>
    client.post(`..${AD_NODE_API.DETECTOR}/_search`, {
      body: JSON.stringify(requestBody),
    }),
});

export const updateDetector = (
  detectorId: string,
  requestBody: Detector
): APIAction => ({
  type: UPDATE_DETECTOR,
  request: (client: HttpSetup) =>
    client.put(`..${AD_NODE_API.DETECTOR}/${detectorId}`, {
      body: JSON.stringify(requestBody),
    }),
  detectorId,
});

export const deleteDetector = (detectorId: string): APIAction => ({
  type: DELETE_DETECTOR,
  request: (client: HttpSetup) =>
    client.delete(`..${AD_NODE_API.DETECTOR}/${detectorId}`),
  detectorId,
});

export const startDetector = (detectorId: string): APIAction => ({
  type: START_DETECTOR,
  request: (client: HttpSetup) =>
    client.post(`..${AD_NODE_API.DETECTOR}/${detectorId}/start`),
  detectorId,
});

export const stopDetector = (detectorId: string): APIAction => ({
  type: STOP_DETECTOR,
  request: (client: HttpSetup) =>
    client.post(`..${AD_NODE_API.DETECTOR}/${detectorId}/stop`),
  detectorId,
});

export const getDetectorProfile = (detectorId: string): APIAction => ({
  type: GET_DETECTOR_PROFILE,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API.DETECTOR}/${detectorId}/_profile`),
  detectorId,
});

export const matchDetector = (detectorName: string): APIAction => ({
  type: MATCH_DETECTOR,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API.DETECTOR}/${detectorName}/_match`),
});

export const getDetectorCount = (): APIAction => ({
  type: GET_DETECTOR_COUNT,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API.DETECTOR}/_count`, {}),
});

export const getHistoricalDetectorList = (
  queryParams: GetDetectorsQueryParams
): APIAction => ({
  type: GET_HISTORICAL_DETECTOR_LIST,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API.DETECTOR}/historical`, { query: queryParams }),
});

export default reducer;
