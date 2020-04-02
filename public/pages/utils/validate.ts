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

export const ILLEGAL_CHARACTERS = [
  '\\',
  '/',
  '?',
  '"',
  '<',
  '>',
  '|',
  ',',
  ' ',
];

export const validateIndex = (options: any) => {
  if (!Array.isArray(options)) return 'Must specify an index';
  if (!options.length) return 'Must specify an index';
  const illegalCharacters = ILLEGAL_CHARACTERS.join(' ');
  const pattern = options.map(({ label }) => label).join('');
  if (!isIndexPatternQueryValid(pattern, ILLEGAL_CHARACTERS)) {
    return `One of your inputs contains invalid characters or spaces. Please omit: ${illegalCharacters}`;
  }
};

export function isIndexPatternQueryValid(
  pattern: string,
  illegalCharacters: string[]
) {
  if (!pattern || !pattern.length) {
    return false;
  }
  if (pattern === '.' || pattern === '..') {
    return false;
  }
  return !illegalCharacters.some(char => pattern.includes(char));
}
