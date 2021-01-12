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

import { Dispatch, MiddlewareAPI, AnyAction } from 'redux';
import { HttpSetup, APIAction, ThunkAction } from './types';
import { get } from 'lodash';
/*
  This a middleware for Redux. To understand this read : http://redux.js.org/docs/advanced/Middleware.html
*/

const isAPIAction = (
  action: APIAction | Function | AnyAction
): action is APIAction => (action as APIAction).request !== undefined;

//TODO: Find better way to define return type and avoid ANY.

export default function clientMiddleware<State>(client: HttpSetup) {
  return ({ dispatch, getState }: MiddlewareAPI<Dispatch, State>) => (
    next: Dispatch
  ) => async (action: APIAction | ThunkAction | AnyAction): Promise<any> => {
    if (typeof action === 'function') {
      //@ts-ignore
      return action(dispatch, getState);
    }
    if (isAPIAction(action)) {
      const { request, type, ...rest } = action;
      try {
        // Network call
        next({ ...rest, type: `${type}_REQUEST` });
        const result = await request(client);
        //@ts-ignore
        if (get(result, 'ok', true)) {
          next({ ...rest, result, type: `${type}_SUCCESS` });
          return result;
        } else {
          //@ts-ignore
          throw get(result, 'error', '');
        }
      } catch (error) {
        next({ ...rest, error, type: `${type}_FAILURE` });
        throw error;
      }
    } else {
      return next(action);
    }
  };
}
