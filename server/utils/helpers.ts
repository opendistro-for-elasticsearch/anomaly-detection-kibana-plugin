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

import {
  camelCase,
  isPlainObject,
  map,
  mapKeys,
  mapValues,
  snakeCase,
} from 'lodash';

import { MIN_IN_MILLI_SECS } from './constants';
import { SHOW_DECIMAL_NUMBER_THRESHOLD } from '../../public/pages/Dashboard/utils/constants';

export function mapKeysDeep(obj: object, fn: any): object | any[] {
  if (Array.isArray(obj)) {
    return map(obj, innerObj => mapKeysDeep(innerObj, fn));
  } else {
    //@ts-ignore
    return isPlainObject(obj)
      ? mapValues(mapKeys(obj, fn), value => mapKeysDeep(value, fn))
      : obj;
  }
}

export const toSnake = (value: any, key: string) => snakeCase(key);

export const toCamel = (value: any, key: string) => camelCase(key);

export const getFloorPlotTime = (plotTime: number): number => {
  return Math.floor(plotTime / MIN_IN_MILLI_SECS) * MIN_IN_MILLI_SECS;
};

export const toFixedNumber = (num: number, digits?: number, base?: number) => {
  var pow = Math.pow(base || 10, digits || 2);
  return Math.round(num * pow) / pow;
};

// 1.If num>0.01, will keep two digits;
// 2.If num<0.01, will use scientific notation, example 0.001234 will beome 1.23e-3
export const toFixedNumberForAnomaly = (num: number): number => {
  const newNumber = toFixedNumber(num, 2);
  return newNumber ? newNumber : Number(num.toExponential(2));
};

export const formatAnomalyNumber = (num: number): string => {
  return num >= SHOW_DECIMAL_NUMBER_THRESHOLD
    ? num.toFixed(2)
    : num.toExponential(2);
};
