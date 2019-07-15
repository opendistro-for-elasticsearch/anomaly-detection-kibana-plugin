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

import queryString from 'query-string';
import { DetectorResultsQueryParams } from '../../../../server/models/types';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import { DEFAULT_QUERY_PARAMS } from './constants';

export const getURLQueryParams = (location: {
  search: string;
}): DetectorResultsQueryParams => {
  const { from, size, sortField, sortDirection } = queryString.parse(
    location.search
  ) as { [key: string]: string };
  return {
    from: isNaN(parseInt(from, 10))
      ? DEFAULT_QUERY_PARAMS.from
      : parseInt(from, 10),
    size: isNaN(parseInt(size, 10))
      ? DEFAULT_QUERY_PARAMS.size
      : parseInt(size, 10),
    sortField:
      typeof sortField !== 'string'
        ? DEFAULT_QUERY_PARAMS.sortField
        : sortField,
    sortDirection:
      typeof sortDirection !== 'string'
        ? DEFAULT_QUERY_PARAMS.sortDirection
        : (sortDirection as SORT_DIRECTION),
  };
};
