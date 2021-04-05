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

import { FEATURE_TYPE } from '../../../models/interfaces';
import { AggregationOption } from '../../../models/types';

// Formik values used when creating/editing the model configuration
export interface ModelConfigurationFormikValues {
  featureList: FeaturesFormikValues[];
  categoryFieldEnabled: boolean;
  categoryField: string[];
  shingleSize: number;
}

export interface FeaturesFormikValues {
  featureId: string;
  featureName: string | undefined;
  featureType: FEATURE_TYPE;
  featureEnabled: boolean;
  aggregationQuery: string;
  aggregationBy?: string;
  aggregationOf?: AggregationOption[];
  newFeature?: boolean;
}
