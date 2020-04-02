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

import { validateIndex, ILLEGAL_CHARACTERS } from '../validate';

describe('validateIndex', () => {
  test('returns undefined if valid index options', () => {
    expect(
      validateIndex([{ label: 'valid-index' }, { label: 'valid*' }])
    ).toBeUndefined();
  });

  test('returns error string if non array is passed in', () => {
    const invalidText = 'Must specify an index';
    expect(validateIndex(1)).toBe(invalidText);
    expect(validateIndex(null)).toBe(invalidText);
    expect(validateIndex('test')).toBe(invalidText);
    expect(validateIndex({})).toBe(invalidText);
  });

  test('returns error string if empty array', () => {
    const invalidText = 'Must specify an index';
    expect(validateIndex([])).toBe(invalidText);
  });

  test('returns error string if invalid index pattern', () => {
    const illegalCharacters = ILLEGAL_CHARACTERS.join(' ');
    const invalidText = `One of your inputs contains invalid characters or spaces. Please omit: ${illegalCharacters}`;
    expect(validateIndex([{ label: 'valid- index$' }])).toBe(invalidText);
  });
  test('returns error string if invalid index pattern', () => {
    const illegalCharacters = ILLEGAL_CHARACTERS.join(' ');
    const invalidText = `One of your inputs contains invalid characters or spaces. Please omit: ${illegalCharacters}`;
    expect(validateIndex([{ label: '..' }])).toBe(invalidText);
  });
  test('returns error string if invalid index pattern', () => {
    const illegalCharacters = ILLEGAL_CHARACTERS.join(' ');
    const invalidText = `One of your inputs contains invalid characters or spaces. Please omit: ${illegalCharacters}`;
    expect(validateIndex([{ label: '.' }])).toBe(invalidText);
  });
});
