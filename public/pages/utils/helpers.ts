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

import { CatIndex, IndexAlias } from '../../../server/models/types';
import sortBy from 'lodash/sortBy';
import { DetectorListItem } from '../../models/interfaces';
import { SORT_DIRECTION } from '../../../server/utils/constants';
import { ALL_INDICES, ALL_DETECTOR_STATES, DETECTOR_STATES } from './constants';

export function sanitizeSearchText(searchValue: string): string {
  if (!searchValue || searchValue == '*') {
    return '';
  }
  if (canAppendWildcard(searchValue)) {
    return `*${searchValue}*`;
  } else {
    return searchValue;
  }
}
function canAppendWildcard(searchValue: string): boolean {
  // If it's not a letter or number, reject it
  if (!searchValue || !/[a-z0-9]/i.test(searchValue)) {
    return false;
  }
  return true;
}

const isSystemIndices = (index: string) => {
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

export const filterAndSortDetectors = (
  detectors: DetectorListItem[],
  search: string,
  selectedIndices: string[],
  selectedDetectorStates: string[],
  sortField: string,
  sortDirection: string,
  size: number,
  page: number
) => {
  let filteredBySearch = detectors.filter(detector => {
    return search == '' || detector.name.includes(search);
  });
  let filteredByState = filteredBySearch.filter(detector => {
    return (
      selectedDetectorStates == ALL_DETECTOR_STATES ||
      //@ts-ignore
      selectedDetectorStates.includes(DETECTOR_STATES[detector.curState])
    );
  });
  let filteredByIndex = filteredByState.filter(detector => {
    return (
      selectedIndices == ALL_INDICES ||
      selectedIndices.includes(detector.indices[0])
    );
  });
  let sorted = sortBy(filteredByIndex, sortField);
  if (sortDirection == SORT_DIRECTION.DESC) {
    sorted = sorted.reverse();
  }
  return sorted;
};

export const getDetectorsToDisplay = (
  detectors: DetectorListItem[],
  page: number,
  size: number
) => {
  return detectors.slice(size * page, page * size + size);
};
