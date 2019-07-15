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

import { get, cloneDeep } from 'lodash';
import { Detector, FEATURE_TYPE } from '../../../../models/interfaces';
import { FeaturesFormikValues } from './formikToFeatures';
import { INITIAL_VALUES } from './constants';

export function featuresToFormik(
  detector: Detector
): { [key: string]: FeaturesFormikValues } {
  const ad = cloneDeep(detector);
  if (ad) {
    return ad.featureAttributes.reduce((acc, feature) => {
      const metaData = get(
        ad,
        `uiMetadata.features.${feature.featureName}`,
        {}
      );
      const featureId = feature.featureId || 'something_is_wrong';
      return {
        ...acc,
        [featureId]: {
          featureName: feature.featureName,
          enabled: feature.featureEnabled,
          customAggregation: JSON.stringify(feature.aggregationQuery, null, 4),
          aggregationBy: metaData.aggregationBy || INITIAL_VALUES.aggregationBy,
          featureType: metaData.featureType || FEATURE_TYPE.CUSTOM, //Assume it to be API detector
          aggregationOf: metaData.aggregationOf
            ? [{ label: metaData.aggregationOf }]
            : [],
        },
      };
    }, {});
  }
  return {};
}
