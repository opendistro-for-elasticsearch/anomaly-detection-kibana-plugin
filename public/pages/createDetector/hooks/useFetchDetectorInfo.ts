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

import { get, isEmpty } from 'lodash';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Detector } from '../../../models/interfaces';
import { AppState } from '../../../redux/reducers';
import { getDetector } from '../../../redux/reducers/ad';
import { getMappings } from '../../../redux/reducers/elasticsearch';

//A hook which gets required info in order to display a detector on kibana.
// 1. Get detector
// 2. Gets index mapping
export const useFetchDetectorInfo = (
  detectorId: string
): {
  detector: Detector;
  hasError: boolean;
  isLoadingDetector: boolean;
} => {
  const dispatch = useDispatch();
  const detector = useSelector(
    (state: AppState) => state.ad.detectors[detectorId]
  );
  const hasError = useSelector((state: AppState) => state.ad.errorMessage);
  const isDetectorRequesting = useSelector(
    (state: AppState) => state.ad.requesting
  );
  const isIndicesRequesting = useSelector(
    (state: AppState) => state.elasticsearch.requesting
  );
  const selectedIndices = get(detector, 'indices.0', '');
  useEffect(() => {
    const fetchDetector = async () => {
      if (!detector) {
        await dispatch(getDetector(detectorId));
      }
      if (selectedIndices) {
        await dispatch(getMappings(selectedIndices));
      }
    };
    if (detectorId) {
      fetchDetector();
    }
  }, [detectorId, selectedIndices]);
  return {
    detector: detector || {},
    hasError: !isEmpty(hasError) && isEmpty(detector),
    isLoadingDetector: isDetectorRequesting || isIndicesRequesting,
  };
};
