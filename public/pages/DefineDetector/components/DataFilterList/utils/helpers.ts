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

import { get } from 'lodash';
import {
  COMPARISON_OPERATORS,
  OPERATORS_MAP,
  COMPARISON_OPERATOR,
} from './constant';
import { DATA_TYPES } from '../../../../../utils/constants';
import { UIFilter, FILTER_TYPES } from '../../../../../models/interfaces';
import { isEmpty } from 'lodash';

const allowedFilters = [
  DATA_TYPES.BOOLEAN,
  DATA_TYPES.KEYWORD,
  DATA_TYPES.NUMBER,
  DATA_TYPES.TEXT,
];

export const getIndexFields = (allFields: { [key: string]: string[] }) =>
  allowedFilters
    .map((dataType) =>
      allFields[dataType]
        ? {
            label: dataType,
            options: allFields[dataType].map((field) => ({
              label: field,
              type: dataType,
            })),
          }
        : null
    )
    .filter(Boolean);

export const getOperators = (fieldType: DATA_TYPES): any[] =>
  COMPARISON_OPERATORS.reduce(
    (acc: any[], currentOperator: COMPARISON_OPERATOR) =>
      currentOperator.dataTypes.includes(fieldType)
        ? [...acc, { text: currentOperator.text, value: currentOperator.value }]
        : acc,
    []
  );

export const isRangeOperator = (selectedOperator: OPERATORS_MAP): boolean =>
  [OPERATORS_MAP.IN_RANGE, OPERATORS_MAP.NOT_IN_RANGE].includes(
    selectedOperator
  );

export const isNullOperator = (selectedOperator: OPERATORS_MAP): boolean =>
  [OPERATORS_MAP.IS_NULL, OPERATORS_MAP.IS_NOT_NULL].includes(selectedOperator);

export const displayText = (filter: UIFilter): string => {
  if (!isEmpty(filter.label)) {
    //@ts-ignore
    return filter.label;
  }
  const fieldName = get(filter, 'fieldInfo[0].label', '');
  const selectedOperator = filter.operator as OPERATORS_MAP;
  const operatorObj = COMPARISON_OPERATORS.find(
    (operator) => operator.value === selectedOperator
  ) || { text: '' };
  const initialText = `${fieldName} ${operatorObj.text}`;

  if (isRangeOperator(selectedOperator)) {
    const startRange = get(filter, 'fieldRangeStart', 0);
    const endRange = get(filter, 'fieldRangeEnd', 0);
    return `${initialText} from ${startRange} to ${endRange}`;
  } else if (isNullOperator(selectedOperator)) {
    return `${initialText}`;
  } else {
    const value = get(filter, 'fieldValue', '');
    return `${initialText} ${value}`;
  }
};

export const validateStart = (startVal: number | string, endVal: number) => {
  if (startVal === '' || startVal === null || startVal === undefined) {
    return 'Required';
  }
  if (endVal !== null && endVal !== undefined && startVal >= endVal) {
    return 'Start should be less than end';
  }
};

export const validateEnd = (endVal: number | string, startVal: number) => {
  if (endVal === '' || endVal === null || endVal === undefined) {
    return 'Required';
  }
  if (startVal !== null && startVal !== undefined && endVal <= startVal) {
    return 'End should be greater than start';
  }
};

export const validFilterQuery = (value: string) => {
  try {
    JSON.parse(value);
  } catch (err) {
    return 'Invalid JSON';
  }
};

export const getFilterLabel = (filter: UIFilter) => {
  return filter.filterType === FILTER_TYPES.SIMPLE
    ? displayText(filter)
    : !isEmpty(filter.query)
    ? filter.query
    : 'Custom query';
};
