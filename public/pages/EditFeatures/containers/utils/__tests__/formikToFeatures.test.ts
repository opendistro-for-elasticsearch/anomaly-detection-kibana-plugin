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

import { FeaturesFormikValues, prepareDetector } from '../formikToFeatures';
import { FEATURE_TYPE } from '../../../../../models/interfaces';

describe('featuresToFormik', () => {
  test('should able to add new feature', () => {
    const randomDetector = getRandomDetector(false);
    const newFeature: FeaturesFormikValues = {
      featureId: 'test-feature-id',
      aggregationBy: 'sum',
      aggregationOf: [{ label: 'bytes' }],
      featureEnabled: true,
      featureName: 'New feature',
      featureType: FEATURE_TYPE.SIMPLE,
      aggregationQuery: '',
    };
    const randomPositiveInt = Math.ceil(Math.random()*100);
    const apiRequest = prepareDetector([newFeature], randomPositiveInt, randomDetector, false);
    // expect(apiRequest.featureAttributes).toEqual([
    //   {
    //     featureId: newFeature.featureId,
    //     featureName: newFeature.featureName,
    //     featureEnabled: newFeature.featureEnabled,
    //     importance: 1,
    //     aggregationQuery: { new_feature: { sum: { field: 'bytes' } } },
    //   },
    //   ...randomDetector.featureAttributes,
    // ]);
  });
  // test('should able to edit feature', () => {
  //   const randomDetector = getRandomDetector(false);
  //   const featureToEdit = randomDetector.featureAttributes[0];
  //   const newFeature: FeaturesFormikValues = {
  //     aggregationBy: 'sum',
  //     aggregationOf: [{ label: 'bytes' }],
  //     enabled: true,
  //     featureName: 'New feature',
  //     featureType: FEATURE_TYPE.SIMPLE,
  //     customAggregation: '',
  //   };
  //   const apiRequest = prepareDetector(
  //     newFeature,
  //     randomDetector,
  //     featureToEdit.featureId || ''
  //   );
  //   expect(apiRequest.featureAttributes).toEqual([
  //     {
  //       featureId: featureToEdit.featureId,
  //       featureName: newFeature.featureName,
  //       featureEnabled: newFeature.enabled,
  //       importance: 1,
  //       aggregationQuery: { new_feature: { sum: { field: 'bytes' } } },
  //     },
  //     ...randomDetector.featureAttributes.slice(1),
  //   ]);
  // });
});
