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

import { get } from 'lodash';
import { getRandomDetector } from '../../../../../redux/reducers/__tests__/utils';
import { featuresToFormik } from '../featuresToFormik';
import { INITIAL_VALUES } from '../constants';
import { UiMetaData, FEATURE_TYPE } from '../../../../../models/interfaces';

describe('featuresToFormik', () => {
  test('should convert features to formikValues', () => {
    const randomDetector = getRandomDetector(false);
    const expectedFeatures = randomDetector.featureAttributes.reduce(
      (acc, feature) => {
        const metaData = get(
          randomDetector,
          `uiMetadata.features.${feature.featureName}`,
          {}
        );
        const featureId = feature.featureId || 'something_is_wrong';
        return {
          ...acc,
          [featureId]: {
            featureName: feature.featureName,
            featureType: metaData.featureType,
            enabled: feature.featureEnabled,
            customAggregation: JSON.stringify(
              feature.aggregationQuery,
              null,
              4
            ),
            aggregationBy: metaData.aggregationBy,
            aggregationOf: [{ label: metaData.aggregationOf }],
          },
        };
      },
      {}
    );
    const formikFeatures = featuresToFormik(randomDetector);
    expect(formikFeatures).toEqual(expectedFeatures);
  });
  test('should default to API type if metadata does not exists', () => {
    const { uiMetadata, ...rest } = getRandomDetector(false);
    const expectedFeatures = rest.featureAttributes.reduce((acc, feature) => {
      const featureId = feature.featureId || 'something_is_wrong';
      return {
        ...acc,
        [featureId]: {
          featureName: feature.featureName,
          featureType: FEATURE_TYPE.CUSTOM,
          enabled: feature.featureEnabled,
          customAggregation: JSON.stringify(feature.aggregationQuery, null, 4),
          aggregationBy: INITIAL_VALUES.aggregationBy,
          aggregationOf: [],
        },
      };
    }, {});
    const formikFeatures = featuresToFormik({
      ...rest,
      uiMetadata: {} as UiMetaData,
    });
    expect(formikFeatures).toEqual(expectedFeatures);
  });
});
