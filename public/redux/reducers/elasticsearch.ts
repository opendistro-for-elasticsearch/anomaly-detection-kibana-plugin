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
  HttpSetup,
  APIErrorAction,
  ThunkAction,
} from '../middleware/types';
import handleActions from '../utils/handleActions';
import { getPathsPerDataType } from './mapper';
import { CatIndex, IndexAlias } from '../../../server/models/types';
import { AD_NODE_API } from '../../../utils/constants';
import { get } from 'lodash';

const GET_INDICES = 'elasticsearch/GET_INDICES';
const GET_ALIASES = 'elasticsearch/GET_ALIASES';
const GET_MAPPINGS = 'elasticsearch/GET_MAPPINGS';
const SEARCH_ES = 'elasticsearch/SEARCH_ES';
const CREATE_INDEX = 'elasticsearch/CREATE_INDEX';
const BULK = 'elasticsearch/BULK';
const DELETE_INDEX = 'elasticsearch/DELETE_INDEX';

export type Mappings = {
  [key: string]: any;
};

export interface DataTypes {
  long?: string[];
  integer?: string[];
  short?: string[];
  byte?: string[];
  double?: string[];
  float?: string[];
  half_float?: string[];
  boolean?: string[];
  date?: string[];
  keyword?: string[];
  text?: string[];
  integer_range?: string[];
  float_range?: string[];
  long_range?: string[];
  double_range?: string[];
  date_range?: string[];
  [key: string]: any; // Any new or unknown
}

interface ElasticsearchState {
  indices: CatIndex[];
  aliases: IndexAlias[];
  dataTypes: DataTypes;
  requesting: boolean;
  searchResult: object;
  errorMessage: string;
}
export const initialState: ElasticsearchState = {
  indices: [],
  aliases: [],
  dataTypes: {},
  requesting: false,
  searchResult: {},
  errorMessage: '',
};

const reducer = handleActions<ElasticsearchState>(
  {
    [GET_INDICES]: {
      REQUEST: (state: ElasticsearchState): ElasticsearchState => {
        return { ...state, requesting: true, errorMessage: '' };
      },
      SUCCESS: (
        state: ElasticsearchState,
        action: APIResponseAction
      ): ElasticsearchState => {
        return {
          ...state,
          requesting: false,
          indices: get(action, 'result.response.indices', []),
        };
      },
      FAILURE: (
        state: ElasticsearchState,
        action: APIErrorAction
      ): ElasticsearchState => ({
        ...state,
        requesting: false,
        errorMessage: get(action, 'error.error', action.error),
      }),
    },
    [GET_ALIASES]: {
      REQUEST: (state: ElasticsearchState): ElasticsearchState => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (
        state: ElasticsearchState,
        action: APIResponseAction
      ): ElasticsearchState => {
        return {
          ...state,
          requesting: false,
          aliases: get(action, 'result.response.aliases', []),
        };
      },
      FAILURE: (
        state: ElasticsearchState,
        action: APIErrorAction
      ): ElasticsearchState => ({
        ...state,
        requesting: false,
        errorMessage: get(action, 'error.error', action.error),
      }),
    },
    [SEARCH_ES]: {
      REQUEST: (state: ElasticsearchState): ElasticsearchState => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (
        state: ElasticsearchState,
        action: APIResponseAction
      ): ElasticsearchState => {
        return {
          ...state,
          requesting: false,
          searchResult: { ...get(action, 'result.response', {}) },
        };
      },
      FAILURE: (
        state: ElasticsearchState,
        action: APIErrorAction
      ): ElasticsearchState => ({
        ...state,
        requesting: false,
        errorMessage: get(action, 'error.error', action.error),
      }),
    },
    [GET_MAPPINGS]: {
      REQUEST: (state: ElasticsearchState): ElasticsearchState => ({
        ...state,
        requesting: true,
        errorMessage: '',
      }),
      SUCCESS: (
        state: ElasticsearchState,
        action: APIResponseAction
      ): ElasticsearchState => {
        return {
          ...state,
          requesting: false,
          dataTypes: getPathsPerDataType(
            get(action, 'result.response.mappings', {})
          ),
        };
      },
      FAILURE: (
        state: ElasticsearchState,
        action: APIErrorAction
      ): ElasticsearchState => ({
        ...state,
        requesting: false,
        errorMessage: get(action, 'error.error', action.error),
        dataTypes: {},
      }),
    },
    [CREATE_INDEX]: {
      REQUEST: (state: ElasticsearchState): ElasticsearchState => {
        return { ...state, requesting: true, errorMessage: '' };
      },
      SUCCESS: (
        state: ElasticsearchState,
        action: APIResponseAction
      ): ElasticsearchState => {
        return {
          ...state,
          requesting: false,
          indices: get(action, 'result.response.indices', []),
        };
      },
      FAILURE: (
        state: ElasticsearchState,
        action: APIErrorAction
      ): ElasticsearchState => ({
        ...state,
        requesting: false,
        errorMessage: get(action, 'error.error', action.error),
      }),
    },
    [BULK]: {
      REQUEST: (state: ElasticsearchState): ElasticsearchState => {
        return { ...state, requesting: true, errorMessage: '' };
      },
      SUCCESS: (
        state: ElasticsearchState,
        action: APIResponseAction
      ): ElasticsearchState => {
        return {
          ...state,
          requesting: false,
        };
      },
      FAILURE: (
        state: ElasticsearchState,
        action: APIErrorAction
      ): ElasticsearchState => ({
        ...state,
        requesting: false,
        errorMessage: get(action, 'error.error', action.error),
      }),
    },
    [DELETE_INDEX]: {
      REQUEST: (state: ElasticsearchState): ElasticsearchState => {
        return { ...state, requesting: true, errorMessage: '' };
      },
      SUCCESS: (
        state: ElasticsearchState,
        action: APIResponseAction
      ): ElasticsearchState => {
        return {
          ...state,
          requesting: false,
          indices: get(action, 'result.response.indices', []),
        };
      },
      FAILURE: (
        state: ElasticsearchState,
        action: APIErrorAction
      ): ElasticsearchState => ({
        ...state,
        requesting: false,
        errorMessage: get(action, 'error.error', action.error),
      }),
    },
  },
  initialState
);

export const getIndices = (searchKey: string = ''): APIAction => ({
  type: GET_INDICES,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API._INDICES}`, { query: { index: searchKey } }),
});

export const getAliases = (searchKey: string = ''): APIAction => ({
  type: GET_ALIASES,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API._ALIASES}`, { query: { alias: searchKey } }),
});

export const getMappings = (searchKey: string = ''): APIAction => ({
  type: GET_MAPPINGS,
  request: (client: HttpSetup) =>
    client.get(`..${AD_NODE_API._MAPPINGS}`, {
      query: { index: searchKey },
    }),
});

export const searchES = (requestData: any): APIAction => ({
  type: SEARCH_ES,
  request: (client: HttpSetup) =>
    client.post(`..${AD_NODE_API._SEARCH}`, {
      body: JSON.stringify(requestData),
    }),
});

export const createIndex = (indexConfig: any): APIAction => ({
  type: CREATE_INDEX,
  request: (client: HttpSetup) =>
    client.put(`..${AD_NODE_API.CREATE_INDEX}`, {
      body: JSON.stringify(indexConfig),
    }),
});

export const bulk = (body: any): APIAction => ({
  type: BULK,
  request: (client: HttpSetup) =>
    client.post(`..${AD_NODE_API.BULK}`, { body: JSON.stringify(body) }),
});

export const deleteIndex = (index: string): APIAction => ({
  type: DELETE_INDEX,
  request: (client: HttpSetup) =>
    client.post(`..${AD_NODE_API.DELETE_INDEX}`, { query: { index: index } }),
});

export const getPrioritizedIndices = (searchKey: string): ThunkAction => async (
  dispatch,
  getState
) => {
  //Fetch Indices and Aliases with text provided
  await dispatch(getIndices(searchKey));
  await dispatch(getAliases(searchKey));
  const esState = getState().elasticsearch;
  const exactMatchedIndices = esState.indices;
  const exactMatchedAliases = esState.aliases;
  if (exactMatchedAliases.length || exactMatchedIndices.length) {
    //If we have exact match just return that
    return {
      indices: exactMatchedIndices,
      aliases: exactMatchedAliases,
    };
  } else {
    //No results found for exact match, append wildCard and get partial matches if exists
    await dispatch(getIndices(`${searchKey}*`));
    await dispatch(getAliases(`${searchKey}*`));
    const esState = getState().elasticsearch;
    const partialMatchedIndices = esState.indices;
    const partialMatchedAliases = esState.aliases;
    if (partialMatchedAliases.length || partialMatchedIndices.length) {
      return {
        indices: partialMatchedIndices,
        aliases: partialMatchedAliases,
      };
    }
  }
};

export default reducer;
