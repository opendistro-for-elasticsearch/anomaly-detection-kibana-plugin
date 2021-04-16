/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { DATA_TYPES } from '../../../../../utils/constants';
import { FILTER_TYPES } from '../../../../../models/interfaces';

export const WHERE_BOOLEAN_FILTERS = [
  { text: 'Select value', value: '' },
  { text: 'True', value: 'true' },
  { text: 'False', value: 'false' },
];

export const FILTER_TYPES_OPTIONS = [
  { text: 'Visual editor', value: FILTER_TYPES.SIMPLE },
  { text: 'Custom expression', value: FILTER_TYPES.CUSTOM },
];

export enum OPERATORS_MAP {
  IS = 'is',
  IS_NOT = 'is_not',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  IS_GREATER = 'is_greater',
  IS_GREATER_EQUAL = 'is_greater_equal',
  IS_LESS = 'is_less',
  IS_LESS_EQUAL = 'is_less_equal',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'does_not_contains',
  IN_RANGE = 'in_range',
  NOT_IN_RANGE = 'not_in_range',
}

export interface COMPARISON_OPERATOR {
  text: string;
  value: OPERATORS_MAP;
  dataTypes: DATA_TYPES[];
}

export const COMPARISON_OPERATORS: COMPARISON_OPERATOR[] = [
  {
    text: 'is',
    value: OPERATORS_MAP.IS,
    dataTypes: [
      DATA_TYPES.NUMBER,
      DATA_TYPES.TEXT,
      DATA_TYPES.KEYWORD,
      DATA_TYPES.BOOLEAN,
    ],
  },
  {
    text: 'is not',
    value: OPERATORS_MAP.IS_NOT,
    dataTypes: [
      DATA_TYPES.NUMBER,
      DATA_TYPES.TEXT,
      DATA_TYPES.KEYWORD,
      DATA_TYPES.BOOLEAN,
    ],
  },
  {
    text: 'is null',
    value: OPERATORS_MAP.IS_NULL,
    dataTypes: [
      DATA_TYPES.NUMBER,
      DATA_TYPES.TEXT,
      DATA_TYPES.KEYWORD,
      DATA_TYPES.BOOLEAN,
    ],
  },
  {
    text: 'is not null',
    value: OPERATORS_MAP.IS_NOT_NULL,
    dataTypes: [DATA_TYPES.NUMBER, DATA_TYPES.TEXT, DATA_TYPES.KEYWORD],
  },
  {
    text: 'is greater than',
    value: OPERATORS_MAP.IS_GREATER,
    dataTypes: [DATA_TYPES.NUMBER],
  },
  {
    text: 'is greater than equal',
    value: OPERATORS_MAP.IS_GREATER_EQUAL,
    dataTypes: [DATA_TYPES.NUMBER],
  },
  {
    text: 'is less than',
    value: OPERATORS_MAP.IS_LESS,
    dataTypes: [DATA_TYPES.NUMBER],
  },
  {
    text: 'is less than equal',
    value: OPERATORS_MAP.IS_LESS_EQUAL,
    dataTypes: [DATA_TYPES.NUMBER],
  },
  {
    text: 'is in range',
    value: OPERATORS_MAP.IN_RANGE,
    dataTypes: [DATA_TYPES.NUMBER],
  },
  {
    text: 'is not in range',
    value: OPERATORS_MAP.NOT_IN_RANGE,
    dataTypes: [DATA_TYPES.NUMBER],
  },
  {
    text: 'starts with',
    value: OPERATORS_MAP.STARTS_WITH,
    dataTypes: [DATA_TYPES.TEXT, DATA_TYPES.KEYWORD],
  },
  {
    text: 'ends with',
    value: OPERATORS_MAP.ENDS_WITH,
    dataTypes: [DATA_TYPES.TEXT, DATA_TYPES.KEYWORD],
  },
  {
    text: 'contains',
    value: OPERATORS_MAP.CONTAINS,
    dataTypes: [DATA_TYPES.TEXT, DATA_TYPES.KEYWORD],
  },
  {
    text: 'does not contains',
    value: OPERATORS_MAP.NOT_CONTAINS,
    dataTypes: [DATA_TYPES.TEXT],
  },
];
