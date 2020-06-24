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

export const containsDetectorsIndex = (indices: CatIndex[]) => {
  const detectorsIndexName = '.opendistro-anomaly-detectors';
  return indices.map((index) => index.index).includes(detectorsIndexName);
};

export const containsIndex = (indices: CatIndex[], indexName: string) => {
  return indices.map((index) => index.index).includes(indexName);
};

export const containsDetector = (
  detectors: DetectorListItem[],
  detectorName: string
) => {
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
