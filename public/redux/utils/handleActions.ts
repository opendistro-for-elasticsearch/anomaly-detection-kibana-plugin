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

import { Action, Reducer } from 'redux';

// This is utility to remove boilerplate for Redux.
// Redux requires quite few boilerplate for Reducers, this utility will help to simplify writing reducers.
const isFunction = (func: Object): Boolean => typeof func === 'function';

const makeType = (prefix: string[], type: string): string =>
  prefix.concat(type).join('_');

export interface ReducerMap {
  [key: string]: any;
}

const iterator = (
  reducers: ReducerMap,
  initial = {},
  prefix: string[] = []
): ReducerMap => {
  const reducerTypes = Object.keys(reducers);
  return reducerTypes.reduce((acc, type) => {
    const reducer = reducers[type];
    return isFunction(reducer)
      ? { ...acc, [makeType(prefix, type)]: reducer }
      : iterator(reducer, acc, [makeType(prefix, type)]);
  }, initial);
};

function handleActions<State>(
  reducerMap: ReducerMap,
  initialState: State
): Reducer<State> {
  const flattened = iterator(reducerMap);
  return (state = initialState, action: Action) => {
    const reducer = flattened[action.type];
    return reducer ? reducer(state, action) : state;
  };
}

export default handleActions;
