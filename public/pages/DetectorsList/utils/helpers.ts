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

import queryString from 'query-string';
import { get, cloneDeep } from 'lodash';
import { GetDetectorsQueryParams } from '../../../../server/models/types';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import { DEFAULT_QUERY_PARAMS } from '../../utils/constants';
import { DETECTOR_STATE } from '../../../../server/utils/constants';
import { Monitor } from '../../../models/interfaces';
import { DetectorListItem } from '../../../models/interfaces';
import { DETECTOR_ACTION } from '../utils/constants';
export const getURLQueryParams = (location: {
  search: string;
}): GetDetectorsQueryParams => {
  const {
    from,
    size,
    search,
    indices,
    sortField,
    sortDirection,
  } = queryString.parse(location.search) as { [key: string]: string };
  return {
    // @ts-ignore
    from: isNaN(parseInt(from, 10))
      ? DEFAULT_QUERY_PARAMS.from
      : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10))
      ? DEFAULT_QUERY_PARAMS.size
      : parseInt(size, 10),
    search: typeof search !== 'string' ? DEFAULT_QUERY_PARAMS.search : search,
    indices:
      typeof indices !== 'string' ? DEFAULT_QUERY_PARAMS.indices : indices,
    sortField: typeof sortField !== 'string' ? 'name' : sortField,
    sortDirection:
      typeof sortDirection !== 'string'
        ? DEFAULT_QUERY_PARAMS.sortDirection
        : (sortDirection as SORT_DIRECTION),
  };
};

// For realtime detectors: cannot have 'Completed' state
export const getDetectorStateOptions = () => {
  return Object.values(DETECTOR_STATE)
    .map((detectorState) => ({
      label: detectorState,
      text: detectorState,
    }))
    .filter((option) => option.label !== DETECTOR_STATE.FINISHED);
};

export const getDetectorsForAction = (
  detectors: DetectorListItem[],
  action: DETECTOR_ACTION
) => {
  switch (action) {
    case DETECTOR_ACTION.START: {
      const detectorsForAction = detectors.filter(
        (detector) =>
          detector.curState === DETECTOR_STATE.DISABLED ||
          detector.curState === DETECTOR_STATE.INIT_FAILURE ||
          detector.curState === DETECTOR_STATE.UNEXPECTED_FAILURE
      );
      return detectorsForAction;
    }
    case DETECTOR_ACTION.STOP: {
      const detectorsForAction = detectors.filter(
        (detector) =>
          detector.curState === DETECTOR_STATE.RUNNING ||
          detector.curState === DETECTOR_STATE.INIT
      );
      return detectorsForAction;
    }
    case DETECTOR_ACTION.DELETE: {
      return cloneDeep(detectors);
    }
    default:
      return [];
  }
};

export const getMonitorsForAction = (
  detectorsForAction: DetectorListItem[],
  monitors: { [key: string]: Monitor }
) => {
  let monitorsForAction = {} as { [key: string]: Monitor };
  detectorsForAction.forEach((detector) => {
    const relatedMonitor = get(monitors, `${detector.id}.0`);
    if (relatedMonitor) {
      monitorsForAction[`${detector.id}`] = relatedMonitor;
    }
  });
  return monitorsForAction;
};
