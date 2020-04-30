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

import { SORT_DIRECTION, AD_DOC_FIELDS } from '../../../server/utils/constants';
import { getDetectorResults } from '../../redux/reducers/anomalyResults';
import { getDetectorLiveResults } from '../../redux/reducers/liveAnomalyResults';
import moment from 'moment';
import { Dispatch } from 'redux';
import { get } from 'lodash';
import { AnomalyData, DateRange } from '../../models/interfaces';
import { MAX_ANOMALIES } from '../../utils/constants';

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

export const getAnomalyResultsWithDateRange = (
  dispatch: Dispatch<any>,
  startTime: number,
  endTime: number,
  detectorId: string
) => {
  const updatedParams = {
    from: 0,
    size: MAX_ANOMALIES,
    sortDirection: SORT_DIRECTION.DESC,
    sortField: AD_DOC_FIELDS.DATA_START_TIME,
    dateRangeFilter: {
      startTime: startTime,
      endTime: endTime,
      fieldName: AD_DOC_FIELDS.DATA_START_TIME,
    },
  };
  dispatch(getDetectorResults(detectorId, updatedParams));
};

const MAX_DATA_POINTS = 1000;

const calculateStep = (total: number): number => {
  return Math.ceil(total / MAX_DATA_POINTS);
};

//TODO: sorting and find the maximum value?
function findAnomalyWithMaxAnomalyGrade(anomalies: any[]) {
  let anomalyWithMaxGrade = anomalies[0];
  for (let i = 1, len = anomalies.length; i < len; i++) {
    let anomaly = anomalies[i];
    anomalyWithMaxGrade =
      anomaly.anomalyGrade > anomalyWithMaxGrade.anomalyGrade
        ? anomaly
        : anomalyWithMaxGrade;
  }
  return anomalyWithMaxGrade;
}

const sampleMaxAnomalyGrade = (anomalies: any[]): any[] => {
  const step = calculateStep(anomalies.length);
  let index = 0;
  const sampledAnomalies = [];
  while (index < anomalies.length) {
    const arr = anomalies.slice(index, index + step);
    sampledAnomalies.push(findAnomalyWithMaxAnomalyGrade(arr));
    index = index + step;
  }
  return sampledAnomalies;
};

export const prepareDataForChart = (data: any[], dateRange: DateRange) => {
  if (!data || data.length === 0) {
    return [];
  }
  let anomalies = data.filter(
    anomaly =>
      anomaly.plotTime >= dateRange.startDate &&
      anomaly.plotTime <= dateRange.endDate
  );

  anomalies = sampleMaxAnomalyGrade(anomalies);

  anomalies.push({
    startTime: dateRange.startDate,
    endTime: dateRange.startDate,
    plotTime: dateRange.startDate,
    confidence: null,
    anomalyGrade: null,
  });
  anomalies.unshift({
    startTime: dateRange.endDate,
    endTime: dateRange.endDate,
    plotTime: dateRange.endDate,
    confidence: null,
    anomalyGrade: null,
  });
  return anomalies;
};

export const generateAnomalyAnnotations = (anomalies: any[]): any[] => {
  return anomalies
    .filter((anomaly: AnomalyData) => anomaly.anomalyGrade > 0)
    .map((anomaly: AnomalyData) => ({
      coordinates: {
        x0: anomaly.startTime,
        x1: anomaly.endTime,
      },
      details: `There is an anomaly with confidence ${
        anomaly.confidence
      } between ${moment(anomaly.startTime).format(
        'MM/DD/YY h:mm A'
      )} and ${moment(anomaly.endTime).format('MM/DD/YY h:mm A')}`,
    }));
};

export const filterWithDateRange = (
  data: any[],
  dateRange: DateRange,
  timeField: string
) => {
  const anomalies = data.filter(item => {
    const time = get(item, `${timeField}`);
    return time && time >= dateRange.startDate && time <= dateRange.endDate;
  });
  return anomalies;
};
