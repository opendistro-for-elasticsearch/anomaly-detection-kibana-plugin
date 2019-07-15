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

import { UIFilter } from '../../../../models/interfaces';
import { DATA_TYPES } from '../../../../utils/constants';
import { OPERATORS_MAP } from '../../components/DataFilters/utils/constant';

//TODO:: Breakdown to factory pattern for rules in-case we support multiple filters. This is just ease for the single one
export const OPERATORS_QUERY_MAP = {
  [OPERATORS_MAP.IS]: {
    query: ({ fieldInfo: [{ label, type }], fieldValue }: UIFilter) =>
      type === DATA_TYPES.TEXT
        ? { match_phrase: { [label]: fieldValue } }
        : { term: { [label]: fieldValue } },
  },
  [OPERATORS_MAP.IS_NOT]: {
    query: ({ fieldInfo: [{ label, type }], fieldValue }: UIFilter) =>
      type === DATA_TYPES.TEXT
        ? {
            bool: { must_not: { match_phrase: { [label]: fieldValue } } },
          }
        : {
            bool: { must_not: { term: { [label]: fieldValue } } },
          },
  },
  [OPERATORS_MAP.IS_NULL]: {
    query: ({ fieldInfo: [{ label: fieldKey }] }: UIFilter) => ({
      bool: { must_not: { exists: { field: fieldKey } } },
    }),
  },
  [OPERATORS_MAP.IS_NOT_NULL]: {
    query: ({ fieldInfo: [{ label: fieldKey }] }: UIFilter) => ({
      exists: { field: fieldKey },
    }),
  },
  [OPERATORS_MAP.IS_GREATER]: {
    query: ({ fieldInfo: [{ label: fieldKey }], fieldValue }: UIFilter) => ({
      range: { [fieldKey]: { gt: fieldValue } },
    }),
  },

  [OPERATORS_MAP.IS_GREATER_EQUAL]: {
    query: ({ fieldInfo: [{ label: fieldKey }], fieldValue }: UIFilter) => ({
      range: { [fieldKey]: { gte: fieldValue } },
    }),
  },
  [OPERATORS_MAP.IS_LESS]: {
    query: ({ fieldInfo: [{ label: fieldKey }], fieldValue }: UIFilter) => ({
      range: { [fieldKey]: { lt: fieldValue } },
    }),
  },

  [OPERATORS_MAP.IS_LESS_EQUAL]: {
    query: ({ fieldInfo: [{ label: fieldKey }], fieldValue }: UIFilter) => ({
      range: { [fieldKey]: { lte: fieldValue } },
    }),
  },

  [OPERATORS_MAP.IN_RANGE]: {
    query: ({
      fieldInfo: [{ label: fieldKey }],
      fieldRangeStart,
      fieldRangeEnd,
    }: UIFilter) => ({
      range: { [fieldKey]: { gte: fieldRangeStart, lte: fieldRangeEnd } },
    }),
  },
  [OPERATORS_MAP.NOT_IN_RANGE]: {
    query: ({
      fieldInfo: [{ label: fieldKey }],
      fieldRangeStart,
      fieldRangeEnd,
    }: UIFilter) => ({
      bool: {
        must_not: {
          range: { [fieldKey]: { gte: fieldRangeStart, lte: fieldRangeEnd } },
        },
      },
    }),
  },

  [OPERATORS_MAP.STARTS_WITH]: {
    query: ({ fieldInfo: [{ label: fieldKey }], fieldValue }: UIFilter) => ({
      prefix: { [fieldKey]: fieldValue },
    }),
  },

  [OPERATORS_MAP.ENDS_WITH]: {
    query: ({ fieldInfo: [{ label: fieldKey }], fieldValue }: UIFilter) => ({
      wildcard: { [fieldKey]: `*${fieldValue}` },
    }),
  },
  [OPERATORS_MAP.CONTAINS]: {
    query: ({ fieldInfo: [{ label, type }], fieldValue }: UIFilter) =>
      type === DATA_TYPES.TEXT
        ? {
            query_string: { query: `*${fieldValue}*`, default_field: label },
          }
        : {
            wildcard: { [label]: `*${fieldValue}*` },
          },
  },
  [OPERATORS_MAP.NOT_CONTAINS]: {
    query: ({ fieldInfo: [{ label, type }], fieldValue }: UIFilter) =>
      type === DATA_TYPES.TEXT
        ? {
            bool: {
              must_not: {
                query_string: {
                  query: `*${fieldValue}*`,
                  default_field: label,
                },
              },
            },
          }
        : {
            bool: { must_not: { wildcard: { [label]: `*${fieldValue}*` } } },
          },
  },
};
