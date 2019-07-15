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

import { get, snakeCase, cloneDeep } from 'lodash';
import {
  Detector,
  FeatureAttributes,
  FEATURE_TYPE,
} from '../../../../models/interfaces';

import { AggregationOption } from '../../models/types';

export type FeaturesFormikValues = {
  featureName: string;
  featureType: FEATURE_TYPE;
  enabled: boolean;
  customAggregation: string;
  aggregationBy: string;
  aggregationOf: AggregationOption[];
};

export function prepareDetector(
  values: FeaturesFormikValues,
  ad: Detector,
  featureToEdit: string
): Detector {
  //TODO::Verify why immutable is creating an issue
  const detector = cloneDeep(ad);
  const feature = formikToFeatures(values);
  const featureAttributes: FeatureAttributes[] = get(
    detector,
    'featureAttributes',
    []
  );
  const editIndex = featureAttributes.findIndex(
    feature => feature.featureId === featureToEdit
  );

  if (editIndex >= 0) {
    featureAttributes.splice(editIndex, 1, {
      featureId: featureToEdit,
      ...feature,
    });
  } else {
    featureAttributes.unshift(feature);
  }

  return {
    ...detector,
    featureAttributes: [...featureAttributes],
    uiMetadata: {
      ...detector.uiMetadata,
      features: {
        ...get(detector, 'uiMetadata.features', {}),
        ...formikToUIMetadata(values),
      },
    },
  };
}

export function formikToAggregation(values: FeaturesFormikValues) {
  if (values.featureType === FEATURE_TYPE.SIMPLE) {
    return {
      [snakeCase(values.featureName)]: {
        [values.aggregationBy]: { field: values.aggregationOf[0].label },
      },
    };
  }
  return JSON.parse(values.customAggregation);
}

export function formikToFeatures(values: FeaturesFormikValues) {
  const featureAttribute = formikToFeatureAttributes(values);
  return featureAttribute;
}

export function formikToUIMetadata(values: FeaturesFormikValues) {
  //TODO:: Delete Stale metadata if name is changed
  if (values.featureType === FEATURE_TYPE.SIMPLE) {
    return {
      [values.featureName]: {
        featureType: values.featureType,
        aggregationBy: values.aggregationBy,
        aggregationOf: values.aggregationOf[0].label,
      },
    };
  }
  return {
    [values.featureName]: {
      featureType: values.featureType,
    },
  };
}
function formikToFeatureAttributes(
  values: FeaturesFormikValues
): FeatureAttributes {
  return {
    featureName: values.featureName,
    featureEnabled: values.enabled,
    importance: 1,
    aggregationQuery: formikToAggregation(values),
  };
}
