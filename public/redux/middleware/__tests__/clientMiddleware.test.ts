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

import { AnyAction } from 'redux';
import { httpClientMock } from '../../../../test/mocks';
import clientMiddleware from '../clientMiddleware';
import { APIAction, ThunkAction } from '../types';

const create = () => {
  const store = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
  };
  const next = jest.fn();
  const invoke = (action: APIAction | ThunkAction<any> | AnyAction) =>
    clientMiddleware(httpClientMock)(store)(next)(action);
  return { store, next, invoke, httpClientMock };
};

const fooPromise = (success: boolean, result: string | object = 'Resolved') =>
  new Promise((resolve, reject) => {
    process.nextTick(() => (success ? resolve(result) : reject('Rejected')));
  });

describe('client MiddleWare', () => {
  test('passes through non-function action', () => {
    const { next, invoke } = create();
    const action = { type: 'TEST' };
    invoke(action);
    expect(next).toHaveBeenCalledWith(action);
  });
  test('calls the function', () => {
    const { invoke } = create();
    const fn = jest.fn();
    invoke(fn);
    expect(fn).toHaveBeenCalled();
  });
  test('passes dispatch and getState', () => {
    const { store, invoke } = create();
    invoke((dispatch, getState) => {
      dispatch({ type: 'TEST DISPATCH' });
      getState();
    });
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'TEST DISPATCH' });
    expect(store.getState).toHaveBeenCalled();
  });
  test('action passed with request should passes client', () => {
    const { invoke, httpClientMock } = create();
    const actionCall = jest.fn().mockReturnValue(fooPromise(true));
    const action = { type: 'TEST', request: actionCall };
    invoke(action);
    expect(actionCall).toHaveBeenCalledWith(httpClientMock);
  });

  test('action passed with request key should dispatch REQUEST', () => {
    const { next, invoke } = create();
    const actionCall = jest.fn().mockReturnValue(fooPromise(true));
    const action = { type: 'TEST', request: actionCall };
    invoke(action);
    expect(next).toHaveBeenCalledWith({ type: 'TEST_REQUEST' });
    expect(actionCall).toHaveBeenCalled();
  });

  test('should invoke _SUCCESS if Promise is Resolved', () => {
    expect.assertions(2);
    const { next, invoke } = create();
    const actionCall = jest.fn().mockReturnValue(fooPromise(true));
    const action = { type: 'TEST', request: actionCall };
    return invoke(action).then(() => {
      expect(next.mock.calls.length).toBe(2);
      expect(next.mock.calls[1][0]).toEqual({
        result: 'Resolved',
        type: 'TEST_SUCCESS',
      });
    });
  });

  test('should invoke _FAILURE if Promise is resolved but response is not ok', () => {
    expect.assertions(2);
    const { next, invoke } = create();
    const actionCall = jest
      .fn()
      .mockReturnValue(fooPromise(true, { ok: false }));
    const action = { type: 'TEST', request: actionCall };
    return invoke(action).then(() => {
      expect(next.mock.calls.length).toBe(2);
      expect(next.mock.calls[1][0]).toEqual({
        result: { ok: false },
        type: 'TEST_SUCCESS',
      });
    });
  });

  test('should invoke _FAILURE if Promise is Rejected', () => {
    const { next, invoke } = create();
    const actionCall = jest.fn().mockReturnValue(fooPromise(false));
    const action = { type: 'TEST', request: actionCall };
    return invoke(action).catch(() => {
      expect(next.mock.calls.length).toBe(2);
      expect(next.mock.calls[1][0]).toEqual({
        error: 'Rejected',
        type: 'TEST_FAILURE',
      });
    });
  });
});
