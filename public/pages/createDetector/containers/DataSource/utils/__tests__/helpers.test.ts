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

import { getVisibleOptions, sanitizeSearchText } from '../helpers';
describe('helpers', () => {
  describe('getVisibleOptions', () => {
    test('returns without system indices if valid index options', () => {
      expect(
        getVisibleOptions(
          [
            { index: 'hello', health: 'green' },
            { index: '.world', health: 'green' },
          ],
          [
            { alias: 'hello', index: 'world' },
            { alias: '.system', index: 'kibana' },
          ]
        )
      ).toEqual([
        {
          label: 'Indices',
          options: [{ label: 'hello', health: 'green' }],
        },
        {
          label: 'Aliases',
          options: [{ label: 'hello' }],
        },
      ]);
    });
    test('returns empty aliases and index ', () => {
      expect(
        getVisibleOptions(
          [
            { index: '.hello', health: 'green' },
            { index: '.world', health: 'green' },
          ],
          [{ alias: '.system', index: 'kibana' }]
        )
      ).toEqual([
        {
          label: 'Indices',
          options: [],
        },
        {
          label: 'Aliases',
          options: [],
        },
      ]);
    });
  });
  describe('sanitizeSearchText', () => {
    test('should return empty', () => {
      expect(sanitizeSearchText('*')).toBe('');
      expect(sanitizeSearchText('')).toBe('');
    });
    test('should append wildcard', () => {
      expect(sanitizeSearchText('h')).toBe('h*');
    });
    test('should not append wildcard', () => {
      expect(sanitizeSearchText('hello')).toBe('hello');
    });
  });
});
