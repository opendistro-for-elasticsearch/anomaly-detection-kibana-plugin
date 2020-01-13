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

import { cloneDeep } from 'lodash';
import { AdjustModelFormikValues } from '../AdjustModel';
import { Detector, UNITS } from '../../../../models/interfaces';
import { formikToFeatures } from './formikToFeatures';

export function prepareTunedDetector(
  values: AdjustModelFormikValues,
  detector: Detector
): Detector {
  const clonedDetector = cloneDeep(detector);
  const featureAttributes = values.formikFeatures.map(formikToFeatures);
  return {
    ...clonedDetector,
    detectionInterval: {
      period: { interval: values.detectionInterval, unit: UNITS.MINUTES },
    },
    windowDelay: {
      period: { interval: values.windowDelay, unit: UNITS.MINUTES },
    },
    featureAttributes: featureAttributes,
  };
}
