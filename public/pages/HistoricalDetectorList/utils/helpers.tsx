/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import queryString from 'querystring';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import { DEFAULT_QUERY_PARAMS } from '../../utils/constants';
import { DETECTOR_STATE } from '../../../../server/utils/constants';

export const getURLQueryParams = (location: { search: string }): any => {
  const { from, size, search, sortField, sortDirection } = queryString.parse(
    location.search
  ) as { [key: string]: string };
  return {
    // @ts-ignore
    from: isNaN(parseInt(from, 10))
      ? DEFAULT_QUERY_PARAMS.from
      : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10))
      ? DEFAULT_QUERY_PARAMS.size
      : parseInt(size, 10),
    search: typeof search !== 'string' ? DEFAULT_QUERY_PARAMS.search : search,
    sortField: typeof sortField !== 'string' ? 'name' : sortField,
    sortDirection:
      typeof sortDirection !== 'string'
        ? DEFAULT_QUERY_PARAMS.sortDirection
        : (sortDirection as SORT_DIRECTION),
  };
};

// For historical detectors: can only be stopped/running/completed/failed
export const getHistoricalDetectorStateOptions = () => {
  return Object.values(DETECTOR_STATE)
    .map((detectorState) => ({
      label: detectorState,
      text: detectorState,
    }))
    .filter(
      (option) =>
        option.label !== DETECTOR_STATE.INIT &&
        option.label !== DETECTOR_STATE.FEATURE_REQUIRED &&
        option.label !== DETECTOR_STATE.INIT_FAILURE
    );
};
