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

import { ADFormikValues } from '../models/interfaces';
import { OPERATORS_MAP } from '../../components/DataFilters/utils/constant';
import { UIFilter, FILTER_TYPES } from '../../../../models/interfaces';

export const INITIAL_VALUES: ADFormikValues = {
  detectorName: '',
  timeField: '',
  detectorDescription: '',
  filters: [],
  index: [],
  filterType: FILTER_TYPES.SIMPLE,
  filterQuery: JSON.stringify({ query: { bool: { filter: [] } } }, null, 4),
  detectionInterval: 10,
  windowDelay: 0,
};

export const EMPTY_UI_FILTER: UIFilter = {
  fieldInfo: [],
  operator: OPERATORS_MAP.IS,
  fieldValue: '',
};
