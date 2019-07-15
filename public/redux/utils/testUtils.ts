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

import configureStore, { MockStore } from 'redux-mock-store';
import clientMiddleware from '../middleware/clientMiddleware';
import httpClientMock from '../../../test/mocks/httpClientMock';
import { AppState } from '../reducers';
export const initialState = {
  ad: {
    requesting: false,
    detectors: {},
    totalDetectors: 0,
    errorMessage: '',
    detectorList: {},
  },
  elasticsearch: {
    indices: [],
    aliases: [],
    dataTypes: {},
    requesting: false,
    searchResult: {},
    errorMessage: '',
  },
  anomalies: {
    requesting: false,
    anomaliesResult: {
      anomalies: [],
      featureData: {},
    },
    errorMessage: '',
  },
  anomalyResults: {
    requesting: false,
    total: 0,
    anomalies: [],
    errorMessage: '',
  },
};

export const mockedStore = (mockState = initialState): MockStore<AppState> => {
  const middlewares = [clientMiddleware(httpClientMock)];
  const mockStore = configureStore<AppState>(middlewares);
  const store = mockStore(mockState);
  return store;
};
