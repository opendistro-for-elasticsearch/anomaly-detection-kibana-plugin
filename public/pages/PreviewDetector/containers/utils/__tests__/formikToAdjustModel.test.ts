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

import { getRandomDetector } from '../../../../../redux/reducers/__tests__/utils';
import { AdjustModelFormikValues } from '../../AdjustModel';
import { featuresToFormik } from '../featuresToFormik';
import { prepareTunedDetector } from '../formikToAdjustModel';
import { UNITS } from '../../../../../../server/models/types';

describe('prepareTunedDetector', () => {
  test('should able to update detection interval', () => {
    const randomDetector = getRandomDetector(false);
    const tuneValue: AdjustModelFormikValues = {
      detectionInterval: 20,
      formikFeatures: Object.values(featuresToFormik(randomDetector)),
    };
    const apiRequest = prepareTunedDetector(tuneValue, randomDetector);
    expect(apiRequest.detectionInterval).toEqual({
      period: { interval: 20, unit: UNITS.MINUTES },
    });
  });
  test('should able to update state of a feature interval', () => {
    const randomDetector = getRandomDetector(false);
    const formikFeaturesMap = featuresToFormik(randomDetector);
    const editFeatureId = randomDetector.featureAttributes[0].featureId || '';
    const updatedFeatures = {
      ...formikFeaturesMap,
      [editFeatureId]: {
        ...formikFeaturesMap[editFeatureId],
        enabled: !formikFeaturesMap[editFeatureId].enabled,
      },
    };
    const formikFeatures = Object.values(updatedFeatures);
    const tuneValue: AdjustModelFormikValues = {
      detectionInterval: 20,
      formikFeatures: formikFeatures,
    };
    const apiRequest = prepareTunedDetector(tuneValue, randomDetector);
    expect(apiRequest.detectionInterval).toEqual({
      period: { interval: 20, unit: UNITS.MINUTES },
    });
    expect(apiRequest.featureAttributes[0].featureEnabled).toBe(
      !formikFeaturesMap[editFeatureId].enabled
    );
  });
});
