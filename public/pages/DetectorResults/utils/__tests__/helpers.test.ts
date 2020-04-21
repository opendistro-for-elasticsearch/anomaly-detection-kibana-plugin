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

import { getURLQueryParams } from '../helpers';
import { SORT_DIRECTION } from '../../../../../server/utils/constants';

describe('helpers spec', () => {
  describe('getURLQueryParams', () => {
    test('should return default values', () => {
      expect(getURLQueryParams({ search: '' })).toEqual({
        from: 0,
        size: 20,
        sortField: 'data_start_time',
        sortDirection: SORT_DIRECTION.ASC,
      });
    });
    test('should  default values if missing from queryParams', () => {
      expect(getURLQueryParams({ search: 'from=100&size=20' })).toEqual({
        from: 100,
        size: 20,
        sortField: 'data_start_time',
        sortDirection: SORT_DIRECTION.ASC,
      });
    });
    test('should return queryParams from location', () => {
      expect(
        getURLQueryParams({
          search: 'from=100&size=5&sortField=endTime&sortDirection=desc',
        })
      ).toEqual({
        from: 100,
        size: 5,
        sortField: 'endTime',
        sortDirection: SORT_DIRECTION.DESC,
      });
    });
  });
});
