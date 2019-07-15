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

import { createSelector } from 'reselect';
import { AppState } from '../reducers';

const esSelector = (state: AppState) => state.elasticsearch;

const NUMBER_TYPES = [
  'long',
  'integer',
  'short',
  'byte',
  'double',
  'float',
  'half_float',
  'scaled_float',
];

export const getIndices = createSelector(
  esSelector,
  es => es.indices
);

export const getDataTypes = createSelector(
  esSelector,
  es => es.dataTypes
);

const getNumberFields = createSelector(
  getDataTypes,
  dataTypes => ({
    number: NUMBER_TYPES.reduce((acc, currentType) => {
      const newOptions = dataTypes[currentType] || [];
      return acc.concat(newOptions);
    }, []),
  })
);

const getOtherFields = createSelector(
  getDataTypes,
  dataTypes =>
    Object.keys(dataTypes).reduce(
      (acc, dataType: string) => {
        if (NUMBER_TYPES.includes(dataType)) {
          return { ...acc };
        } else {
          return {
            ...acc,
            [dataType]: [...dataTypes[dataType]],
          };
        }
      },
      {} as { [key: string]: string[] }
    )
);

//TODO:: Memoize this selector to avoid calculation on each time
export const getAllFields = createSelector(
  getNumberFields,
  getOtherFields,
  (numberFields, otherFields): { [key: string]: string[] } => {
    return { ...numberFields, ...otherFields };
  }
);
