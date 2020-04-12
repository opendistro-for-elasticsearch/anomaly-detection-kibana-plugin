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

import { combineReducers } from 'redux';
import indicesReducer from './elasticsearch';
import adReducer from './ad';
import anomalies from './anomalies';
import anomalyResults from './anomalyResults';
import adAppReducer from './adAppReducer';

const rootReducer = combineReducers({
  elasticsearch: indicesReducer,
  anomalies: anomalies,
  anomalyResults: anomalyResults,
  ad: adReducer,
  adApp: adAppReducer,
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
