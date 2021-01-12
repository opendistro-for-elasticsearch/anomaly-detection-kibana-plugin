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

import { INITIAL_VALUES } from '../constant';
import {
  MULTI_ENTITY_SHINGLE_SIZE,
  SINGLE_ENTITY_SHINGLE_SIZE,
} from '../../../../../utils/constants';
import { getRandomDetector } from '../../../../../redux/reducers/__tests__/utils';
import { detectorToFormik } from '../detectorToFormik';
import { Detector, FILTER_TYPES } from '../../../../../models/interfaces';

describe('adToFormik', () => {
  test('should return initialValues if detector is null', () => {
    const randomDetector = {} as Detector;
    const adFormikValues = detectorToFormik(randomDetector);
    expect(adFormikValues).toEqual(INITIAL_VALUES);
  });
  test('should return remote values if detector is not null', () => {
    const randomDetector = getRandomDetector();
    const adFormikValues = detectorToFormik(randomDetector);
    expect(adFormikValues).toEqual({
      detectorName: randomDetector.name,
      detectorDescription: randomDetector.description,
      filters: randomDetector.uiMetadata.filters,
      filterType: FILTER_TYPES.SIMPLE,
      filterQuery: JSON.stringify(randomDetector.filterQuery || {}, null, 4),
      index: [{ label: randomDetector.indices[0] }], // Currently we support only one index
      shingleSize: SINGLE_ENTITY_SHINGLE_SIZE,
      timeField: randomDetector.timeField,
      detectionInterval: randomDetector.detectionInterval.period.interval,
      windowDelay: randomDetector.windowDelay.period.interval,
    });
  });
  test('should return if detector does not have metadata', () => {
    const randomDetector = getRandomDetector();
    //@ts-ignore
    randomDetector.uiMetadata = undefined;
    const adFormikValues = detectorToFormik(randomDetector);
    expect(adFormikValues).toEqual({
      detectorName: randomDetector.name,
      detectorDescription: randomDetector.description,
      filters: [],
      filterType: FILTER_TYPES.CUSTOM,
      filterQuery: JSON.stringify(randomDetector.filterQuery || {}, null, 4),
      index: [{ label: randomDetector.indices[0] }], // Currently we support only one index
      shingleSize: SINGLE_ENTITY_SHINGLE_SIZE,
      timeField: randomDetector.timeField,
      detectionInterval: randomDetector.detectionInterval.period.interval,
      windowDelay: randomDetector.windowDelay.period.interval,
    });
  });
  test('should return if detector has categoryField', () => {
    let randomDetector = getRandomDetector();
    randomDetector.categoryField = ['field'];
    const adFormikValues = detectorToFormik(randomDetector);
    expect(adFormikValues).toEqual({
      detectorName: randomDetector.name,
      detectorDescription: randomDetector.description,
      filters: [],
      filterType: FILTER_TYPES.SIMPLE,
      filterQuery: JSON.stringify(randomDetector.filterQuery || {}, null, 4),
      index: [{ label: randomDetector.indices[0] }], // Currently we support only one index
      shingleSize: MULTI_ENTITY_SHINGLE_SIZE,
      timeField: randomDetector.timeField,
      detectionInterval: randomDetector.detectionInterval.period.interval,
      windowDelay: randomDetector.windowDelay.period.interval,
    });
  });
});
