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
import {
  DetectorListItem,
  HistoricalDetectorListItem,
} from '../../models/interfaces';
import { SORT_DIRECTION } from '../../../server/utils/constants';
import { ALL_INDICES, ALL_DETECTOR_STATES } from './constants';
import { DETECTOR_STATE } from '../../../server/utils/constants';
import { timeFormatter } from '@elastic/charts';

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

const isUserIndex = (index: string) => {
  if (!index) {
    return false;
  }
  return !index.startsWith('.');
};

export function getVisibleOptions(indices: CatIndex[], aliases: IndexAlias[]) {
  const visibleIndices = indices
    .filter((value) => isUserIndex(value.index))
    .map((value) => ({ label: value.index, health: value.health }));
  const visibleAliases = aliases
    .filter((value) => isUserIndex(value.alias))
    .map((value) => ({ label: value.alias }));

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
  selectedDetectorStates: DETECTOR_STATE[],
  sortField: string,
  sortDirection: string
) => {
  let filteredBySearch =
    search == ''
      ? detectors
      : detectors.filter((detector) => detector.name.includes(search));
  let filteredBySearchAndState =
    selectedDetectorStates == ALL_DETECTOR_STATES
      ? filteredBySearch
      : filteredBySearch.filter((detector) =>
          selectedDetectorStates.includes(detector.curState)
        );
  let filteredBySearchAndStateAndIndex =
    selectedIndices == ALL_INDICES
      ? filteredBySearchAndState
      : filteredBySearchAndState.filter((detector) =>
          selectedIndices.includes(detector.indices[0])
        );
  let sorted = sortBy(filteredBySearchAndStateAndIndex, sortField);
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

export const dateFormatter = timeFormatter('MM/DD/YY hh:mm:ss A');
export const minuteDateFormatter = timeFormatter('MM/DD/YY hh:mm A');

export const formatNumber = (data: any) => {
  try {
    const value = parseFloat(data);
    return !value ? value : value.toFixed(2);
  } catch (err) {
    return '';
  }
};

export const filterAndSortHistoricalDetectors = (
  detectors: HistoricalDetectorListItem[],
  search: string,
  selectedDetectorStates: DETECTOR_STATE[],
  sortField: string,
  sortDirection: string
) => {
  let filteredBySearch =
    search == ''
      ? detectors
      : detectors.filter((detector) => detector.name.includes(search));
  let filteredBySearchAndState =
    selectedDetectorStates == ALL_DETECTOR_STATES
      ? filteredBySearch
      : filteredBySearch.filter((detector) =>
          selectedDetectorStates.includes(detector.curState)
        );
  let sorted = sortBy(filteredBySearchAndState, sortField);
  if (sortDirection == SORT_DIRECTION.DESC) {
    sorted = sorted.reverse();
  }
  return sorted;
};

export const getHistoricalDetectorsToDisplay = (
  detectors: HistoricalDetectorListItem[],
  page: number,
  size: number
) => {
  return detectors.slice(size * page, page * size + size);
};
