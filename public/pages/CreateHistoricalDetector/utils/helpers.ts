/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { get, cloneDeep, isEmpty } from 'lodash';
import { Detector, UNITS, FEATURE_TYPE } from '../../../models/interfaces';
import { SHINGLE_SIZE } from '../../../utils/constants';
import {
  HistoricalDetectorFormikValues,
  INITIAL_HISTORICAL_DETECTOR_VALUES,
} from './constants';
import datemath from '@elastic/datemath';
import moment from 'moment';
import {
  FeaturesFormikValues,
  formikToFeatures,
  formikToUIMetadata,
} from '../../EditFeatures/containers/utils/formikToFeatures';

export function formikToHistoricalDetector(
  values: HistoricalDetectorFormikValues,
  detector: Detector
): Detector {
  let apiRequest = {
    ...detector,
    name: values.name,
    description: values.description,
    indices: values.index.map((index) => index.label),
    timeField: values.timeField,
    featureAttributes: formikToFeatures(values.featureList, false),
    uiMetadata: {
      ...detector?.uiMetadata,
      features: { ...formikToUIMetadata(values.featureList) },
    },
    detectionInterval: {
      period: { interval: values.detectionInterval, unit: UNITS.MINUTES },
    },
    windowDelay: {
      period: { interval: values.windowDelay, unit: UNITS.MINUTES },
    },
    shingleSize: values.shingleSize,
    detectionDateRange: {
      startTime: convertTimestampToNumber(values.startTime),
      endTime: convertTimestampToNumber(values.endTime),
    },
  } as Detector;

  return apiRequest;
}

export function historicalDetectorToFormik(
  detector: Detector
): HistoricalDetectorFormikValues {
  const initialValues = cloneDeep(INITIAL_HISTORICAL_DETECTOR_VALUES);
  if (isEmpty(detector)) {
    return initialValues;
  }
  return {
    ...initialValues,
    name: detector.name,
    description: detector.description,
    index: [{ label: detector.indices[0] }],
    timeField: detector.timeField,
    featureList: featuresToFormik(detector),
    detectionInterval: get(detector, 'detectionInterval.period.interval', 10),
    shingleSize: get(detector, 'shingleSize', SHINGLE_SIZE),
    startTime: get(detector, 'detectionDateRange.startTime'),
    endTime: get(detector, 'detectionDateRange.endTime'),
  };
}

function featuresToFormik(detector: Detector): FeaturesFormikValues[] {
  const featureUiMetaData = get(detector, 'uiMetadata.features', []);
  const features = get(detector, 'featureAttributes', []);
  // @ts-ignore
  return features.map((feature: FeatureAttributes) => {
    return {
      ...featureUiMetaData[feature.featureName],
      ...feature,
      aggregationQuery: JSON.stringify(feature['aggregationQuery'], null, 4),
      aggregationOf: get(
        featureUiMetaData,
        `${feature.featureName}.aggregationOf`
      )
        ? [
            {
              label: get(
                featureUiMetaData,
                `${feature.featureName}.aggregationOf`
              ),
            },
          ]
        : [],
      featureType: get(featureUiMetaData, `${feature.featureName}.featureType`)
        ? get(featureUiMetaData, `${feature.featureName}.featureType`)
        : FEATURE_TYPE.CUSTOM,
    };
  });
}

export function convertTimestampToString(timestamp: number | string) {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return moment(timestamp).format();
}

export function convertTimestampToNumber(timestamp: number | string) {
  if (typeof timestamp === 'string') {
    return datemath.parse(timestamp)?.valueOf();
  }
  return timestamp;
}

export const getAllDetectorOptions = (allDetectors: any[]) => {
  return allDetectors.map((detector) => {
    return {
      id: detector.id,
      label: detector.name,
      index: get(detector, 'indices.0', ''),
    };
  });
};
