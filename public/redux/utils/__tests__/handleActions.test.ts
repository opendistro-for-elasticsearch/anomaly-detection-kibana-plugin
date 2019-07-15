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

import handleActions from '../handleActions';
import { Reducer } from 'redux';

describe('Handle Actions', () => {
  const tempAction = { type: 'TEMP_ACTION' };

  test('Should accept initial State', () => {
    const initialState = { initial: 'state' };
    const reducer = handleActions({}, initialState);
    expect(reducer(undefined, tempAction)).toEqual(initialState);
  });
  describe('Given flat reducer', () => {
    const initialState = { initial: 'state' };
    const mockReducer = {
      FOO: jest.fn().mockReturnValue({ state: 'foo' }),
      BAR: jest.fn().mockReturnValue({ state: 'bar' }),
    };
    let reducer: Reducer;
    beforeEach(() => {
      reducer = handleActions(mockReducer, initialState);
    });

    test('should ignore reducers when no matching type', () => {
      const anotherAction = { type: 'ANOTHER' };
      const newState = reducer(undefined, anotherAction);
      expect(newState).toEqual(initialState);
      expect(mockReducer.FOO).toHaveBeenCalledTimes(0);
      expect(mockReducer.BAR).toHaveBeenCalledTimes(0);
    });
    test('should ignore reducers when no matching type', () => {
      const action = { type: 'FOO' };
      const newState = reducer(undefined, action);
      expect(newState).toEqual({ state: 'foo' });
      expect(mockReducer.FOO).toHaveBeenCalledTimes(1);
      expect(mockReducer.BAR).toHaveBeenCalledTimes(0);
    });
  });

  describe('Works with Nested reducer (Async)', () => {
    const initialState = { initial: 'state' };
    const mockReducer = {
      FOO: {
        REQUEST: jest.fn().mockReturnValue({ requesting: true }),
        SUCCESS: jest
          .fn()
          .mockReturnValue({ requesting: false, requested: true }),
        FAILURE: jest
          .fn()
          .mockReturnValue({ requesting: false, requested: false }),
      },
    };
    let reducer: Reducer;
    beforeEach(() => {
      reducer = handleActions(mockReducer, initialState);
    });

    test('should call nested with matching reducer and matching prefix', () => {
      const action = { type: 'FOO_REQUEST' };
      const state = { test: 'test' };
      const newState = reducer(state, action);
      expect(newState).toEqual({ requesting: true });
      expect(mockReducer.FOO.REQUEST).toHaveBeenCalledTimes(1);
      expect(mockReducer.FOO.REQUEST).toHaveBeenCalledWith(state, action);
      expect(mockReducer.FOO.SUCCESS).toHaveBeenCalledTimes(0);
      expect(mockReducer.FOO.FAILURE).toHaveBeenCalledTimes(0);
    });
  });
});
