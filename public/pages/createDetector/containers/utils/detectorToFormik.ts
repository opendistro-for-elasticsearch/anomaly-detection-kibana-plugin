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

import { cloneDeep, isEmpty, get } from 'lodash';
import { Detector, FILTER_TYPES } from '../../../../models/interfaces';
import { ADFormikValues } from '../models/interfaces';
import { INITIAL_VALUES } from './constant';
import { getShingleSizeFromObject } from '../../../../pages/EditFeatures/utils/helpers';

export function detectorToFormik(ad: Detector): ADFormikValues {
  const initialValues = cloneDeep(INITIAL_VALUES);
  if (isEmpty(ad)) return initialValues;
  //If detector id updated / added using API, convert all filters to Query boxes as we don't have any meta data.
  const filterType =
    get(ad, 'uiMetadata.filterType', undefined) || FILTER_TYPES.CUSTOM;
  let filterQuery = JSON.stringify(
    get(ad, 'filterQuery', { match_all: {} }),
    null,
    4
  );
  return {
    ...initialValues,
    detectorName: ad.name,
    detectorDescription: ad.description,
    filters: get(ad, 'uiMetadata.filters', []),
    filterType,
    filterQuery,
    index: [{ label: ad.indices[0] }], // Currently we support only one index
    timeField: ad.timeField,
    detectionInterval: get(ad, 'detectionInterval.period.interval', 10),
    windowDelay: get(ad, 'windowDelay.period.interval', 0),
    shingleSize: getShingleSizeFromObject(
      ad,
      !isEmpty(get(ad, 'categoryField', []))
    ),
  };
}
