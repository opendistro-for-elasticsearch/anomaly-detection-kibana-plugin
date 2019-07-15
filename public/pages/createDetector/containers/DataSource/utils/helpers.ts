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

import { CatIndex, IndexAlias } from '../../../../../../server/models/types';

export function sanitizeSearchText(searchValue: string): string {
  if (!searchValue || searchValue == '*') {
    return '';
  }
  if (canAppendWildcard(searchValue)) {
    return `${searchValue}*`;
  } else {
    return searchValue;
  }
}
export function canAppendWildcard(searchValue: string): boolean {
  // If it's not a letter, number or is something longer, reject it
  if (
    !searchValue ||
    !/[a-z0-9]/i.test(searchValue) ||
    searchValue.length !== 1
  ) {
    return false;
  }
  return true;
}

export const isSystemIndices = (index: string) => {
  if (!index) {
    return index;
  }
  return !index.startsWith('.');
};

export function getVisibleOptions(indices: CatIndex[], aliases: IndexAlias[]) {
  const visibleIndices = indices
    .filter(value => isSystemIndices(value.index))
    .map(value => ({ label: value.index, health: value.health }));
  const visibleAliases = aliases
    .filter(value => isSystemIndices(value.alias))
    .map(value => ({ label: value.alias }));
  return [
    {
      label: 'Indices',
      options: visibleIndices,
    },
    {
      label: 'Aliases',
      options: visibleAliases,
    },
  ];
}
