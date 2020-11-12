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

import { HttpSetup, HttpResponse } from '../../../../../src/core/public';
import { Action, Dispatch } from 'redux';
import { AppState } from '../reducers';

interface APIAction extends Action {
  // NOTE: there is no HttpPromise equivalent in core, using TypeScript's default Promise. Will need to confirm this still works as expected
  request: (client: HttpSetup) => Promise<HttpResponse<any>>;
  [key: string]: any;
}

interface APIResponseAction extends Action {
  result: any;
  [key: string]: any;
}

interface APIErrorAction extends Action {
  error: any;
  [key: string]: any;
}

type ThunkAction<State = AppState> = (
  dispatch: Dispatch,
  getState: () => State
) => void;

export {
  HttpSetup,
  HttpResponse,
  APIAction,
  APIResponseAction,
  APIErrorAction,
  ThunkAction,
};
