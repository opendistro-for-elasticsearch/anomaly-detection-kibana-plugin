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

import { FeaturesFormikValues } from './formikToFeatures';
import { FEATURE_TYPE } from '../../../../models/interfaces';

export const FEATURE_TYPE_OPTIONS = [
  { text: 'Field aggregation', value: FEATURE_TYPE.SIMPLE },
  { text: 'Custom expression', value: FEATURE_TYPE.CUSTOM },
];

export const INITIAL_VALUES: FeaturesFormikValues = {
  featureName: '',
  enabled: true,
  featureType: FEATURE_TYPE.SIMPLE,
  customAggregation: JSON.stringify(
     { aggregation_name: { sum: { field: 'field_name' } } },
    null,
    4
  ),
  aggregationBy: '',
  aggregationOf: [],
};
