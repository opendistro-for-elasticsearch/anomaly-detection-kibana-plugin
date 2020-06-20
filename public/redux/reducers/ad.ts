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
  APIErrorAction,
} from '../middleware/types';
import handleActions from '../utils/handleActions';
import { Detector, DetectorListItem } from '../../models/interfaces';
import { AD_NODE_API } from '../../../utils/constants';
import { GetDetectorsQueryParams } from '../../../server/models/types';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { DETECTOR_STATE } from '../../utils/constants';

const CREATE_DETECTOR = 'ad/CREATE_DETECTOR';
const GET_DETECTOR = 'ad/GET_DETECTOR';
const GET_DETECTOR_LIST = 'ad/GET_DETECTOR_LIST';
const UPDATE_DETECTOR = 'ad/UPDATE_DETECTOR';
const SEARCH_DETECTOR = 'ad/SEARCH_DETECTOR';
const DELETE_DETECTOR = 'ad/DELETE_DETECTOR';
const START_DETECTOR = 'ad/START_DETECTOR';
const STOP_DETECTOR = 'ad/STOP_DETECTOR';
const GET_DETECTOR_PROFILE = 'ad/GET_DETECTOR_PROFILE';

export interface Detectors {
  requesting: boolean;
  detectors: { [key: string]: Detector };
  detectorList: { [key: string]: DetectorListItem };
  totalDetectors: number;
  errorMessage: string;
}
export const initialDetectorsState: Detectors = {
  requesting: false,
  detectors: {},
  detectorList: {},
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
          [action.result.data.response.id]: action.result.data.response,
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
            ...cloneDeep(action.result.data.response),
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
          ...action.result.data.response.detectors.reduce(
            (acc: any, detector: Detector) => ({
              ...acc,
              [detector.id]: detector,
            }),
            {}
          ),
        },
      }),
      FAILURE: (state: Detectors): Detectors => ({
        ...state,
        requesting: false,
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
        detectorList: action.result.data.response.detectorList.reduce(
          (acc: any, detector: DetectorListItem) => ({
            ...acc,
            [detector.id]: detector,
          }),
          {}
        ),
        totalDetectors: action.result.data.response.totalDetectors,
      }),
      FAILURE: (state: Detectors): Detectors => ({
        ...state,
        requesting: false,
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
            ...action.result.data.response,
            lastUpdateTime: moment().valueOf(),
          },
        },
      }),
      FAILURE: (state: Detectors): Detectors => ({
        ...state,
        requesting: false,
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
            curState: action.result.data.response.state,
          },
        },
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
  request: (client: IHttpService) =>
    client.post(`..${AD_NODE_API.DETECTOR}`, requestBody),
});

export const getDetector = (detectorId: string): APIAction => ({
  type: GET_DETECTOR,
  request: (client: IHttpService) =>
    client.get(`..${AD_NODE_API.DETECTOR}/${detectorId}`),
  detectorId,
});

export const getDetectorList = (
  queryParams: GetDetectorsQueryParams
): APIAction => ({
  type: GET_DETECTOR_LIST,
  request: (client: IHttpService) =>
    client.get(`..${AD_NODE_API.DETECTOR}`, { params: queryParams }),
});

export const searchDetector = (requestBody: any): APIAction => ({
  type: SEARCH_DETECTOR,
  request: (client: IHttpService) =>
    client.post(`..${AD_NODE_API.DETECTOR}/_search`, requestBody),
});

export const updateDetector = (
  detectorId: string,
  requestBody: Detector
): APIAction => ({
  type: UPDATE_DETECTOR,
  request: (client: IHttpService) =>
    client.put(`..${AD_NODE_API.DETECTOR}/${detectorId}`, requestBody, {
      params: {
        ifPrimaryTerm: requestBody.primaryTerm,
        ifSeqNo: requestBody.seqNo,
      },
    }),
  detectorId,
});

export const deleteDetector = (detectorId: string): APIAction => ({
  type: DELETE_DETECTOR,
  request: (client: IHttpService) =>
    client.delete(`..${AD_NODE_API.DETECTOR}/${detectorId}`),
  detectorId,
});

export const startDetector = (detectorId: string): APIAction => ({
  type: START_DETECTOR,
  request: (client: IHttpService) =>
    client.post(`..${AD_NODE_API.DETECTOR}/${detectorId}/start`, {
      detectorId: detectorId,
    }),
  detectorId,
});

export const stopDetector = (detectorId: string): APIAction => ({
  type: STOP_DETECTOR,
  request: (client: IHttpService) =>
    client.post(`..${AD_NODE_API.DETECTOR}/${detectorId}/stop`, {
      detectorId: detectorId,
    }),
  detectorId,
});

export const getDetectorProfile = (detectorId: string): APIAction => ({
  type: GET_DETECTOR_PROFILE,
  request: (client: IHttpService) =>
    client.get(`..${AD_NODE_API.DETECTOR}/${detectorId}/_profile`, {
      params: detectorId,
    }),
  detectorId,
});

export default reducer;
