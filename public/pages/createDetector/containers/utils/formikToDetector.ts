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
  Detector,
  UIFilter,
  FILTER_TYPES,
  UNITS,
} from '../../../../models/interfaces';
import { ADFormikValues } from '../models/interfaces';
import { OPERATORS_QUERY_MAP } from './whereFilters';
import { get } from 'lodash';

export function formikToDetector(
  values: ADFormikValues,
  detector: Detector
): Detector {
  let filterQuery = {};
  if (values.filterType === FILTER_TYPES.SIMPLE) {
    filterQuery = formikToFilterQuery(values.filters);
  } else {
    try {
      filterQuery = JSON.parse(values.filterQuery);
    } catch (e) {
      //This should mostly not happen as we've have validation before submit
      filterQuery = {};
    }
  }
  const indices = formikToIndices(values.index);
  const uiMetaData = formikToUIMetadata(values, detector);

  let apiRequest = {
    ...detector,
    name: values.detectorName,
    description: values.detectorDescription,
    timeField: values.timeField,
    indices,
    filterQuery: {
      ...filterQuery,
    },
    uiMetadata: uiMetaData,
    detectionInterval: {
      period: { interval: values.detectionInterval, unit: UNITS.MINUTES },
    },
    windowDelay: {
      period: { interval: values.windowDelay, unit: UNITS.MINUTES },
    },
  } as Detector;

  return apiRequest;
}

export const formikToUIMetadata = (
  values: ADFormikValues,
  detector: Detector
) => {
  return {
    filterType: values.filterType,
    filters: formikFiltersToUiMetadata(values.filters),
    features: get(detector, 'uiMetadata.features', {}),
  };
};

export const formikFiltersToUiMetadata = (filters: UIFilter[]) =>
  filters.length > 0 ? filters : [];

export const formikToFilterQuery = (
  filters: UIFilter[]
): { [key: string]: any } => {
  if (filters.length > 0) {
    const esFilters = filters.map((filter: UIFilter) => {
      return OPERATORS_QUERY_MAP[filter.operator].query(filter);
    });
    return {
      bool: {
        filter: [...esFilters],
      },
    };
  } else {
    return { match_all: {} };
  }
};

const formikToIndices = (indices: { label: string }[]) =>
  indices.map(index => index.label);
