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

import {
  SORT_DIRECTION,
  AD_DOC_FIELDS,
} from '../../../../server/utils/constants';
import { getDetectorResults } from '../../../redux/reducers/anomalyResults';
import { getDetectorLiveResults } from '../../../redux/reducers/liveAnomalyResults';
import moment, { Moment } from 'moment';
import { Dispatch } from 'redux';
import { cloneDeep } from 'lodash';
import { AnomalyData } from 'public/models/interfaces';

export const getLiveAnomalyResults = (
  dispatch: Dispatch<any>,
  detectorId: string,
  detectionInterval: number,
  intervals: number
) => {
  const startTime = moment()
    .subtract(intervals * detectionInterval, 'minutes')
    .valueOf();
  const updatedParams = {
    from: 0,
    size: intervals,
    sortDirection: SORT_DIRECTION.DESC,
    sortField: AD_DOC_FIELDS.DATA_START_TIME,
    dateRangeFilter: {
      startTime: startTime.valueOf(),
      fieldName: AD_DOC_FIELDS.DATA_START_TIME,
    },
  };
  dispatch(getDetectorLiveResults(detectorId, updatedParams));
};

// export const getAnomalyResults = (
//   dispatch: Dispatch<any>,
//   days: number,
//   detectorId: string
// ) => {
//   const dataStartTimeLowerLimit = moment()
//     .subtract(days, 'days')
//     .valueOf();
//   const updatedParams = {
//     from: 0,
//     size: 10000,
//     sortDirection: SORT_DIRECTION.DESC,
//     // sortField: 'startTime',
//     // dataStartTimeLowerLimit: dataStartTimeLowerLimit,
//     dateRangeFilter: {
//       startTime: dataStartTimeLowerLimit.valueOf(),
//       fieldName: AD_DOC_FIELDS.DATA_START_TIME,
//     },
//   };
//   dispatch(getDetectorResults(detectorId, updatedParams));
// };

export const getAnomalyResultsWithDateRange = (
  dispatch: Dispatch<any>,
  startTime: Moment,
  endTime: Moment,
  detectorId: string
) => {
  const updatedParams = {
    from: 0,
    size: 10000,
    sortDirection: SORT_DIRECTION.DESC,
    sortField: AD_DOC_FIELDS.DATA_START_TIME,
    dateRangeFilter: {
      startTime: startTime.valueOf(),
      endTime: endTime.valueOf(),
      fieldName: AD_DOC_FIELDS.DATA_START_TIME,
    },
  };
  dispatch(getDetectorResults(detectorId, updatedParams));
};

export const prepareDataForChart = (
  data: any[],
  startTime: Moment,
  endTime: Moment
) => {
  if (!data || data.length === 0) {
    return [];
  }
  let anomalies = cloneDeep(data);

  anomalies.push({
    startTime: startTime.valueOf(),
    endTime: startTime.valueOf(),
    plotTime: startTime.valueOf(),
    confidence: null,
    anomalyGrade: null,
  });
  anomalies.unshift({
    startTime: endTime.valueOf(),
    endTime: endTime.valueOf(),
    plotTime: endTime.valueOf(),
    confidence: null,
    anomalyGrade: null,
  });
  return anomalies;
};

export const generateAnomalyAnnotations = (anomalies: any[]) => {
  anomalies
    .filter((anomaly: AnomalyData) => anomaly.anomalyGrade > 0)
    .map((anomaly: AnomalyData) => ({
      coordinates: {
        x0: anomaly.startTime,
        x1: anomaly.endTime,
      },
      details: `There is an anomaly with confidence ${
        anomaly.confidence
      } between ${moment(anomaly.startTime).format(
        'MM/DD/YY h:mm a'
      )} and ${moment(anomaly.endTime).format('MM/DD/YY h:mm a')}`,
    }));
};
