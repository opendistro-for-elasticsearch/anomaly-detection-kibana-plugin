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

import { CatIndex } from '../../../../server/models/types';
import { DetectorListItem } from 'public/models/interfaces';
import { SAMPLE_TYPE, ANOMALY_DETECTORS_INDEX } from '../../../utils/constants';
import {
  sampleHttpResponses,
  sampleEcommerce,
  sampleHostHealth,
} from '../utils/constants';

export const containsDetectorsIndex = (indices: CatIndex[]) => {
  return indices.map((index) => index.index).includes(ANOMALY_DETECTORS_INDEX);
};

export const containsSampleIndex = (
  indices: CatIndex[],
  sampleType: SAMPLE_TYPE
) => {
  let indexName = '';
  switch (sampleType) {
    case SAMPLE_TYPE.HTTP_RESPONSES: {
      indexName = sampleHttpResponses.indexName;
      break;
    }
    case SAMPLE_TYPE.ECOMMERCE: {
      indexName = sampleEcommerce.indexName;
      break;
    }
    case SAMPLE_TYPE.HOST_HEALTH: {
      indexName = sampleHostHealth.indexName;
      break;
    }
  }
  return indices.map((index) => index.index).includes(indexName);
};

export const containsSampleDetector = (
  detectors: DetectorListItem[],
  sampleType: SAMPLE_TYPE
) => {
  let detectorName = '';
  switch (sampleType) {
    case SAMPLE_TYPE.HTTP_RESPONSES: {
      detectorName = sampleHttpResponses.detectorName;
      break;
    }
    case SAMPLE_TYPE.ECOMMERCE: {
      detectorName = sampleEcommerce.detectorName;
      break;
    }
    case SAMPLE_TYPE.HOST_HEALTH: {
      detectorName = sampleHostHealth.detectorName;
      break;
    }
  }
  return detectors.map((detector) => detector.name).includes(detectorName);
};

export const getDetectorId = (
  detectors: DetectorListItem[],
  detectorName: string
) => {
  let detectorId = '';
  detectors.some((detector) => {
    if (detector.name === detectorName) {
      detectorId = detector.id;
      return true;
    }
    return false;
  });
  return detectorId;
};
